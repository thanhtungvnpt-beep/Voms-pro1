-- =========================================================================
-- VOMS PRO / NEURAL LINK ENTERPRISE — DATABASE SCHEMA (PHASE 1 TRUST FOUNDATION)
-- Compliance: ISO 9001:2015 / IATF 16949 / ISO 27001
-- Target Database: PostgreSQL 15+ / Google Cloud SQL
-- =========================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. AUTHENTICATION & ACCESS CONTROL (8 ENTERPRISE ROLES)
-- -------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM (
  'SYSTEM_ADMIN',
  'MANAGEMENT',
  'OUTSOURCING_GROUP',
  'VENDOR_MANAGER',
  'QC',
  'EQUIPMENT_TECHNICIAN',
  'DATA_OPERATOR',
  'AUDITOR'
);

CREATE TABLE IF NOT EXISTS auth_users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(128) UNIQUE NOT NULL,
  full_name VARCHAR(128) NOT NULL,
  role user_role NOT NULL,
  plant_id VARCHAR(32), -- NULL for enterprise-wide roles; specific plant for VENDOR_MANAGER / OPERATOR
  password_hash VARCHAR(256) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  token VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  plant_id VARCHAR(32),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role_plant ON auth_users(role, plant_id);

-- -------------------------------------------------------------------------
-- 2. SATELLITE PLANTS & VENDORS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS satellite_plants (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  vendor_group VARCHAR(64) NOT NULL,
  country VARCHAR(32) NOT NULL DEFAULT 'Vietnam',
  province VARCHAR(64) NOT NULL,
  contact_lead VARCHAR(128),
  contact_phone VARCHAR(32),
  target_daily_capacity_pcs INTEGER NOT NULL DEFAULT 15000,
  data_isolation_level VARCHAR(32) NOT NULL DEFAULT 'STRICT_PARTITION',
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed 7 Satellite Plants
INSERT INTO satellite_plants (id, name, vendor_group, province, target_daily_capacity_pcs) VALUES
('KHV', 'KHV High-Tech SMT', 'KHV Group', 'Bắc Ninh', 15000),
('DREAM_TECH', 'DREAM TECH Electronics', 'DreamTech Vina', 'Bắc Ninh', 18000),
('HSTEC', 'HSTEC Precision Assembly', 'HSTEC Vina', 'Hải Phòng', 16000),
('KTECH', 'KTECH CNC Precision', 'KTech Korea', 'Thái Nguyên', 20000),
('HOJEONGB', 'HOJEONGB Micro-Molding', 'Hojeong Group', 'Bắc Giang', 15500),
('HOJEONG_VINA', 'HOJEONG VINA Laser Welding', 'Hojeong Group', 'Bắc Giang', 18000),
('DAAL', 'DAAL Precision Aluminum', 'Daal Industry', 'Hải Phòng', 18000)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------------
-- 3. AUDIT TRAIL ENGINE (IMMUTABLE RECORD LOGGING)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  event_id VARCHAR(64) PRIMARY KEY,
  correlation_id VARCHAR(64) NOT NULL,
  timestamp_utc TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actor_id VARCHAR(64) NOT NULL,
  actor_name VARCHAR(128) NOT NULL,
  actor_role user_role NOT NULL,
  plant_id VARCHAR(32),
  action VARCHAR(64) NOT NULL,
  resource VARCHAR(64) NOT NULL,
  target_id VARCHAR(128),
  status_before JSONB,
  status_after JSONB,
  payload JSONB,
  ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
  user_agent VARCHAR(256),
  integrity_hash VARCHAR(128) NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp_utc DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id, actor_role);
CREATE INDEX IF NOT EXISTS idx_audit_plant ON audit_logs(plant_id);
CREATE INDEX IF NOT EXISTS idx_audit_correlation ON audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_action_resource ON audit_logs(action, resource);

-- -------------------------------------------------------------------------
-- 4. HUMAN-IN-THE-LOOP APPROVAL WORKFLOW
-- State Machine: DRAFT -> SUBMITTED -> APPROVED / REJECTED -> EXECUTING -> COMPLETED / FAILED
-- -------------------------------------------------------------------------
CREATE TYPE approval_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'EXECUTING',
  'COMPLETED',
  'FAILED'
);

CREATE TYPE risk_level AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL_P1'
);

CREATE TABLE IF NOT EXISTS approval_requests (
  approval_id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(256) NOT NULL,
  module VARCHAR(64) NOT NULL,
  plant_id VARCHAR(32) REFERENCES satellite_plants(id),
  action_type VARCHAR(64) NOT NULL,
  risk_level risk_level NOT NULL DEFAULT 'MEDIUM',
  status approval_status NOT NULL DEFAULT 'SUBMITTED',
  requested_by VARCHAR(64) NOT NULL REFERENCES auth_users(id),
  requested_by_name VARCHAR(128) NOT NULL,
  requested_by_role user_role NOT NULL,
  approver_id VARCHAR(64) REFERENCES auth_users(id),
  approver_name VARCHAR(128),
  approver_role user_role,
  decision_reason TEXT,
  rollback_plan TEXT NOT NULL,
  payload JSONB NOT NULL,
  result_summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  CONSTRAINT chk_no_self_approval CHECK (
    status != 'APPROVED' OR (requested_by != approver_id)
  )
);

CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_plant ON approval_requests(plant_id);
CREATE INDEX IF NOT EXISTS idx_approval_created ON approval_requests(created_at DESC);

-- -------------------------------------------------------------------------
-- 5. DATA TRUST CENTER (DATA QUALITY & GOVERNANCE)
-- -------------------------------------------------------------------------
CREATE TYPE issue_severity AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');
CREATE TYPE issue_status AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'IGNORED');

CREATE TABLE IF NOT EXISTS data_trust_sources (
  source_id VARCHAR(64) PRIMARY KEY,
  source_name VARCHAR(128) NOT NULL,
  source_type VARCHAR(64) NOT NULL, -- SAP_ERP, MES_SIEMENS, IOT_MQTT, HANDHELD_SCANNER, EDI_VENDOR
  plant_id VARCHAR(32) NOT NULL REFERENCES satellite_plants(id),
  connection_status VARCHAR(32) NOT NULL DEFAULT 'ONLINE',
  sync_mode VARCHAR(32) NOT NULL DEFAULT 'DEMO_MOCK', -- DEMO_MOCK or PRODUCTION_LIVE
  is_demo_mode BOOLEAN NOT NULL DEFAULT TRUE,
  trust_score_pct NUMERIC(5, 2) NOT NULL DEFAULT 95.0,
  last_sync_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  avg_latency_ms NUMERIC(6, 2) NOT NULL DEFAULT 10.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_trust_issues (
  issue_id VARCHAR(64) PRIMARY KEY,
  source_id VARCHAR(64) NOT NULL REFERENCES data_trust_sources(source_id),
  plant_id VARCHAR(32) NOT NULL REFERENCES satellite_plants(id),
  rule_code VARCHAR(64) NOT NULL, -- SCHEMA_VIOLATION, MISSING_REQUIRED_FIELD, OUT_OF_BOUNDS, DUPLICATE_ENTRY, TIMESTAMP_DRIFT
  entity_type VARCHAR(64) NOT NULL,
  entity_id VARCHAR(128) NOT NULL,
  severity issue_severity NOT NULL,
  description TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status issue_status NOT NULL DEFAULT 'OPEN',
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(64) REFERENCES auth_users(id),
  resolution_note TEXT
);

CREATE TABLE IF NOT EXISTS data_trust_import_runs (
  run_id VARCHAR(64) PRIMARY KEY,
  source_id VARCHAR(64) NOT NULL REFERENCES data_trust_sources(source_id),
  plant_id VARCHAR(32) NOT NULL REFERENCES satellite_plants(id),
  batch_name VARCHAR(128) NOT NULL,
  total_records INTEGER NOT NULL,
  valid_records INTEGER NOT NULL,
  error_records INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
  is_demo_run BOOLEAN NOT NULL DEFAULT TRUE,
  executed_by VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_issues_plant_status ON data_trust_issues(plant_id, status);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON data_trust_issues(severity);
CREATE INDEX IF NOT EXISTS idx_runs_source ON data_trust_import_runs(source_id, created_at DESC);
