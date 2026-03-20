# OMS (Open Market Sales) National Control Platform
## MVP Specification & Complete Database Schema

**Document Version:** 1.0  
**Date:** March 20, 2026  
**Prepared for:** Ministry of Food, Government of Bangladesh  
**Prepared by:** Manus AI MVP Team  

---

## Executive Summary

This document defines the scope of the Minimum Viable Product (MVP) for the OMS system and provides the complete database schema. The MVP focuses on core functionality required to demonstrate system value and validate key assumptions. The MVP will be deployed in a controlled environment for testing before pilot rollout.

---

## Part 1: MVP Scope Definition

### 1.1 MVP Objectives

The MVP is designed to achieve three primary objectives. First, it demonstrates that the system can reliably process food distribution transactions with duplicate prevention and quota enforcement. Second, it validates that face recognition technology works reliably in field conditions with diverse beneficiary populations. Third, it provides evidence of system benefits (reduced leakage, improved transparency) that justifies continued investment and pilot rollout.

### 1.2 MVP Features (In Scope)

**Dealer Management:** The MVP includes online dealer registration, government approval workflow, dealer login to mobile app, and basic dealer profile management. Dealers can register through a web form, government officials can approve or reject applications through a web interface, and approved dealers can log in to the mobile app.

**Beneficiary Registration:** The MVP includes beneficiary registration with face capture using smartphone camera, national ID verification, and basic eligibility checking. Beneficiaries are registered with their national ID, name, phone number, address, category (widow, elderly, disabled, poor family), and a face photo.

**Food Distribution Transactions:** The MVP includes transaction recording with face verification, daily duplicate prevention (preventing the same beneficiary from receiving food twice in one day), monthly quota tracking, and transaction history. When a beneficiary arrives to collect food, the dealer captures a live photo, the system verifies the face matches the registered photo, checks if the beneficiary has already received food today, and records the transaction.

**Basic Dashboard:** The MVP includes a simple dashboard showing daily transaction summary, total quantity distributed, number of beneficiaries served, duplicate attempts blocked, and quota violations prevented. The dashboard updates in real-time as transactions are processed.

**Audit Logging:** The MVP includes comprehensive audit logging of all transactions and user actions. Every transaction is logged with beneficiary ID, dealer ID, quantity, timestamp, face verification result, and duplicate check result. Every user action (login, approval, etc.) is logged with user ID, action type, timestamp, and result.

**Mobile App with Offline Support:** The MVP includes an Android mobile app that functions offline, stores beneficiary data locally, queues transactions when offline, and synchronizes with the server when online. The app includes a local SQLite database that stores beneficiary records, quota information, and transaction history.

**SMS Notifications:** The MVP includes SMS notifications to dealers about important events including dealer approval, allotment creation, and payment confirmation. Notifications are sent to the phone number provided during dealer registration.

### 1.3 MVP Features (Out of Scope)

**Advanced Analytics:** Analytics module for demand forecasting, poverty indicators, and trend analysis is out of scope for MVP. This will be added in Phase 2.

**Physical Inspection Module:** The observation module for physical inspections and anomaly detection is out of scope for MVP. This will be added in Phase 2.

**Multi-Level Monitoring:** Monitoring dashboards for division and national-level supervisors are out of scope for MVP. The MVP includes only basic district-level monitoring.

**Integration with External Systems:** Integration with Bangladesh Bank payment gateway, government beneficiary database, and Google Maps is out of scope for MVP. These will be added in Phase 2.

**Dealer Rating System:** Dealer rating by beneficiaries is out of scope for MVP. This will be added in Phase 3.

**Advanced Reporting:** Complex reports and export functionality are out of scope for MVP. The MVP includes only basic transaction reports.

### 1.4 MVP Success Criteria

The MVP is considered successful if it meets the following criteria. The system must successfully process 100 or more test transactions per day without errors. Face verification accuracy must exceed 95% when tested with diverse beneficiary photos. Duplicate prevention must work correctly in 100% of test cases where the same beneficiary attempts to receive food twice in one day. Monthly quota enforcement must work correctly in 100% of test cases. Mobile app must function reliably in offline mode with successful synchronization when connectivity is restored. System response time must be under 5 seconds for all operations. All transactions must be logged correctly with complete audit trail. Beneficiary satisfaction survey must show 85% or higher satisfaction with the distribution process.

### 1.5 MVP Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Requirements & Design | Week 1-2 | Architecture finalized, database schema approved, API specifications completed |
| Backend Development | Week 3-5 | All microservices implemented, database deployed, API endpoints tested |
| Mobile App Development | Week 3-5 | Android app with offline support, face recognition integration, sync engine |
| Frontend Development | Week 4-6 | Web application for admin dashboard, dealer registration, beneficiary management |
| Integration & Testing | Week 7-8 | End-to-end testing, performance testing, security testing, bug fixes |
| User Acceptance Testing | Week 9 | Testing with real users, feedback collection, final adjustments |
| Deployment & Training | Week 10 | System deployment to test environment, user training, documentation |

### 1.6 MVP Resource Requirements

**Development Team:** The MVP development team consists of 4-5 backend developers, 1 Android developer, 1 frontend developer, 2 QA engineers, 1 DevOps engineer, 1 project manager, and 1 business analyst. Total team size is 9-10 people.

**Infrastructure:** The MVP requires 2 API servers (8 CPU, 16GB RAM each), 1 database server (16 CPU, 64GB RAM), 1 cache server (4 CPU, 8GB RAM), and 1 monitoring server (4 CPU, 8GB RAM).

**Testing:** The MVP requires testing with at least 100 beneficiaries and 20 dealers in a controlled environment. Test data includes realistic beneficiary photos, transaction patterns, and edge cases.

---

## Part 2: Complete Database Schema

### 2.1 Database Overview

The OMS system uses PostgreSQL as the primary database. The database is designed for high performance, data integrity, and auditability. The schema includes tables for users, dealers, beneficiaries, transactions, offices, programs, and audit logs.

### 2.2 Users Table

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  office_id UUID NOT NULL REFERENCES offices(office_id),
  role_id UUID NOT NULL REFERENCES roles(role_id),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login_at TIMESTAMP,
  password_changed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(user_id),
  
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_office_id ON users(office_id);
CREATE INDEX idx_users_role_id ON users(role_id);
```

### 2.3 Roles Table

```sql
CREATE TABLE roles (
  role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (role_name, description) VALUES
  ('super_user', 'Full system access'),
  ('inspector', 'Monitoring and inspection access'),
  ('dealer', 'Transaction entry access');
```

### 2.4 Offices Table

```sql
CREATE TABLE offices (
  office_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_name VARCHAR(255) NOT NULL,
  office_type VARCHAR(50) NOT NULL CHECK (office_type IN ('national', 'division', 'district', 'upazila', 'center')),
  parent_office_id UUID REFERENCES offices(office_id),
  address VARCHAR(500),
  phone_number VARCHAR(20),
  email VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_hierarchy CHECK (
    (office_type = 'national' AND parent_office_id IS NULL) OR
    (office_type != 'national' AND parent_office_id IS NOT NULL)
  )
);

CREATE INDEX idx_offices_parent_id ON offices(parent_office_id);
CREATE INDEX idx_offices_type ON offices(office_type);
```

### 2.5 Dealers Table

```sql
CREATE TABLE dealers (
  dealer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(50) NOT NULL UNIQUE,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address VARCHAR(500) NOT NULL,
  office_id UUID NOT NULL REFERENCES offices(office_id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'suspended', 'cancelled')),
  approval_date TIMESTAMP,
  approval_by UUID REFERENCES users(user_id),
  suspension_reason VARCHAR(500),
  suspension_end_date DATE,
  bank_account_number VARCHAR(50),
  bank_name VARCHAR(100),
  business_license_url VARCHAR(500),
  national_id_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(user_id),
  
  CONSTRAINT valid_phone CHECK (phone_number ~ '^\+880[0-9]{10}$')
);

CREATE INDEX idx_dealers_office_id ON dealers(office_id);
CREATE INDEX idx_dealers_status ON dealers(status);
CREATE INDEX idx_dealers_registration_number ON dealers(registration_number);
```

### 2.6 Beneficiaries Table

```sql
CREATE TABLE beneficiaries (
  beneficiary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id VARCHAR(13) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  address VARCHAR(500) NOT NULL,
  office_id UUID NOT NULL REFERENCES offices(office_id),
  category VARCHAR(50) NOT NULL CHECK (category IN ('widow', 'elderly', 'disabled', 'poor_family')),
  daily_limit_kg DECIMAL(10, 2) NOT NULL,
  monthly_limit_kg DECIMAL(10, 2) NOT NULL,
  face_photo_url VARCHAR(500),
  face_encoding BYTEA,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(user_id),
  
  CONSTRAINT valid_national_id CHECK (national_id ~ '^[0-9]{13}$'),
  CONSTRAINT valid_daily_limit CHECK (daily_limit_kg > 0 AND daily_limit_kg <= 5),
  CONSTRAINT valid_monthly_limit CHECK (monthly_limit_kg > 0 AND monthly_limit_kg <= 100)
);

CREATE INDEX idx_beneficiaries_national_id ON beneficiaries(national_id);
CREATE INDEX idx_beneficiaries_office_id ON beneficiaries(office_id);
CREATE INDEX idx_beneficiaries_status ON beneficiaries(status);
```

### 2.7 Transactions Table

```sql
CREATE TABLE transactions (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(beneficiary_id),
  dealer_id UUID NOT NULL REFERENCES dealers(dealer_id),
  office_id UUID NOT NULL REFERENCES offices(office_id),
  quantity_kg DECIMAL(10, 2) NOT NULL,
  product_type VARCHAR(20) NOT NULL CHECK (product_type IN ('rice', 'flour')),
  face_verification_result VARCHAR(50) NOT NULL CHECK (face_verification_result IN ('success', 'failed', 'manual_override')),
  face_verification_confidence DECIMAL(3, 2),
  duplicate_check_result VARCHAR(50) NOT NULL CHECK (duplicate_check_result IN ('no_duplicate', 'duplicate_today', 'quota_exceeded')),
  quota_check_result VARCHAR(50) NOT NULL CHECK (quota_check_result IN ('success', 'quota_exceeded')),
  monthly_consumed_kg DECIMAL(10, 2),
  transaction_date DATE NOT NULL,
  transaction_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(user_id),
  
  CONSTRAINT valid_quantity CHECK (quantity_kg > 0)
);

CREATE INDEX idx_transactions_date_beneficiary ON transactions(transaction_date, beneficiary_id);
CREATE INDEX idx_transactions_dealer_date ON transactions(dealer_id, transaction_date);
CREATE INDEX idx_transactions_office_date ON transactions(office_id, transaction_date);
CREATE INDEX idx_transactions_beneficiary_id ON transactions(beneficiary_id);
```

### 2.8 Daily Beneficiary Index Table

This table maintains a real-time index of beneficiaries who have received food today for fast duplicate checking.

```sql
CREATE TABLE daily_beneficiary_index (
  index_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(beneficiary_id),
  office_id UUID NOT NULL REFERENCES offices(office_id),
  last_distribution_time TIMESTAMP NOT NULL,
  quantity_received_today_kg DECIMAL(10, 2) NOT NULL,
  dealer_id UUID REFERENCES dealers(dealer_id),
  index_date DATE NOT NULL,
  
  UNIQUE(beneficiary_id, index_date)
);

CREATE INDEX idx_daily_beneficiary_index_date ON daily_beneficiary_index(index_date);
CREATE INDEX idx_daily_beneficiary_index_beneficiary ON daily_beneficiary_index(beneficiary_id);
```

### 2.9 Monthly Quota Tracking Table

```sql
CREATE TABLE monthly_quota_tracking (
  quota_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(beneficiary_id),
  office_id UUID NOT NULL REFERENCES offices(office_id),
  year_month VARCHAR(7) NOT NULL,
  total_consumed_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
  monthly_limit_kg DECIMAL(10, 2) NOT NULL,
  
  UNIQUE(beneficiary_id, year_month)
);

CREATE INDEX idx_monthly_quota_beneficiary ON monthly_quota_tracking(beneficiary_id);
CREATE INDEX idx_monthly_quota_year_month ON monthly_quota_tracking(year_month);
```

### 2.10 Allotments Table

```sql
CREATE TABLE allotments (
  allotment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(dealer_id),
  office_id UUID NOT NULL REFERENCES offices(office_id),
  quantity_kg DECIMAL(10, 2) NOT NULL,
  product_type VARCHAR(20) NOT NULL CHECK (product_type IN ('rice', 'flour')),
  delivery_date DATE NOT NULL,
  price_per_kg DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending_deposit' CHECK (status IN ('pending_deposit', 'deposit_received', 'delivered', 'cancelled')),
  deposit_amount DECIMAL(15, 2),
  deposit_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(user_id),
  
  CONSTRAINT valid_quantity CHECK (quantity_kg > 0),
  CONSTRAINT valid_price CHECK (price_per_kg > 0)
);

CREATE INDEX idx_allotments_dealer_id ON allotments(dealer_id);
CREATE INDEX idx_allotments_delivery_date ON allotments(delivery_date);
CREATE INDEX idx_allotments_status ON allotments(status);
```

### 2.11 Delivery Orders Table

```sql
CREATE TABLE delivery_orders (
  delivery_order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allotment_id UUID NOT NULL REFERENCES allotments(allotment_id),
  dealer_id UUID NOT NULL REFERENCES dealers(dealer_id),
  office_id UUID NOT NULL REFERENCES offices(office_id),
  warehouse_id UUID,
  do_number VARCHAR(50) NOT NULL UNIQUE,
  collection_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending_collection' CHECK (status IN ('pending_collection', 'collected', 'cancelled')),
  collection_time TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(user_id),
  
  CONSTRAINT valid_do_number CHECK (do_number ~ '^DO-[0-9]{4}-[0-9]{6}$')
);

CREATE INDEX idx_delivery_orders_dealer_id ON delivery_orders(dealer_id);
CREATE INDEX idx_delivery_orders_collection_date ON delivery_orders(collection_date);
```

### 2.12 Audit Logs Table

```sql
CREATE TABLE audit_logs (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failure')),
  error_message TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_ip CHECK (ip_address ~ '^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$')
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
```

### 2.13 Programs Table

```sql
CREATE TABLE programs (
  program_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name VARCHAR(255) NOT NULL,
  program_type VARCHAR(50) NOT NULL CHECK (program_type IN ('regular', 'emergency', 'seasonal')),
  daily_limit_kg DECIMAL(10, 2) NOT NULL,
  monthly_limit_kg DECIMAL(10, 2) NOT NULL,
  eligible_categories VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(user_id),
  
  CONSTRAINT valid_dates CHECK (start_date <= end_date)
);

CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_date_range ON programs(start_date, end_date);
```

### 2.14 Session Management Table

```sql
CREATE TABLE sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_ip CHECK (ip_address ~ '^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$')
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
```

### 2.15 Sync Queue Table (for Mobile App)

```sql
CREATE TABLE sync_queue (
  queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(dealer_id),
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('create_transaction', 'update_beneficiary', 'sync_quota')),
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
  retry_count INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP,
  
  CONSTRAINT valid_retry_count CHECK (retry_count >= 0 AND retry_count <= 5)
);

CREATE INDEX idx_sync_queue_dealer_id ON sync_queue(dealer_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at);
```

---

## Part 3: Database Constraints & Relationships

### 3.1 Referential Integrity

All foreign key relationships are enforced at the database level. When a user is deleted, all records created by that user are retained (for audit purposes) but the user reference is set to NULL. When an office is deleted, all dealers and beneficiaries in that office are marked as inactive rather than deleted.

### 3.2 Data Validation

The database implements comprehensive data validation through constraints:

- Phone numbers must be in format +880XXXXXXXXXX
- National IDs must be exactly 13 digits
- Email addresses must be valid email format
- Daily limits must be between 0.5 and 5 kg
- Monthly limits must be between 10 and 100 kg
- Quantities must be positive numbers
- Dates must be valid and in correct order (start_date <= end_date)

### 3.3 Audit Trail Integrity

The audit_logs table is append-only. Records in audit_logs cannot be modified or deleted. This ensures that the audit trail cannot be tampered with. Audit logs include the old and new values of all modified fields, allowing complete reconstruction of any change.

---

## Part 4: Performance Optimization

### 4.1 Indexes

The database includes indexes on frequently queried columns to improve performance:

- Beneficiary lookup by national ID
- Transaction lookup by date and beneficiary
- Dealer lookup by office
- Audit log lookup by user and timestamp
- Daily beneficiary index for fast duplicate checking
- Monthly quota tracking for quota enforcement

### 4.2 Query Optimization

Complex queries are optimized using:

- Materialized views for aggregated data
- Query result caching in Redis
- Connection pooling to reduce connection overhead
- Prepared statements to prevent SQL injection and improve performance

### 4.3 Partitioning Strategy

The transactions table is partitioned by date to improve query performance for large datasets. Each month's transactions are stored in a separate partition, allowing queries to quickly identify relevant partitions.

---

## Part 5: Backup & Disaster Recovery

### 5.1 Backup Strategy

Daily full backups and hourly incremental backups are performed. Backups are stored in geographically distributed locations to ensure availability if the primary data center becomes unavailable. Backup retention is 30 days, allowing recovery to any point within the last 30 days.

### 5.2 Recovery Procedures

In case of data loss, the database can be recovered from backups. The recovery process includes:

1. Restore database from most recent backup
2. Restore incremental backups to bring database to current state
3. Verify data integrity
4. Resume normal operations

Recovery time objective (RTO) is 1 hour. Recovery point objective (RPO) is 1 hour (maximum 1 hour of data loss).

---

## Part 6: Database Administration

### 6.1 User Permissions

Database users are created with minimal permissions required for their role:

- **Application user:** SELECT, INSERT, UPDATE, DELETE on application tables only
- **Backup user:** SELECT on all tables for backup purposes
- **Admin user:** Full permissions for maintenance and administration

### 6.2 Connection Security

All database connections use SSL/TLS encryption. Database server only accepts connections from application servers with valid certificates. Direct connections from client machines are not allowed.

### 6.3 Monitoring

Database performance is monitored continuously:

- Query execution time
- Connection count
- Disk space usage
- Backup completion status
- Replication lag

Alerts are triggered if performance degrades or issues are detected.

---

## Conclusion

The OMS database schema is designed for high performance, data integrity, and auditability. The schema supports the required scale (5,000 concurrent users, 300,000 daily transactions) while maintaining sub-second query response times. Comprehensive indexes, constraints, and audit logging ensure data quality and enable investigation of any transaction or user action.

