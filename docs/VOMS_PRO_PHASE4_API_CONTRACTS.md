# VOMS PRO — PHASE 4: API SPECIFICATIONS & CONTRACTS

**Base Path:** `/api/v1/automation`  
**Authentication:** `Authorization: Bearer <token>`  
**Headers Tuân thủ:** `x-correlation-id`, `x-idempotency-key`  

---

## 1. TỔNG HỢP CÁC ENDPOINTS

### 1.1 Overview & Metrics
- `GET /api/v1/automation/overview`
  - **Mô tả:** Trả về toàn bộ số liệu KPI tự động hóa (quy trình đang chạy, chờ duyệt, lỗi DLQ, đội robot, trạng thái ngắt mạch) và cảnh báo tính trung thực.
  - **Quyền:** Mọi người dùng đã xác thực.

### 1.2 Integration Control Center
- `GET /api/v1/automation/integrations`: Danh sách các đầu mối kết nối.
- `GET /api/v1/automation/integrations/:id`: Chi tiết đầu mối kết nối.
- `POST /api/v1/automation/integrations/:id/test-connection`: Kiểm tra bắt tay hợp đồng Adapter (trả về `latencyMs`, `disclaimer`, `isPhysicalConnected`).
- `PATCH /api/v1/automation/integrations/:id`: Điều chỉnh cấu hình timeout, rate limit, ngưỡng circuit breaker (`SYSTEM_ADMIN`, `MANAGEMENT`).

### 1.3 API Integration Engine & Circuit Breakers
- `GET /api/v1/automation/api/circuit-breakers`: Danh sách trạng thái các bộ ngắt mạch.
- `POST /api/v1/automation/api/circuit-breakers/:id/reset`: Thiết lập lại trạng thái ngắt mạch về `CLOSED`.
- `POST /api/v1/automation/api/dispatch`: Ủy quyền gọi API an toàn qua cổng Gateway kèm cơ chế khử trùng dữ liệu (`password`, `token` -> `***REDACTED***`).

### 1.4 GMES Data Synchronization (11-Step Lifecycle)
- `GET /api/v1/automation/gmes-sync/runs`: Lịch sử các đợt đồng bộ.
- `GET /api/v1/automation/gmes-sync/runs/:id`: Chi tiết đợt đồng bộ và kết quả từng bước trong 11 bước.
- `GET /api/v1/automation/gmes-sync/staging`: Danh sách các bản ghi nằm trong khu vực đệm cô lập Staging.
- `POST /api/v1/automation/gmes-sync/trigger`: Kích hoạt chu trình đồng bộ 11 bước an toàn.
- `POST /api/v1/automation/gmes-sync/staging/:recordId/resolve`: Xử lý thủ công xung đột bản ghi Staging.

### 1.5 RPA Control Center
- `GET /api/v1/automation/rpa/robots`: Danh mục đội robot cùng trạng thái heartbeat.
- `GET /api/v1/automation/rpa/runs`: Lịch sử thực thi tác vụ robot.
- `POST /api/v1/automation/rpa/robots/:id/trigger`: Giao việc cho robot thực thi kèm idempotency key.
- `POST /api/v1/automation/rpa/robots/:id/kill-switch`: Dừng khẩn cấp robot tức thời (`KILLED`), ghi vết audit log.
- `POST /api/v1/automation/rpa/robots/:id/heartbeat`: Cập nhật nhịp đập heartbeat.

### 1.6 Workflow Orchestration Engine (9-State FSM)
- `GET /api/v1/automation/workflows`: Lọc và liệt kê danh sách quy trình tự động.
- `GET /api/v1/automation/workflows/:id`: Chi tiết quy trình và tiến độ từng bước.
- `POST /api/v1/automation/workflows`: Khởi tạo quy trình mới.
- `POST /api/v1/automation/workflows/:id/execute`: Thực thi bước kế tiếp trong FSM.
- `POST /api/v1/automation/workflows/:id/approve`: Cổng phê duyệt con người (áp dụng nghiêm ngặt Anti-Self-Approval và Dual Approval cấp 4).
- `POST /api/v1/automation/workflows/:id/pause`: Tạm dừng quy trình đang chạy.
- `POST /api/v1/automation/workflows/:id/resume`: Tiếp tục quy trình đã tạm dừng.
- `POST /api/v1/automation/workflows/:id/cancel`: Hủy quy trình.

### 1.7 Policy Engine & Exception Queue (DLQ)
- `GET /api/v1/automation/policies`: Danh mục 4 cấp độ chính sách rủi ro (Level A, B, C, D).
- `POST /api/v1/automation/policies/evaluate`: Thẩm định tự động cấp độ rủi ro dựa trên chi phí, số nhà máy ảnh hưởng và thời gian dừng chuyền.
- `GET /api/v1/automation/exceptions`: Danh sách lỗi trong Hàng đợi Ngoại lệ (Dead Letter Queue).
- `POST /api/v1/automation/exceptions/:id/retry`: Thử lại tác vụ bị lỗi trong giới hạn `maxRetries`.
- `POST /api/v1/automation/exceptions/:id/resolve`: Giải quyết thủ công ngoại lệ và giải phóng khỏi DLQ.
- `POST /api/v1/automation/exceptions/:id/discard`: Loại bỏ ngoại lệ không cần xử lý.
