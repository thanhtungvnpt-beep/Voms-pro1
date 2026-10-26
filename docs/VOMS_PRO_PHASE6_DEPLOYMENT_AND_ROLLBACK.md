# VOMS PRO — QUY TRÌNH TRIỂN KHAI VÀ PHƯƠNG ÁN QUAY LUI PHASE 6
## DEPLOYMENT CHECKLIST & DISASTER RECOVERY ROLLBACK PLAN
**Mã tài liệu:** `VOMS-DOC-P6-DEP-015`  
**Phiên bản:** `v6.0.0-PRO`  

---

### 1. QUY TRÌNH TRIỂN KHAI 4 BƯỚC (4-STEP DEPLOYMENT)
1. **Bước 1 — Kiểm tra điều kiện (Preflight Verification):**
   - Chạy `POST /api/v1/phase6/lifecycle/preflight` để xác thực toàn bộ 8 bài kiểm tra.
   - Kiểm tra mã băm SHA-256 tính toàn vẹn hệ thống.
2. **Bước 2 — Xác thực Thẩm quyền (RBAC Authorization):**
   - Người thao tác phải có vai trò `SYSTEM_ADMIN` hoặc `MANAGEMENT`.
3. **Bước 3 — Lựa chọn Phạm vi Kích hoạt (Module Matrix Selection):**
   - Có thể kích hoạt toàn phần (All 8 Modules) hoặc kích hoạt có chọn lọc từng mô-đun (A–H).
4. **Bước 4 — Bấm Kích hoạt Master:**
   - Hệ thống chuyển sang trạng thái `RUNNING`, gửi tín hiệu đồng bộ lên AI Control Tower và hiển thị nhãn `FIELD ACTIVE` trên thanh điều hướng Sidebar.

---

### 2. PHƯƠNG ÁN QUAY LUI KHẨN CẤP (ROLLBACK PLAN)
Trong trường hợp phát hiện bất thường nghiêm trọng ở tầng di động:
1. **Thao tác:** Bấm nút **"QUAY LUI VỀ PHASE 5"** trên bàn điều khiển `AI Control Tower`.
2. **Hành động hệ thống:**
   - Đóng các kết nối Web Speech và Vision AI analyzer.
   - Chuyển trạng thái Phase 6 về `ROLLED_BACK`.
   - Giữ nguyên vẹn toàn bộ 100% dữ liệu đã ghi nhận (Work Orders, Lessons, Escalations).
   - Hệ thống vận hành lùi về baseline Phase 5 an toàn mà không ảnh hưởng tới sản xuất thực tế tại 7 nhà máy.
