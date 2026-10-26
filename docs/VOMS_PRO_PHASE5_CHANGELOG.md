# VOMS PRO PHASE 5 — CHRONOLOGICAL CHANGELOG

**Dự án:** VOMS PRO (VNPT Operations Management System Pro)  
**Nâng cấp:** Phase 5 — Operational Intelligence, D3 Geolocation & Compliance Governance  
**Ngày phát hành:** 26/10/2026  
**Chính sách tương thích:** Zero-Regression Guarantee (Bảo toàn 100% Phase 1–4)  

---

## 1. MÃ NGUỒN MỚI ĐƯỢC TẠO LẬP

1. `/src/server/operationalIntelligenceServices.ts`:
   - Xây dựng router Express xử lý toàn bộ endpoints `/api/v1/phase5/*`.
   - Máy trạng thái vòng đời triển khai (FSM) và 8 bài kiểm tra Preflight thực tế.
   - Kho lưu trữ in-memory cho 12 KPIs, bất thường, cảnh báo sớm SLA, hồ sơ RCA (5 Whys / Ishikawa), CAPA và Closed-Loop.
   - Tích hợp ghi nhật ký kiểm toán bất biến SHA-256 cho mọi hành vi chuyển trạng thái.
2. `/src/components/modules/OperationalIntelligenceModule.tsx`:
   - Giao diện điều hành chuyên sâu chuẩn Cybernetic Dark với Zero-pill discipline.
   - Hỗ trợ đa ngôn ngữ 3 thứ tiếng (Tiếng Việt, Tiếng Anh, Tiếng Hàn - VI/EN/KR).
   - 7 Tab chức năng: KPI Engine, Multidimensional Monitor, Anomaly Detection, Early Warning, Root Cause Analysis (5 Whys / Ishikawa), CAPA Governance, Closed-Loop & 7 Satellites Benchmark.
3. `/src/components/PlantGeolocationMap.tsx` & `/src/data/worldGeoData.ts`:
   - Bản đồ địa lý vệ tinh 7 nhà máy sản xuất (Việt Nam & Hàn Quốc) hiển thị trên bản đồ thế giới tương tác sử dụng **D3.js**.
   - Chiếu bản đồ địa không gian Mercator với lớp Graticule, đường bờ biển và hải trình logistics xuất khẩu (Busan, Hải Phòng, Đà Nẵng, Rotterdam, Long Beach).
   - Vòng hào quang radar xung nhịp (Pulsing radar rings) mã hóa màu theo trạng thái thời gian thực:
     - **Optimal (Tối ưu):** Màu ngọc lục bảo Emerald (#10b981).
     - **Warning (Cảnh báo):** Màu hổ phách Amber (#f59e0b).
     - **Critical (Nguy cấp):** Màu đỏ Crimson (#ef4444) kèm sóng xung kích nhấp nháy.
   - Hỗ trợ thao tác thu phóng (Zoom & Pan), góc nhìn cài sẵn (Cụm Việt Nam, HQ Hàn Quốc, Toàn cầu) và bảng thông số kỹ thuật tức thời khi chọn nhà máy.
4. `/tests/phase5_operational_intelligence_tests.ts`:
   - Bộ kiểm thử tự động gồm 25 kịch bản kiểm tra toàn diện API, FSM, RBAC, Dual-Approval và tính toán thống kê.

---

## 2. MÃ NGUỒN ĐƯỢC CẬP NHẬT MỞ RỘNG (KHÔNG PHÁ HỎNG TÍNH TƯƠNG THÍCH)

1. `/src/components/AiInsightPanel.tsx`:
   - **Dự báo xu hướng 24h bằng Recharts:** Tính toán đường cong sản lượng dự báo 24 giờ tới (H+1 đến H+24) dựa trên OEE thực tế, nhịp ca làm việc, độ mòn dao CNC và so sánh trực tiếp với đường chuẩn kế hoạch (Target ReferenceLine).
   - **Chỉ báo giám sát tuân thủ thời gian thực (ISO 9001:2015 & IATF 16949:2016):** Giám sát trạng thái đánh giá chất lượng tự động, phát hiện tài liệu không phù hợp (Non-Conformity NC) đang chờ xử lý (ví dụ: Báo cáo 8D phôi đúc DAAL, biên bản hiệu chuẩn quang học laser HOJEONG VINA), cho phép ký số duyệt trực tiếp trong feed.
   - Hỗ trợ chọn nhà máy đồng bộ 2 chiều với thanh KPI và bản đồ D3.
2. `/src/components/modules/AiControlTowerModule.tsx`:
   - **Triển khai Dịch vụ PreflightCheck:** Kiểm tra tự động 3 nhóm nhân tố then chốt:
     - *Nguồn Dữ Liệu & Vệ Tinh (Data Connectivity):* Kiểm tra độ trễ và tính liên tục của 7 nhà máy vệ tinh + GMES Mock Adapter.
     - *Toàn Vẹn Hệ Thống (System Integrity):* Kiểm tra Circuit Breakers (CLOSED) và chuỗi mã băm SHA-256.
     - *Thẩm Quyền Phân Quyền (RBAC):* Xác thực token người dùng đối chiếu với vai trò `SYSTEM_ADMIN` / `MANAGEMENT`.
   - **Khóa kích hoạt cứng (Hard-Gating):** Nút **"KÍCH HOẠT GIAI ĐOẠN 5" / "ACTIVATE PHASE 5"** bị vô hiệu hóa và cảnh báo rõ ràng nếu chưa vượt qua Preflight Check hoặc người dùng thiếu thẩm quyền.
   - Hiển thị 3 đồng hồ tóm tắt phân loại và danh sách 8 thẻ bài kiểm tra chi tiết kèm độ trễ và mã băm bằng chứng.
3. `/src/components/Sidebar.tsx` & `/src/App.tsx`:
   - Bổ sung mục điều hướng `13. Bản đồ Địa lý Vệ tinh (D3)` với biểu tượng `Globe` và huy hiệu `MAP`.
   - Bổ sung thanh chuyển đổi chế độ xem tức thời tại Màn hình Tổng quan Điều hành (Overview): chuyển đổi mượt mà giữa **Mạng Causal DAG (9 Nodes)** và **Bản Đồ Địa Lý D3.js 7 Nhà Máy**.

---

## 3. KẾT QUẢ KIỂM CHỨNG BẰNG CHỨNG
- **Linter (`tsc --noEmit`):** 0 Lỗi, 0 Cảnh báo.
- **Build (`npm run build`):** Thành công 100%.
- **Kiểm thử tự động:** 97 / 97 kịch bản vượt qua (Phase 1: 20/20, Phase 3: 28/28, Phase 4: 24/24, Phase 5: 25/25).
