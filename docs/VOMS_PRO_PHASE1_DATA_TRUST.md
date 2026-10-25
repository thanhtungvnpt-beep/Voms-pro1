# VOMS PRO PHASE 1 — DATA TRUST & GOVERNANCE SPECIFICATION

**System:** VOMS PRO / Neural Link Production Control Center  
**Target Entities:** 7 Satellite Manufacturing Factories (KHV, DREAM TECH, HSTEC, KTECH, HOJEONGB, HOJEONG VINA, DAAL)  
**Standard Compliance:** ISO 9001:2015 Clause 8.5.2 (Identification and Traceability), IATF 16949 Clause 8.5.1  
**Author:** Data Governance & Enterprise Quality Engineering Team  
**Date:** 2026-10-25  

---

## 1. Data Trust Center Mission & Scope

The Data Trust Center serves as the single source of truth for telemetry and production event integrity across all 7 satellite factories. Because the current environment operates in **DEMO MODE (Chưa kết nối dữ liệu thực)**, all incoming ingestion streams pass through an audited staging and schema validation filter before being admitted into the operational state store.

### Explicit Warning Banner
Every Phase 1 screen and telemetry summary displays:
> **DEMO MODE — CHƯA KẾT NỐI DỮ LIỆU THỰC (DEMO MODE — NOT CONNECTED TO LIVE PRODUCTION DATABASE)**

---

## 2. Ingestion Protocols & Data Sources (7 Plants)

| Factory | Protocol / Adapter | Entity Types Audited | SLA Freshness | Target Trust % |
|---|---|---|---|---|
| **KHV** | `SAP_ERP` RFC / REST | Daily Transfer Orders, Master BOM | < 15s | >= 98.0% |
| **DREAM_TECH** | `EDI_VENDOR` AS2 / HTTPS | PCB SMT Batch Run, Shipment Advance Shipping Notice (ASN) | < 30s | >= 98.0% |
| **HSTEC** | `HANDHELD_SCANNER` PDA WebSocket | Barcode Scan Events, Workstation cycle times | < 5s | >= 95.0% |
| **KTECH** | `IOT_MQTT` Broker | Spindle Vibration (G), Bearing Temperature (°C) | < 2s | >= 95.0% |
| **HOJEONGB** | `AOI_OPTICAL` Inspection Hub | Dimensional defect rate, Defect classification | < 10s | >= 95.0% |
| **HOJEONG_VINA** | `LASER_CONTROLLER` Modbus TCP | Laser optic beam alignment (mm), Weld seam depth | < 5s | >= 92.0% |
| **DAAL** | `MES_SIEMENS` OPC-UA | Aluminum Billet Heat No, Stamping Press Cycle (Bar) | < 10s | >= 90.0% |

---

## 3. Schema Validation Rules (Phase 1 Ruleset)

All telemetry and production lot payloads posted to `/api/v1/data-trust/validate` must satisfy 5 canonical validation checks:

### Rule 1: `MISSING_REQUIRED_FIELD`
- Fields `id`, `plantId`, and `timestamp` are mandatory.
- Batches containing records without primary identifier or plant designation are rejected immediately.

### Rule 2: `DUPLICATE_ID`
- Records within a single batch transmission or within a sliding 60-second window cannot duplicate the same entity key (e.g. rapid duplicate PDA scans on barcode `BC-SMT-44021`).
- Deduplication filter drops secondary duplicates and logs an informational audit note.

### Rule 3: `OUT_OF_BOUNDS_VALUE`
- Quantity fields must satisfy $0 \le \text{quantity} \le 100,000$. Negative quantities are rejected.
- Vibration sensors must satisfy $0.0 \le G \le 10.0$.
- Press pressure must not exceed Upper Control Limit (UCL = 220 Bar).

### Rule 4: `INVALID_TIMESTAMP_FORMAT`
- Timestamps must parse strictly as ISO 8601 UTC (e.g., `2026-10-25T08:00:00Z`).
- NTP clock drift exceeding $\pm 5.0$ seconds triggers an automatic `TIMESTAMP_DRIFT` warning.

### Rule 5: `ISOLATION_MISMATCH`
- Vendor payloads originating from a plant-specific gateway cannot specify external `plantId` values.

---

## 4. Integration Pattern for Satellite Factories

To connect a satellite factory to VOMS PRO:

1. **Gateway Provisioning:** Deploy a certified VOMS Edge Gateway or MQTT Connector.
2. **Key Assignment:** Obtain an isolated Bearer Token scoped to the assigned `plant_id`.
3. **Pre-Flight Schema Test:** Run a test payload against `POST /api/v1/data-trust/validate`.
4. **Gradual Staging:**
   - Level 0: `DEMO_MOCK` (Staged schema validation, mock response).
   - Level 1: `SHADOW_SYNC` (Live telemetry mirrored without mutating state).
   - Level 2: `PRODUCTION_LIVE` (Full bidirectional GMES integration).
