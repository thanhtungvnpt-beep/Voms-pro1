# VOMS PRO PHASE 3 — CHANGELOG & VERSION HISTORY
**Phiên bản phát hành**: v3.0.0-PRO-ENTERPRISE  
**Ngày phát hành**: 2026-10-25  

---

## [3.0.0] - 2026-10-25

### Đã thêm (Added)
- **AI Control Tower Module (`AiControlTowerModule.tsx`)**:
  - Giao diện điều hành AI Pro Cybernetic Dark hợp nhất 8 domain views: Thiết bị, Kế hoạch sản xuất, Chất lượng OQC, Đối tác vệ tinh, Tin cậy dữ liệu, Quyết định AI, Cảnh báo thông minh, Cổng phê duyệt.
  - Hỗ trợ đa ngôn ngữ trilingual chuyển đổi tức thì (VI, EN, KR).
  - Tích hợp nhãn cảnh báo rõ ràng: `DEMO SIMULATION MODE — DISCONNECTED FROM LIVE PRODUCTION DB`.
- **Backend Service Phase 3 (`src/server/controlTowerServices.ts`)**:
  - Máy trạng thái hữu hạn 11 bước (Finite State Machine).
  - Chính sách chống tự phê duyệt (Strict Anti-Self-Approval) khóa mọi nỗ lực người tạo hoặc AI tự phê duyệt.
  - Chính sách rủi ro 4 cấp độ và quy trình phê duyệt kép Dual-Approval bắt buộc cho `LEVEL_4_HIGH_IMPACT`.
  - Action Execution Gateway ứng dụng Safe Adapter Pattern kèm tiền/hậu kiểm chứng số liệu đo đạc.
  - Alert Intelligence Center với bộ đếm SLA tự động leo thang cảnh báo khi quá hạn.
  - RLHF Feedback Engine ghi nhận đánh giá 1-5 sao, phân loại phản hồi và tính toán chỉ số Brier score.
- **Mở rộng RBAC Profile Switcher (`Header.tsx`)**:
  - Bổ sung vai trò doanh nghiệp: `PRODUCTION_PLANNER`, `APPROVER`, `AI_AUDITOR`.
  - Tự động lưu và phát sóng sự kiện chuyển token `voms_active_token` qua `localStorage` và `CustomEvent`.
- **Tập kiểm thử tự động toàn diện (`tests/phase3_control_tower_tests.ts`)**:
  - 28 test cases kiểm tra từ chẩn đoán AI, ma trận FSM, Anti-Self-Approval, Dual-Approval, Action Gateway, Alert SLA, Feedback và Regression đạt 100% PASS.
- **Bộ 12 tài liệu kỹ thuật chuẩn mực**:
  - Đặt tại thư mục `/docs/VOMS_PRO_PHASE3_*.md` phục vụ kiểm toán ISO 9001:2015 và IATF 16949.

### Đã bảo toàn (Preserved)
- Bảo toàn 100% 12 phân hệ nghiệp vụ hiện hữu (M01 tới M12).
- Bảo toàn giao diện di động 390px Mobile PDA Scanner và Mobile System Suite.
- Bảo toàn hệ thống đồ thị nhân quả Causal DAG và công thức Do-calculus.
- Bảo toàn toàn bộ Data Trust Center và Audit Trail từ Phase 1.
