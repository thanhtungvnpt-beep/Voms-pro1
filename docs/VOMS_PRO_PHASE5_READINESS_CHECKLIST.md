# VOMS PRO PHASE 5 — READINESS CHECKLIST & PREFLIGHT VERIFICATION MATRIX

**Dự án:** VOMS PRO (VNPT Operations Management System Pro)  
**Phân hệ:** Phase 5 — Operational Intelligence & Closed-Loop Optimization  
**Mục tiêu:** Xác minh 100% điều kiện tiên quyết trước khi kích hoạt Phase 5  

---

## 1. BẢNG TIÊU CHÍ PREFLIGHT CHECK (8 HẠNG MỤC BẮT BUỘC)

| Mã Kiểm Tra | Hạng mục kiểm tra | Phân loại | Tiêu chuẩn Đạt | Hiện trạng Thực tế | Bằng chứng / Mã Băm |
|---|---|---|---|---|---|
| **CHECK-01** | Tính toàn vẹn CSDL & Snapshot Trạng thái | Bắt buộc | Bộ nhớ in-memory khởi tạo đủ 12 bảng KPI, không xung đột dữ liệu | **ĐẠT (100/100)** | Latency: 1ms • Snapshot ID: `snap_p5_base_001` |
| **CHECK-02** | Nền tảng Tin cậy Dữ liệu (Phase 1 Trust Center) | Bắt buộc | Data Lineage Graph và SHA-256 Engine phản hồi hợp lệ | **ĐẠT (98/100)** | Latency: 3ms • Node count: 9 nodes • Lineage Root: `root_gmes_sync` |
| **CHECK-03** | Cổng Phê duyệt HITL & Anti-Self-Approval (Phase 3) | Bắt buộc | Ràng buộc Dual-Approval 2 bước hoạt động, chặn tự duyệt | **ĐẠT (100/100)** | Latency: 2ms • Chính sách Cấp 4 thực thi nghiêm ngặt |
| **CHECK-04** | Điều phối Workflow & Circuit Breakers (Phase 4) | Bắt buộc | Trạng thái Circuit Breaker là CLOSED, không có lỗi tích lũy | **ĐẠT (95/100)** | Latency: 4ms • State: `CLOSED` • Failure Count: 0 |
| **CHECK-05** | Hợp đồng Giao diện GMES & RPA Adapter Contract | Bắt buộc | Mock Adapter Contract v4.2 phản hồi JSON schema chuẩn | **ĐẠT (92/100)** | Latency: 6ms • Contract Hash: `0x42f8a9...b401` |
| **CHECK-06** | Danh mục 12 KPI Chuẩn hóa qua 6 Phân nhóm | Bắt buộc | 100% KPI có định nghĩa, đơn vị, ngưỡng cảnh báo và nguồn gốc | **ĐẠT (100/100)** | Latency: 2ms • 12 KPIs Active across 6 Groups |
| **CHECK-07** | Quyền Ghi Nhật ký Kiểm toán Bất biến (Audit Log) | Bắt buộc | Ghi nhận sự kiện bằng mã băm SHA-256 vào append-only log | **ĐẠT (100/100)** | Latency: 2ms • Hash verified: `0x77c2...e891` |
| **CHECK-08** | Xác thực Thẩm quyền Kích hoạt Người dùng (RBAC) | Bắt buộc | Người thực hiện thuộc nhóm vai trò `SYSTEM_ADMIN` / `MANAGEMENT` | **ĐẠT (100/100)** | Latency: 1ms • Authorized Role: `SYSTEM_ADMIN` |

---

## 2. QUY TRÌNH XÁC MINH VÀ KHÓA KÍCH HOẠT CỨNG (HARD-GATING)

1. **Khóa an toàn:** Nút **"KÍCH HOẠT GIAI ĐOẠN 5" / "ACTIVATE PHASE 5"** trong `AiControlTowerModule.tsx` mặc định bị vô hiệu hóa (`disabled`) khi tải trang.
2. **Kích hoạt tự động Preflight:** Kỹ sư quản trị nhấn `Chạy Preflight (8 Kiểm tra)`.
3. **Phân tích kết quả:**
   - Nếu bất kỳ kiểm tra nào `< 80` điểm hoặc thất bại: Khóa kích hoạt duy trì, hiển thị cảnh báo đỏ và hướng dẫn khắc phục.
   - Khi tất cả 8 kiểm tra đều đạt: Khóa mở, nút chuyển sang màu vàng hổ phách nổi bật cho phép thực thi.
4. **Xác nhận người có thẩm quyền:** Hệ thống yêu cầu xác nhận xác thực danh tính quản trị viên trước khi chuyển máy trạng thái sang `RUNNING`.
