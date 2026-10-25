# VOMS PRO PHASE 1 — TRUST FOUNDATION ARCHITECTURE SPECIFICATION

**System:** VOMS PRO / Neural Link Enterprise GMES Suite v4.2  
**Architect:** Ngô Thanh Tùng (Chief Enterprise Architect)  
**Standard Compliance:** ISO 9001:2015, IATF 16949, ISO/IEC 27001, SOC 2 Type II  
**Document Version:** 1.0.0  
**Status:** Approved for Trust Foundation Deployment  

---

## 1. High-Level Architecture Overview

VOMS PRO (Vendor Operations Management System Professional) operates as a high-concurrency, real-time cybernetic production control platform spanning 7 satellite manufacturing facilities in Vietnam.

Phase 1 introduces the **Trust Foundation Architecture**, establishing:
1. **Cryptographic Data Immutability** for audit logging.
2. **Multi-Tenant Data Isolation** partitioning vendor records strictly by `plant_id`.
3. **Dual-Key Human-in-the-Loop Governance** preventing AI or rogue single actors from executing high-impact interventions without multi-stage approval.
4. **Data Quality & Lineage Center** ensuring incoming telemetry meets strict schema and SLA bounds.

```
+-----------------------------------------------------------------------------------+
|                            VOMS PRO FRONTEND CLIENT                               |
|   (React 19 SPA + Vite + Tailwind CSS v4 + Motion + Mobile 390px PDA Suite)       |
+------------------------------------------+----------------------------------------+
                                           | HTTP / Bearer Auth / SSE
                                           v
+-----------------------------------------------------------------------------------+
|                         EXPRESS FULL-STACK BACKEND (PORT 3000)                    |
|   +------------------------------------+--------------------------------------+   |
|   |   Operational REST Routes          |   Phase 1 Trust Foundation Services  |   |
|   |   - /api/v1/telemetry/live         |   - /api/v1/auth/* (8 RBAC Roles)    |   |
|   |   - /api/v1/causal/graph           |   - /api/v1/audit/* (SHA-256 Trail)  |   |
|   |   - /api/v1/logistics/*            |   - /api/v1/approvals/* (HITL FSM)   |   |
|   |   - /api/v1/simulation/*           |   - /api/v1/data-trust/* (Governance)|   |
|   +------------------------------------+--------------------------------------+   |
+------------------------------------------+----------------------------------------+
                                           | DDL & In-Memory Enforced Store
                                           v
+-----------------------------------------------------------------------------------+
|                   POSTGRESQL 15+ / GOOGLE CLOUD SQL DATABASE                      |
|   Tables: auth_users, auth_sessions, satellite_plants, audit_logs,                |
|           approval_requests, data_trust_sources, data_trust_issues, import_runs   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Finite State Machine (HITL Approval Workflow)

Destructive and high-impact operations (e.g., dispatching raw materials, CNC maintenance tool overrides, laser re-calibration) cannot be executed unilaterally by AI or individual operators. They are enforced by a deterministic finite state machine:

```
    [ DRAFT ] 
        |
        v  (Submit with mandatory Rollback Plan)
    [ SUBMITTED ]
        |
        +-----------------------------------+
        |                                   |
        v  (Approved by independent Lead)   v  (Rejected with Reason)
    [ APPROVED ]                        [ REJECTED ]
        |
        v  (Execution Triggered)
    [ EXECUTING ]
        |
        +-----------------+
        |                 |
        v                 v
   [ COMPLETED ]      [ FAILED ]
```

### Critical Invariants:
1. **Self-Approval Prohibition:** `CHECK (requested_by != approver_id)`. An operator or vendor manager proposing an emergency transfer cannot sign off on it.
2. **AI Action Constraint:** AI recommendations produce draft or submitted approvals; the system refuses to invoke mutating actions automatically without human signature.
3. **Mandatory Rollback Strategy:** Every approval request requires an explicit, auditable `rollback_plan` string (e.g., redirecting trucks within 60 minutes, switching to secondary CNC spindle).

---

## 3. Cryptographic Audit Trail Architecture

Every mutation generates a tamper-evident audit log record structured as follows:

```typescript
interface AuditLogEntry {
  eventId: string;           // EVT-<epoch>-<random>
  correlationId: string;     // CORR-<epoch> propagated across micro-transactions
  timestampUtc: string;      // ISO 8601 UTC timestamp
  actorId: string;           // Unique user identifier
  actorName: string;         // Human-readable actor name
  actorRole: UserRole;       // Role snapshot at execution time
  plantId: string | null;    // Scoped facility or null for enterprise
  action: string;            // SYSTEM_BOOT, APPROVAL_SUBMITTED, etc.
  resource: string;          // Target entity type
  targetId: string;          // Target identifier
  statusBefore: any;         // JSON snapshot prior to mutation
  statusAfter: any;          // JSON snapshot subsequent to mutation
  payload: any;              // Request arguments
  ipAddress: string;         // Client IP
  integrityHash: string;     // SHA-256 signature
  isVerified: boolean;       // Tamper status
}
```

### Hash Formula:
$$\text{Hash} = \text{SHA256}(\text{eventId} \parallel \text{correlationId} \parallel \text{timestampUtc} \parallel \text{actorId} \parallel \text{action} \parallel \text{resource} \parallel \text{JSON}(\text{payload}))$$

Verification runs via `/api/v1/audit/verify/:eventId`, computing the expected digest against stored fields. Any tampering yields immediate status divergence.

---

## 4. Multi-Tenant Vendor Data Isolation

Vendor managers and local floor technicians operate under strict multi-tenant data boundaries:
- A user authenticated with `plantId: 'DAAL'` can only query and mutate resources matching plant `DAAL`.
- Inter-plant transactions (such as transferring billet stock from Hub A01 to DAAL) require elevated roles: `SYSTEM_ADMIN`, `MANAGEMENT`, or `OUTSOURCING_GROUP`.
- Enforced at the middleware level via `enforceVendorIsolation()`.
