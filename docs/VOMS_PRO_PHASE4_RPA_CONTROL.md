# VOMS PRO — PHASE 4: RPA CONTROL CENTER & BOT FLEET GOVERNANCE

**Mục tiêu:** Quản trị vòng đời, giám sát heartbeat, phân bổ tác vụ và cơ chế Kill Switch khẩn cấp cho đội ngũ Robot RPA.

---

## 1. QUẢN TRỊ ĐỘI NGŨ ROBOT (RPA FLEET GOVERNANCE)

Hệ thống quản lý 4 robot chuyên dụng cho chuỗi 7 nhà máy vệ tinh:
1. `RPA-BOT-01` (`BOT_MES_INGEST_01`): Điều phối thu thập dữ liệu chuyền dập nhôm DAAL và máy dán SMT HSTEC.
2. `RPA-BOT-02` (`BOT_PO_RECONCILE_02`): Đối soát hóa đơn và chứng từ vận tải cảng Hải Phòng Gate 4.
3. `RPA-BOT-03` (`BOT_SPINDLE_CALIB_03`): Đo đạc và đọc chỉ số rung động sensor trục Spindle CNC KTECH.
4. `RPA-BOT-04` (`BOT_SHIFT_HANDOVER_04`): Tự động kết xuất biên bản bàn giao ca sản xuất theo tiêu chuẩn ISO 9001.

---

## 2. CƠ CHẾ KILL SWITCH KHẨN CẤP (EMERGENCY KILL SWITCH)

- **Mục đích:** Ngắt nguồn hoặc dừng xử lý tác vụ ngay lập tức khi phát hiện rung động máy vượt ngưỡng an toàn (ví dụ: Spindle 4.35G), kẹt phôi hoặc sai lệch đơn hàng.
- **Quyền hạn:** `EQUIPMENT_TECHNICIAN`, `MANAGEMENT`, `SYSTEM_ADMIN`.
- **Hành động kỹ thuật:**
  - Chuyển trạng thái robot sang `KILLED`.
  - Hủy bỏ `currentJobId`.
  - Khóa mọi yêu cầu giao việc mới tới robot (`HTTP 409 Conflict - ROBOT_KILLED`).
  - Ghi nhận nhật ký kiểm toán bất biến `RPA_KILL_SWITCH_ENGAGED` kèm lý do giải trình.
- **Quy trình Phục hồi:** Robot chỉ có thể nhận việc lại sau khi kỹ sư bảo trì kiểm tra hiện trường và gửi tín hiệu Heartbeat Resume.
