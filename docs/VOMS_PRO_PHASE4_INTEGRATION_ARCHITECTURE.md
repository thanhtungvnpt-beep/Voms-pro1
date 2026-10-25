# VOMS PRO — PHASE 4: INTEGRATION ARCHITECTURE

**Tiêu chuẩn:** ISO 9001:2015 • IATF 16949 • ISO 27001  
**Mục tiêu:** Kiến trúc tích hợp đa hệ thống, kết nối GMES API, Siemens MES, Cụm Robot RPA, File Ingest và Hệ thống thông báo.

---

## 1. MÔ HÌNH KIẾN TRÚC TÍCH HỢP (INTEGRATION TOPOLOGY)

```
+-----------------------------------------------------------------------------------+
|                        VOMS PRO CONTROL CENTER (CORE)                             |
|                                                                                   |
|  [ Automation Dashboard ] <--> [ Workflow FSM Engine ] <--> [ Safety Gateway ]    |
|                                         |                                         |
|  [ Circuit Breakers ]     <--> [ Idempotency Store ]   <--> [ Audit Trail SHA ]   |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                         |                         |
                v                         v                         v
     [ GMES Mock Adapter v4.2 ]  [ MES Siemens Adapter ]  [ RPA Contract Orchestrator ]
                |                         |                         |
                v                         v                         v
       (GMES Cloud REST)         (Plant Edge DAAL)         (RPA Worker Cluster)
```

---

## 2. NGUYÊN TẮC THIẾT KẾ BỘ ĐIỀU HỢP (ADAPTER DESIGN PATTERN)

1. **Adapter Contract Interface:**
   - Mọi kết nối đối ngoại đều thông qua lớp hợp đồng giao diện `IntegrationEndpoint`.
   - Các thuộc tính bắt buộc: `id`, `name`, `type`, `endpointUrl`, `authType`, `status`, `timeoutMs`, `rateLimitPerMin`, `circuitBreakerThreshold`, `avgLatencyMs`.
2. **Nguyên tắc Tính Trung thực (Honesty Boundary):**
   - Không giả lập thành công sai sự thật khi môi trường vật lý chưa được đấu nối.
   - Luôn gắn cờ `isPhysicalConnected: false` và kèm nhãn `disclaimer: "Chưa kết nối GMES vật lý / Demo Mock Adapter v4.2"`.
3. **Quản lý Ngắt mạch Tự động (Circuit Breaker):**
   - Mỗi kết nối có một Circuit Breaker riêng biệt với 3 trạng thái: `CLOSED` (bình thường), `OPEN` (ngắt mạch khi số lỗi liên tiếp vượt ngưỡng), `HALF_OPEN` (thử nghiệm thăm dò sau thời gian làm nguội `coolDownSeconds`).
4. **Idempotency Key & Deduplication:**
   - Tất cả yêu cầu biến đổi dữ liệu (POST/PATCH) đều hỗ trợ `x-idempotency-key`.
   - Nếu client gửi lại cùng mã idempotency key trong vòng đời cache, hệ thống trả về kết quả đã xử lý trước đó kèm `_idempotency: { isDuplicate: true }`, ngăn chặn trùng lặp giao dịch.
5. **Correlation ID Tracing:**
   - Mọi yêu cầu được gán `x-correlation-id` xuyên suốt từ giao diện đến middleware, log kiểm toán và phản hồi backend.
