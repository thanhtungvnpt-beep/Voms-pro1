# VOMS PRO PHASE 5 — CORRECTIVE & PREVENTIVE ACTION (CAPA) GOVERNANCE

**Phân hệ:** CAPA Management & Human-in-the-Loop Gateway (Module F)  
**Tiêu chuẩn tuân thủ:** ISO 9001:2015 Clause 10.2 · IATF 16949 Clause 10.2.3  

---

## 1. VÒNG ĐỜI HÀNH ĐỘNG CAPA (CAPA LIFECYCLE FSM)

```
[ PROPOSAL ] ──► [ PENDING_APPROVAL ] ──► [ APPROVED ]
                        │                      │
                        ▼                      ▼
                   [ REJECTED ]          [ IN_PROGRESS ]
                                               │
                                               ▼
                                    [ PENDING_VERIFICATION ]
                                               │
                                               ▼
                                    [ VERIFIED_EFFECTIVE ]
```

---

## 2. NGUYÊN TẮC QUẢN TRỊ BẮT BUỘC

### 2.1. Quy tắc Chống Tự Phê Duyệt (Anti-Self-Approval)
- Người dùng đề xuất (`proposedBy.id`) bị hệ thống từ chối quyền ký duyệt CAPA của chính mình (Trả về lỗi `HTTP 403: ANTI_SELF_APPROVAL_VIOLATION`).
- Đảm bảo tính khách quan và kiểm soát chéo (segregation of duties) bắt buộc theo tiêu chuẩn ISO 27001 và ISO 9001.

### 2.2. Phê duyệt Kép (Dual-Approval) cho Hành động Rủi ro Cao (Cấp 4)
- Các CAPA có mức ưu tiên `CRITICAL_L4` hoặc tác động trực tiếp tới dừng máy, đổi công thức phôi hay điều chỉnh lịch xuất hàng bắt buộc phải có 2 người phê duyệt độc lập:
  - **Chữ ký 1 (Technical Review):** Chuyên viên/Trưởng phòng Kỹ thuật hoặc Điều độ (`APPROVER` / `PRODUCTION_PLANNER`).
  - **Chữ ký 2 (Executive Authorization):** Lãnh đạo VOMS hoặc Quản trị Hệ thống (`MANAGEMENT` / `SYSTEM_ADMIN`).
- Sau chữ ký 1, hệ thống lưu trạng thái vẫn là `PENDING_APPROVAL (1/2)` và chỉ chuyển sang `APPROVED` khi chữ ký thứ 2 được ghi nhận hợp lệ.

---

## 3. CHỈ TIÊU ĐO LƯỜNG ĐỊNH LƯỢNG RÕ RÀNG
Mỗi CAPA bắt buộc phải khai báo:
- `targetKpiId`: Mã chỉ số KPI dùng để nghiệm thu.
- `baselineKpiValue`: Giá trị KPI trước khi thực thi.
- `expectedKpiValue`: Giá trị KPI kỳ vọng đạt được sau cải tiến.
- `dueDate`: Hạn chót hoàn thành.
