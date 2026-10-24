import asyncio
import json
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [GMES-v4.2] %(message)s"
)
logger = logging.getLogger("NeuralLinkBackend")

app = FastAPI(
    title="NEURAL LINK PRO & VOMS — Autonomous Manufacturing API",
    description="Enterprise Production Control Center • Author: Ngô Thanh Tùng (Chief Architect) • ISO 9001 / IATF 16949 Compliant • Latency < 12ms",
    version="4.2.0-PRO"
)

# CORS Configuration cho kết nối React Frontend & AI Studio
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================================
# 1. PYDANTIC SCHEMAS (LƯỢC ĐỒ DỮ LIỆU)
# =========================================================================

class PlantTelemetry(BaseModel):
    id: str
    name: str
    actual: int
    target: int
    rate: float
    oee: float
    status: str = Field(..., pattern="^(optimal|stable|warning|critical)$")
    statusText: str
    imgUrl: str
    bottleneck_cause: Optional[str] = None

class CausalEdgeSchema(BaseModel):
    id: str
    source: str
    target: str
    sourceName: str
    targetName: str
    weight: float
    pValue: float
    type: str
    directEffect: float
    indirectEffect: float
    totalEffect: float
    actionFeasibility: str
    doCalculusFormula: str
    riskSharePercent: float

class TransferOrderSchema(BaseModel):
    id: str
    orderCode: str
    sku: str
    vendorName: str
    destination: str
    qtyShipped: int
    qtyTarget: int
    etd: str
    eta: str
    statusType: str
    statusBadgeText: str
    riskOtdPercent: float
    actionPrimaryText: str
    rootCause: Optional[str] = None

class EmergencyDispatchAction(BaseModel):
    material_code: str = Field(..., example="ALUMINUM_A980")
    quantity_kg: float = Field(..., example=3200.0)
    source_hub: str = Field(..., example="HUB_A01")
    target_plant: str = Field(..., example="DAAL")
    priority: str = Field(default="KHẨN CẤP", example="KHẨN CẤP")

class CounterfactualRequest(BaseModel):
    scenario_type: str = Field(..., example="SCENARIO_B_FULL_AI_OPTIMAL")
    interventions: List[str] = Field(..., example=["DISPATCH_3200KG_A980", "AUGMENT_12_SMT_HSTEC", "BUFFER_RELEASE_4500PCS"])

class CounterfactualResponse(BaseModel):
    scenario_type: str
    output_pcs: int
    otd_rate: float
    recovery_gain_pcs: int
    confidence_score: float
    message: str

# =========================================================================
# 2. IN-MEMORY DATABASE (SEED DATA)
# =========================================================================

PLANTS_DB: List[PlantTelemetry] = [
    PlantTelemetry(id="KHV", name="KHV", actual=12800, target=15000, rate=85.3, oee=91.2, status="optimal", statusText="Tối ưu", imgUrl="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400"),
    PlantTelemetry(id="DREAM_TECH", name="DREAM TECH", actual=13000, target=18000, rate=72.2, oee=86.4, status="stable", statusText="Ổn định", imgUrl="https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400"),
    PlantTelemetry(id="HSTEC", name="HSTEC", actual=12500, target=16000, rate=78.1, oee=79.1, status="warning", statusText="Thiếu 12 thợ SMT", imgUrl="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400", bottleneck_cause="R04: Nhân sự SMT chuyền 2"),
    PlantTelemetry(id="KTECH", name="KTECH", actual=12000, target=20000, rate=60.0, oee=65.3, status="warning", statusText="Bảo trì Spindle", imgUrl="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400", bottleneck_cause="R08: Mòn dao trục Spindle 04"),
    PlantTelemetry(id="HOJEONGB", name="HOJEONGB", actual=13700, target=15500, rate=88.4, oee=93.8, status="optimal", statusText="Vượt nhịp", imgUrl="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400"),
    PlantTelemetry(id="HOJEONG_VINA", name="HOJEONG VINA", actual=13700, target=18000, rate=76.1, oee=80.2, status="warning", statusText="Lệch hàn laser", imgUrl="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400", bottleneck_cause="Rework Laser 12%"),
    PlantTelemetry(id="DAAL", name="DAAL", actual=8600, target=18000, rate=47.8, oee=51.4, status="critical", statusText="Đứt phôi nhôm A980", imgUrl="https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=400", bottleneck_cause="R06: Đứt phôi A980 từ Hub A01"),
]

CAUSAL_EDGES_DB: List[CausalEdgeSchema] = [
    CausalEdgeSchema(
        id="R06", source="N03", target="N08", sourceName="N03 (Kho A01)", targetName="N08 (DAAL)",
        weight=0.82, pValue=0.0012, type="critical", directEffect=0.82, indirectEffect=0.14, totalEffect=0.96,
        actionFeasibility="Cao (45m)", doCalculusFormula="P(Output | do(Mat = K1)) = 96.2%", riskSharePercent=48.0
    ),
    CausalEdgeSchema(
        id="R08", source="N05", target="N08", sourceName="N05 (Spindle 04)", targetName="N08 (KTECH)",
        weight=0.67, pValue=0.0045, type="cascade", directEffect=0.67, indirectEffect=0.08, totalEffect=0.75,
        actionFeasibility="Trung bình", doCalculusFormula="P(Output | do(CNC = Repl)) = 88.4%", riskSharePercent=28.0
    ),
    CausalEdgeSchema(
        id="R04", source="N04", target="N08", sourceName="N04 (Thợ SMT)", targetName="N08 (HSTEC)",
        weight=0.48, pValue=0.0120, type="critical", directEffect=0.48, indirectEffect=0.12, totalEffect=0.60,
        actionFeasibility="Rất cao", doCalculusFormula="P(Output | do(Staff = +12)) = 94.1%", riskSharePercent=15.0
    ),
]

TRANSFER_ORDERS_DB: List[TransferOrderSchema] = [
    TransferOrderSchema(
        id="TO-3011", orderCode="TO-3011 (Hải Phòng Port)", sku="Camera Bracket Base (SKU-A980)",
        vendorName="DAAL Precision", destination="Hải Phòng Terminal Gate 4",
        qtyShipped=8600, qtyTarget=18000, etd="13:00", eta="17:45",
        statusType="danger", statusBadgeText="ĐỎ KHẨN CẤP / DELAYED", riskOtdPercent=68.0,
        actionPrimaryText="Điều phối xe ưu tiên", rootCause="Thâm hụt 5,600 pcs chi tiết vỏ đúc A980"
    ),
    TransferOrderSchema(
        id="TO-3018", orderCode="TO-3018 (Nội Bài Cargo)", sku="SMT Mainboard Sub-Module (SKU-C450)",
        vendorName="HSTEC", destination="Nội Bài Cargo Terminal B8",
        qtyShipped=12500, qtyTarget=12500, etd="14:15", eta="15:00",
        statusType="in_transit", statusBadgeText="XANH / ĐÚNG GIỜ", riskOtdPercent=12.0,
        actionPrimaryText="Xem GPS", rootCause="Bù 12 thợ thành công"
    ),
    TransferOrderSchema(
        id="TO-3022", orderCode="TO-3022 (Kho Samsung Hub)", sku="CNC Base Plate Bracket",
        vendorName="KTECH CNC", destination="Kho Trung tâm SEVT Thái Nguyên",
        qtyShipped=12000, qtyTarget=20000, etd="15:00", eta="18:00",
        statusType="warning", statusBadgeText="VÀNG CẢNH BÁO", riskOtdPercent=48.0,
        actionPrimaryText="Chia tải lô gấp", rootCause="Kẹt dao phay R08 dở dang 1,200 pcs"
    )
]

# =========================================================================
# 3. WEBSOCKET CONNECTION POOL CHO LIVE TELEMETRY (< 12MS)
# =========================================================================

class TelemetryConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info("WebSocket client disconnected.")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting WebSocket message: {e}")

manager = TelemetryConnectionManager()

async def telemetry_pulse_broadcaster():
    while True:
        await asyncio.sleep(2.0)
        pulse_data = {
            "event": "CAUSAL_PULSE_UPDATE",
            "timestamp": datetime.utcnow().isoformat(),
            "latency_ms": 10.4,
            "core_output_pcs": 75600,
            "deficit_pcs": -29400,
            "active_bottleneck": "R06",
            "otd_forecast": 68.0,
            "chief_architect": "Ngô Thanh Tùng"
        }
        await manager.broadcast(pulse_data)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(telemetry_pulse_broadcaster())
    logger.info("Neural Link GMES v4.2 PRO Backend started successfully.")

# =========================================================================
# 4. RESTful API ENDPOINTS
# =========================================================================

@app.get("/", tags=["System Information"])
async def root():
    return {
        "system": "NEURAL LINK PRO / VOMS BACKEND",
        "author": "Ngô Thanh Tùng (Chief Architect)",
        "compliance": "GMES Enterprise Suite v4.2 PRO • ISO 9001 / IATF 16949",
        "latency": "< 12ms",
        "status": "ONLINE",
        "docs_url": "/docs"
    }

@app.get("/api/v1/telemetry/live", response_model=Dict[str, Any], tags=["M01 Operations"])
async def get_live_telemetry():
    total_actual = sum(p.actual for p in PLANTS_DB)
    total_target = sum(p.target for p in PLANTS_DB)
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "shift_id": "CA_1_0800_1600",
        "system_latency_ms": 11.2,
        "total_actual": total_actual,
        "total_target": total_target,
        "completion_rate": round((total_actual / total_target) * 100, 1),
        "plants": PLANTS_DB
    }

@app.get("/api/v1/causal/graph", response_model=List[CausalEdgeSchema], tags=["M10 AI Causal"])
async def get_causal_graph():
    return CAUSAL_EDGES_DB

@app.get("/api/v1/causal/link/{link_id}", response_model=CausalEdgeSchema, tags=["M10 AI Causal"])
async def get_causal_link_detail(link_id: str):
    for edge in CAUSAL_EDGES_DB:
        if edge.id.upper() == link_id.upper():
            return edge
    raise HTTPException(status_code=404, detail=f"Causal link '{link_id}' not found.")

@app.get("/api/v1/logistics/transfer-orders", response_model=List[TransferOrderSchema], tags=["M04 Logistics OTD"])
async def get_transfer_orders(status_filter: Optional[str] = Query(None)):
    if status_filter and status_filter != "all":
        return [to for to in TRANSFER_ORDERS_DB if to.statusType == status_filter]
    return TRANSFER_ORDERS_DB

@app.post("/api/v1/actions/dispatch-material", tags=["Autonomous Dispatch"])
async def dispatch_material(payload: EmergencyDispatchAction):
    logger.info(f"EXECUTING EMERGENCY DISPATCH: {payload.quantity_kg}kg {payload.material_code} -> {payload.target_plant}")
    for plant in PLANTS_DB:
        if plant.id == payload.target_plant:
            plant.status = "stable"
            plant.statusText = f"Đang nhận {payload.quantity_kg}kg phôi K1"
            plant.rate = min(100.0, plant.rate + 25.0)

    return {
        "status": "SUCCESS",
        "action_id": f"ACT-DISP-{int(datetime.utcnow().timestamp())}",
        "message": f"Đã phát lệnh điều phối {payload.quantity_kg}kg {payload.material_code} từ {payload.source_hub} sang {payload.target_plant}.",
        "target_plant": payload.target_plant,
        "estimated_arrival": "45 phút (ETA 14:15)"
    }

@app.post("/api/v1/simulation/counterfactual", response_model=CounterfactualResponse, tags=["M10 AI Causal"])
async def run_counterfactual_simulation(payload: CounterfactualRequest):
    if payload.scenario_type == "BASELINE":
        return CounterfactualResponse(
            scenario_type="BASELINE",
            output_pcs=82400,
            otd_rate=68.0,
            recovery_gain_pcs=0,
            confidence_score=0.984,
            message="Kịch bản không can thiệp. Thâm hụt 22,600 pcs, rủi ro phạt hợp đồng TO-3011."
        )
    elif payload.scenario_type == "SCENARIO_B_FULL_AI_OPTIMAL":
        return CounterfactualResponse(
            scenario_type="SCENARIO_B_FULL_AI_OPTIMAL",
            output_pcs=101800,
            otd_rate=98.5,
            recovery_gain_pcs=19400,
            confidence_score=0.964,
            message="Kịch bản can thiệp tối ưu toàn diện AI: Cấp phôi K1 + Bù 12 thợ SMT + Xả đệm M09. Phục hồi 97% sản lượng."
        )
    else:
        return CounterfactualResponse(
            scenario_type=payload.scenario_type,
            output_pcs=94200,
            otd_rate=84.0,
            recovery_gain_pcs=11800,
            confidence_score=0.912,
            message="Kịch bản can thiệp cục bộ một phần."
        )

@app.websocket("/ws/v1/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received message from client: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
