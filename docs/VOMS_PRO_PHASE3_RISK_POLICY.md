# VOMS PRO PHASE 3 — RISK-BASED APPROVAL POLICY & DUAL-APPROVAL MATRIX
**Chính sách**: Phân cấp Thẩm quyền & Quản trị Rủi ro Tự động hóa  
**Tiêu chuẩn**: ISO 9001:2015 Clause 6.1 (Actions to address risks and opportunities), IATF 16949  

---

## 1. PHÂN CẤP RỦI RO 4 CẤP ĐỘ (LEVEL 1 TO LEVEL 4)

Mọi đề xuất can thiệp vận hành của hệ thống được tự động phân loại rủi ro dựa trên phạm vi ảnh hưởng:

| Cấp độ rủi ro | Mã Cấp độ | Định nghĩa tác động | Yêu cầu thẩm quyền phê duyệt |
| :--- | :--- | :--- | :--- |
| **Level 1** | `LEVEL_1_INFO` | Thông tin thụ động, thông báo tình trạng thiết bị, gợi ý kiểm tra không làm thay đổi dây chuyền | Tự động ghi nhận hoặc xác nhận bởi Kỹ thuật viên / Quản đốc ca |
| **Level 2** | `LEVEL_2_OPERATIONAL` | Điều chỉnh tác nghiệp nội bộ tại một xưởng (ví dụ: thay dao phay bảo dưỡng, bổ sung dung dịch làm mát) | Cần 1 phê duyệt từ Kỹ sư thiết bị (`EQUIPMENT_ENGINEER`) hoặc Quản đốc nhà máy đối tác (`VENDOR_MANAGER`) |
| **Level 3** | `LEVEL_3_PRODUCTION` | Tác động tới tiến độ giao hàng, điều phối nguyên vật liệu giữa các kho, điều chuyển nhân sự liên nhà máy | Cần 1 phê duyệt cấp phòng ban: Trưởng ban Thuê ngoài (`OUTSOURCING_GROUP`), Điều độ Kế hoạch (`PRODUCTION_PLANNER`) hoặc Giám đốc Khối (`MANAGEMENT`) |
| **Level 4** | `LEVEL_4_HIGH_IMPACT` | Dừng dây chuyền khẩn cấp (Emergency Line Stop), hủy lô hàng giá trị cao, thay đổi thông số dung sai kỹ thuật | **BẮT BUỘC DUAL-APPROVAL**: 2 phê duyệt độc lập từ 2 cán bộ quản lý khác nhau (`MANAGEMENT`, `SYSTEM_ADMIN`, `APPROVER`) |

---

## 2. QUY TRÌNH PHÊ DUYỆT KÉP (DUAL-APPROVAL PROTOCOL FOR LEVEL 4)

Đối với đề xuất gán nhãn `LEVEL_4_HIGH_IMPACT`:
1. **Lượt phê duyệt thứ nhất (1st Approval)**:
   - Cán bộ quản lý thứ nhất phê duyệt qua giao diện hoặc API.
   - Trạng thái đề xuất **VẪN Ở `PENDING_REVIEW`**, ghi nhận cờ `partiallyApproved: true` và `approvalsRecorded: 1 / 2`.
   - Cấm thực thi hành động qua Action Gateway ở giai đoạn này.
2. **Kiểm tra chống lặp lại (Anti-Duplicate Check)**:
   - Cùng một cán bộ quản lý không được phép phê duyệt lần 2. Nếu cố ý gọi tiếp, hệ thống trả về lỗi `400 DUPLICATE_APPROVAL`.
3. **Lượt phê duyệt thứ hai (2nd Approval)**:
   - Cán bộ quản lý thứ hai (vai trò độc lập, ví dụ: System Admin hoặc Trưởng ban Thẩm định) xem xét và phê duyệt.
   - Khi đủ 2 phê duyệt hợp lệ, trạng thái đề xuất mới chính thức chuyển sang **`APPROVED`**.
   - Lúc này, Action Execution Gateway mới được mở khóa để kích hoạt thực thi an toàn.

---

## 3. BẢNG PHÂN QUYỀN RBAC CHO CÁC VAI TRÒ DOANH NGHIỆP

| Vai trò người dùng (Role) | Cấp độ rủi ro tối đa được duyệt | Quyền đa nhà máy (Multi-plant) |
| :--- | :--- | :--- |
| `SYSTEM_ADMIN` | Level 1, 2, 3, 4 (Phê duyệt cấp cao & Cứu hộ) | Có (Cả 7 nhà máy) |
| `MANAGEMENT` | Level 1, 2, 3, 4 (Ban giám đốc điều hành) | Có (Cả 7 nhà máy) |
| `APPROVER` | Level 1, 2, 3, 4 (Hội đồng phê duyệt) | Có (Cả 7 nhà máy) |
| `OUTSOURCING_GROUP` | Level 1, 2, 3 (Điều phối chuỗi cung ứng) | Có (Cả 7 nhà máy) |
| `PRODUCTION_PLANNER` | Level 1, 2, 3 (Điều độ kế hoạch & Gantt) | Có (Cả 7 nhà máy) |
| `QC` / `QUALITY_CONTROL` | Level 1, 2, 3 (Kiểm chuẩn OQC & AOI) | Có (Cả 7 nhà máy) |
| `EQUIPMENT_ENGINEER` | Level 1, 2 (Bảo trì TPM & Thiết bị) | Có (Cả 7 nhà máy) |
| `VENDOR_MANAGER` | Level 1, 2 (Quản lý nội bộ nhà máy vệ tinh) | **KHÔNG** (Chỉ trong nhà máy được chỉ định) |
| `DATA_OPERATOR` | Level 1 (Nhập liệu & quét mã PDA) | **KHÔNG** (Chỉ trong nhà máy được chỉ định) |
| `AUDITOR` / `AI_AUDITOR` | Không phê duyệt (Chỉ đọc & Kiểm toán độc lập)| Có (Toàn quyền kiểm tra nhật ký) |
