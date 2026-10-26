# VOMS PRO — KIẾN TRÚC HỆ THỐNG GIAI ĐOẠN 6
## AI FIELD ASSISTANT & MOBILE INTELLIGENCE ARCHITECTURE
**Mã tài liệu:** `VOMS-DOC-P6-ARCH-002`  
**Phiên bản:** `v6.0.0-PRO`  

---

### 1. MÔ HÌNH KIẾN TRÚC PHÂN TẦNG (LAYERED ARCHITECTURE)

```
+-----------------------------------------------------------------------------------+
|               TẦNG TRẢI NGHIỆM NGƯỜI DÙNG HIỆN TRƯỜNG (PRESENTATION LAYER)         |
|  - Thiết kế thích ứng 390px (Mobile-First responsive)                             |
|  - Giao diện trợ lý hiện trường (MobileFieldAssistantModule.tsx)                  |
|  - Web Speech Recognition & SpeechSynthesis TTS Engine                           |
|  - Canvas biểu diễn Bounding Boxes khi phân tích hình ảnh khiếm khuyết            |
|  - Đa ngôn ngữ trilingual (Tiếng Việt · English · 한국어)                         |
+-----------------------------------------------------------------------------------+
                                        | (REST APIs / JSON HTTP & Audio WebSocket)
+-----------------------------------------------------------------------------------+
|               TẦNG ĐIỀU HÀNH VÒNG ĐỜI & GIAO TIẾP (ORCHESTRATION LAYER)           |
|  - Phase 6 Finite State Machine (FSM): NOT_STARTED -> READY -> RUNNING (PAUSED)   |
|  - Preflight Gating Engine (8 bài kiểm tra điều kiện cứng)                         |
|  - Master Activation Guard & Phân quyền RBAC (SYSTEM_ADMIN / MANAGEMENT)         |
|  - Deep-link Router & Cross-module Event Bus (voms-navigate-tab)                  |
+-----------------------------------------------------------------------------------+
                                        |
+-----------------------------------------------------------------------------------+
|               TẦNG MÔ-ĐUN DỊCH VỤ CHUYÊN BIỆT (SERVICE LAYER A-H)                 |
|  - Mod A: Trợ lý AI & Khung hướng dẫn SOP từng bước kèm cảnh báo thẻ khóa LOTO   |
|  - Mod B: Voice AI Engine & Xử lý ngôn ngữ tự nhiên công nghiệp (NLP Commands)    |
|  - Mod C: Vision AI Defect Inspector & Nhận diện bề mặt dao / quang học laser     |
|  - Mod D: Mobile Operations Engine & Cơ chế hàng đợi ngoại tuyến (Offline Queue)  |
|  - Mod E: Quản lý Phiếu Công việc & Sự cố Hiện trường (Digital Work Orders)      |
|  - Mod F: Kho Tri thức Kỹ thuật Số hóa (Knowledge Hub SOPs)                      |
|  - Mod G: Quy trình Học hỏi Liên tục (Continuous Learning Review Pipeline)        |
|  - Mod H: Kênh Leo thang Chuyên gia Kỹ thuật Cấp 4 với Đồng hồ đếm ngược SLA 30m |
+-----------------------------------------------------------------------------------+
                                        |
+-----------------------------------------------------------------------------------+
|               TẦNG BẢO MẬT, KIỂM TOÁN & LƯU TRỮ (PERSISTENCE & SECURITY LAYER)    |
|  - Bảng băm chuỗi khối kiểm toán SHA-256 (Audit Trail Engine)                    |
|  - CSDL In-Memory đồng bộ cao (Atomic Store cho Work Orders, SOPs, Lessons)       |
|  - Kế thừa toàn vẹn dữ liệu từ Phase 1 (Data Trust), Phase 3 (HITL), Phase 5     |
+-----------------------------------------------------------------------------------+
```

---

### 2. LUỒNG DỮ LIỆU ĐÓNG VÒNG (CLOSED-LOOP DATA FLOW)
1. **Phát hiện:** Kỹ thuật viên hiện trường quan sát hoặc hệ thống AI cảnh báo sự cố (ví dụ: Spindle rung 4.2G tại KTECH, lệch laser tại HOJEONG VINA).
2. **Tiếp nhận bằng Đa phương thức:** Nhận khẩu lệnh giọng nói qua mic (Voice AI) hoặc chụp ảnh chi tiết lỗi (Vision AI).
3. **Đối soát Tri thức:** Hệ thống tự động tra cứu trong Knowledge Hub (SOP-CNC-SPINDLE-04, SOP-LASER-CALIB-01) và hiển thị các bước xử lý kèm cảnh báo an toàn LOTO bắt buộc.
4. **Khởi tạo Phiếu Công việc:** Tạo Digital Work Order với độ ưu tiên HIGH/CRITICAL, gán người thực hiện và giám sát tiến độ hoàn thành checklist an toàn.
5. **Chuyển cấp khi vượt thẩm quyền:** Nếu sự cố bất khả kháng sau các bước thông thường, kích hoạt Escalation Cấp 4 gửi tới chuyên gia với SLA 30 phút.
6. **Thu hoạch Bài học:** Sau khi xử lý thành công, kỹ thuật viên gửi đề xuất kinh nghiệm thực tế (Lesson Proposal); Chuyên gia Cấp cao xét duyệt và tự động đưa vào Knowledge Hub thành quy trình chuẩn mới.
