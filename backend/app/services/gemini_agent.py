import os
import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

dispatch_material_func = FunctionDeclaration(
    name="dispatch_material_emergency",
    description="Kích hoạt lệnh điều động nguyên vật liệu khẩn cấp từ kho tổng Hub A01 hoặc các cụm nhà máy vệ tinh để giải cứu cam kết giao hàng OTD.",
    parameters={
        "type": "OBJECT",
        "properties": {
            "material_code": {"type": "STRING", "description": "Mã phôi vật tư (VD: 'ALUMINUM_A980')."},
            "quantity_kg": {"type": "NUMBER", "description": "Khối lượng điều chuyển (kg)."},
            "source_hub": {"type": "STRING", "description": "Kho nguồn (VD: 'HUB_A01')."},
            "target_plant": {"type": "STRING", "enum": ["DAAL", "KTECH", "HSTEC", "HOJEONG_VINA"], "description": "Nhà máy tiếp nhận."},
            "priority": {"type": "STRING", "enum": ["KHẨN CẤP", "TIÊU CHUẨN"]}
        },
        "required": ["material_code", "quantity_kg", "source_hub", "target_plant", "priority"]
    }
)

counterfactual_sim_func = FunctionDeclaration(
    name="execute_counterfactual_simulation",
    description="Chạy mô phỏng nhân quả can thiệp đối chứng theo thuật toán Pearl Do-Calculus để dự báo tỷ lệ OTD và mức phục hồi sản lượng.",
    parameters={
        "type": "OBJECT",
        "properties": {
            "scenario_type": {"type": "STRING", "enum": ["BASELINE", "SCENARIO_A_DAAL_ONLY", "SCENARIO_B_FULL_AI_OPTIMAL"]},
            "interventions": {
                "type": "ARRAY",
                "items": {"type": "STRING"},
                "description": "Danh sách các can thiệp (VD: ['DISPATCH_3200KG_A980', 'AUGMENT_12_SMT_HSTEC'])"
            }
        },
        "required": ["scenario_type", "interventions"]
    }
)

manufacturing_tools = Tool(function_declarations=[dispatch_material_func, counterfactual_sim_func])

SYSTEM_INSTRUCTION = """
Bạn là Trợ lý AI Điều hành Sản xuất & Kiến trúc sư Trưởng của Hệ sinh thái "NEURAL LINK PRO / VOMS" (Vendor Outsourcing Management System).
Tác giả & Kiến trúc sư trưởng của hệ thống: Ngô Thanh Tùng (Chief Architect).
Chuẩn vận hành: GMES Enterprise Suite v4.2 PRO • ISO 9001 / IATF 16949 Compliant • Latency < 12ms.

CẤU TRÚC NGHIỆP VỤ & QUY TẮC SUY DIỄN:
1. Chuỗi gồm 7 nhà máy vệ tinh: KHV (85%), DREAM TECH (72%), HSTEC (78% - thiếu 12 thợ SMT), KTECH (60% - mòn dao CNC R08), HOJEONGB (88%), HOJEONG VINA (76% - lệch hàn laser 12%), DAAL (48% - điểm nghẽn P1 Critical đứt phôi nhôm A980).
2. Sơ đồ nhân quả: Mạng DAG 18 nút / 24 liên kết, suy luận qua thuật toán Pearl Do-Calculus và phân rã Shapley Value.
3. Khi người dùng hỏi về tiến độ ca, nguyên nhân trễ hạn hoặc yêu cầu cứu vãn chỉ tiêu OTD:
   - Truy tìm nguyên nhân gốc: R06 (DAAL), R08 (KTECH), R04 (HSTEC).
   - Tự động gọi Function Calling: dispatch_material_emergency hoặc execute_counterfactual_simulation.
"""

def get_neural_link_agent():
    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro-latest",
        system_instruction=SYSTEM_INSTRUCTION,
        tools=[manufacturing_tools]
    )
    return model
