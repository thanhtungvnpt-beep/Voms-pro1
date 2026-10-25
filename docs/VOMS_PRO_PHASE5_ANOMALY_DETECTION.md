# VOMS PRO PHASE 5 — ANOMALY DETECTION ENGINE SPECIFICATION

**Phân hệ:** Anomaly Detection Engine (Module C)  
**Tiêu chuẩn chất lượng:** Statistical Process Control (SPC) · ISO 9001 / IATF 16949  

---

## 1. PHƯƠNG PHÁP PHÁT HIỆN BẤT THƯỜNG (DETECTION ALGORITHMS)

Hệ thống kết hợp 4 lớp thuật toán phát hiện bất thường:

1. **Thống kê 3-Sigma (`STATISTICAL_3_SIGMA`):**
   - Theo dõi độ lệch chuẩn $(\mu \pm 3\sigma)$ trên chuỗi thời gian viễn trắc.
   - Ứng dụng: Phát hiện rung chấn Spindle 04 tại KTECH ($5.4 \text{ mm/s}$ vượt xa ngưỡng $1.8 \text{ mm/s}$).
2. **Ngưỡng Giới hạn Nghiệp vụ (`RULE_THRESHOLD`):**
   - Áp dụng các quy tắc cận trên (UCL) và cận dưới (LCL) cứng.
   - Ứng dụng: Lượng phôi tồn kho khả dụng tại DAAL ($1.2 \text{ giờ} < 4.0 \text{ giờ}$ giới hạn).
3. **Độ trôi Đồ thị Causal DAG (`CAUSAL_DAG_DRIFT`):**
   - Phát hiện mối quan hệ nhân quả suy yếu hoặc nghịch chuyển trên đồ thị DAG.
   - Ứng dụng: Trôi tiêu cự chùm tia laser ($38.5 \mu\text{m}$ so với chuẩn $12.0 \mu\text{m}$) tại HOJEONG VINA.
4. **Tốc độ Thay đổi Bất thường (`RATE_OF_CHANGE`):**
   - Đạo hàm bậc 1 của chuỗi viễn trắc $(\Delta y / \Delta t)$.
   - Ứng dụng: Độ lệch nhịp Takt cycle time đột ngột tăng $+36.1\%$ tại chuyền SMT HSTEC.

---

## 2. CHỐNG CẢNH BÁO BÁO ĐỘNG GIẢ & KHỬ TRÙNG LẶP (DEDUPLICATION)

- **Mã băm Fingerprint (`fingerprintHash`):** Mỗi bất thường được băm từ tổ hợp `[plantId, equipmentId, metric, hourWindow]`. Nếu trùng lặp, sự kiện được ghi tăng số lần xuất hiện thay vì tạo ra cảnh báo trùng rác.
- **Điểm tin cậy (Confidence Score):** Thang điểm 0–100%. Chỉ các bất thường có điểm tin cậy $\ge 85\%$ mới được chuyển tiếp sang hàng đợi điều tra RCA.
