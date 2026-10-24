# 🏛️ NEURAL LINK PRO / VOMS — SYSTEM ARCHITECTURE & API CONTRACT SPECIFICATION
**Tác giả & Kiến trúc sư trưởng:** Ngô Thanh Tùng (Chief Architect)  
**Hệ thống:** NEURAL LINK PRO & VOMS (Vendor Outsourcing Management System)  
**Tiêu chuẩn chất lượng:** ISO 9001 / IATF 16949 Compliant • Latency < 12ms  
**Mục tiêu tài liệu:** Cung cấp thông số kiến trúc kỹ thuật toàn diện, lược đồ dữ liệu (Data Schemas), định dạng sự kiện thời gian thực (WebSockets/SSE), và bộ đặc tả giao tiếp API (OpenAPI 3.1 & Gemini Function Calling Specs) để nạp trực tiếp vào **Google AI Studio** nhằm xây dựng Backend logic, Agentic Workflows và Microservices.

---

## 📑 MỤC LỤC
1. [Tổng quan kiến trúc cấp cao (High-Level Architecture)](#1-tổng-quan-kiến-trúc-cấp-cao)
2. [Động cơ suy luận AI & Causal DAG Engine](#2-động-cơ-suy-luận-ai--causal-dag-engine)
3. [Mô hình dữ liệu lõi (Core Data Schemas)](#3-mô-hình-dữ-liệu-lõi)
4. [Bộ đặc tả API RESTful (API Endpoints Contract)](#4-bộ-đặc-tả-api-restful)
5. [Đặc tả Gemini Function Calling (Dành riêng cho Google AI Studio)](#5-đặc-tả-gemini-function-calling)
6. [Hệ thống luồng sự kiện thời gian thực (Real-Time WebSocket / Telemetry)](#6-hệ-thống-luồng-sự-kiện-thời-gian-thực)
7. [System Prompt & Instructions mẫu cho Google AI Studio](#7-system-prompt-mẫu-cho-google-ai-studio)

---

## 1. TỔNG QUAN KIẾN TRÚC CẤP CAO (HIGH-LEVEL ARCHITECTURE)

Hệ thống **NEURAL LINK PRO** được tổ chức theo kiến trúc Event-Driven Microservices kết hợp Causal AI Engine, bao gồm 4 tầng cốt lõi:

```
[ FRONTEND LAYER (Stitch HTML/Tailwind/Canvas / Mobile 390px) ]
       │                                     ▲
       ▼ REST (OpenAPI 3.1)                  │ WebSocket (Live Telemetry 12ms)
[ API GATEWAY / REVERSE PROXY (Kong / Envoy / FastAPI) ]
       │
       ├──► [ CAUSAL INFERENCE ENGINE (Pearl Do-Calculus & Bayesian DAG) ]
       │        ├── Network Topology: 18 Nodes / 24 Edges
       │        ├── Counterfactual Simulator (What-If Scenarios)
       │        └── Shapley Value Attribution Engine
       │
       ├──► [ ORCHESTRATION & ERP/MES DISPATCHER ]
       │        ├── Automated Interventions (Auto-Action Engine)
       │        └── Material / Line Balancing Dispatcher
       │
       └──► [ GOOGLE GEMINI AGENT (AI Studio / Vertex AI) ]
                ├── Function Calling: dispatch_material, rebalance_line, run_counterfactual
                └── Root Cause Analysis & Shift Report Generator
```

### 7 Nhà máy vệ tinh tích hợp trong cụm (Satellite Plants):
1. **KHV:** Chuyền SMT & Lắp ráp vi mạch (Mục tiêu: 15.0k, Đạt: 85%)
2. **DREAM TECH:** Đúc vỏ & Ép khuôn chính xác (Mục tiêu: 18.0k, Đạt: 72%)
3. **HSTEC:** Gia công bản mạch SMT cao cấp (Mục tiêu: 16.0k, Đạt: 78% - Thiếu 12 thợ SMT)
4. **KTECH:** Cơ khí chính xác CNC & Phay trục (Mục tiêu: 20.0k, Đạt: 60% - Lỗi mòn dao R08)
5. **HOJEONGB:** Lắp ráp cụm module điện tử (Mục tiêu: 15.5k, Đạt: 88%)
6. **HOJEONG VINA:** Hàn laser & Xử lý bề mặt (Mục tiêu: 18.0k, Đạt: 76% - Lệch mối hàn)
7. **DAAL:** Đúc phôi nhôm & Cơ khí nặng (Mục tiêu: 18.0k, Đạt: 48% - Đứt phôi nhôm A980 [P1 Critical])

---

## 2. ĐỘNG CƠ SUY LUẬN AI & CAUSAL DAG ENGINE

### 2.1 Cấu trúc đồ thị DAG (Directed Acyclic Graph)
- **Nodes (18 Nút vận hành):**
  - `N01_PLAN`: Kế hoạch sản xuất ca (Định mức 105,000 pcs)
  - `N02_BUFFER`: Prebuild Buffer M09 (Tồn an toàn 8,400 pcs)
  - `N03_MATERIAL`: Kho vật liệu trung tâm (Đứt phôi nhôm A980, thâm hụt 4,800 kg tại Hub A01)
  - `N04_WORKFORCE`: Nhân lực & Tay nghề (Thiếu 12 thợ SMT tại HSTEC)
  - `N05_EQUIPMENT`: Thiết bị & OEE (Trục Spindle 04 rung > 4.2G tại KTECH)
  - `N06_OQC`: Kiểm tra chất lượng thành phẩm (Lỗi vi mô laser DEF-01)
  - `N07_REWORK`: Chuyền làm lại BGA & vi mạch
  - `N08_ACTUAL_OUTPUT`: Sản lượng thực tế (Core Metric Hub: 75,600 pcs, thâm hụt -29,400 pcs)
  - `N09_DELIVERY_OTD`: Tỷ lệ giao hàng đúng hạn (Dự báo 68.0%, trễ xe TO-3011 & TO-3022)
  - `N10_EXTERNAL`: Yếu tố ngoại lai (Thời tiết Hải Phòng, dao động điện áp lưới 220V ±8%)
  - *(Các sub-node nhà máy: DAAL_PROD, KTECH_PROD, HSTEC_PROD,...)*

- **Edges & Trọng số suy luận ($w$):**
  - `R06: N03_MATERIAL ➔ N08_ACTUAL_OUTPUT` ($w = 0.82$, P1 Critical, $P < 0.0012$)
  - `R08: N05_EQUIPMENT ➔ N08_ACTUAL_OUTPUT` ($w = 0.67$, P1 Cascade)
  - `R05: N01_PLAN ➔ N08_ACTUAL_OUTPUT` ($w = 0.71$)
  - `R07: N02_BUFFER ➔ N08_ACTUAL_OUTPUT` ($w = 0.63$)
  - `R04: N04_WORKFORCE ➔ N08_ACTUAL_OUTPUT` ($w = 0.48$)

---

## 3. MÔ HÌNH DỮ LIỆU LÕI (CORE DATA SCHEMAS)

### 3.1 JSON Schema: Telemetry Snapshot 7 Nhà Máy
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PlantTelemetrySnapshot",
  "type": "object",
  "properties": {
    "timestamp": { "type": "string", "format": "date-time" },
    "shift_id": { "type": "string", "example": "SHIFT-01-20250624" },
    "system_latency_ms": { "type": "number", "maximum": 12 },
    "plants": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/PlantMetric"
      }
    }
  },
  "required": ["timestamp", "shift_id", "plants"],
  "$defs": {
    "PlantMetric": {
      "type": "object",
      "properties": {
        "plant_id": { "type": "string", "enum": ["KHV", "DREAM_TECH", "HSTEC", "KTECH", "HOJEONGB", "HOJEONG_VINA", "DAAL"] },
        "name": { "type": "string" },
        "actual_output": { "type": "integer" },
        "target_output": { "type": "integer" },
        "completion_rate": { "type": "number" },
        "oee_percentage": { "type": "number" },
        "status": { "type": "string", "enum": ["OPTIMAL", "STABLE", "WARNING", "CRITICAL"] },
        "bottleneck_code": { "type": ["string", "null"] }
      },
      "required": ["plant_id", "actual_output", "target_output", "completion_rate", "oee_percentage", "status"]
    }
  }
}
```

---

## 4. BỘ ĐẶC TẢ API RESTFUL (OPENAPI 3.1 SPECIFICATION)

### 4.1 Danh sách Endpoints chính
| Phương thức | Đường dẫn | Mục đích nghiệp vụ |
| :--- | :--- | :--- |
| `GET` | `/api/v1/telemetry/live` | Lấy dữ liệu live telemetry 7 nhà máy & sản lượng ca |
| `GET` | `/api/v1/causal/graph` | Lấy toàn bộ cấu trúc 18 nút và 24 liên kết DAG ($w$, $p$-value) |
| `GET` | `/api/v1/causal/link/{link_id}` | Truy xuất chi tiết bằng chứng quan hệ nhân quả (VD: `R06`, `R08`) |
| `POST` | `/api/v1/simulation/counterfactual` | Chạy mô phỏng What-If (Pearl Do-Calculus intervention) |
| `POST` | `/api/v1/actions/dispatch-material` | Kích hoạt lệnh điều phối phôi cấp cứu (Hub A01 ➔ DAAL) |
| `POST` | `/api/v1/actions/maintenance-override`| Đẩy lệnh can thiệp bảo trì khẩn cấp thiết bị CNC KTECH |
| `GET` | `/api/v1/analytics/shapley-attribution`| Lấy bảng phân rã đóng góp phương sai thâm hụt sản lượng |

### 4.2 Chi tiết Endpoint: `POST /api/v1/simulation/counterfactual`
- **Request Body:**
```json
{
  "target_node": "N08_ACTUAL_OUTPUT",
  "interventions": [
    {
      "node": "N03_MATERIAL",
      "action": "TRANSFER_ALUMINUM_A980",
      "quantity_kg": 3200,
      "source_hub": "HUB_A01",
      "dest_plant": "DAAL"
    },
    {
      "node": "N04_WORKFORCE",
      "action": "AUGMENT_OPERATORS",
      "operator_count": 12,
      "skill_level": "SMT_SENIOR",
      "target_plant": "HSTEC"
    }
  ]
}
```
- **Response Body (200 OK):**
```json
{
  "simulation_id": "SIM-CF-94821",
  "baseline_output": 82400,
  "baseline_otd": 0.68,
  "simulated_output": 101800,
  "simulated_otd": 0.985,
  "gap_reduction_pcs": 19400,
  "confidence_score": 0.964,
  "recommended_scenario": "SCENARIO_B_FULL_AI_OPTIMIZATION"
}
```

---

## 5. ĐẶC TẢ GEMINI FUNCTION CALLING (DÀNH CHO GOOGLE AI STUDIO)

Khi cấu hình Gemini trong Google AI Studio (hoặc Gemini API SDK), cung cấp các Function Declarations sau để AI có thể tự động gọi hành động điều hành sản xuất:

```json
[
  {
    "name": "dispatch_material_emergency",
    "description": "Kích hoạt lệnh điều động nguyên vật liệu khẩn cấp từ kho tổng hoặc cụm nhà máy vệ tinh để giải cứu điểm nghẽn sản xuất.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "material_code": {
          "type": "STRING",
          "description": "Mã vật tư cần điều chuyển, ví dụ: 'ALUMINUM_A980'."
        },
        "quantity_kg": {
          "type": "NUMBER",
          "description": "Khối lượng cần cấp bù (tính bằng kg)."
        },
        "from_location": {
          "type": "STRING",
          "description": "Kho nguồn, ví dụ: 'HUB_A01' hoặc 'KHV'."
        },
        "to_plant": {
          "type": "STRING",
          "enum": ["DAAL", "KTECH", "HSTEC", "HOJEONG_VINA", "DREAM_TECH"],
          "description": "Nhà máy tiếp nhận vật tư."
        },
        "transport_priority": {
          "type": "STRING",
          "enum": ["P1_EMERGENCY", "P2_STANDARD"],
          "description": "Mức độ ưu tiên vận chuyển."
        }
      },
      "required": ["material_code", "quantity_kg", "from_location", "to_plant", "transport_priority"]
    }
  },
  {
    "name": "schedule_cnc_maintenance",
    "description": "Lên lịch và gửi lệnh bảo trì/thay dao Spindle khẩn cấp cho máy CNC tại nhà máy cơ khí.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "plant_id": { "type": "STRING", "enum": ["KTECH", "DREAM_TECH"] },
        "machine_id": { "type": "STRING", "description": "Mã định danh máy, ví dụ: 'CNC-SPINDLE-04'." },
        "action_type": { "type": "STRING", "enum": ["TOOL_REPLACEMENT", "FULL_OVERHAUL", "CALIBRATION"] },
        "estimated_downtime_minutes": { "type": "INTEGER" }
      },
      "required": ["plant_id", "machine_id", "action_type"]
    }
  },
  {
    "name": "execute_counterfactual_simulation",
    "description": "Chạy mô phỏng suy luận nhân quả đối chứng (Counterfactual What-If) theo thuật toán Pearl Do-Calculus để dự báo sản lượng và OTD sau can thiệp.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "scenario_type": {
          "type": "STRING",
          "enum": ["BASELINE", "PARTIAL_INTERVENTION", "FULL_AI_OPTIMAL"]
        },
        "interventions": {
          "type": "ARRAY",
          "items": { "type": "STRING" },
          "description": "Danh sách các mã can thiệp, ví dụ: ['DISPATCH_DAAL_K1', 'SHIFT_12_SMT_HSTEC']"
        }
      },
      "required": ["scenario_type", "interventions"]
    }
  }
]
```

---

## 6. HỆ THỐNG LUỒNG SỰ KIỆN THỜI GIAN THỰC (WEBSOCKET / SSE)

### 6.1 WebSocket Endpoint: `wss://api.neurallink.internal/ws/v1/telemetry`
Dành cho việc cập nhật liên tục các hạt ánh sáng (Traveling Node Pulses) và số liệu sản lượng với độ trễ $< 12\text{ms}$.

- **Sample Stream Packet (Broadcasting to UI):**
```json
{
  "event": "CAUSAL_PULSE_EVENT",
  "data": {
    "timestamp_epoch_ms": 1750755600012,
    "active_bottleneck": "R06",
    "flow_type": "NEGATIVE_IMPACT",
    "origin_node": "N03_MATERIAL",
    "target_node": "N08_ACTUAL_OUTPUT",
    "weight": 0.82,
    "current_variance_contribution_pct": 38.5,
    "delta_actual_pcs": -29400,
    "otd_risk_pct": 68.0
  }
}
```

---

## 7. SYSTEM PROMPT MẪU CHO GOOGLE AI STUDIO

Khi bắt đầu dự án mới trong **Google AI Studio**, sao chép toàn bộ nội dung khối dưới đây dán vào ô **System Instructions**:

```text
Bạn là Trợ lý AI Điều hành Sản xuất & Kiến trúc sư Phần mềm Cao cấp của Hệ sinh thái "NEURAL LINK PRO / VOMS" (Vendor Outsourcing Management System).
Tác giả & Kiến trúc sư trưởng của hệ thống: Ngô Thanh Tùng (Chief Architect).
Chuẩn kiểm định hệ thống: GMES Causal AI Engine v4.2 • ISO 9001 / IATF 16949 Compliant • Latency < 12ms.

Cấu trúc nghiệp vụ:
1. Chuỗi gồm 7 nhà máy vệ tinh: KHV (85%), DREAM TECH (72%), HSTEC (78% - thiếu thợ SMT), KTECH (60% - mòn dao CNC), HOJEONGB (88%), HOJEONG VINA (76% - lệch mối hàn laser), DAAL (48% - điểm nghẽn P1 đứt phôi nhôm A980).
2. Sơ đồ nhân quả: Mạng DAG 18 nút / 24 liên kết, suy luận qua giải thuật Pearl Do-Calculus, phân tích phương sai Shapley Value.
3. Khi người dùng yêu cầu phân tích sự cố, hãy truy tìm nguyên nhân gốc (Root Cause), kiểm tra các quan hệ R06, R08, R05 và tự động gọi các tool function tương ứng:
   - dispatch_material_emergency
   - schedule_cnc_maintenance
   - execute_counterfactual_simulation
4. Khi sinh code Backend (FastAPI / Node.js) hoặc Frontend Components (React / Vue), luôn tuân thủ chuẩn bảng mã màu Dark Cybernetics:
   - Primary Cyan: #06b6d4 / #00f0ff
   - Critical Red: #ef4444 / #f87171
   - Warning Amber: #f59e0b
   - Background Dark: #070e1b / #0d1321
```

---
*Tài liệu được biên soạn và chuẩn hóa phục vụ trực tiếp việc nạp vào Google AI Studio.*
