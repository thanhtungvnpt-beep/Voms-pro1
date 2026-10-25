# VOMS PRO — PHASE 4: SECURITY & DATA SANITIZATION GUIDELINES

**Tiêu chuẩn:** ISO 27001 • OWASP Top 10 API Security Risks • IATF 16949  

---

## 1. NGUYÊN TẮC BẢO MẬT PHÍA SERVER (SERVER-SIDE SECRETS)

1. **Không lộ khóa bảo mật ra Browser:**
   - Tuyệt đối không lưu trữ khóa API, chuỗi kết nối cơ sở dữ liệu, mật khẩu hoặc khóa chứng thực mTLS trong mã nguồn giao diện React/Vite.
   - Mọi kết nối tới các hệ thống bên ngoài đều chạy qua các proxy endpoint máy chủ (`/api/v1/automation/*`).
2. **Khử trùng dữ liệu nhạy cảm (Data Sanitization):**
   - Hàm `sanitizePayload()` chủ động duyệt qua mọi payload và bản ghi nhật ký.
   - Bất kỳ trường dữ liệu nào có tên chứa các từ khóa nhạy cảm (`password`, `token`, `authorization`, `secret`, `apikey`, `api_key`, `private_key`) đều được che dấu tự động thành `***REDACTED***` trước khi lưu vào cơ sở dữ liệu Audit hoặc gửi lại giao diện người dùng.

---

## 2. PHÂN QUYỀN TRUY CẬP TỐI THIỂU (LEAST PRIVILEGE RBAC)

| Nhóm Hành Động | Vai Trò Được Phép | Vai Trò Bị Ngăn Chặn |
|---|---|---|
| Kích hoạt Kill Switch Robot | `EQUIPMENT_TECHNICIAN`, `MANAGEMENT`, `SYSTEM_ADMIN` | `DATA_OPERATOR`, `VENDOR_MANAGER`, `AUDITOR` |
| Reset Circuit Breaker | `SYSTEM_ADMIN`, `MANAGEMENT` | Toàn bộ vai trò còn lại |
| Phê duyệt Quy trình Level C | `APPROVER`, `MANAGEMENT`, `SYSTEM_ADMIN` | Người tạo quy trình, `DATA_OPERATOR`, `QC` |
| Phê duyệt Quy trình Level D (Dual Approval) | Phải có đủ 2 cá nhân độc lập thuộc `APPROVER`, `MANAGEMENT`, `SYSTEM_ADMIN` | Người tạo quy trình, Người phê duyệt Cấp 1 |
| Xử lý xung đột Staging / DLQ | `DATA_OPERATOR`, `QC`, `MANAGEMENT`, `SYSTEM_ADMIN` | Khách vãng lai, tài khoản không có quyền |
