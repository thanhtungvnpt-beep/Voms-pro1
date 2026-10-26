# VOMS PRO PHASE 5 — DATA GOVERNANCE & MODEL AUDIT MATRIX

**Dự án:** VOMS PRO (VNPT Operations Management System Pro)  
**Tài liệu:** Quản Trị Dữ Liệu, Độ Tin Cậy & Phiên Bản Thuật Toán Phase 5  

---

## 1. NGUYÊN TẮC QUẢN TRỊ DỮ LIỆU
1. **Không Dùng Dữ Liệu Ảo Cho Báo Cáo Sản Xuất:**
   - Dữ liệu demo hoặc thử nghiệm được gắn nhãn `DEMO / SYNTHETIC` rõ ràng.
   - Khi nguồn dữ liệu thiếu hoặc mất kết nối: Hệ thống hiển thị `CHƯA ĐỦ ĐIỀU KIỆN TÍNH`, nghiêm cấm tự gán số 0 gây sai lệch phân tích.
2. **Nguồn Gốc Dữ Liệu (Data Lineage):**
   - 100% chỉ số KPI được liên kết trực tiếp tới bản ghi gốc và mã băm SHA-256.
   - Lộ trình: `GMES API / Mock Contract → Data Quality Sanitizer → KPI Computation Engine → Anomaly/Alert Pipeline → Immutable Audit Trail`.
3. **Phân Quyền Truy Cập Dữ Liệu (RBAC & Multi-Tenant):**
   - Dữ liệu của 7 nhà máy vệ tinh (KHV, DREAM_TECH, HSTEC, KTECH, HOJEONGB, HOJEONG_VINA, DAAL) được kiểm soát nghiêm ngặt theo phân quyền nhà máy và thẩm quyền cấp quản lý.

---

## 2. QUẢN TRỊ MÔ HÌNH VÀ QUY TẮC PHÂN TÍCH

| Mã Quy Tắc / Mô Hình | Tên Thuật Toán | Mục Đích | Dữ Liệu Đầu Vào | Ngưỡng Phê Duyệt | Trạng Thái |
|---|---|---|---|---|---|
| **RULE-KPI-01** | Weighted OEE Engine | Tính toán OEE tổng thể và thành phần | Availability, Performance, Quality | Mục tiêu ≥ 85%, Cảnh báo < 75% | **ĐÃ PHÊ DUYỆT** |
| **RULE-ANOM-01** | 3-Sigma Statistical Anomaly | Phát hiện biến động bất thường sản lượng | Chuỗi sản lượng từng giờ 30 ngày | Lệch > 3 standard deviations | **ĐÃ PHÊ DUYỆT** |
| **RULE-ANOM-02** | Vibration Spike Rule | Cảnh báo rung lắc trục máy phay CNC | Cảm biến gia tốc trục Spindle | Gia tốc rung > 4.0G | **ĐÃ PHÊ DUYỆT** |
| **RULE-WARN-01** | OTD Sea Freight SLA | Cảnh báo trễ chuyến tàu xuất khẩu | Tồn kho sẵn sàng, tiến độ đóng hàng | SLA Buffer < 6 giờ | **ĐÃ PHÊ DUYỆT** |
| **MODEL-RCA-01** | Ishikawa 6M & 5 Whys Engine | Phân loại nguyên nhân gốc rễ | Dữ liệu máy, vật liệu, con người | Yêu cầu kỹ sư trưởng ký số | **ĐÃ PHÊ DUYỆT** |
| **MODEL-CL-01** | Student's t-test Closed-Loop | Đo lường hiệu quả sau cải tiến | Dữ liệu KPI Trước (30 ngày) vs Sau | Mức ý nghĩa thống kê p < 0.01 | **ĐÃ PHÊ DUYỆT** |
