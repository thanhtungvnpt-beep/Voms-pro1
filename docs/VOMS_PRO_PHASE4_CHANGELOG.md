# VOMS PRO — PHASE 4: CHANGELOG & MIGRATION NOTES

**Phiên bản:** v4.4.0-phase4  
**Ngày phát hành:** 2026-10-25  

---

## 1. CÁC TÍNH NĂNG MỚI ĐÃ BỔ SUNG (NEW ADDITIONS)

### 1.1 Backend Services
- Bổ sung `src/server/automationServices.ts` với router `/api/v1/automation`.
- Triển khai **Integration Control Center** quản lý danh mục 5 cổng kết nối (GMES Core, Siemens MES DAAL, RPA Worker Cluster, File Ingest Gateway, Notification Webhook).
- Xây dựng **Circuit Breakers** tự động ngắt mạch bảo vệ hệ thống đối ngoại với 3 trạng thái (`CLOSED`, `OPEN`, `HALF_OPEN`).
- Tích hợp **Idempotency Engine** và **Payload Sanitizer** (tự động loại bỏ password, apikey, token).
- Hoàn thiện chu trình **Đồng bộ GMES 11 bước** (từ mTLS bắt tay tới đối soát hậu đồng bộ).
- Thiết lập **Trung tâm kiểm soát Robot RPA** với nhịp đập Heartbeat và cơ chế **Kill Switch khẩn cấp**.
- Thiết kế **Workflow Orchestration Engine 9 trạng thái FSM** kèm khóa cạnh tranh `concurrencyKey`.
- Tích hợp **Cổng Phê duyệt Con người** với cơ chế chống tự phê duyệt (**Anti-Self-Approval**) và phê duyệt kép (**Level 4 Dual-Approval**).
- Xây dựng **Hàng đợi Ngoại lệ (Dead Letter Queue - DLQ)** phân loại 9 nhóm lỗi, hỗ trợ retry và đối soát thủ công.
- Tích hợp bộ lập lịch **Scheduler & Event Trigger** chống trùng lặp.

### 1.2 Frontend Module & Navigation
- Tạo mới `src/components/modules/AutomationControlModule.tsx` chuẩn phong cách Cybernetic Dark, hỗ trợ 3 ngôn ngữ (Tiếng Việt, Tiếng Anh, Tiếng Hàn).
- Bổ sung 6 tab quản trị chuyên sâu:
  1. *Dashboard Tổng quan*
  2. *Integration Control Center*
  3. *Đồng bộ GMES (11 Bước)*
  4. *RPA Control Center*
  5. *Workflow Orchestration (FSM)*
  6. *Safety Gateway & Exception Queue*
- Cập nhật `src/components/Sidebar.tsx` với mục điều hướng "Tự động hóa & RPA (P4)".
- Cập nhật `src/App.tsx` gắn kết route `currentTab === 'automation_center'`.

---

## 2. TƯƠNG THÍCH VÀ KHÔNG THAY ĐỔI CÁC TÍNH NĂNG CŨ (ZERO REGRESSION)

- Giữ nguyên 100% các API hiện hữu:
  - `/api/v1/system/info`
  - `/api/v1/telemetry/live`
  - `/api/v1/causal/graph`
  - `/api/v1/logistics/transfer-orders`
  - `/api/v1/simulation/counterfactual`
  - Toàn bộ các route `/api/v1/control-tower/*` (Phase 3)
  - Toàn bộ các route `/api/v1/trust/*` và `/api/v1/audit/*` (Phase 1)
- Giữ nguyên 100% 12 module vận hành cũ (M01-M12), chế độ Mobile Handheld Scanner, phân hệ Develop & QA.
