# VOMS PRO — CƠ CHẾ KIỂM SOÁT KÍCH HOẠT GIAI ĐOẠN 6
## MASTER ACTIVATION BUTTON & LIFECYCLE FSM SPECIFICATION
**Mã tài liệu:** `VOMS-DOC-P6-ACT-003`  
**Phiên bản:** `v6.0.0-PRO`  

---

### 1. NÚT KÍCH HOẠT MASTER GIAI ĐOẠN 6
- **Vị trí tích hợp:** `AI CONTROL TOWER → QUẢN LÝ GIAI ĐOẠN TRIỂN KHAI`.
- **Nhãn hiển thị 3 thứ tiếng:**
  - Tiếng Việt: `KÍCH HOẠT GIAI ĐOẠN 6`
  - Tiếng Anh: `ACTIVATE PHASE 6`
  - Tiếng Hàn: `6단계 활성화`
- **Khóa an toàn điều kiện cứng (Hard-Gating):**
  - Không cho phép kích hoạt nếu chưa chạy Preflight Check.
  - Không cho phép kích hoạt nếu có bất kỳ bài kiểm tra nào trong 8 bài không đạt (All 8 must pass).
  - Không cho phép kích hoạt nếu tài khoản không có vai trò `SYSTEM_ADMIN` hoặc `MANAGEMENT`.

---

### 2. MÁY TRẠNG THÁI HỮU HẠN (FINITE STATE MACHINE - FSM)

```
       [NOT_STARTED]
             |
             v (Chạy Preflight)
         [CHECKING]
             |
      +------+------+
      |             |
      v             v
 [NOT_READY]     [READY]
                    |
                    v (Xác thực RBAC Admin + Bấm Kích hoạt)
               [ACTIVATING]
                    |
                    v
                [RUNNING] <---------------+
                 |     |                  |
   (Tạm dừng)    |     | (Chỉ bật 1 phần) | (Tiếp tục lại)
                 v     v                  |
              [PAUSED] [PARTIALLY_ACTIVE] |
                 |                        |
                 +------------------------+
                 |
                 v (Quay lui khẩn cấp)
           [ROLLING_BACK]
                 |
                 v
           [ROLLED_BACK] (Bảo toàn baseline Phase 5)
```

---

### 3. CÁC THAO TÁC ĐIỀU HÀNH VÒNG ĐỜI
1. **Chạy Preflight (POST `/api/v1/phase6/lifecycle/preflight`):** Quét kiểm tra toàn bộ 8 điều kiện tiên quyết, sinh mã băm SHA-256 xác thực bằng chứng.
2. **Kích hoạt (POST `/api/v1/phase6/lifecycle/activate`):** Đưa toàn bộ 8 mô-đun hoặc các mô-đun được chọn vào trạng thái `RUNNING`.
3. **Tạm dừng (POST `/api/v1/phase6/lifecycle/pause`):** Đóng băng các tác vụ hiện trường, hệ thống Phase 1–5 vẫn hoạt động bình thường không gián đoạn.
4. **Tiếp tục (POST `/api/v1/phase6/lifecycle/resume`):** Chuyển trạng thái từ `PAUSED` trở lại `RUNNING`.
5. **Quay lui (POST `/api/v1/phase6/lifecycle/rollback`):** Khôi phục trạng thái hệ thống về baseline Phase 5, lưu vết sự kiện vào nhật ký kiểm toán.
