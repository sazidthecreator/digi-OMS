# OMS (Open Market Sales) National Control Platform
## Functional Requirements & Complete API Documentation

**Document Version:** 1.0  
**Date:** March 20, 2026  
**Prepared for:** Ministry of Food, Government of Bangladesh  
**Prepared by:** Manus AI Technical Team  

---

## Executive Summary

This document provides detailed functional specifications for all six modules of the OMS system, including complete API documentation with request/response examples, business rules, and validation requirements. The document is intended for developers implementing the system and technical stakeholders who need to understand system capabilities in detail.

---

## Part 1: Module 1 - Dealer Registration & Lifecycle

### 1.1 Overview

The Dealer Registration module manages the complete lifecycle of dealers in the OMS system. Dealers are merchants authorized by the government to distribute food to beneficiaries. The module handles online registration, government approval, renewal, and suspension/cancellation.

### 1.2 Functional Requirements

**Requirement 1.1: Online Dealer Registration**

Dealers can apply for registration through the web application. The registration form collects the following information:

- Dealer name (required, string, max 100 characters)
- Business registration number (required, string, unique, max 50 characters)
- Phone number (required, string, format: +880XXXXXXXXXX)
- Email address (optional, string, valid email format)
- Physical address (required, string, max 500 characters)
- Office location (required, dropdown selection of government offices)
- Bank account number (required for payment processing)
- Bank name (required)
- Business license copy (required, file upload, PDF/JPG, max 10MB)
- National ID copy (required, file upload, PDF/JPG, max 10MB)

After submission, the application enters "pending" status and awaits government approval.

**Requirement 1.2: Dealer Approval Workflow**

Government officials at the district or upazila level review dealer applications and approve or reject them. The approval process includes:

- Verification of business registration with government records
- Verification of national ID with government database
- Background check for criminal history
- Site inspection (optional, can be scheduled)
- Approval or rejection decision

When approved, the dealer receives an email notification with login credentials and instructions for accessing the mobile app.

**Requirement 1.3: Dealer Login**

Dealers log in to the mobile app using their username (business registration number) and password. The system authenticates the dealer and issues a JWT token valid for 24 hours. The token is used to authenticate all subsequent requests from the mobile app.

**Requirement 1.4: Dealer Renewal**

Dealer registrations expire annually and must be renewed. The system sends a renewal reminder 30 days before expiration. Dealers can initiate renewal through the mobile app by confirming their information and paying a renewal fee. Renewal applications follow the same approval process as new applications.

**Requirement 1.5: Dealership Suspension/Cancellation**

Government officials can suspend or cancel dealerships for violations including:

- Repeated fraud attempts
- Selling food at inflated prices
- Distributing substandard quality food
- Violating quota limits
- Failure to maintain records

Suspended dealers cannot access the system. Cancelled dealers are permanently removed from the system.

### 1.3 API Endpoints

**Endpoint 1.1: Submit Dealer Registration**

```
POST /api/v1/dealers/register
```

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "dealer_name": "Ahmed's Food Distribution Center",
  "registration_number": "BRN-2024-001234",
  "phone_number": "+8801700000001",
  "email": "ahmed@foodcenter.com",
  "address": "123 Main Street, Dhaka-1100",
  "office_id": "550e8400-e29b-41d4-a716-446655440001",
  "bank_account_number": "1234567890",
  "bank_name": "Dhaka Bank",
  "business_license_url": "https://cdn.example.com/licenses/brn-2024-001234.pdf",
  "national_id_url": "https://cdn.example.com/ids/1234567890123.pdf"
}
```

**Response (201 Created):**
```json
{
  "dealer_id": "550e8400-e29b-41d4-a716-446655440002",
  "dealer_name": "Ahmed's Food Distribution Center",
  "registration_number": "BRN-2024-001234",
  "status": "pending",
  "application_date": "2026-03-20T10:30:00Z",
  "message": "Registration submitted successfully. Please wait for approval."
}
```

**Response (400 Bad Request):**
```json
{
  "error": "validation_error",
  "details": [
    {
      "field": "phone_number",
      "message": "Phone number must be in format +880XXXXXXXXXX"
    },
    {
      "field": "registration_number",
      "message": "This registration number is already registered"
    }
  ]
}
```

**Endpoint 1.2: Get Dealer Details**

```
GET /api/v1/dealers/{dealer_id}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "dealer_id": "550e8400-e29b-41d4-a716-446655440002",
  "dealer_name": "Ahmed's Food Distribution Center",
  "registration_number": "BRN-2024-001234",
  "phone_number": "+8801700000001",
  "email": "ahmed@foodcenter.com",
  "address": "123 Main Street, Dhaka-1100",
  "office_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "approved",
  "approval_date": "2026-03-21T14:00:00Z",
  "approved_by": "550e8400-e29b-41d4-a716-446655440010",
  "bank_account_number": "1234567890",
  "bank_name": "Dhaka Bank",
  "current_allotment_kg": 500,
  "total_distributed_today_kg": 250,
  "remaining_quota_kg": 250,
  "total_distributed_this_month_kg": 8500,
  "monthly_quota_kg": 10000,
  "renewal_date": "2027-03-21",
  "created_at": "2026-03-20T10:30:00Z",
  "updated_at": "2026-03-21T14:00:00Z"
}
```

**Endpoint 1.3: Approve Dealer Application**

```
POST /api/v1/dealers/{dealer_id}/approve
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "approval_notes": "Business registration verified. Site inspection completed successfully."
}
```

**Response (200 OK):**
```json
{
  "dealer_id": "550e8400-e29b-41d4-a716-446655440002",
  "status": "approved",
  "approval_date": "2026-03-21T14:00:00Z",
  "message": "Dealer approved successfully. Notification sent to dealer."
}
```

**Endpoint 1.4: Suspend Dealer**

```
POST /api/v1/dealers/{dealer_id}/suspend
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Repeated fraud attempts detected",
  "suspension_duration_days": 30
}
```

**Response (200 OK):**
```json
{
  "dealer_id": "550e8400-e29b-41d4-a716-446655440002",
  "status": "suspended",
  "suspension_reason": "Repeated fraud attempts detected",
  "suspension_end_date": "2026-04-20",
  "message": "Dealer suspended successfully."
}
```

---

## Part 2: Module 2 - Dealer Management

### 2.1 Overview

The Dealer Management module handles operational aspects of dealer business including allotment creation, deposit collection, payment approval, and delivery order creation.

### 2.2 Functional Requirements

**Requirement 2.1: Dealer Allotment**

Government officials create allotments that specify how much rice/flour each dealer receives. Allotments are created based on:

- Beneficiary population in the dealer's service area
- Seasonal demand patterns
- Historical consumption data
- Available government inventory

Each allotment specifies the quantity (in kilograms), product type (rice or flour), and delivery date.

**Requirement 2.2: Dealer Deposit**

Before receiving inventory, dealers must deposit money with the government. The deposit amount is typically 10-20% of the allotment value. The system records the deposit and verifies payment through Bangladesh Bank.

**Requirement 2.3: Dealer Payment Approval**

After distributing food, dealers submit payment to the government. The system verifies the payment through Bangladesh Bank and approves it. Payment approval triggers inventory adjustment and quota reset.

**Requirement 2.4: Delivery Order Creation**

After allotment and deposit are confirmed, the system creates a delivery order (DO) that authorizes the dealer to collect inventory from the government warehouse. The DO includes the allotment details and is used for warehouse receipt verification.

### 2.3 API Endpoints

**Endpoint 2.1: Create Allotment**

```
POST /api/v1/allotments
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "dealer_id": "550e8400-e29b-41d4-a716-446655440002",
  "quantity_kg": 500,
  "product_type": "rice",
  "delivery_date": "2026-03-22",
  "price_per_kg": 40,
  "total_amount": 20000,
  "notes": "Regular monthly allotment"
}
```

**Response (201 Created):**
```json
{
  "allotment_id": "550e8400-e29b-41d4-a716-446655440020",
  "dealer_id": "550e8400-e29b-41d4-a716-446655440002",
  "quantity_kg": 500,
  "product_type": "rice",
  "delivery_date": "2026-03-22",
  "total_amount": 20000,
  "status": "pending_deposit",
  "required_deposit_amount": 4000,
  "created_at": "2026-03-20T15:00:00Z"
}
```

**Endpoint 2.2: Record Dealer Deposit**

```
POST /api/v1/allotments/{allotment_id}/deposit
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "deposit_amount": 4000,
  "payment_method": "bank_transfer",
  "transaction_reference": "TXN-2026-001234",
  "payment_date": "2026-03-21"
}
```

**Response (200 OK):**
```json
{
  "allotment_id": "550e8400-e29b-41d4-a716-446655440020",
  "deposit_amount": 4000,
  "status": "deposit_received",
  "delivery_order_id": "550e8400-e29b-41d4-a716-446655440021",
  "message": "Deposit received. Delivery order created."
}
```

**Endpoint 2.3: Create Delivery Order**

```
POST /api/v1/delivery-orders
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "allotment_id": "550e8400-e29b-41d4-a716-446655440020",
  "warehouse_id": "550e8400-e29b-41d4-a716-446655440030",
  "collection_date": "2026-03-22",
  "authorized_by": "550e8400-e29b-41d4-a716-446655440010"
}
```

**Response (201 Created):**
```json
{
  "delivery_order_id": "550e8400-e29b-41d4-a716-446655440021",
  "allotment_id": "550e8400-e29b-41d4-a716-446655440020",
  "dealer_id": "550e8400-e29b-41d4-a716-446655440002",
  "quantity_kg": 500,
  "product_type": "rice",
  "warehouse_id": "550e8400-e29b-41d4-a716-446655440030",
  "collection_date": "2026-03-22",
  "status": "pending_collection",
  "do_number": "DO-2026-001234",
  "created_at": "2026-03-21T10:00:00Z"
}
```

---

## Part 3: Module 3 - Distribution

### 3.1 Overview

The Distribution module handles the core OMS operation: distributing food to beneficiaries. This module includes beneficiary registration, face verification, transaction recording, and duplicate prevention.

### 3.2 Functional Requirements

**Requirement 3.1: Beneficiary Registration**

Beneficiaries are registered in the system with the following information:

- National ID (required, unique, 13 digits)
- Full name (required, string, max 100 characters)
- Phone number (optional, string)
- Physical address (required, string, max 500 characters)
- Category (required, enum: widow, elderly, disabled, poor_family)
- Daily limit (required, decimal, in kilograms, typically 2kg)
- Monthly limit (required, decimal, in kilograms, typically 40kg)
- Face photo (required, JPEG/PNG, min 200x200 pixels)

The face photo is used for verification during distribution. The system extracts face embeddings from the photo using ML Kit for face recognition.

**Requirement 3.2: Face Verification During Distribution**

When a beneficiary arrives to collect food, the dealer uses the mobile app to:

1. Enter the beneficiary's national ID or phone number to search the database
2. Capture a live photo of the beneficiary using the phone camera
3. The system compares the live photo with the registered face photo
4. If the match confidence is above 95%, the system marks the verification as successful
5. If the match confidence is below 95%, the system marks the verification as failed and requires manual override

**Requirement 3.3: Duplicate Prevention**

The system maintains a real-time index of all beneficiaries who have received food today. When a dealer attempts to distribute food to a beneficiary, the system checks this index. If the beneficiary has already received food today, the system alerts the dealer and prevents the transaction unless an authorized officer approves an exception.

**Requirement 3.4: Quota Enforcement**

The system tracks each beneficiary's cumulative food collection for the current month. When a dealer attempts to distribute food, the system verifies that the distribution will not exceed the beneficiary's monthly quota. If the quota would be exceeded, the system alerts the dealer and prevents the transaction.

**Requirement 3.5: Transaction Recording**

Each food distribution transaction is recorded with complete details including:

- Beneficiary ID
- Dealer ID
- Office ID
- Quantity (in kilograms)
- Product type (rice or flour)
- Face verification result (success, failed, manual override)
- Duplicate check result (no duplicate, duplicate today, quota exceeded)
- Transaction date and time
- User who approved any exceptions

### 3.3 API Endpoints

**Endpoint 3.1: Register Beneficiary**

```
POST /api/v1/beneficiaries
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**
```
national_id: 1234567890123
full_name: Fatima Begum
phone_number: +8801800000001
address: 456 Side Street, Dhaka-1100
category: widow
daily_limit_kg: 2
monthly_limit_kg: 40
office_id: 550e8400-e29b-41d4-a716-446655440001
face_photo: [binary image data]
```

**Response (201 Created):**
```json
{
  "beneficiary_id": "550e8400-e29b-41d4-a716-446655440003",
  "national_id": "1234567890123",
  "full_name": "Fatima Begum",
  "category": "widow",
  "daily_limit_kg": 2,
  "monthly_limit_kg": 40,
  "status": "active",
  "created_at": "2026-03-20T11:00:00Z"
}
```

**Endpoint 3.2: Record Food Distribution Transaction**

```
POST /api/v1/transactions
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**
```
beneficiary_id: 550e8400-e29b-41d4-a716-446655440003
dealer_id: 550e8400-e29b-41d4-a716-446655440002
quantity_kg: 2
product_type: rice
face_photo: [binary image data]
```

**Response (Success - 201 Created):**
```json
{
  "transaction_id": "550e8400-e29b-41d4-a716-446655440004",
  "beneficiary_id": "550e8400-e29b-41d4-a716-446655440003",
  "dealer_id": "550e8400-e29b-41d4-a716-446655440002",
  "quantity_kg": 2,
  "product_type": "rice",
  "face_verification": {
    "result": "success",
    "confidence": 0.98
  },
  "duplicate_check": "no_duplicate",
  "quota_check": {
    "result": "success",
    "monthly_consumed_kg": 2,
    "monthly_limit_kg": 40,
    "remaining_kg": 38
  },
  "transaction_date": "2026-03-20",
  "transaction_time": "12:00:00",
  "status": "success",
  "created_at": "2026-03-20T12:00:00Z"
}
```

**Response (Duplicate Detected - 409 Conflict):**
```json
{
  "error": "duplicate_detected",
  "message": "This beneficiary has already received food today",
  "duplicate_check": "duplicate_today",
  "previous_transaction": {
    "transaction_id": "550e8400-e29b-41d4-a716-446655440005",
    "dealer_id": "550e8400-e29b-41d4-a716-446655440006",
    "quantity_kg": 2,
    "transaction_time": "10:30:00"
  },
  "action_required": "Manual override needed. Contact supervisor."
}
```

**Response (Quota Exceeded - 409 Conflict):**
```json
{
  "error": "quota_exceeded",
  "message": "This distribution would exceed the beneficiary's monthly quota",
  "quota_check": {
    "result": "quota_exceeded",
    "monthly_consumed_kg": 38,
    "monthly_limit_kg": 40,
    "requested_kg": 2,
    "remaining_kg": 2
  },
  "action_required": "Reduce quantity to 2kg or contact supervisor for exception."
}
```

**Endpoint 3.3: Get Beneficiary Distribution History**

```
GET /api/v1/beneficiaries/{beneficiary_id}/transactions
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date`: YYYY-MM-DD (optional)
- `end_date`: YYYY-MM-DD (optional)
- `limit`: number (optional, default 50)
- `offset`: number (optional, default 0)

**Response (200 OK):**
```json
{
  "beneficiary_id": "550e8400-e29b-41d4-a716-446655440003",
  "total_transactions": 25,
  "total_kg_received": 50,
  "transactions": [
    {
      "transaction_id": "550e8400-e29b-41d4-a716-446655440004",
      "dealer_id": "550e8400-e29b-41d4-a716-446655440002",
      "dealer_name": "Ahmed's Food Center",
      "quantity_kg": 2,
      "product_type": "rice",
      "transaction_date": "2026-03-20",
      "transaction_time": "12:00:00"
    },
    {
      "transaction_id": "550e8400-e29b-41d4-a716-446655440006",
      "dealer_id": "550e8400-e29b-41d4-a716-446655440007",
      "dealer_name": "Karim's Distribution",
      "quantity_kg": 2,
      "product_type": "flour",
      "transaction_date": "2026-03-19",
      "transaction_time": "14:30:00"
    }
  ]
}
```

---

## Part 4: Module 4 - Observation & Monitoring

### 4.1 Overview

The Observation module provides supervisors and inspectors with tools to monitor dealer activities, conduct physical inspections, and identify suspicious patterns.

### 4.2 Functional Requirements

**Requirement 4.1: Sales Activity Monitoring**

Supervisors can view real-time sales activity for dealers in their jurisdiction. The dashboard displays:

- Current transaction volume
- Beneficiary count
- Total quantity distributed today
- Average transaction time
- Face verification success rate
- Duplicate attempts blocked
- Quota violations prevented

**Requirement 4.2: Physical Inspection**

Inspectors can schedule and conduct physical inspections of dealer locations. The inspection records include:

- Inspection date and time
- Inspector name
- Dealer location
- Inventory verification (physical count vs. system records)
- Beneficiary interviews (random sample)
- Observations and findings
- Photos (optional)
- Recommendations

**Requirement 4.3: Anomaly Detection**

The system automatically identifies suspicious patterns including:

- Dealers serving beneficiaries outside their assigned area
- Unusually high transaction volumes
- Face verification failures above normal rate
- Duplicate attempts above normal rate
- Dealers with unusual operating hours

Anomalies are flagged for supervisor review.

### 4.3 API Endpoints

**Endpoint 4.1: Get Sales Activity Summary**

```
GET /api/v1/dashboard/sales-activity
Authorization: Bearer {token}
```

**Query Parameters:**
- `office_id`: UUID (optional, filters to specific office)
- `date`: YYYY-MM-DD (optional, defaults to today)

**Response (200 OK):**
```json
{
  "date": "2026-03-20",
  "office_id": "550e8400-e29b-41d4-a716-446655440001",
  "summary": {
    "total_transactions": 1250,
    "total_quantity_kg": 2500,
    "unique_beneficiaries": 1200,
    "average_transaction_time_seconds": 45,
    "face_verification_success_rate": 0.98,
    "duplicate_attempts_blocked": 15,
    "quota_violations_prevented": 3
  },
  "by_dealer": [
    {
      "dealer_id": "550e8400-e29b-41d4-a716-446655440002",
      "dealer_name": "Ahmed's Food Center",
      "transactions": 50,
      "quantity_kg": 100,
      "unique_beneficiaries": 48,
      "face_verification_success_rate": 0.96
    }
  ],
  "anomalies": [
    {
      "anomaly_type": "high_transaction_volume",
      "dealer_id": "550e8400-e29b-41d4-a716-446655440008",
      "severity": "warning",
      "description": "Transaction volume 50% above normal"
    }
  ]
}
```

**Endpoint 4.2: Create Physical Inspection**

```
POST /api/v1/inspections
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "dealer_id": "550e8400-e29b-41d4-a716-446655440002",
  "inspection_date": "2026-03-21",
  "inspection_time": "10:00",
  "inspector_id": "550e8400-e29b-41d4-a716-446655440011",
  "inspection_type": "routine",
  "notes": "Routine monthly inspection"
}
```

**Response (201 Created):**
```json
{
  "inspection_id": "550e8400-e29b-41d4-a716-446655440040",
  "dealer_id": "550e8400-e29b-41d4-a716-446655440002",
  "inspection_date": "2026-03-21",
  "inspection_time": "10:00",
  "status": "scheduled",
  "created_at": "2026-03-20T15:30:00Z"
}
```

**Endpoint 4.3: Submit Inspection Report**

```
POST /api/v1/inspections/{inspection_id}/report
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "inspection_findings": {
    "inventory_verification": {
      "system_quantity_kg": 250,
      "physical_count_kg": 248,
      "discrepancy_kg": 2,
      "notes": "Minor discrepancy within acceptable range"
    },
    "beneficiary_interviews": {
      "beneficiaries_interviewed": 10,
      "satisfaction_rating": 4.5,
      "complaints": "None"
    },
    "observations": "Dealer operating normally. Good record keeping. Beneficiaries satisfied.",
    "violations_found": false,
    "recommendations": "Continue routine monitoring"
  },
  "photos": [
    "https://cdn.example.com/inspections/photo1.jpg",
    "https://cdn.example.com/inspections/photo2.jpg"
  ]
}
```

**Response (200 OK):**
```json
{
  "inspection_id": "550e8400-e29b-41d4-a716-446655440040",
  "status": "completed",
  "inspection_date": "2026-03-21",
  "findings_summary": "Dealer operating normally. No violations found.",
  "submitted_at": "2026-03-21T11:30:00Z"
}
```

---

## Part 5: Module 5 - OMS Operation Setup

### 5.1 Overview

The OMS Operation Setup module allows government administrators to configure the system for different administrative contexts and operational parameters.

### 5.2 Functional Requirements

**Requirement 5.1: Office Setup**

Administrators can create and configure offices at different administrative levels (national, division, district, upazila, center). Each office can have a parent office (for hierarchical organization) and can manage dealers and beneficiaries.

**Requirement 5.2: Office-Wise Dealer Approval Settings**

Administrators can configure dealer approval settings for each office including:

- Automatic approval threshold (dealers below this threshold are auto-approved)
- Required approval documents
- Approval authority (who can approve dealers)
- Approval timeline (how long approval should take)

**Requirement 5.3: OMS Program Setup**

Administrators can create different OMS programs with different eligibility criteria and allocation rules. For example:

- Regular OMS program (for general vulnerable population)
- Emergency OMS program (for disaster relief)
- Seasonal OMS program (for specific seasons)

Each program can have different daily/monthly limits and beneficiary categories.

**Requirement 5.4: Office-Wise Operation Setup**

Administrators can configure operational parameters for each office including:

- Daily distribution limit per beneficiary
- Monthly distribution limit per beneficiary
- Beneficiary categories eligible for OMS
- Operating hours
- Holidays

### 5.3 API Endpoints

**Endpoint 5.1: Create Office**

```
POST /api/v1/offices
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "office_name": "Dhaka District OMS Center",
  "office_type": "district",
  "parent_office_id": "550e8400-e29b-41d4-a716-446655440050",
  "address": "123 Government Complex, Dhaka",
  "phone_number": "+88029861858",
  "admin_user_id": "550e8400-e29b-41d4-a716-446655440011"
}
```

**Response (201 Created):**
```json
{
  "office_id": "550e8400-e29b-41d4-a716-446655440051",
  "office_name": "Dhaka District OMS Center",
  "office_type": "district",
  "parent_office_id": "550e8400-e29b-41d4-a716-446655440050",
  "status": "active",
  "created_at": "2026-03-20T16:00:00Z"
}
```

**Endpoint 5.2: Configure OMS Program**

```
POST /api/v1/programs
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "program_name": "Regular OMS Program",
  "program_type": "regular",
  "daily_limit_kg": 2,
  "monthly_limit_kg": 40,
  "eligible_categories": ["widow", "elderly", "disabled", "poor_family"],
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "description": "Regular OMS program for vulnerable populations"
}
```

**Response (201 Created):**
```json
{
  "program_id": "550e8400-e29b-41d4-a716-446655440060",
  "program_name": "Regular OMS Program",
  "daily_limit_kg": 2,
  "monthly_limit_kg": 40,
  "status": "active",
  "created_at": "2026-03-20T16:30:00Z"
}
```

---

## Part 6: Module 6 - User & Access Management

### 6.1 Overview

The User Management module provides comprehensive access control including user creation, role assignment, permission management, and audit logging.

### 6.2 Functional Requirements

**Requirement 6.1: User Creation**

Administrators can create new users with the following information:

- Username (required, unique, string)
- Email (required, unique, valid email format)
- Full name (required, string)
- Phone number (optional, string)
- Office (required, dropdown selection)
- Role (required, dropdown selection: Super User, Inspector, Dealer)
- Status (active or inactive)

**Requirement 6.2: Role-Based Access Control**

The system implements three primary roles:

- **Super User:** Full access to all system functions and data. Can approve dealers, manage users, configure programs, and view all reports.
- **Inspector:** Can view dealer activities, conduct inspections, and view reports for their assigned office and below.
- **Dealer:** Can register beneficiaries and record food distributions. Can only view their own data.

**Requirement 6.3: Permission Management**

Permissions are assigned at the role level. Each role has a predefined set of permissions that cannot be modified per user. All users with the same role have the same permissions.

**Requirement 6.4: Audit Logging**

All user actions are logged including:

- User ID
- Action performed (e.g., "CREATE_DEALER", "APPROVE_TRANSACTION")
- Timestamp
- IP address
- User agent (browser/app information)
- Result (success or failure)
- Details of what was changed (for modification actions)

### 6.3 API Endpoints

**Endpoint 6.1: Create User**

```
POST /api/v1/users
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "inspector.dhaka@dgfood.gov.bd",
  "email": "inspector.dhaka@dgfood.gov.bd",
  "full_name": "Mohammad Karim",
  "phone_number": "+8801700000002",
  "office_id": "550e8400-e29b-41d4-a716-446655440051",
  "role": "inspector",
  "status": "active"
}
```

**Response (201 Created):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440012",
  "username": "inspector.dhaka@dgfood.gov.bd",
  "full_name": "Mohammad Karim",
  "role": "inspector",
  "office_id": "550e8400-e29b-41d4-a716-446655440051",
  "status": "active",
  "temporary_password": "TempPass123!@#",
  "message": "User created successfully. Temporary password sent to email."
}
```

**Endpoint 6.2: Get Audit Logs**

```
GET /api/v1/audit-logs
Authorization: Bearer {token}
```

**Query Parameters:**
- `user_id`: UUID (optional)
- `action`: string (optional)
- `start_date`: YYYY-MM-DD (optional)
- `end_date`: YYYY-MM-DD (optional)
- `limit`: number (optional, default 50)
- `offset`: number (optional, default 0)

**Response (200 OK):**
```json
{
  "total_logs": 5000,
  "logs": [
    {
      "audit_id": "550e8400-e29b-41d4-a716-446655440070",
      "user_id": "550e8400-e29b-41d4-a716-446655440010",
      "username": "admin@dgfood.gov.bd",
      "action": "APPROVE_DEALER",
      "table_name": "dealers",
      "record_id": "550e8400-e29b-41d4-a716-446655440002",
      "old_values": {
        "status": "pending"
      },
      "new_values": {
        "status": "approved",
        "approval_date": "2026-03-21T14:00:00Z"
      },
      "ip_address": "192.168.1.100",
      "timestamp": "2026-03-21T14:00:00Z",
      "status": "success"
    }
  ]
}
```

---

## Part 7: Error Handling & Status Codes

The API uses standard HTTP status codes:

| Status Code | Meaning | Example |
|-------------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User lacks permission for this action |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Request conflicts with current state (e.g., duplicate detected) |
| 422 | Unprocessable Entity | Request validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Server temporarily unavailable |

---

## Part 8: Rate Limiting

The API implements rate limiting to prevent abuse:

- **Unauthenticated requests:** 100 requests per hour per IP address
- **Authenticated requests:** 10,000 requests per hour per user
- **Bulk operations:** 100 requests per minute per user

Rate limit information is returned in response headers:

```
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9950
X-RateLimit-Reset: 1711000000
```

---

## Part 9: Data Validation Rules

**Dealer Registration:**
- Phone number must be in format +880XXXXXXXXXX
- Registration number must be unique
- Address must be at least 10 characters

**Beneficiary Registration:**
- National ID must be exactly 13 digits
- Daily limit must be between 0.5 and 5 kg
- Monthly limit must be between 10 and 100 kg
- Face photo must be at least 200x200 pixels

**Transactions:**
- Quantity must be positive number
- Product type must be "rice" or "flour"
- Beneficiary must be active (not suspended)
- Dealer must be approved (not pending or suspended)

---

## Conclusion

This document provides comprehensive functional specifications and API documentation for the OMS system. All endpoints follow RESTful principles and return JSON responses. The system implements comprehensive error handling, rate limiting, and data validation to ensure reliability and security.

