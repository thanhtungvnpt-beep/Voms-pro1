# VOMS PRO PHASE 5 — STANDARDIZED KPI CATALOG

**Hệ thống:** VOMS PRO (VNPT Operations Management System Pro)  
**Phân hệ:** KPI Intelligence Engine (Module A)  
**Tiêu chuẩn chất lượng:** ISO 9001 / IATF 16949 / OEE Industry 4.0 Standard  

---

## DANH MỤC 12 CHỈ SỐ KPI CHUẨN HÓA QUA 6 PHÂN NHÓM

### 1. NHÓM THIẾT BỊ & NĂNG SUẤT (EQUIPMENT)

| Mã KPI | Tên chỉ số | Đơn vị | Baseline | Target | Cảnh báo | Nguy cấp | Công thức tính toán | Nguồn dữ liệu Lineage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **KPI-EQ-01** | Hiệu suất Thiết bị Tổng thể (OEE) | % | 74.5 | 85.0 | < 75.0 | < 65.0 | Availability × Performance × Quality (A × P × Q) | `GMES_TELEMETRY_M07_CNC_SPINDLE` |
| **KPI-EQ-02** | Chỉ số Sức khỏe Trục Spindle | Điểm/100 | 82.0 | 92.0 | < 80.0 | < 70.0 | 100 - (VibrationRMS × 8.5 + BearingTempFactor × 4.2) | `EDGE_IOT_ACCELEROMETER_KTECH_04` |

### 2. NHÓM KẾ HOẠCH SẢN XUẤT (PRODUCTION PLAN)

| Mã KPI | Tên chỉ số | Đơn vị | Baseline | Target | Cảnh báo | Nguy cấp | Công thức tính toán | Nguồn dữ liệu Lineage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **KPI-PL-01** | Tỷ lệ Hoàn thành Kế hoạch | % | 81.2 | 95.0 | < 85.0 | < 70.0 | (Actual Production / Planned Target) × 100 | `MES_GANTT_SCHEDULER_M02` |
| **KPI-PL-02** | Độ lệch Nhịp chuyền Theo giờ (Takt) | % | 12.8 | 4.5 | > 8.0 | > 15.0 | StdDev(HourlyAttainment) / Mean(Attainment) × 100 | `M03_HANDHELD_SCANNER_AGGREGATION` |

### 3. NHÓM CHẤT LƯỢNG (QUALITY)

| Mã KPI | Tên chỉ số | Đơn vị | Baseline | Target | Cảnh báo | Nguy cấp | Công thức tính toán | Nguồn dữ liệu Lineage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **KPI-QC-01** | Tỷ lệ Đạt Sơ kỳ (First Pass Yield - FPY) | % | 94.2 | 98.8 | < 96.0 | < 92.0 | (Units Passing First Test / Units Tested) × 100 | `OQC_VISION_INSPECTOR_M05` |
| **KPI-QC-02** | Tỷ lệ Rework Mối hàn Laser | % | 6.8 | 1.5 | > 3.5 | > 6.0 | (Rework Assemblies / Total Welded Assemblies) × 100 | `HOJEONG_VINA_LASER_CELL_02` |

### 4. NHÓM ĐỐI TÁC VỆ TINH (VENDOR PERFORMANCE)

| Mã KPI | Tên chỉ số | Đơn vị | Baseline | Target | Cảnh báo | Nguy cấp | Công thức tính toán | Nguồn dữ liệu Lineage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **KPI-VD-01** | Tỷ lệ Giao hàng Đúng hạn (OTD) | % | 86.4 | 96.0 | < 90.0 | < 80.0 | (Shipments Delivered ≤ SLA / Total Shipments) × 100 | `LOGISTICS_TRANSFER_ORDER_M04` |
| **KPI-VD-02** | Chỉ số Đánh giá Năng lực Đối tác | Điểm/100 | 83.1 | 92.0 | < 85.0 | < 75.0 | 0.4 × OTD + 0.35 × FPY + 0.25 × DataIntegrity | `VENDOR_GOVERNANCE_PHASE1_TRUST` |

### 5. NHÓM TIN CẬY DỮ LIỆU (DATA TRUST)

| Mã KPI | Tên chỉ số | Đơn vị | Baseline | Target | Cảnh báo | Nguy cấp | Công thức tính toán | Nguồn dữ liệu Lineage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **KPI-DT-01** | Tỷ lệ Dữ liệu có Nguồn gốc Xác thực | % | 92.0 | 99.5 | < 95.0 | < 88.0 | (Verified Hashes / Total Ingested Events) × 100 | `DATA_TRUST_CENTER_PHASE1` |
| **KPI-DT-02** | Độ trễ Viễn trắc GMES Trung bình | ms | 1420 | 450 | > 1200 | > 3000 | Mean(IngestTimestamp - SensorTimestamp) | `GMES_ADAPTER_CONTRACT_V42` |

### 6. NHÓM SỰ CỐ & CẢI TIẾN (INCIDENT & CAPA)

| Mã KPI | Tên chỉ số | Đơn vị | Baseline | Target | Cảnh báo | Nguy cấp | Công thức tính toán | Nguồn dữ liệu Lineage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **KPI-CP-01** | Tỷ lệ Đóng CAPA Đúng hạn | % | 71.4 | 94.0 | < 85.0 | < 70.0 | (Closed CAPAs ≤ DueDate / Total Closed) × 100 | `PHASE5_CLOSED_LOOP_ENGINE` |
| **KPI-CP-02** | Tỷ lệ Tái phát Sự cố sau 30 ngày | % | 11.2 | 2.0 | > 5.0 | > 10.0 | (Recurrent Incidents / Total Resolved Incidents) × 100 | `RCA_HISTORICAL_MATCH_LOG` |
