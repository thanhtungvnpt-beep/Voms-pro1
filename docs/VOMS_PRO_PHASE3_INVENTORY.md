# VOMS PRO PHASE 3 — REPOSITORY & SYSTEM INVENTORY REPORT
**Hệ thống**: Neural Link Pro / VOMS PRO Control Center & Causal AI GMES Suite v4.2  
**Tiêu chuẩn tuân thủ**: ISO 9001:2015, IATF 16949, ISO/IEC 27001, EU AI Act Guardrails  
**Kiến trúc sư trưởng**: Ngô Thanh Tùng (Chief Enterprise Architect)  
**Thời điểm kiểm kê**: 2026-10-25T11:30:00Z  

---

## 1. BẢNG ĐỐI CHIẾU TIẾN ĐỘ & BẢO TOÀN DI SẢN (PHASE 1, 2, 3)

| Phân hệ / Mô-đun | Trạng thái Phase 1 & 2 | Trạng thái Phase 3 | Cam kết bảo toàn chức năng |
| :--- | :--- | :--- | :--- |
| **M01: Tổng quan điều hành** | Active (Live Telemetry 12ms) | Tích hợp AI Control Tower | Giữ nguyên 100% KPI bar, DAG, 7 nhà máy |
| **M02: Kế hoạch sản xuất** | Active (Gantt Matrix) | Tích hợp Drift Detection | Giữ nguyên ma trận Gantt, bổ sung AI Schedule Alert |
| **M03: Sản lượng thực tế** | Active (PDA Handheld) | Tích hợp Dedup & Trust | Giữ nguyên màn hình quét barcode 390px |
| **M04: Giao hàng & OTD** | Active (Transfer Orders) | Tích hợp OTD Risk Inference | Giữ nguyên bảng đơn vận TO-3011, TO-3018, TO-3022 |
| **M05: Chất lượng OQC** | Active (AOI Laser Defect) | Tích hợp Optical Drift AI | Giữ nguyên modal hiệu chuẩn, thêm Dual-Approval L4 |
| **M06: Quản trị nhân sự** | Active (SMT Workforce) | Tích hợp Anomaly Detector | Giữ nguyên bù thợ ca 1, thêm kiểm tra hiện trường |
| **M07: Thiết bị & OEE** | Active (TPM Spindle 04) | Tích hợp IoT Predictive Maint | Giữ nguyên rung động 4.8G, thêm Action Gateway |
| **M08: Kho vật liệu phôi** | Active (A980 Billet) | Tích hợp Emergency Dispatch | Giữ nguyên điều xe tải TK-77, thêm FSM audit trail |
| **M09: Prebuild & Rework** | Active (Buffer Rework) | Tích hợp Quarantine Adapter | Giữ nguyên buffer lô phế phẩm |
| **M10: Causal AI Deep Dive**| Active (Do-calculus & DAG) | Nền tảng lõi cho Phase 3 | Cung cấp trọng số p-value cho AI Analysis Engine |
| **M11: Báo cáo ISO/IATF** | Active (Report Generator) | Bổ sung Brier Score Audit | Lưu vết kiểm toán AI Governance |
| **M12: Cài đặt hệ thống** | Active (Parameter tuning) | Bổ sung HITL Risk Thresholds | Thiết lập ngưỡng phân loại Risk Level 1-4 |
| **Data Trust Center (P1)**| Hoàn thành (7 Data Sources)| Kế thừa trực tiếp | Nguồn cấp bằng chứng vi mô cho AI Engine |
| **HITL & Audit Trail (P1)**| Hoàn thành (FSM sơ khởi) | Nâng cấp toàn diện | Mở rộng 11 trạng thái FSM, Dual-Approval Level 4 |
| **AI Control Tower (P3)** | Chưa có | **Triển khai mới 100%** | Trung tâm điều hành 8 domain views, trilingual |

---

## 2. KIỂM KÊ TOÀN DIỆN MÃ NGUỒN FRONTEND & BACKEND

### 2.1. Mã nguồn Frontend (`src/`)
- `src/App.tsx`: Bộ điều phối trung tâm quản lý tab, state phân hệ và tích hợp `AiControlTowerModule`.
- `src/components/Header.tsx`: Thanh điều hướng cybernetic tích hợp Profile Switcher cho 12 vai trò doanh nghiệp và đồng bộ token `localStorage`.
- `src/components/Sidebar.tsx`: Menu điều hướng phân cấp (Vận hành, Phase 1 Trust, Phase 3 Tower, Phân hệ Develop).
- `src/components/modules/AiControlTowerModule.tsx`: Thành phần giao diện điều hành AI Phase 3 với 8 domain views, hỗ trợ đa ngôn ngữ VI/EN/KR, mô hình lý giải 3 phần (Fact - Inference - Recommendation), và modal tương tác phê duyệt.
- `src/components/modules/DataTrustCenterModule.tsx`: Quản trị chất lượng dữ liệu và kiểm kê 7 nguồn vệ tinh.
- `src/components/modules/AuditLogApprovalModule.tsx`: Truy vết nhật ký bất biến SHA-256.

### 2.2. Mã nguồn Backend (`src/server/`)
- `server.ts`: Server Node.js Express tích hợp Vite middleware, chạy tại port 3000.
- `src/server/trustServices.ts`: Dịch vụ xác thực token Bearer, RBAC, cách ly nhà máy vệ tinh (Vendor Isolation), băm bảo mật SHA-256.
- `src/server/controlTowerServices.ts`: Bộ định tuyến `/api/v1/control-tower` bao gồm:
  - FSM 11 trạng thái với ma trận chuyển tiếp nghiêm ngặt.
  - Chính sách chống tự phê duyệt (Anti-Self-Approval) ngăn cản người tạo hoặc AI tự phê duyệt.
  - Cơ chế Dual-Approval bắt buộc đối với rủi ro cấp 4 (`LEVEL_4_HIGH_IMPACT`).
  - Action Execution Gateway với Adapter an toàn và tiền/hậu kiểm chứng (Pre/Post verification).
  - Alert Intelligence Center với bộ đếm SLA và tự động leo thang (Auto-Escalation).
  - Feedback Calibration Engine đo lường Brier score và tỷ lệ báo động giả (FP Rate).

---

## 3. KIỂM KÊ DỮ LIỆU & PHẠM VI 7 NHÀ MÁY VỆ TINH

Mọi logic và bảng dữ liệu được kiểm soát chặt chẽ theo mã định danh 7 nhà máy vệ tinh của GMES:
1. **KHV** (Bắc Ninh) — Dập & Khung vỏ chính (Tối ưu 85.3% OEE).
2. **DREAM_TECH** (Bắc Ninh) — Bảng mạch SMT cao tầng (Ổn định 72.2%).
3. **HSTEC** (Hà Nội) — SMT & Lắp ráp vi mô (Cảnh báo thiếu 12 thợ SMT chuyền 2).
4. **KTECH** (Thái Nguyên) — Tiện phay CNC chính xác (Cảnh báo rung Spindle 04 đạt 4.8G).
5. **HOJEONGB** (Bắc Giang) — Khuôn mẫu & Ép đúc (Vượt nhịp 88.4%).
6. **HOJEONG_VINA** (Bắc Ninh) — Hàn Laser vi mô (Lệch tiêu cự quang học 0.12mm, phế phẩm 12%).
7. **DAAL** (Hải Phòng) — Đúc áp lực nhôm (Khẩn cấp: đứt phôi nhôm A980, đe dọa trễ đơn TO-3011).

*Tuyên bố minh bạch*: Hệ thống đang vận hành ở chế độ **DEMO SIMULATION MODE** có gắn cờ cảnh báo rõ ràng; chưa kết nối trực tiếp database vật lý của nhà máy đối tác bên ngoài mà không có xác thực mTLS.
