# VOMS PRO PHASE 5 — DEPLOYMENT, PAUSE & ROLLBACK RUNBOOK

**Dự án:** VOMS PRO (VNPT Operations Management System Pro)  
**Tài liệu:** Hướng dẫn Vận hành, Kích hoạt, Tạm dừng và Quay lui Phase 5  

---

## 1. MÁY TRẠNG THÁI VÒNG ĐỜI (LIFECYCLE FSM)

Phase 5 vận hành theo mô hình máy trạng thái hữu hạn có kiểm soát:

```
[NOT_STARTED] 
      │
      ▼ (Run Preflight Check)
[PREFLIGHT_VERIFIED] 
      │
      ▼ (ACTIVATE PHASE 5 by SYSTEM_ADMIN)
  [RUNNING] ◄────────────────┐
   │     │                   │
   │     ▼ (PAUSE)           │ (RESUME)
   │   [PAUSED] ─────────────┘
   │
   ▼ (ROLLBACK)
[ROLLED_BACK] (Restores Phase 4 Baseline)
```

---

## 2. HƯỚNG DẪN THỰC THI

### 2.1. Kích hoạt Phase 5 (Activation)
1. Truy cập mục: **AI CONTROL TOWER → QUẢN LÝ GIAI ĐOẠN TRIỂN KHAI** (Deployment Lifecycle).
2. Nhấn nút **"Chạy Preflight (8 Kiểm tra)"**.
3. Hệ thống kiểm tra: Nguồn dữ liệu 7 nhà máy, Circuit Breakers, CSDL in-memory và vai trò người dùng.
4. Khi 8 bài kiểm tra ĐẠT (100%): Nút **"KÍCH HOẠT GIAI ĐOẠN 5"** sáng lên.
5. Nhấn nút kích hoạt: Hệ thống gửi lệnh `POST /api/v1/phase5/lifecycle/activate` kèm danh sách module toggles được chọn. Trạng thái chuyển thành `RUNNING`.

### 2.2. Tạm dừng Phase 5 (Pause)
- **Khi nào áp dụng:** Bảo trì định kỳ, hiệu chỉnh thuật toán thống kê hoặc bảo dưỡng hệ thống.
- **Thao tác:** Nhấn **"TẠM DỪNG PHASE 5"** (`POST /api/v1/phase5/lifecycle/pause`).
- **Cam kết an toàn:** Tạm dừng Phase 5 **không** ảnh hưởng tới hoạt động của Phase 1–4. Toàn bộ dữ liệu kiểm toán và kết nối API vẫn duy trì.

### 2.3. Tiếp tục Vận hành (Resume)
- **Thao tác:** Nhấn **"TIẾP TỤC VẬN HÀNH"** (`POST /api/v1/phase5/lifecycle/resume`).
- Máy trạng thái chuyển từ `PAUSED` trở lại `RUNNING` mà không cần chạy lại toàn bộ quy trình khởi tạo.

### 2.4. Quay lui về Phiên bản Cũ (Rollback)
- **Khi nào áp dụng:** Khẩn cấp khi phát hiện sai lệch số liệu hoặc yêu cầu từ Hội đồng Quản trị.
- **Thao tác:** Nhấn **"QUAY LUI VỀ PHASE 4"** (`POST /api/v1/phase5/lifecycle/rollback`).
- **Phạm vi quay lui:**
  - Ngừng tính toán KPI Phase 5 và đóng các cảnh báo tự động mới.
  - Khôi phục baseline trạng thái Phase 4.
  - **Bảo toàn 100% dữ liệu:** Không xóa bất kỳ bản ghi kiểm toán SHA-256 hay nhật ký thao tác nào đã tạo ra.
