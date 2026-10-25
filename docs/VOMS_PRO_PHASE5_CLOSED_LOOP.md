# VOMS PRO PHASE 5 — CLOSED-LOOP IMPROVEMENT & CAUSAL VERIFICATION

**Phân hệ:** Closed-Loop Improvement & Effectiveness Verification (Module G)  
**Tiêu chuẩn thống kê:** Statistical Hypothesis Testing · Causal Inference Evaluation  

---

## 1. NGUYÊN LÝ NGHIỆM THU HIỆU QUẢ CẢI TIẾN KHÉP KÍN

Hệ thống VOMS PRO Phase 5 không đánh dấu CAPA hoàn thành chỉ bằng báo cáo giấy tờ hoặc xác nhận hành chính. Mỗi CAPA chỉ được cấp chứng chỉ `VERIFIED_EFFECTIVE` khi dữ liệu viễn trắc đo lường thực tế chứng minh hiệu quả định lượng:

1. **So sánh Trước vs Sau (Baseline vs Post-Improvement):**
   - Đo lường KPI trong khung thời gian tương đương (VD: 24 giờ trước vs 24 giờ sau cải tiến).
   - Tính toán tỷ lệ phần trăm cải thiện: $\Delta\% = \frac{V_{\text{post}} - V_{\text{baseline}}}{V_{\text{baseline}}} \times 100\%$.
2. **Kiểm định Ý nghĩa Thống kê (Statistical Significance):**
   - Tính toán giá trị p-value dựa trên phân phối kiểm định.
   - Điều kiện đạt: $p < 0.01$ (độ tin cậy $> 99\%$).
3. **Xác thực Tính Nhân quả & Kiểm soát Yếu tố Gây nhiễu (Causal Control):**
   - Hệ thống đánh giá xem sự cải thiện có thực sự đến từ hành động CAPA hay chỉ là trùng hợp ngẫu nhiên do thay đổi khối lượng ca làm việc, nhiệt độ môi trường, hay lô vật tư khác.
   - Các yếu tố gây nhiễu được kiểm soát (Confounding Factors Controlled) được ghi nhận minh bạch vào chứng chỉ nghiệm thu.

---

## 2. CHỨNG CHỈ NGHIỆM THU HIỆU QUẢ THỰC TẾ

| Mã nghiệm thu | Mã CAPA | Chỉ số KPI | Trước cải tiến | Sau cải tiến | Mức cải thiện | Ý nghĩa thống kê | Kết luận hiệu quả |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CLO-2026-001** | CAPA-2026-003 | Tỷ lệ hàn lỗi Rework Laser (HOJEONG VINA) | 4.8% | 1.2% | **-75.0% lỗi** | $p = 0.0008 < 0.01$ | `HIGHLY_EFFECTIVE` |
| **CLO-2026-002** | CAPA-2026-001 | Tỷ lệ Giao hàng Đúng hạn OTD (DAAL) | 47.8% | 86.4% | **+80.7% OTD** | $p = 0.0015 < 0.01$ | `HIGHLY_EFFECTIVE` |
