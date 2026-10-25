# VOMS PRO — PHASE 4: AUTOMATION RISK POLICIES & GOVERNANCE MATRIX

**Tiêu chuẩn:** ISO 9001:2015 • IATF 16949 • EU AI Act Safety Guardrails  

---

## 1. MA TRẬN PHÂN CẤP RỦI RO TỰ ĐỘNG HÓA 4 CẤP (4-TIER RISK MATRIX)

| Cấp Độ Rủi Ro | Phân Loại Nghiệp Vụ | Yêu Cầu Phê Duyệt Con Người | Cơ Chế Phê Duyệt | Thời Gian Chờ (Timeout) | Vai Trò Được Phép Kích Hoạt | Vai Trò Được Phép Phê Duyệt |
|---|---|---|---|---|---|---|
| **Level A** | Chỉ đọc, kiểm kê tồn kho, truy vấn viễn trắc cảm biến, đếm sản lượng | **Không** (Tự động thực thi) | N/A | 10s | Mọi vai trò tác nghiệp (`DATA_OPERATOR`, `PRODUCTION_PLANNER`, `QC`, v.v.) | N/A |
| **Level B** | Chuẩn hóa định dạng mã vạch, deduplicate staging, đồng bộ danh mục SKU | **Không** (Tự động thực thi + Ghi vết Audit) | Tự động ghi nhật ký SHA-256 | 30s | `DATA_OPERATOR`, `PRODUCTION_PLANNER`, `OUTSOURCING_GROUP`, `MANAGEMENT` | N/A |
| **Level C** | Tác động nghiệp vụ: Cấp bù vật liệu khẩn cấp, bù 12 thợ SMT, điều phối xe tải TO-3011 | **Có** (1 Phê duyệt viên độc lập) | **Anti-Self-Approval** bắt buộc: Người tạo không được tự duyệt | 120s | `PRODUCTION_PLANNER`, `OUTSOURCING_GROUP`, `EQUIPMENT_TECHNICIAN` | `APPROVER`, `MANAGEMENT`, `SYSTEM_ADMIN` |
| **Level D** | **RỦI RO CAO / ĐẶC BIỆT NGUY CẤP:** Dừng dây chuyền, reset rung trục chính spindle toàn nhà máy, hủy hợp đồng | **Có** (**DUAL APPROVAL BẮT BUỘC**) | **2 Phê duyệt viên độc lập riêng biệt**: Cấp 1 (Hội đồng Phê duyệt) + Cấp 2 (Ban Giám đốc) | 300s | `MANAGEMENT`, `OUTSOURCING_GROUP`, `SYSTEM_ADMIN` | `APPROVER` (Cấp 1) và `MANAGEMENT` / `SYSTEM_ADMIN` (Cấp 2) |

---

## 2. NGUYÊN TẮC KIỂM SOÁT KÉP (ANTI-SELF-APPROVAL)

- Nghiêm cấm tuyệt đối trường hợp người tạo quy trình tự phê duyệt quy trình của chính mình (`wf.createdBy === currentUser.id` -> trả về `HTTP 403 Forbidden - ANTI_SELF_APPROVAL_VIOLATION`).
- Đối với Level D, Người phê duyệt Cấp 2 bắt buộc phải là một cá nhân khác biệt so với Người phê duyệt Cấp 1 (`firstApproverId !== secondApproverId` -> nếu trùng trả về `HTTP 403 Forbidden - DUAL_APPROVAL_SAME_ACTOR`).
