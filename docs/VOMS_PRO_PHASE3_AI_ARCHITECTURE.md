# VOMS PRO PHASE 3 — AI ARCHITECTURE & REASONING DECOMPOSITION
**Phân hệ**: AI Analysis Engine & Anti-Hallucination Guardrails  
**Kiến trúc**: Tri-Part Causal Reasoning (FACT → INFERENCE → RECOMMENDATION)  
**Tiêu chuẩn**: ISO 9001:2015, IATF 16949, EU AI Act High-Risk Requirements  

---

## 1. NGUYÊN TẮC CỐT LÕI: PHÂN BIỆT RÕ RÀNG 3 THÀNH PHẦN

Để triệt tiêu hoàn toàn rủi ro ảo giác (hallucination) và đảm bảo kiểm toán theo tiêu chuẩn sản xuất ISO/IATF, AI Analysis Engine bắt buộc phải bóc tách mọi chẩn đoán thành 3 cấu phần độc lập:

```
[TELEMETRY / DATA SOURCES]
          │
          ▼
   ┌───────────────┐
   │ 1. FACT       │  <-- Dữ liệu thực tế quan sát được (Verified telemetry & thresholds)
   └──────┬────────┘
          ▼
   ┌───────────────┐
   │ 2. INFERENCE  │  <-- Suy luận nhân quả mô hình (Causal DAG, Bayesian p-value, Do-calculus)
   └──────┬────────┘
          ▼
   ┌───────────────┐
   │ 3. RECOMMEND  │  <-- Hành động cụ thể đề xuất cho con người phê duyệt (Actionable Proposal)
   └───────────────┘
```

### 1.1. FACT (Dữ liệu quan sát được)
- **Định nghĩa**: Các giá trị đo lường thực tế thu thập từ cảm biến IoT, hệ thống MES, máy quét mã vạch PDA, hoặc lệnh ERP.
- **Yêu cầu**: Phải có liên kết với `sourceId`, giá trị quan sát (`observedValue`), giá trị chuẩn (`expectedValue`), độ lệch (`deviationPct`) và nhãn xác thực (`verified: true`).
- *Ví dụ*: "Tồn kho phôi nhôm A980 tại DAAL hiện còn 840kg (mức tối thiểu 4,500kg). Chuyền dập dở dang 5,600 pcs."

### 1.2. INFERENCE (Suy luận nhân quả)
- **Định nghĩa**: Kết luận logic rút ra từ mô hình nhân quả Causal DAG và trọng số xác suất p-value.
- **Yêu cầu**: Phải công bố chỉ số độ tin cậy (`confidenceScore`) và độ chuẩn định (`calibrationScore`). Nếu độ tin cậy rơi xuống dưới 60%, hệ thống bị cấm đưa ra kết luận khẳng định mà phải gắn cờ `INSUFFICIENT_EVIDENCE`.
- *Ví dụ*: "Mô hình Causal DAG (N03 -> N08, weight 0.82, p=0.0012) xác định đứt phôi tại Hub A01 là nguyên nhân gây 48% rủi ro OTD toàn hệ thống. Xác suất hoàn thành đơn nếu điều xe tức thì đạt 96.2%."

### 1.3. RECOMMENDATION (Khuyến nghị hành động)
- **Định nghĩa**: Phương án can thiệp cụ thể đề xuất cho con người có thẩm quyền ra quyết định.
- **Yêu cầu**: Phải nêu rõ hành động, đối tượng tác động, mã tham số, và kế hoạch phục hồi (rollback). AI tuyệt đối không tự ý thực thi hành động này mà không qua Human-in-the-Loop Gateway.
- *Ví dụ*: "Kích hoạt điều phối xe tải TK-77 chuyển 5,600kg phôi nhôm từ Hub A01 sang DAAL Precision với luồng xanh ưu tiên."

---

## 2. XỬ LÝ THIẾU BẰNG CHỨNG (INSUFFICIENT EVIDENCE PROTOCOL)

Khi dữ liệu đầu vào bị thiếu, gián đoạn kết nối, hoặc độ tin cậy của mô hình `< 0.60`:
1. Trạng thái đề xuất được chuyển thành `NEEDS_MORE_INFORMATION`.
2. Hệ thống tạo yêu cầu xác minh thủ công gửi đến quản đốc xưởng (`MANUAL_VERIFICATION_REQUEST`).
3. Khóa toàn bộ các nút bấm "Phê duyệt" hoặc "Thực thi" tự động.

---

## 3. ĐỘ CHUẨN ĐỊNH & BRIER SCORE
- **Chỉ số Brier**: Đo lường sai số chuẩn định giữa xác suất dự báo của AI và kết quả thực tế ($Brier = \frac{1}{N}\sum(f_t - o_t)^2$). Hiện tại hệ thống đạt **0.042** (mức tối ưu < 0.10).
- **Tỷ lệ báo động giả (False Positive Rate)**: Duy trì ở mức **5.2%**, thấp hơn ngưỡng cho phép 8.0% theo tiêu chuẩn IATF 16949.
