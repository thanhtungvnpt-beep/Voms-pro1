# VOMS PRO PHASE 5 — OPERATIONAL INTELLIGENCE & CLOSED-LOOP ARCHITECTURE

**Hệ thống:** VOMS PRO (VNPT Operations Management System Pro)  
**Tài liệu:** Kiến trúc Trí tuệ Vận hành & Vòng lặp Tối ưu hóa Khép kín (Closed-Loop Optimization)  
**Tiêu chuẩn:** ISO 9001:2015 · IATF 16949:2016 · ISO 27001  

---

## 1. SƠ ĐỒ LUỒNG ĐIỀU HÀNH VÒNG LẶP KHÉP KÍN (CLOSED-LOOP OPERATIONAL WORKFLOW)

Hệ thống hoạt động theo chu trình 8 giai đoạn khép kín nghiêm ngặt, đảm bảo dữ liệu luôn có căn cứ xác thực và mọi cải tiến đều được đo lường hiệu quả định lượng:

```
┌─────────────────────────┐
│   1. Data Trust Center  │ ──► Dữ liệu viễn trắc 7 nhà máy được kiểm tra chất lượng &
└───────────┬─────────────┘     ký mã băm SHA-256 bất biến.
            │
            ▼
┌─────────────────────────┐
│ 2. Data Quality Engine  │ ──► Kiểm tra 7 quy tắc chất lượng (thiếu trường, âm, lệch time).
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│      3. KPI Engine      │ ──► Tính toán 12 chỉ số KPI động qua 6 nhóm với công thức
└───────────┬─────────────┘     truy nguyên nguồn gốc và xử lý dữ liệu thiếu an toàn.
            │
            ▼
┌─────────────────────────┐
│  4. Anomaly Detection   │ ──► Phát hiện bất thường qua 3-Sigma, ngưỡng giới hạn và
└───────────┬─────────────┘     độ trôi Causal DAG. Đánh giá Confidence Score & Dedup.
            │
            ▼
┌─────────────────────────┐
│ 5. Early Warning System │ ──► Cảnh báo nguy cơ trễ OTD, tăng phế phẩm với đồng hồ SLA
└───────────┬─────────────┘     đếm ngược và cơ chế leo thang tự động.
            │
            ▼
┌─────────────────────────┐
│ 6. Root Cause Analysis  │ ──► Điều tra nguyên nhân gốc rễ bằng 5 Whys & biểu đồ Ishikawa
└───────────┬─────────────┘     (6M), chỉ chuyển sang VERIFIED khi có bằng chứng chứng thực.
            │
            ▼
┌─────────────────────────┐
│  7. CAPA Management     │ ──► Đề xuất hành động khắc phục/phòng ngừa; áp dụng Dual-Approval
└───────────┬─────────────┘     cấp 4 và quy tắc Anti-Self-Approval nghiêm ngặt.
            │
            ▼
┌─────────────────────────┐
│ 8. Closed-Loop Verify   │ ──► So sánh KPI Trước vs Sau cải tiến (Baseline vs Post);
└───────────┬─────────────┘     xác thực ý nghĩa thống kê (p < 0.01) và loại trừ yếu tố gây nhiễu.
            │
            └─────────────────► Cập nhật lại Baseline mới cho KPI Engine (Khép kín vòng lặp).
```

---

## 2. MA TRẬN 8 PHÂN HỆ CHỨC NĂNG (MODULES A–H)

| Mô-đun | Tên phân hệ | Trách nhiệm kỹ thuật | Giao diện | Backend API |
| :--- | :--- | :--- | :--- | :--- |
| **Module A** | KPI Intelligence Engine | Định nghĩa, tính toán và theo dõi 12 KPIs qua 6 nhóm | Tab 1: KPI Engine | `/api/v1/phase5/kpis`, `/evaluate` |
| **Module B** | Operational Dashboard | Giám sát đa chiều, lọc theo 7 nhà máy, ca kíp và chỉ số | Tab 2: Dashboard | `/api/v1/phase5/lifecycle/status` |
| **Module C** | Anomaly Detection | Phát hiện bất thường thống kê, chống cảnh báo giả | Tab 3: Anomalies | `/api/v1/phase5/anomalies`, `/detect` |
| **Module D** | Early Warning System | Dự báo nguy cơ trễ hạn, hao hụt, đếm ngược SLA | Tab 4: Early Warning | `/api/v1/phase5/early-warnings` |
| **Module E** | Root Cause Analysis (RCA) | Phân tích 5 Whys, biểu đồ xương cá 6M, xác thực chứng cứ | Tab 5: RCA | `/api/v1/phase5/rca`, `/:id/verify` |
| **Module F** | CAPA Management & HITL | Quy trình đề xuất, duyệt 2 cấp, ngăn tự duyệt, theo dõi hạn | Tab 6: CAPA | `/api/v1/phase5/capa`, `/:id/transition` |
| **Module G** | Closed-Loop Improvement | Nghiệm thu hiệu quả cải tiến định lượng, p-value | Tab 7: Closed Loop | `/api/v1/phase5/closed-loop/verify` |
| **Module H** | 7 Satellite Vendor Intel | Xếp hạng và phân loại năng lực 7 nhà máy vệ tinh | Tab 7: 7 Satellites | `/api/v1/phase5/vendor-benchmarks` |

---

## 3. NGUYÊN TẮC LIÊM CHÍNH VÀ AN TOÀN HỆ THỐNG

1. **Phân quyền nghiêm ngặt (RBAC):** Chỉ `SYSTEM_ADMIN` và `MANAGEMENT` có thẩm quyền kích hoạt, tạm dừng, tiếp tục hoặc quay lui Phase 5.
2. **Quy tắc Chống Tự Phê Duyệt (Anti-Self-Approval):** Người đề xuất hành động CAPA bị cấm tuyệt đối tham gia ký duyệt hành động của chính mình.
3. **Phê duyệt Kép (Dual-Approval) cho Rủi ro Cao (Cấp 4):** Bắt buộc có 2 chữ ký độc lập từ 2 tài khoản quản lý khác nhau trước khi chuyển trạng thái sang `APPROVED`.
4. **Nhật ký Kiểm toán Bất biến (Immutable Audit Trail):** Toàn bộ thao tác kích hoạt, tiền kiểm tra, điều chỉnh trạng thái và nghiệm thu đều được ký mã băm SHA-256 vào sổ cái kiểm toán.
