# VOMS PRO PHASE 3 — IMMUTABLE AUDIT TRAIL & DECISION TRACEABILITY
**Tiêu chuẩn**: ISO 9001:2015 Clause 7.5.3 (Control of documented information), ISO/IEC 27001  
**Thuật toán mã hóa toàn vẹn**: SHA-256 Chain Hashing  

---

## 1. CẤU TRÚC BẢN GHI NHẬT KÝ KIỂM TOÁN (AUDIT LOG SCHEMA)

Mọi biến động trạng thái đề xuất, phê duyệt, từ chối, và thực thi đều tạo ra một bản ghi bất biến với cấu trúc:

```typescript
export interface AuditLogEntry {
  eventId: string;          // Khóa chính duy nhất e.g. EVT-1729851234-882
  correlationId: string;    // Mã định danh luồng xử lý e.g. CORR-2026-DISP-01
  timestampUtc: string;     // Dấu thời gian chuẩn ISO 8601 UTC
  actorId: string;          // Mã định danh người thực hiện (hoặc AI_AGENT_AUTONOMOUS)
  actorName: string;        // Tên đầy đủ của nhân sự
  actorRole: UserRole;      // Vai trò quyền hạn tại thời điểm thực hiện
  plantId: string | null;   // Nhà máy vệ tinh liên quan (hoặc null nếu toàn chuỗi)
  action: string;           // Hành động e.g. PROPOSAL_STATUS_CHANGED_APPROVED
  resource: string;         // Phân hệ e.g. HITL_FSM_WORKFLOW
  targetId: string;         // Đối tượng đích e.g. PROP-2026-P3-001
  statusBefore: any;        // Trạng thái hệ thống trước can thiệp
  statusAfter: any;         // Trạng thái hệ thống sau can thiệp
  payload: any;             // Chi tiết tham số nghiệp vụ
  ipAddress: string;        // Địa chỉ IP nguồn thực hiện
  integrityHash: string;    // Chuỗi băm mật mã SHA-256 bảo đảm tính bất biến
  isVerified: boolean;      // Kết quả đối soát toàn vẹn
}
```

---

## 2. CÔNG THỨC BĂM MẬT MÃ TOÀN VẸN (INTEGRITY HASH)

Chuỗi băm `integrityHash` được tính toán trực tiếp từ dữ liệu nguyên bản:

$$\text{Hash} = \text{SHA256}(\text{eventId} \parallel \text{correlationId} \parallel \text{timestampUtc} \parallel \text{actorId} \parallel \text{action} \parallel \text{resource} \parallel \text{JSON}(\text{payload}))$$

Nếu bất kỳ thuộc tính nào trong bản ghi bị chỉnh sửa trái phép (tampering), mã băm đối soát sẽ không trùng khớp, kích hoạt ngay cảnh báo vi phạm bảo mật hệ thống.

---

## 3. TRUY VẾT TẬN GỐC (END-TO-END CORRELATION)
Mọi quyết định từ lúc AI phát hiện cảnh báo đến khi con người phê duyệt và Action Gateway thực thi thành công đều mang chung một **`correlationId`**:
- `EVT-01`: Cảm biến rung Spindle 4.8G kích hoạt cảnh báo `ALT-2026-002`.
- `EVT-02`: AI phân tích tạo đề xuất `PROP-2026-P3-002` (correlationId: `CORR-SPINDLE-44`).
- `EVT-03`: Kỹ sư bảo trì phê duyệt đề xuất (correlationId: `CORR-SPINDLE-44`).
- `EVT-04`: Action Gateway thực thi thay dao CNC-04 (correlationId: `CORR-SPINDLE-44`).
- `EVT-05`: Kỹ sư gửi đánh giá 5 sao cho AI (correlationId: `CORR-SPINDLE-44`).

Chuyên gia đánh giá ISO/IATF có thể truy xuất trọn vẹn vòng đời của sự kiện trong vòng chưa đầy 1 giây qua API `/api/v1/audit/logs`.
