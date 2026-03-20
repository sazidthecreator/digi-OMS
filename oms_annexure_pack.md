
# Annexure Pack — OMS Control Platform

## Annexure A — Solution Architecture Summary

### A.1 Objective
The proposed OMS Control Platform is designed to ensure beneficiary identity verification, restrict duplicate lifting, enforce quota rules, support low-connectivity field operations, and provide central monitoring, audit, and analytics.

### A.2 Core Components
1. Dealer Android Application
   - Beneficiary registration
   - Face verification
   - Food distribution
   - Offline queue and conditional synchronization

2. Central Web Control Tower
   - National monitoring dashboard
   - Office/program setup
   - Audit and exception review
   - Analytics and reporting

3. Biometric Verification Layer
   - 1:1 face verification
   - Match / retry / exception result states
   - Future readiness for fingerprint / multimodal verification

4. Audit & Analytics Layer
   - Access logs
   - Distribution logs
   - Exception tracking
   - Region-level demand and risk visibility

### A.3 Architecture Principles
- Offline-first field continuity
- Audit-by-design governance
- Modular service-oriented backend
- Scalable national deployment model
- Government ownership through documentation and handover

---

## Annexure B — API Specification Summary

### B.1 Core API Groups
- Auth
- Dealer Context
- Beneficiaries
- Verifications
- Distributions
- Sync
- Dashboard
- Audit

### B.2 Key Endpoints
- POST /api/v1/auth/login
- GET /api/v1/dealers/me
- POST /api/v1/beneficiaries
- GET /api/v1/beneficiaries/{beneficiaryCode}
- GET /api/v1/beneficiaries/search?q=
- POST /api/v1/verifications/face
- POST /api/v1/distributions/check-eligibility
- POST /api/v1/distributions
- POST /api/v1/sync/events
- GET /api/v1/dashboard/summary
- GET /api/v1/audit/logs

### B.3 MVP API Logic
- Beneficiary must exist and be eligible
- Same-day duplicate transaction must be blocked
- Monthly quota must not be exceeded
- Distribution requires matched verification or controlled exception
- Offline sync must be idempotent by event_id
- Audit entry must be written for every critical action

---

## Annexure C — Database Schema Summary

### C.1 Core Master Tables
- offices
- oms_programs
- users
- roles
- user_roles
- dealers
- dealer_program_assignments
- beneficiaries
- beneficiary_biometrics
- quota_rules
- devices

### C.2 Core Transaction Tables
- beneficiary_quota_ledger
- verification_events
- distribution_transactions
- sync_events
- audit_logs
- inspection_reports

### C.3 Core Constraints
- Unique event_id for verification, distribution, and sync events
- Unique beneficiary_code, dealer_code, office_code, user_code
- Positive quantity constraint for distribution
- Period uniqueness for quota ledger
- Foreign key integrity across office, dealer, beneficiary, and program references

---

## Annexure D — MVP Demonstration Scope

### D.1 Demo Scope
- Dealer login
- Beneficiary registration
- Face verification
- Distribution transaction
- Same-day duplicate prevention
- Offline sync queue
- Dashboard summary
- Audit log view

### D.2 Demo Storyline
1. Dealer logs in
2. Dealer registers or selects beneficiary
3. System checks eligibility and quota
4. Face verification is performed
5. Distribution transaction is submitted
6. Duplicate attempt is blocked
7. Offline events are synchronized
8. Dashboard and audit log reflect the result

---

## Annexure E — Deployment Readiness Checklist
- Source code repository structure
- API documentation
- Database migration scripts
- User manual and developer guide
- Environment configuration template
- Training and handover plan

---

## Annexure F — Future Extension Areas
- Full dealer lifecycle automation
- Payment and allotment integrations
- Inspection workflow expansion
- Region-wise predictive demand forecasting
- Fingerprint or multimodal verification support
- Higher-order anomaly scoring and risk models
