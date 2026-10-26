# VOMS PRO — VẬN HÀNH DI ĐỘNG HIỆN TRƯỜNG (MODULE D)
## MOBILE OPERATIONS & OFFLINE QUEUE RESILIENCE
**Mã tài liệu:** `VOMS-DOC-P6-M04-008`  
**Phiên bản:** `v6.0.0-PRO`  

---

### 1. TIÊU CHUẨN THIẾT KẾ DI ĐỘNG (MOBILE-FIRST)
- Tối ưu hóa cho thiết bị di động cầm tay (PDA công nghiệp, smartphone kích thước từ 390px chiều ngang).
- Các nút bấm có kích thước chạm tối thiểu 44px x 44px, độ tương phản cao, giao diện tối Cybernetic Dark Theme chống lóa mắt dưới ánh đèn phân xưởng.
- Khả năng lọc nhanh theo 7 nhà máy vệ tinh chỉ bằng 1 thao tác cuộn ngang.

---

### 2. CƠ CHẾ ĐỒNG BỘ NGOẠI TUYẾN (OFFLINE QUEUE SYNC)
Trong trường hợp di chuyển vào góc khuất sóng Wi-Fi hoặc trạm biến áp gây nhiễu sóng:
- Các thao tác ghi nhận sự cố, đánh dấu hoàn thành bước SOP được lưu tạm vào hàng đợi cục bộ `localStorage` / `IndexedDB`.
- Khi thiết bị khôi phục kết nối mạng, hệ thống tự động đẩy hàng đợi lên API `/api/v1/phase6/work-orders` kèm mã băm bằng chứng tại thời điểm ghi nhận thực tế.
