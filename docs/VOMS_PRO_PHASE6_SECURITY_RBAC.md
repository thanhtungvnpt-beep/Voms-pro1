# VOMS PRO — BẢO MẬT HIỆN TRƯỜNG & PHÂN QUYỀN RBAC PHASE 6
## FIELD ROLE-BASED ACCESS CONTROL & SHA-256 AUDIT TRAILS
**Mã tài liệu:** `VOMS-DOC-P6-SEC-012`  
**Phiên bản:** `v6.0.0-PRO`  

---

### 1. MA TRẬN PHÂN QUYỀN HIỆN TRƯỜNG (FIELD RBAC MATRIX)

| Nhóm vai trò | Mã Role | Quyền hạn tra cứu SOP | Quyền tạo / sửa Work Order | Quyền duyệt bài học (G) | Quyền kích hoạt Phase 6 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Kỹ thuật viên Hiện trường** | `MAINTENANCE_TECH` | Xem toàn bộ SOP | Tạo mới, Cập nhật trạng thái | Đề xuất bài học | Không có quyền (403) |
| **Công nhân Vận hành** | `OPERATOR_VIEW_ONLY`| Xem SOP theo chuyền | Báo cáo sự cố cơ bản | Không | Không có quyền (403) |
| **Quản đốc / Quản lý Phân xưởng** | `MANAGEMENT` | Toàn quyền | Phân công, Duyệt đóng phiếu | Ký duyệt bài học | Có quyền kích hoạt |
| **Chuyên gia Cấp cao Thiết bị** | `SENIOR_ENGINEER` | Toàn quyền | Tham gia Escalation L4 | Thẩm định & Xuất bản SOP | Không có quyền |
| **Quản trị viên Hệ thống** | `SYSTEM_ADMIN` | Toàn quyền | Quản trị toàn diện | Quản trị toàn diện | Toàn quyền kích hoạt & rollback |

---

### 2. TÍNH BẤT BIẾN CỦA NHẬT KÝ KIỂM TOÁN SHA-256
Mọi hành động:
- Chạy Preflight kiểm tra.
- Kích hoạt / Tạm dừng / Tiếp tục / Quay lui Phase 6.
- Tạo phiếu sự cố và cập nhật trạng thái LOTO.
- Đề xuất và phê duyệt bài học kinh nghiệm.
Đều được nối vào chuỗi khối `AUDIT_LOGS_DB` với mã băm:
`H = SHA256(eventId | correlationId | timestamp | actor | action | resource | payload)`
Đảm bảo tuân thủ nghiêm ngặt chuẩn ISO 9001:2015 Mục 7.5 và IATF 16949 Mục 9.2.
