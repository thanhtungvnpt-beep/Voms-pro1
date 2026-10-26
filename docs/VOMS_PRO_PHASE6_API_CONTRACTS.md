# VOMS PRO — HỢP ĐỒNG GIAO DIỆN API GIAI ĐOẠN 6
## PHASE 6 RESTFUL OPENAPI SPECIFICATIONS & INTEGRATION CONTRACTS
**Mã tài liệu:** `VOMS-DOC-P6-API-013`  
**Phiên bản:** `v6.0.0-PRO`  

---

### 1. NHÓM ĐIỀU HÀNH VÒNG ĐỜI (LIFECYCLE APIS)
- `POST /api/v1/phase6/lifecycle/preflight`: Thực thi 8 bài kiểm tra điều kiện cứng, trả về điểm số và `evidenceHash`.
- `GET /api/v1/phase6/lifecycle/status`: Truy vấn trạng thái FSM hiện tại, thời gian kích hoạt, số lượng phiếu và bài viết.
- `POST /api/v1/phase6/lifecycle/activate`: Kích hoạt vận hành Phase 6 (yêu cầu role `SYSTEM_ADMIN` hoặc `MANAGEMENT`).
- `POST /api/v1/phase6/lifecycle/pause`: Tạm dừng có kiểm soát.
- `POST /api/v1/phase6/lifecycle/resume`: Tiếp tục vận hành sau tạm dừng.
- `POST /api/v1/phase6/lifecycle/rollback`: Quay lui an toàn về baseline Phase 5.

---

### 2. NHÓM TÁC NGHIỆP HIỆN TRƯỜNG & DI ĐỘNG (FIELD APIS)
- `GET /api/v1/phase6/work-orders`: Lọc danh sách phiếu theo `plantId`, `status`, `severity`.
- `POST /api/v1/phase6/work-orders`: Khởi tạo phiếu sự cố mới kèm mã thiết bị, bằng chứng hình ảnh và cờ LOTO.
- `PUT /api/v1/phase6/work-orders/:id/status`: Cập nhật tiến độ xử lý và xác nhận an toàn thẻ khóa LOTO.
- `GET /api/v1/phase6/knowledge`: Tìm kiếm tài liệu kỹ thuật theo từ khóa hoặc mã lỗi.
- `GET /api/v1/phase6/knowledge/:code`: Lấy chi tiết quy trình chuẩn SOP có phê duyệt.
- `POST /api/v1/phase6/vision/analyze`: Phân tích hình ảnh, sinh tọa độ bounding box khuyết tật và khuyến nghị SOP.
- `POST /api/v1/phase6/voice/session`: Xử lý khẩu lệnh giọng nói, phân loại ý định và trả về văn bản phản hồi.
- `GET /api/v1/phase6/learning/lessons`: Danh sách bài học kinh nghiệm thực tế.
- `POST /api/v1/phase6/learning/propose`: Đề xuất bài học kinh nghiệm mới từ hiện trường.
- `POST /api/v1/phase6/learning/verify`: Thẩm định và xuất bản bài học thành SOP chính thức.
- `GET /api/v1/phase6/escalation/tickets`: Danh sách sự cố chuyển cấp chuyên gia.
- `POST /api/v1/phase6/escalation/request`: Yêu cầu chuyển cấp Chuyên gia Cấp 4 với hạn phản hồi SLA 30 phút.
