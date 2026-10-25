# VOMS PRO PHASE 3 — REST API CONTRACT & INTERFACE SPECIFICATION
**Giao thức**: HTTP REST / JSON  
**Base Path**: `/api/v1/control-tower`  
**Xác thực**: Bearer Token Authorization (`Authorization: Bearer <token>`)  

---

## 1. DANH SÁCH ENDPOINT & PHÂN QUYỀN TRUY CẬP

| Phương thức | Đường dẫn Endpoint | Vai trò cho phép | Chức năng nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `GET` | `/overview` | Tất cả vai trò xác thực | Lấy tổng quan KPI Control Tower & 8 domain health |
| `GET` | `/domains/:domain` | Tất cả vai trò xác thực | Xem chi tiết cảnh báo & đề xuất của 1 domain |
| `GET` | `/analysis/recommendations` | Tất cả vai trò xác thực | Lấy danh sách đề xuất AI (bộ lọc: domain, plant, status, min_confidence) |
| `POST` | `/analysis/diagnose` | Admin, Mgmt, Outsourcing, Planner, Tech, QC | Kích hoạt phiên chẩn đoán AI tức thời cho 1 nhà máy |
| `POST` | `/proposals/:id/transition` | Admin, Mgmt, Outsourcing, Planner, Approver, Tech, QC | Chuyển trạng thái FSM (Phê duyệt, từ chối, yêu cầu thêm tin) |
| `POST` | `/actions/execute` | Admin, Mgmt, Outsourcing, Planner, VendorMgr, Approver | Thực thi hành động an toàn qua Action Gateway (bắt buộc APPROVED) |
| `GET` | `/alerts` | Tất cả vai trò xác thực | Lấy danh sách cảnh báo nhóm theo cụm và SLA |
| `POST` | `/alerts/check-escalations` | Tất cả vai trò xác thực | Kích hoạt kiểm tra hạn SLA và tự động nâng cấp cảnh báo |
| `POST` | `/alerts/:id/acknowledge` | Tất cả vai trò xác thực | Xác nhận đã tiếp nhận xử lý cảnh báo |
| `GET` | `/feedback/metrics` | Tất cả vai trò xác thực | Lấy chỉ số chuẩn định AI (Brier score, FP rate, tỷ lệ chấp thuận) |
| `POST` | `/feedback` | Tất cả vai trò xác thực | Gửi đánh giá sao và nhận xét thực tế về quyết định của AI |

---

## 2. CHI TIẾT MẪU YÊU CẦU & PHẢN HỒI (REQUEST / RESPONSE SAMPLES)

### 2.1. Phê duyệt đề xuất (`POST /proposals/:id/transition`)
**Request Header**:
```http
Authorization: Bearer token_mgmt_lead_access_5521
Content-Type: application/json
```
**Request Body**:
```json
{
  "targetStatus": "APPROVED",
  "note": "Phê duyệt điều phối xe tải TK-77 giải cứu đơn TO-3011"
}
```
**Response 200 OK**:
```json
{
  "message": "Proposal 'PROP-2026-P3-001' transitioned from 'PENDING_REVIEW' to 'APPROVED'.",
  "proposal": {
    "id": "PROP-2026-P3-001",
    "status": "APPROVED",
    "approvals": [
      {
        "approverId": "USR-MGMT-02",
        "approverName": "Phạm Hồng Quân (Giám đốc Sản xuất)",
        "approverRole": "MANAGEMENT",
        "approvedAt": "2026-10-25T11:25:00.000Z",
        "note": "Phê duyệt điều phối xe tải TK-77 giải cứu đơn TO-3011"
      }
    ]
  }
}
```

### 2.2. Lỗi tự phê duyệt (`403 SELF_APPROVAL_FORBIDDEN`)
**Response 403 Forbidden**:
```json
{
  "error": "SELF_APPROVAL_FORBIDDEN",
  "message": "The creator or requester of a proposal cannot approve their own proposal. Independent human review is required."
}
```

### 2.3. Thực thi hành động an toàn (`POST /actions/execute`)
**Request Body**:
```json
{
  "proposalId": "PROP-2026-P3-001",
  "verificationMode": "STRICT_TELEMETRY"
}
```
**Response 200 OK**:
```json
{
  "success": true,
  "message": "Action 'DISPATCH_MATERIAL' executed and verified successfully.",
  "executionResult": {
    "executedAt": "2026-10-25T11:29:19.420Z",
    "executedBy": "Ngô Thanh Tùng (Chief Architect / System Admin)",
    "success": true,
    "verificationLog": "Đã gửi lệnh điều vận xe tải đến Trung tâm Logistics. Cập nhật tồn kho DAAL +5,600kg phôi nhôm A980. Giảm thời gian trễ đơn TO-3011 xuống 0 phút.",
    "postExecutionMetrics": {
      "targetPlant": "DAAL",
      "stockAddedKg": 5600,
      "riskOtdReductionPct": 52
    }
  }
}
```
