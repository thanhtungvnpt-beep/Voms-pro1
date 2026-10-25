# VOMS PRO PHASE 5 — LIFECYCLE MANAGEMENT & ACTIVATION MANUAL

**Phân hệ:** Quản lý Vòng đời Triển khai & Kích hoạt Phase 5  
**Vị trí giao diện:** AI Control Tower ➔ Tab: "Quản lý Giai đoạn Triển khai (Deployment Lifecycle)"  
**Nút kích hoạt chính:** `KÍCH HOẠT GIAI ĐOẠN 5` / `ACTIVATE PHASE 5` / `5단계 활성화`  
**Tiêu chuẩn an toàn:** ISO 9001 / IATF 16949 / ISO 27001  

---

## 1. MÁY TRẠNG THÁI VÒNG ĐỜI (LIFECYCLE FINITE STATE MACHINE)

Vòng đời Phase 5 được quản lý bằng Finite State Machine nghiêm ngặt nhằm đảm bảo không bao giờ kích hoạt khi chưa qua tiền kiểm tra:

```
[ NOT_STARTED ]
       │
       ▼ (Chạy Preflight Checks)
[ PREFLIGHT_RUNNING ] ──► (Thất bại) ──► [ PREFLIGHT_FAILED ]
       │
       ▼ (8/8 Đạt)
[ PREFLIGHT_PASSED ]
       │
       ▼ (Nhấn nút "KÍCH HOẠT GIAI ĐOẠN 5" + RBAC Admin/Mgmt)
[ ACTIVATING ]
       │
       ▼
   [ RUNNING ] ◄──────────────────────────────┐
       │                                      │
       ├──────────────► [ PAUSED ] ───────────┤ (Resume)
       │                 (Tạm dừng)           │
       │                                      │
       ▼ (Rollback)                           │
 [ ROLLING_BACK ]                             │
       │                                      │
       ▼                                      │
 [ ROLLED_BACK ] ──► (Re-activate) ───────────┘
```

---

## 2. 8 BÀI KIỂM TRA TIỀN TRIỂN KHAI (PREFLIGHT CHECKS)

Hệ thống bắt buộc phải thực thi và vượt qua 100% 8 bài kiểm tra thực tế:

1. **CHECK-01-DB-INTEGRITY:** Kiểm tra tính toàn vẹn cơ sở dữ liệu in-memory & cấu trúc snapshot trạng thái.
2. **CHECK-02-PHASE1-TRUST:** Xác nhận Data Trust Center, đồ thị nguồn gốc (Data Lineage) và công cụ chữ ký SHA-256 đang hoạt động.
3. **CHECK-03-PHASE3-HITL:** Kiểm tra cổng phê duyệt con người, quy tắc Dual-Approval cấp 4 và ngăn chặn AI tự phê duyệt.
4. **CHECK-04-PHASE4-ORCHESTRATION:** Kiểm tra hệ thống điều phối workflow và 4 Circuit Breakers ở trạng thái CLOSED an toàn.
5. **CHECK-05-GMES-CONTRACT:** Xác thực giao diện kết nối 7 nhà máy vệ tinh với Mock Adapter Contract v4.2 và nhãn Disclaimer trung thực.
6. **CHECK-06-KPI-CATALOG:** Xác nhận danh mục 12 KPI chuẩn hóa qua 6 phân nhóm đã được nạp đủ công thức, ngưỡng cảnh báo và chiến lược dữ liệu thiếu.
7. **CHECK-07-IMMUTABLE-AUDIT:** Kiểm tra quyền ghi nhật ký kiểm toán bất biến (Audit Trail) với hàm băm SHA-256.
8. **CHECK-08-RBAC-AUTHORITY:** Xác thực vai trò người kích hoạt thuộc nhóm `SYSTEM_ADMIN` hoặc `MANAGEMENT`.

---

## 3. CƠ CHẾ TẠM DỪNG, TIẾP TỤC VÀ QUAY LUI (PAUSE / RESUME / ROLLBACK)

- **Tạm dừng (`POST /api/v1/phase5/lifecycle/pause`):** Tạm dừng việc đánh giá tự động Phase 5 để thực hiện bảo trì. **Tuyệt đối không làm gián đoạn hay ảnh hưởng tới các dịch vụ Phase 1, Phase 2, Phase 3, Phase 4.**
- **Tiếp tục (`POST /api/v1/phase5/lifecycle/resume`):** Khôi phục trạng thái RUNNING tức thời.
- **Quay lui (`POST /api/v1/phase5/lifecycle/rollback`):** Khôi phục trạng thái hệ thống về baseline Phase 4 ổn định. Toàn bộ lịch sử kiểm toán và nhật ký trước đó được bảo toàn 100%.
