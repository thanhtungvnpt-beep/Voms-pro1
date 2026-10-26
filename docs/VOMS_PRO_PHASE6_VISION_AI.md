# VOMS PRO — THỊ GIÁC MÁY TÍNH HIỆN TRƯỜNG (MODULE C)
## VISION AI: INDUSTRIAL DEFECT INSPECTION & BOUNDING BOX ANALYSIS
**Mã tài liệu:** `VOMS-DOC-P6-M03-007`  
**Phiên bản:** `v6.0.0-PRO`  

---

### 1. NĂNG LỰC NHẬN DIỆN THỊ GIÁC MÁY TÍNH
- **Đầu vào:** Ảnh chụp linh kiện, lưỡi dao, mối hàn laser hoặc nhãn máy móc tải lên từ camera điện thoại hiện trường.
- **Xử lý:** Nhận diện vùng khuyết tật (Bounding Boxes), đánh giá mức độ tin cậy (Confidence Score từ 0% đến 100%), phân loại mức độ rủi ro (CRITICAL, WARNING, INFO).
- **Đầu ra:**
  - Tọa độ khung bao viền `{ x, y, width, height }` hiển thị trực tiếp trên Canvas.
  - Phân tích nguyên nhân khuyết tật (mẻ dao, lệch tâm quang học, xỉ nhôm đông tụ).
  - Tự động liên kết tới tài liệu SOP tương ứng và đưa ra cảnh báo an toàn LOTO.

---

### 2. BẢNG MẪU NHẬN DIỆN KHUYẾT TẬT ĐIỂN HÌNH

| Thiết bị | Loại khuyết tật | Tọa độ Bounding Box | Confidence | SOP Khuyến nghị |
| :--- | :--- | :--- | :--- | :--- |
| `MAZAK-CNC-SPINDLE` | Mòn lưỡi cắt dao phay ngón (Micro-Spalling) | [150, 110, 180, 150] | 96% | `SOP-CNC-SPINDLE-04` |
| `LASER-TRUMPF-02` | Lệch tiêu cự chùm tia Laser (Focal Drift) | [120, 80, 210, 180] | 94% | `SOP-LASER-CALIB-01` |
| `CAST-INGOT-01` | Đóng bám xỉ nhôm đông tụ (Molten Dross) | [90, 140, 280, 160] | 91% | `SOP-INGOT-CAST-02` |
