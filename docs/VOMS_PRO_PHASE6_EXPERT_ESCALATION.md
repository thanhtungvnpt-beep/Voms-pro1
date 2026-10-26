# VOMS PRO — LEO THANG CHUYÊN GIA CẤP 4 (MODULE H)
## LEVEL 4 EXPERT ESCALATION & 30-MINUTE SLA ENGINE
**Mã tài liệu:** `VOMS-DOC-P6-M08-011`  
**Phiên bản:** `v6.0.0-PRO`  

---

### 1. QUY CHUẨN LEO THANG KỸ THUẬT
Khi một sự cố hiện trường vượt quá phạm vi xử lý của SOP thông thường hoặc thiết bị có nguy cơ dừng dây chuyền kéo dài (gây nguy cơ OTD đơn hàng giao chậm):
- Kỹ thuật viên nhấn nút **"Chuyển Cấp Chuyên Gia (Level 4)"**.
- Hệ thống đóng gói toàn bộ:
  - Thông tin thiết bị và mã lỗi.
  - Ảnh chụp lỗi hoặc phân tích quang học từ Vision AI.
  - Lịch sử đối thoại với AI Field Assistant (chat transcript snippet).
  - Các bước SOP đã thử nghiệm nhưng không thành công.

---

### 2. ĐỒNG HỒ ĐẾM NGƯỢC SLA 30 PHÚT
- Ngay khi ticket được tạo qua API `/api/v1/phase6/escalation/request`, hệ thống kích hoạt đồng hồ đếm ngược 30 phút (`slaDeadline`).
- Nếu sau 20 phút chuyên gia chưa phản hồi, cảnh báo nhấp nháy đỏ trên màn hình AI Control Tower và gửi tin nhắn khẩn cấp tới Quản đốc Nhà máy.
