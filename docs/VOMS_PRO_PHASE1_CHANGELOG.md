# VOMS PRO PHASE 1 — CHANGELOG & MIGRATION HISTORY

All notable changes made during **Phase 1 — Trust Foundation Upgrade** are documented below.

The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and ISO 9001 / IATF 16949 Change Management directives.

---

## [1.1.0] - Phase 1 Trust Foundation Release - 2026-10-25

### Added
- **PostgreSQL / Cloud SQL Relational Schema (`src/db/schema.sql`):**
  - Added DDL tables: `auth_users`, `auth_sessions`, `satellite_plants`, `audit_logs`, `approval_requests`, `data_trust_sources`, `data_trust_issues`, `data_trust_import_runs`.
  - Added indexes on `timestamp_utc`, `correlation_id`, `actor_id`, `plant_id`, and `status`.
  - Added CHECK constraint `chk_no_self_approval` enforcing `status != 'APPROVED' OR (requested_by != approver_id)`.
- **Trust Foundation Backend Router (`src/server/trustServices.ts`):**
  - Added 8 enterprise role definitions: `SYSTEM_ADMIN`, `MANAGEMENT`, `OUTSOURCING_GROUP`, `VENDOR_MANAGER`, `QC`, `EQUIPMENT_TECHNICIAN`, `DATA_OPERATOR`, `AUDITOR`.
  - Added `authMiddleware` enforcing Bearer token validation and user session resolution.
  - Added `requireRoles` middleware for role permission gating.
  - Added `enforceVendorIsolation` middleware preventing cross-vendor access.
  - Added cryptographic `recordAuditLog` calculating SHA-256 integrity hash for each state mutation.
  - Added Human-in-the-Loop approval endpoints with finite state transitions (`SUBMITTED -> APPROVED/REJECTED -> EXECUTING -> COMPLETED`).
  - Added Data Trust overview, sources, issues, and batch schema validator endpoints (`/api/v1/data-trust/*`).
- **Data Trust Center UI Component (`src/components/modules/DataTrustCenterModule.tsx`):**
  - Built trilingual UI supporting Vietnamese (VI), English (EN), and Korean (KR).
  - Prominent banner: `"DEMO MODE — CHƯA KẾT NỐI DỮ LIỆU THỰC" (DEMO MODE — NOT CONNECTED TO LIVE PRODUCTION DATABASE)`.
  - Added 7 Satellite Plants Isolation Matrix.
  - Added interactive Batch Schema Validator tool for testing real-time payload conformity.
- **Human-in-the-Loop & Audit Trail UI Component (`src/components/modules/AuditLogApprovalModule.tsx`):**
  - Added dual-tab explorer for HITL Approvals and Immutable Audit Trail.
  - Added approval decision modal with mandatory justification notes.
  - Added SHA-256 integrity verification modal with state diff inspector (Before vs After).
  - Added CSV Export capability.
- **Header & Navigation Updates (`src/components/Header.tsx`, `src/components/Sidebar.tsx`):**
  - Added role switcher dropdown in Header for testing all 8 roles.
  - Added "DEMO MODE — CHƯA KẾT NỐI DB THẬT" badge in Header.
  - Added "NỀN TẢNG TIN CẬY (PHASE 1)" navigation group in Sidebar.
- **Automated Verification Suite (`tests/phase1_audit_tests.ts`):**
  - Added 20 automated tests spanning Auth, RBAC, Vendor Isolation, Schema Validation, HITL workflow, and existing endpoint regressions.
- **Phase 1 Governance Documentation:**
  - `docs/VOMS_PRO_PHASE1_INVENTORY.md`
  - `docs/VOMS_PRO_PHASE1_ARCHITECTURE.md`
  - `docs/VOMS_PRO_PHASE1_SECURITY.md`
  - `docs/VOMS_PRO_PHASE1_DATA_TRUST.md`
  - `docs/VOMS_PRO_PHASE1_TEST_REPORT.md`
  - `docs/VOMS_PRO_PHASE1_CHANGELOG.md`

### Changed
- Mounted `trustRouter` into `server.ts` under `/api/v1`.
- Mounted Phase 1 tabs in `src/App.tsx` router.

### Preserved (No Regressions)
- M01 to M12 operational modules intact.
- Causal DAG 18 nodes / 24 edges intact.
- Pearl Do-Calculus counterfactual simulation intact.
- Mobile Handheld PDA 390px Suite intact.
