# VOMS PRO PHASE 5 — ROOT CAUSE ANALYSIS (5 WHYS & ISHIKAWA 6M)

**Phân hệ:** Root Cause Analysis (Module E)  
**Tiêu chuẩn chất lượng:** ISO 9001 / IATF 16949 Problem Solving Methodology  

---

## 1. PHƯƠNG PHÁP LUẬN 5 WHYS (TẠI SAO 5 CẤP)

Hệ thống bắt buộc truy vấn chuỗi nhân quả 5 bước và chỉ ghi nhận là nguyên nhân gốc rễ (Root Cause) khi đến được yếu tố cốt lõi về quy trình, chính sách hoặc hệ thống:

### Nghiên cứu Điển hình 1: Sự cố hụt 9,400 pcs chi tiết vỏ đúc A980 tại DAAL (RCA-2026-001)

1. **Why 1:** Tại sao chuyến tàu TO-3011 bị nguy cơ trễ hẹn tại cảng Hải Phòng?  
   ➔ *Trả lời:* Nhà máy DAAL chỉ giao được 8,600 / 18,000 pcs (hụt 9,400 sản phẩm).  
   *Bằng chứng:* `TO-3011-WAYBILL-SHA256` (Đã kiểm chứng).
2. **Why 2:** Tại sao sản lượng hoàn thiện chỉ đạt 8,600 pcs?  
   ➔ *Trả lời:* Dây chuyền đúc áp lực nhôm dừng 4.2 tiếng trong ca đêm.  
   *Bằng chứng:* `DAAL-MES-OEE-LOG-SHIFT3` (Đã kiểm chứng).
3. **Why 3:** Tại sao dây chuyền đúc áp lực phải dừng 4.2 tiếng?  
   ➔ *Trả lời:* Kho nguyên liệu hết sạch phôi nhôm thỏi A980.  
   *Bằng chứng:* `DAAL-ERP-INVENTORY-EMPTY` (Đã kiểm chứng).
4. **Why 4:** Tại sao kho phôi nhôm DAAL bị cạn kiệt mà không có đơn nhập trước?  
   ➔ *Trả lời:* Xe chở phôi từ Hub kho trung tâm A01 bị kẹt xe trên QL5B.  
   *Bằng chứng:* `FLEET-GPS-TELEMETRY-HUB01` (Đã kiểm chứng).
5. **Why 5 (NGUYÊN NHÂN GỐC RỄ):** Tại sao không có kho đệm dự phòng (Safety Stock) để bù đắp rủi ro giao thông?  
   ➔ *Kết luận:* Công thức tính Dynamic Safety Stock Buffer trong ERP chỉ đặt mức an toàn 2.5 giờ thay vì 10 giờ, chưa tính đến biến động thời gian thông quan và ách tắc logistics cao điểm.

---

## 2. BIỂU ĐỒ XƯƠNG CÁ ISHIKAWA (6M FACTORS)

Mỗi hồ sơ RCA phải phân rã các yếu tố đóng góp theo 6 nhóm:
- **Man (Con người):** Đào tạo, tác nghiệp, thời gian báo cáo sự cố.
- **Machine (Máy móc):** Tình trạng thiết bị, hao mòn dao cụ, áp suất khí nén.
- **Material (Vật liệu):** Đặc tính phôi, tồn kho đệm, chất lượng lô đầu vào.
- **Method (Phương pháp):** Quy trình vận hành, công thức định mức, lịch TPM.
- **Measurement (Đo lường):** Cảm biến, độ trôi viễn trắc, sai số dụng cụ đo.
- **Milieu (Môi trường):** Độ ẩm phân xưởng, thời tiết, giao thông ngoại vi.

---

## 3. CHUYỂN TRẠNG THÁI HỒ SƠ RCA

1. `HYPOTHESIS`: Giả thuyết nguyên nhân ban đầu.
2. `INVESTIGATING`: Đang thu thập và đo kiểm dữ liệu thực địa.
3. `EVIDENCE_BACKED`: Đã liên kết các bằng chứng số hóa có mã băm.
4. `VERIFIED`: Đã được chuyên gia/trưởng phòng thẩm định và xác nhận.
5. `INSUFFICIENT_EVIDENCE`: Thiếu chứng cứ, yêu cầu đo kiểm lại trước khi tạo CAPA.
