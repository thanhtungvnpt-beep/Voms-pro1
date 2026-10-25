# VOMS PRO PHASE 3 — AI GOVERNANCE & ETHICAL SAFETY SPECIFICATION
**Khung quản trị**: EU AI Act (High-Risk Industrial Applications), NIST AI RMF, ISO/IEC 42001 (AI Management System)  
**Ủy viên kiểm toán độc lập**: Dr. Lê Hoàng Long (`AI_AUDITOR`)  

---

## 1. NGUYÊN TẮC QUẢN TRỊ AN TOÀN AI (THE 5 SAFETY PILLARS)

1. **Human Agency & Oversight (Quyền kiểm soát thuộc về con người)**:
   - AI không có quyền quyết định cuối cùng đối với bất kỳ hành động nào từ Level 2 trở lên.
   - Luôn tồn tại nút ngắt khẩn cấp ("Kill Switch") và hủy bỏ đề xuất (`CANCELLED`).
2. **Technical Robustness & Safety (Độ bền bỉ kỹ thuật & An toàn)**:
   - Khả năng phục hồi khi mất kết nối mạng.
   - Thử nghiệm trên dữ liệu nhiễu và độ lệch dung sai ngẫu nhiên.
3. **Privacy & Data Governance (Bảo mật & Quản trị dữ liệu)**:
   - Cách ly nghiêm ngặt dữ liệu sản xuất giữa 7 nhà máy vệ tinh (Vendor Isolation). Quản đốc nhà máy DAAL tuyệt đối không xem được dữ liệu nhạy cảm của KTECH hay HSTEC.
4. **Transparency & Explainability (Minh bạch & Khả năng giải thích)**:
   - Mô hình bắt buộc phải phân tách Fact - Inference - Recommendation.
   - Không chấp nhận mô hình "hộp đen" (Black Box) trong các khuyến nghị dừng chuyền hay hủy lô hàng.
5. **Diversity, Non-discrimination & Fairness (Công bằng & Khách quan)**:
   - Không thiên vị nhà máy này gây dồn tải bất công cho nhà máy khác khi điều độ dây chuyền.

---

## 2. QUY TRÌNH THU THẬP PHẢN HỒI & CHUẨN ĐỊNH LIÊN TỤC (RLHF FOR INDUSTRIAL MES)

Sau mỗi hành động hoàn tất, hệ thống kích hoạt biểu mẫu thu thập đánh giá từ kỹ sư vận hành:
- **Xếp hạng độ tin cậy**: Từ 1 đến 5 sao.
- **Phân loại phản hồi**:
  - `ACCEPTED_ACCURATE`: AI chẩn đoán và khuyến nghị chính xác hoàn toàn.
  - `MODIFIED_BY_OPERATOR`: Con người đã điều chỉnh lại một số tham số thực tế.
  - `FALSE_POSITIVE`: Báo động giả, hiện trường không có sự cố.
  - `REJECTED_UNSAFE`: Từ chối do vi phạm quy tắc an toàn lao động.
- **Tác động chuẩn định**:
  - Cập nhật ma trận hiệp phương sai Bayesian của Causal DAG.
  - Tự động điều chỉnh ngưỡng tin cậy phân loại cảnh báo.
  - Ghi nhận lịch sử cho phiên đánh giá ISO 9001 định kỳ.
