# VOMS PRO PHASE 5 — SECURITY, RBAC & AUDIT GOVERNANCE

**Phân hệ:** Quản trị Bảo mật, Phân quyền & Tính Bất biến Kiểm toán  
**Tiêu chuẩn áp dụng:** ISO/IEC 27001:2022 · SOC 2 Type II · EU AI Act Article 14  

---

## 1. MA TRẬN THẨM QUYỀN VAI TRÒ (ROLE-BASED ACCESS CONTROL - RBAC)

Hệ thống kế thừa và thực thi 8 vai trò người dùng doanh nghiệp:

| Vai trò (Role) | Token kiểm thử | Kích hoạt/Tạm dừng Phase 5 | Đề xuất CAPA | Phê duyệt CAPA Cấp 1 | Phê duyệt CAPA Cấp 2 (Dual) | Nghiệm thu Closed-Loop |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **SYSTEM_ADMIN** | `token_admin_super_secret_9981` | ✅ TOÀN QUYỀN | ✅ | ✅ | ✅ | ✅ |
| **MANAGEMENT** | `token_mgmt_lead_access_5521` | ✅ CÓ QUYỀN | ✅ | ✅ | ✅ | ✅ |
| **PRODUCTION_PLANNER** | `token_planner_master_3311` | ❌ TỪ CHỐI | ✅ | ✅ | ❌ | ✅ |
| **APPROVER** | `token_approver_board_7788` | ❌ TỪ CHỐI | ✅ | ✅ | ❌ | ✅ |
| **OUTSOURCING_GROUP** | `token_outsourcing_token_7719` | ❌ TỪ CHỐI | ✅ | ✅ | ❌ | ❌ |
| **EQUIPMENT_TECHNICIAN**| `token_technician_service_2290` | ❌ TỪ CHỐI | ✅ | ❌ | ❌ | ❌ |
| **AUDITOR** | `token_auditor_readonly_9900` | ❌ TỪ CHỐI | ❌ (Chỉ đọc) | ❌ | ❌ | ✅ (Giám định) |
| **DATA_OPERATOR** | `token_operator_entry_1109` | ❌ TỪ CHỐI | ❌ (Chỉ đọc) | ❌ | ❌ | ❌ |

---

## 2. QUY TẮC BẢO MẬT BẮT BUỘC

1. **Anti-Self-Approval Enforcement:**
   - Khi một người dùng đề xuất CAPA (VD: `PRODUCTION_PLANNER`), họ không được quyền tự duyệt cho đề xuất đó kể cả khi có quyền Approver.
   - Vi phạm sẽ bị chặn ngay tại backend với mã lỗi `403 ANTI_SELF_APPROVAL_VIOLATION`.
2. **Dual-Approval Gating cho Rủi ro Cao:**
   - Các CAPA có priority `CRITICAL_L4` bắt buộc phải có 2 chữ ký từ 2 cá nhân độc lập.
   - Một người không thể ký duyệt 2 lần trên cùng một CAPA.
3. **Mã băm Tính Toàn vẹn (SHA-256 Audit Trail):**
   - Mọi sự kiện kích hoạt, chuyển trạng thái, phê duyệt và nghiệm thu đều được băm SHA-256 kèm `actorId`, `timestampUtc`, `action`, `resource`, `payload` và địa chỉ IP.
