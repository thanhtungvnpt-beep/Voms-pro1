# VOMS PRO PHASE 1 — SECURITY & ACCESS CONTROL SPECIFICATION

**Application:** VOMS PRO / Neural Link Production Control Center  
**Security Standard:** ISO/IEC 27001:2022, OWASP ASVS Level 2, IATF 16949  
**Security Lead:** Application Security & Governance Team  
**Date:** 2026-10-25  

---

## 1. Role-Based Access Control (RBAC) Matrix (8 Target Roles)

VOMS PRO enforces 8 enterprise roles with explicit permissions:

| Role Identifier | Description | Enterprise Scope | Read Telemetry | Propose Action | Approve Action | Execute Action | Audit Logs |
|---|---|---|---|---|---|---|---|
| `SYSTEM_ADMIN` | Quản trị viên hệ thống & Kiến trúc sư | Toàn chuỗi (All 7) | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes | Full Access |
| `MANAGEMENT` | Giám đốc sản xuất / Ban Lãnh đạo | Toàn chuỗi (All 7) | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes | Read |
| `OUTSOURCING_GROUP` | Trưởng ban Thuê ngoài & Vệ tinh | Toàn chuỗi (All 7) | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes | Read |
| `VENDOR_MANAGER` | Nhà máy trưởng đơn vị vệ tinh | Nhà máy cục bộ (`plantId`) | Scoped | ✓ Yes | ✗ No (Self) | Scoped | Scoped |
| `QC` | Trưởng phòng Quản lý chất lượng OQC | Toàn chuỗi (All 7) | ✓ Yes | ✓ Yes | ✗ No | Scoped | Read |
| `EQUIPMENT_TECHNICIAN`| Kỹ sư cơ khí, TPM & Bảo trì | Toàn chuỗi (All 7) | ✓ Yes | ✓ Yes | ✗ No | ✓ Yes | Read |
| `DATA_OPERATOR` | Kỹ thuật viên nhập liệu, quét mã PDA | Nhà máy cục bộ (`plantId`) | Scoped | ✗ No | ✗ No | ✗ No | No Access |
| `AUDITOR` | Đánh giá viên độc lập ISO/IATF | Toàn chuỗi (All 7) | ✓ Yes | ✗ No | ✗ No | ✗ No | Read & Verify |

---

## 2. Vendor Data Isolation Middleware (`enforceVendorIsolation`)

To ensure compliance with client NDAs and IATF 16949 confidentiality requirements, vendor managers and plant operators are strictly isolated:

```typescript
export function enforceVendorIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const multiPlantRoles = ['SYSTEM_ADMIN', 'MANAGEMENT', 'OUTSOURCING_GROUP', 'AUDITOR', 'QC'];
  if (multiPlantRoles.includes(req.user.role)) {
    return next();
  }

  const targetPlant = (
    req.params.plant_id || 
    req.params.plantId || 
    req.query.plant_id || 
    req.query.plantId || 
    req.body?.plantId || 
    req.body?.plant_id
  );

  if (targetPlant && req.user.plantId && targetPlant.toUpperCase() !== req.user.plantId.toUpperCase()) {
    return res.status(403).json({
      error: 'CROSS_VENDOR_ACCESS_DENIED',
      message: `Data Isolation Breach: User from '${req.user.plantId}' cannot access data belonging to '${targetPlant}'.`
    });
  }

  next();
}
```

---

## 3. Threat Model & Mitigations

| Threat | Attack Vector | Mitigation in Phase 1 | Status |
|---|---|---|---|
| **Unauthorized Action Execution** | Direct REST call without authentication | Bearer Token middleware returns `401 UNAUTHORIZED` on missing/invalid credentials. | Verified (Test #1, #2) |
| **Privilege Escalation** | Low-privilege user approving their own or high-risk actions | Role validation rejects unauthorized roles with `403 FORBIDDEN_ROLE`. | Verified (Test #5) |
| **Cross-Tenant Data Leakage** | Vendor A querying Vendor B shipment details | `enforceVendorIsolation` rejects foreign plant access with `403 CROSS_VENDOR_ACCESS_DENIED`. | Verified (Test #6) |
| **Audit Log Tampering** | Database administrator modifying past records | SHA-256 integrity hash verification detects record discrepancy immediately. | Verified (Test #15) |
| **Rogue AI Action Execution** | Automated agent issuing raw actuator commands | High-impact actions require Human-in-the-Loop approval with non-creator sign-off. | Verified (Test #11) |
