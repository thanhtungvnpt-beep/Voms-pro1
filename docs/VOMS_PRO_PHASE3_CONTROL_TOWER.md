# VOMS PRO PHASE 3 — CONTROL TOWER SPECIFICATION & 8 DOMAIN VIEWS
**Trung tâm điều hành**: AI Control Tower  
**Mục tiêu**: Giám sát hợp nhất 7 nhà máy vệ tinh và quản trị quyết định sản xuất  
**Tiêu chuẩn**: ISO 9001 / IATF 16949 / GMES Suite v4.2 PRO  

---

## 1. TỔNG QUAN 8 LĨNH VỰC HOẠT ĐỘNG (8 DOMAIN VIEWS)

AI Control Tower tích hợp 8 góc nhìn chuyên sâu phục vụ các cấp quản lý và kỹ sư:

| STT | Lĩnh vực (Domain) | Mã Domain | Chỉ số then chốt | Đối tượng cảnh báo chính |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Thiết bị & OEE | `EQUIPMENT` | OEE %, Rung động trục (G), Nhiệt độ (°C) | KTECH CNC Spindle 04 rung 4.8G |
| **2** | Kế hoạch sản xuất | `PRODUCTION_PLAN` | OTD %, Tỷ lệ trễ lịch, Tồn kho an toàn | Đơn TO-3011 DAAL trễ phôi A980 |
| **3** | Quản lý chất lượng | `QUALITY` | Tỷ lệ lỗi OQC %, Độ lệch quang học (mm) | Chuyền Laser CNC 02 lệch 0.12mm |
| **4** | Hiệu suất nhà cung cấp | `VENDOR` | Nhịp sản xuất %, Xếp hạng đối tác | HSTEC thiếu hụt 12 thợ SMT ca 1 |
| **5** | Độ tin cậy dữ liệu | `DATA_TRUST` | Điểm Trust Score %, Nguồn Sync (7/7) | Giám sát chất lượng dữ liệu Phase 1 |
| **6** | Quyết định AI | `AI_DECISIONS` | Tỷ lệ chấp thuận %, Brier Calibration | Khuyến nghị giải cứu chuỗi cung ứng |
| **7** | Trung tâm cảnh báo | `ALERTS` | Số cảnh báo P1/P2, Tỷ lệ quá hạn SLA | Tự động leo thang cấp độ cảnh báo |
| **8** | Trung tâm phê duyệt | `APPROVALS` | Hồ sơ chờ duyệt, Hồ sơ Dual-Approval | Quản trị quy trình Human-in-the-Loop |

---

## 2. GIAO DIỆN ĐA NGÔN NGỮ (TRILINGUAL SUPPORT: VI / EN / KR)

Hệ thống cung cấp chuyển đổi ngôn ngữ tức thời không tải lại trang giữa 3 ngôn ngữ bắt buộc của chuỗi cung ứng Samsung / GMES:
- **Tiếng Việt (VI)**: Cho toàn bộ kỹ sư vận hành, giám sát viên và quản đốc tại các nhà máy vệ tinh Việt Nam.
- **English (EN)**: Chuẩn quản trị doanh nghiệp quốc tế, báo cáo kiểm toán ISO và đối tác toàn cầu.
- **한국어 (KR)**: Phục vụ các chuyên gia và lãnh đạo cấp cao người Hàn Quốc điều hành sản xuất tại chuỗi SEVT / Samsung Electronics.

---

## 3. THIẾT KẾ CYBERNETIC DARK THEME & HIỂN THỊ TRÊN DI ĐỘNG

- **Aesthetic**: Giao diện mang phong cách Pro Cybernetic Dark (`bg-[#080d1a]`, viền `border-cyan-900/40`), phân cấp màu sắc rực rỡ và rõ nét:
  - Cyan / Neon Blue: Tín hiệu công nghệ và điều hướng hoạt động.
  - Emerald / Green: Trạng thái tối ưu, dữ liệu xác thực, hoàn thành an toàn.
  - Amber / Yellow: Cảnh báo cấp 2 (Level 2), trôi nhịp sản xuất, quá hạn SLA.
  - Red / Crimson: Cảnh báo P1, Level 4 High Impact, dừng chuyền khẩn cấp.
  - Purple: Trí tuệ nhân tạo, suy luận nhân quả, kiểm toán AI Governance.
- **Mobile Compatibility**: Toàn bộ lưới hiển thị co giãn linh hoạt từ màn hình 4K điều hành trung tâm tới màn hình máy tính bảng và thiết bị cầm tay 390px (PDA scanner).
