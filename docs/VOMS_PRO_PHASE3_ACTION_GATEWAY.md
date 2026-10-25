# VOMS PRO PHASE 3 — ACTION EXECUTION GATEWAY SPECIFICATION
**Mô hình**: Safe Adapter Pattern với Kiểm chứng Tiền/Hậu thực thi (Pre/Post-Execution Verification)  
**Endpoint**: `POST /api/v1/control-tower/actions/execute`  
**Tiêu chuẩn**: ISO/IEC 27001 (Operational Security), IATF 16949  

---

## 1. NGUYÊN TẮC THIẾT KẾ SAFE ADAPTER PATTERN

AI không bao giờ được phép can thiệp trực tiếp vào thanh ghi PLC, robot hay cơ sở dữ liệu vật lý nếu không thông qua **Action Execution Gateway**:

```
[APPROVED PROPOSAL]
         │
         ▼
 ┌──────────────────────────────────────────────┐
 │ PRE-EXECUTION CHECKS                         │
 │ 1. Status == 'APPROVED' ? (400 if failed)    │
 │ 2. User Authorized & Role Allowed ? (403)    │
 │ 3. Vendor Plant Isolation Matched ? (403)    │
 └──────────────────────┬───────────────────────┘
                        ▼
 ┌──────────────────────────────────────────────┐
 │ SAFE ADAPTER TRANSLATION                     │
 │ • DISPATCH_MATERIAL -> Logistics Hub Dispatch│
 │ • SCHEDULE_MAINTENANCE -> Maintenance Ticket │
 │ • CALIBRATE_LASER -> Safety Stop Trigger     │
 └──────────────────────┬───────────────────────┘
                        ▼
 ┌──────────────────────────────────────────────┐
 │ POST-EXECUTION VERIFICATION                  │
 │ 1. Validate physical metrics changed         │
 │ 2. Transition state: APPROVED -> COMPLETED   │
 │ 3. Auto-resolve linked Alert                 │
 │ 4. Compute SHA-256 Hash & Record Audit Log   │
 └──────────────────────────────────────────────┘
```

---

## 2. DANH MỤC CÁC HÀNH ĐỘNG HỖ TRỢ (SUPPORTED ACTIONS)

1. `DISPATCH_MATERIAL`: Điều phối nguyên vật liệu khẩn cấp giữa các Hub và Nhà máy vệ tinh.
   - *Tham số*: `sourceHub`, `targetPlant`, `materialCode`, `quantityKg`, `truckPlate`.
   - *Hậu kiểm chứng*: Tồn kho nhà máy đích tăng tương ứng, chỉ số rủi ro trễ OTD giảm ngay lập tức.
2. `SCHEDULE_MAINTENANCE`: Đặt lịch bảo trì cơ khí hoặc thay dao cụ CNC.
   - *Tham số*: `equipmentId`, `targetPlant`, `sparePartCode`, `durationMinutes`.
   - *Hậu kiểm chứng*: Dự báo gia tốc rung giảm về ngưỡng an toàn (< 1.5G).
3. `CALIBRATE_LASER_EMERGENCY_STOP`: Ngắt khẩn cấp cụm laser quang học lệch dung sai và cách ly lô lỗi.
   - *Tham số*: `machineId`, `targetPlant`, `quarantineLot`, `action`.
   - *Hậu kiểm chứng*: Máy chuyển trạng thái `SAFE_STOPPED`, sản phẩm lỗi được chuyển vào buffer kho cách ly OQC.
4. `REBALANCE_WORKFORCE`: Tái phân bổ lao động giữa các chuyền sản xuất.
5. `ADJUST_COOLANT_CYCLE`: Điều chỉnh nhịp bơm làm mát dao tiện trục.

---

## 3. CƠ CHẾ PHỤC HỒI THẤT BẠI (ROLLBACK & RETRY)
- Nếu việc gửi tín hiệu đến adapter thất bại hoặc thời gian chờ vượt ngưỡng 5,000ms:
  - Trạng thái đề xuất được chuyển sang `FAILED`.
  - Hệ thống ghi nhật ký cảnh báo P1 gửi thẳng đến Trưởng ca trực.
  - Khôi phục trạng thái ban đầu của hệ thống telemetry (Idempotency guarantee).
