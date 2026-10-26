# VOMS PRO — HỌC HỎI LIÊN TỤC KHÉP KÍN (MODULE G)
## CONTINUOUS LEARNING PIPELINE: FIELD EXPERIENCE HARVESTING & FORMALIZATION
**Mã tài liệu:** `VOMS-DOC-P6-M07-010`  
**Phiên bản:** `v6.0.0-PRO`  

---

### 1. QUY TRÌNH HỌC HỎI TỪ HIỆN TRƯỜNG
1. **Đề xuất (Field Submission):** Kỹ thuật viên sau khi giải quyết một sự cố mới hoặc phát hiện một mẹo thao tác tối ưu (ví dụ: điều chỉnh góc tưới nguội giúp giảm bavia nhôm) sẽ bấm "Đề xuất bài học kinh nghiệm".
2. **Xét duyệt Kỹ thuật (Technical Authority Verification):** Hồ sơ chuyển tới trạng thái `PENDING_EXPERT_REVIEW`. Kỹ sư trưởng hoặc chuyên gia thiết bị thẩm định tính an toàn và hiệu quả thực tế.
3. **Phê chuẩn & Xuất bản (Formal Publication):** Khi được duyệt, hệ thống tự động sinh mã SOP bài học mới (`SOP-LESSON-xxxx`) và nạp trực tiếp vào Knowledge Hub cho toàn bộ 7 nhà máy cùng khai thác.

---

### 2. TIÊU CHÍ CHỐNG "ẢO GIÁC TRI THỨC"
- Không cho phép tự động xuất bản đề xuất lên Knowledge Hub nếu thiếu chữ ký xác thực của chuyên gia có thẩm quyền.
- Phải có mã tham chiếu đến phiếu sự cố thực tế (`sourceIncidentId`).
- Phải ghi nhận nguyên nhân gốc rễ đã được kiểm chứng (`rootCauseVerified`).
