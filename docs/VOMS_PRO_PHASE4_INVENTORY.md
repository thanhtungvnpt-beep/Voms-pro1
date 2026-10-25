# VOMS PRO — PHASE 4: REPOSITORY & INTEGRATION INVENTORY

**Hệ thống:** VOMS PRO (Neural Link Pro Control Center)  
**Tiêu chuẩn tuân thủ:** GMES Enterprise Suite v4.2 PRO • ISO 9001:2015 • IATF 16949 • ISO 27001  
**Mạng lưới nhà máy:** 7 Nhà máy Vệ tinh (KHV, DREAM TECH, HSTEC, KTECH, HOJEONGB, HOJEONG VINA, DAAL)  
**Giai đoạn:** Phase 4 — Intelligent Automation, API/RPA Integration & Workflow Orchestration  

---

## 1. TỔNG QUAN TÀI SẢN KẾ THỪA VÀ MỞ RỘNG

Phase 4 kế thừa toàn vẹn và không làm gián đoạn bất kỳ tính năng, giao diện hoặc API nào của Phase 1, Phase 2 và Phase 3:
- **Phase 1 Trust Foundation:** Bảng mã 12 vai trò doanh nghiệp (RBAC), cô lập đối tác vệ tinh (`plantId`), sổ cái nhật ký kiểm toán bất biến SHA-256 (`recordAuditLog`), bộ chuẩn hóa chất lượng dữ liệu 7 nhà máy.
- **Phase 2 Optimization & Analytics:** Causal Graph 18 Nodes, Do-Calculus Counterfactual simulation, OTD Logistics Tracker, OEE Spindle Maintenance override.
- **Phase 3 AI Control Tower & HITL Gateway:** 8 phân hệ phân tích thông minh, quy trình phê duyệt Human-in-the-Loop, ma trận phân quyền thẩm định, chống tự phê duyệt (Anti-Self-Approval) và cơ chế Dual Approval cấp 4.
- **Phase 4 Intelligent Automation Engine:** Bổ sung hệ thống điều phối workflow FSM 9 trạng thái, bộ tích hợp API/RPA có ngắt mạch tự động (Circuit Breaker), quy trình đồng bộ GMES 11 bước, kiểm soát robot RPA kèm Kill Switch, và hàng đợi xử lý ngoại lệ Dead Letter Queue (DLQ).

---

## 2. KIỂM KÊ CÁC PHÂN HỆ MÃ NGUỒN (SOURCE CODE INVENTORY)

| Phân hệ / Tệp | Vai trò | Trạng thái Phase 4 |
|---|---|---|
| `server.ts` | Máy chủ Node.js/Express chính, kết nối Vite SPA dev server, gắn kết các route REST & SSE | Đã tích hợp `automationRouter` tại `/api/v1/automation` |
| `src/server/trustServices.ts` | Quản trị định danh, RBAC, Data Trust Center, Audit Trail SHA-256 | Kế thừa 100%, dùng chung phiên xác thực & Audit Log |
| `src/server/controlTowerServices.ts` | AI Control Tower, phân tích đa tác tử, HITL Action Gateway | Kế thừa 100%, bảo toàn 28/28 tests |
| `src/server/automationServices.ts` | **MỚI** — API Integration Engine, 11-step GMES Sync, RPA Control, FSM Workflow Engine, Policy Evaluator, Exception DLQ | Hoàn tất mới 100%, kiểm thử 24/24 PASS |
| `src/components/modules/AutomationControlModule.tsx` | **MỚI** — Giao diện Điều khiển Tự động hóa & RPA (Cybernetic Dark, song ngữ VI/EN/KR, 6 tab chuyên sâu) | Hoàn tất mới 100% |
| `src/components/Sidebar.tsx` | Thanh điều hướng hệ thống đa phân hệ | Bổ sung mục "Tự động hóa & RPA (P4)" |
| `src/App.tsx` | Root Component điều phối Tab view | Đã liên kết `currentTab === 'automation_center'` |
| `tests/phase4_automation_tests.ts` | **MỚI** — Bộ kiểm thử tự động 22 kịch bản (24 assertions) | 100% PASS |

---

## 3. DANH MỤC ĐẦU MỐI KẾT NỐI (INTEGRATION ENDPOINTS CATALOG)

| Mã Kết Nối | Tên Hệ Thống | Giao Thức / Auth | Chế Độ Hoạt Động | Ghi Chú Tính Trung Thực |
|---|---|---|---|---|
| `INT-GMES-CORE` | GMES Central Hub Enterprise REST API v4.2 | HTTPS REST / Bearer Token | `CONNECTED_MOCK` | Chưa kết nối GMES vật lý / Demo Mock Adapter v4.2 |
| `INT-MES-DAAL` | DAAL Siemens MES Local Gateway | HTTPS REST / API Key | `CONNECTED_MOCK` | Chưa có bộ kết nối vật lý / Adapter Contract Mode |
| `INT-RPA-CLUSTER` | UiPath / Robocorp RPA Worker Cluster | HTTPS REST / OAuth2 Mock | `CONNECTED_MOCK` | Chưa kết nối RPA Platform vật lý / Adapter Contract Mode |
| `INT-FILE-INGEST` | Secure S3/SFTP Batch CSV/Excel Gateway | SFTP / mTLS Simulated | `CONNECTED_MOCK` | Chưa kết nối SFTP vật lý / File Ingest Mock Adapter |
| `INT-NOTIFY-RELAY` | Enterprise Notification Relay (Teams/Email) | Webhook / API Key | `CONNECTED_MOCK` | Môi trường mô phỏng Webhook Notification |

---

## 4. DANH MỤC ROBOT RPA (RPA FLEET INVENTORY)

1. **`RPA-BOT-01` (BOT_MES_INGEST_01):** Robot thu thập và đồng bộ delta sản lượng đúc dập phôi nhôm DAAL & linh kiện SMT HSTEC.
2. **`RPA-BOT-02` (BOT_PO_RECONCILE_02):** Robot đối soát đơn đặt hàng PO & hóa đơn vận đơn cảng Hải Phòng Gate 4 (Đơn hàng TO-3011).
3. **`RPA-BOT-03` (BOT_SPINDLE_CALIB_03):** Robot thu thập chỉ số rung động IoT trục Spindle CNC-K4 tại nhà máy KTECH.
4. **`RPA-BOT-04` (BOT_SHIFT_HANDOVER_04):** Robot tổng hợp và xuất báo cáo bàn giao ca sản xuất theo mẫu ISO/IATF tại HOJEONGB.
