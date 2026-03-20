
// OMS Control Platform - Single-File Backend Prototype
// Runtime: Node.js (no external dependencies required)
// Purpose: Demo backend for auth, beneficiary, verification, distribution, sync, dashboard, and audit.
// Note: In-memory demo only. Replace with PostgreSQL/Redis/Object Storage in production.

const http = require('http');
const { URL } = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------
// In-memory demo data
// ------------------------------------------------------------
const offices = [
  { id: 1, office_code: 'OFF-HQ-001', office_name: 'DG Food HQ', office_type: 'HQ' },
  { id: 2, office_code: 'OFF-DHK-NORTH', office_name: 'Dhaka North OMS Circle', office_type: 'Circle' },
];

const programs = [
  { id: 1, program_code: 'OMS-RICE-2026', program_name: 'OMS Rice Distribution', product_type: 'rice', default_quota_kg: 10, price_per_kg: 30 },
  { id: 2, program_code: 'OMS-FLOUR-2026', program_name: 'OMS Flour Distribution', product_type: 'flour', default_quota_kg: 10, price_per_kg: 24 },
];

const users = [
  { id: 1, user_code: 'USR-0001', full_name: 'Rahman OMS Point User', username: 'dealer0234', password: 'demo123', office_id: 2, role: 'DEALER', dealer_id: 1, status: 'active' },
  { id: 2, user_code: 'USR-0002', full_name: 'District Officer', username: 'officer01', password: 'demo123', office_id: 2, role: 'OFFICER', dealer_id: null, status: 'active' },
];

const dealers = [
  { id: 1, dealer_code: 'DLR-0234', dealer_name: 'Rahman OMS Point', user_id: 1, office_id: 2, mobile_no: '01700000000', approval_status: 'approved', is_active: true },
];

const beneficiaries = [
  { id: 1, beneficiary_code: 'BEN-10021', full_name: 'Amina Khatun', nid_no: '1234567890', mobile_no: '01811111111', gender: 'FEMALE', age: 42, office_id: 2, program_id: 1, eligibility_status: 'eligible', enrollment_status: 'approved' },
  { id: 2, beneficiary_code: 'BEN-10022', full_name: 'Abdul Karim', nid_no: '2234567890', mobile_no: '01822222222', gender: 'MALE', age: 51, office_id: 2, program_id: 1, eligibility_status: 'eligible', enrollment_status: 'approved' },
  { id: 3, beneficiary_code: 'BEN-10023', full_name: 'Salma Begum', nid_no: '3234567890', mobile_no: '01833333333', gender: 'FEMALE', age: 38, office_id: 2, program_id: 1, eligibility_status: 'eligible', enrollment_status: 'approved' },
];

const biometrics = [
  { id: 1, beneficiary_id: 1, biometric_type: 'face', template_ref: 'face-template-ref-001', capture_quality_score: 97.7, is_primary: true },
  { id: 2, beneficiary_id: 2, biometric_type: 'face', template_ref: 'face-template-ref-002', capture_quality_score: 95.2, is_primary: true },
  { id: 3, beneficiary_id: 3, biometric_type: 'face', template_ref: 'face-template-ref-003', capture_quality_score: 90.4, is_primary: true },
];

const quotaRules = [
  { id: 1, program_id: 1, office_id: 2, product_type: 'rice', quota_period_type: 'monthly', max_quantity_kg: 10, max_transactions_per_day: 1, is_active: true },
  { id: 2, program_id: 2, office_id: 2, product_type: 'flour', quota_period_type: 'monthly', max_quantity_kg: 10, max_transactions_per_day: 1, is_active: true },
];

const quotaLedger = [
  { id: 1, beneficiary_id: 1, program_id: 1, product_type: 'rice', period_year: 2026, period_month: 3, allocated_quantity_kg: 10, consumed_quantity_kg: 5, remaining_quantity_kg: 5, last_transaction_at: null },
  { id: 2, beneficiary_id: 2, program_id: 1, product_type: 'rice', period_year: 2026, period_month: 3, allocated_quantity_kg: 10, consumed_quantity_kg: 10, remaining_quantity_kg: 0, last_transaction_at: null },
  { id: 3, beneficiary_id: 3, program_id: 1, product_type: 'rice', period_year: 2026, period_month: 3, allocated_quantity_kg: 10, consumed_quantity_kg: 5, remaining_quantity_kg: 5, last_transaction_at: '2026-03-20T08:30:00+06:00' },
];

const devices = [
  { id: 1, device_id: 'DEVICE-ABC-001', dealer_id: 1, device_model: 'Samsung Note 10+', app_version: '0.1.0', is_bound: true, status: 'active' },
];

const verificationEvents = [];
const distributionTransactions = [
  {
    id: 1,
    transaction_code: 'TXN-20260320-7000',
    event_id: 'EVT-20260320-000001',
    beneficiary_id: 3,
    dealer_id: 1,
    office_id: 2,
    program_id: 1,
    product_type: 'rice',
    quantity_kg: 5,
    unit_price: 30,
    total_amount: 150,
    transaction_date: '2026-03-20',
    transaction_time: '2026-03-20T08:30:00+06:00',
    verification_status: 'matched',
    quota_check_status: 'pass',
    duplicate_check_status: 'pass',
    source_mode: 'online',
    device_id: 'DEVICE-ABC-001',
    remarks: 'Seed transaction for duplicate check',
    created_by: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const syncEvents = [];
const auditLogs = [];

// ------------------------------------------------------------
// Utility helpers
// ------------------------------------------------------------
function nowISO() {
  return new Date().toISOString();
}

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

function createCode(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
  });
}

function send(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
}

function sendError(res, statusCode, code, message, details = null) {
  send(res, statusCode, {
    error: {
      code,
      message,
      details,
      timestamp: nowISO(),
    }
  });
}

function tokenFor(user) {
  return crypto.createHash('sha256').update(`${user.id}:${user.username}:${Date.now()}`).digest('hex');
}

function getBearerToken(req) {
  const auth = req.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

// Very light demo session store
const sessions = new Map();

function getCurrentUser(req) {
  const token = getBearerToken(req);
  if (!token || !sessions.has(token)) return null;
  const userId = sessions.get(token);
  return users.find(u => u.id === userId) || null;
}

function writeAudit({ userId = null, roleName = null, officeId = null, entityType = null, entityId = null, actionType, fieldChanges = null, resultStatus = 'success', deviceId = null, remarks = null }) {
  const item = {
    id: nextId(auditLogs),
    audit_code: createCode('AUD'),
    user_id: userId,
    role_name: roleName,
    office_id: officeId,
    entity_type: entityType,
    entity_id: entityId,
    action_type: actionType,
    field_changes_json: fieldChanges,
    result_status: resultStatus,
    device_id: deviceId,
    ip_address: null,
    latitude: null,
    longitude: null,
    remarks,
    created_at: nowISO(),
  };
  auditLogs.push(item);
  return item;
}

function currentLedger(beneficiaryId, programId, productType, dateString) {
  const d = new Date(dateString);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  return quotaLedger.find(q => q.beneficiary_id === beneficiaryId && q.program_id === programId && q.product_type === productType && q.period_year === year && q.period_month === month);
}

// ------------------------------------------------------------
// Service-layer logic
// ------------------------------------------------------------
function validateBeneficiaryCreate(payload) {
  const required = ['beneficiary_code', 'full_name', 'office_id', 'program_id'];
  const missing = required.filter(k => !payload[k]);
  if (missing.length) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Missing required fields', details: missing };
  }
  if (beneficiaries.some(b => b.beneficiary_code === payload.beneficiary_code)) {
    return { ok: false, code: 'BENEFICIARY_EXISTS', message: 'Beneficiary code already exists' };
  }
  return { ok: true };
}

function createBeneficiary(payload, actor) {
  const check = validateBeneficiaryCreate(payload);
  if (!check.ok) return check;

  const item = {
    id: nextId(beneficiaries),
    beneficiary_code: payload.beneficiary_code,
    full_name: payload.full_name,
    father_or_spouse_name: payload.father_or_spouse_name || null,
    nid_no: payload.nid_no || null,
    mobile_no: payload.mobile_no || null,
    gender: payload.gender || null,
    date_of_birth: payload.date_of_birth || null,
    age: payload.age || null,
    address_line: payload.address_line || null,
    division_name: payload.division_name || null,
    district_name: payload.district_name || null,
    upazila_name: payload.upazila_name || null,
    office_id: payload.office_id,
    program_id: payload.program_id,
    eligibility_status: 'eligible',
    enrollment_status: 'draft',
    created_by: actor?.id || null,
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  beneficiaries.push(item);
  writeAudit({
    userId: actor?.id,
    roleName: actor?.role,
    officeId: actor?.office_id,
    entityType: 'beneficiary',
    entityId: item.id,
    actionType: 'create',
    resultStatus: 'success',
    remarks: `Beneficiary ${item.beneficiary_code} created`
  });
  return { ok: true, data: item };
}

function findBeneficiaryByCodeOrSearch(query) {
  const q = (query || '').toLowerCase().trim();
  return beneficiaries.filter(b =>
    (b.beneficiary_code || '').toLowerCase().includes(q) ||
    (b.full_name || '').toLowerCase().includes(q) ||
    (b.mobile_no || '').toLowerCase().includes(q) ||
    (b.nid_no || '').toLowerCase().includes(q)
  );
}

function getBeneficiarySnapshot(beneficiaryCode, dateString = '2026-03-20') {
  const b = beneficiaries.find(x => x.beneficiary_code === beneficiaryCode);
  if (!b) return null;
  const program = programs.find(p => p.id === b.program_id);
  const productType = program?.product_type || 'rice';
  const ledger = currentLedger(b.id, b.program_id, productType, dateString);
  const alreadyLiftedToday = distributionTransactions.some(tx => tx.beneficiary_id === b.id && tx.transaction_date === dateString && tx.duplicate_check_status === 'pass');
  return {
    beneficiary_id: b.id,
    beneficiary_code: b.beneficiary_code,
    full_name: b.full_name,
    eligibility_status: b.eligibility_status,
    enrollment_status: b.enrollment_status,
    program: program ? { id: program.id, name: program.program_name, product_type: program.product_type } : null,
    quota: ledger ? {
      period: `${ledger.period_year}-${String(ledger.period_month).padStart(2, '0')}`,
      allocated_quantity_kg: ledger.allocated_quantity_kg,
      consumed_quantity_kg: ledger.consumed_quantity_kg,
      remaining_quantity_kg: ledger.remaining_quantity_kg,
    } : null,
    already_lifted_today: alreadyLiftedToday,
  };
}

function checkEligibility(payload) {
  const { beneficiary_id, program_id, product_type, requested_quantity_kg, transaction_date } = payload;
  const beneficiary = beneficiaries.find(b => b.id === beneficiary_id);
  if (!beneficiary) {
    return { ok: false, code: 'BENEFICIARY_NOT_FOUND', message: 'Beneficiary not found' };
  }
  if (beneficiary.eligibility_status !== 'eligible') {
    return {
      ok: true,
      data: {
        eligible: false,
        already_lifted_today: false,
        remaining_quantity_kg: 0,
        rule_messages: ['Beneficiary is not eligible']
      }
    };
  }

  const dailyRule = quotaRules.find(q => q.program_id === program_id && q.product_type === product_type && q.is_active);
  const alreadyLiftedToday = distributionTransactions.some(tx =>
    tx.beneficiary_id === beneficiary_id &&
    tx.program_id === program_id &&
    tx.product_type === product_type &&
    tx.transaction_date === transaction_date &&
    tx.duplicate_check_status === 'pass'
  );
  if (alreadyLiftedToday) {
    return {
      ok: true,
      data: {
        eligible: false,
        already_lifted_today: true,
        remaining_quantity_kg: 0,
        rule_messages: ['Beneficiary already received allocation today']
      }
    };
  }

  const ledger = currentLedger(beneficiary_id, program_id, product_type, transaction_date);
  if (!ledger) {
    return {
      ok: true,
      data: {
        eligible: false,
        already_lifted_today: false,
        remaining_quantity_kg: 0,
        rule_messages: ['Quota ledger not initialized for this period']
      }
    };
  }

  if (ledger.remaining_quantity_kg < Number(requested_quantity_kg)) {
    return {
      ok: true,
      data: {
        eligible: false,
        already_lifted_today: false,
        remaining_quantity_kg: ledger.remaining_quantity_kg,
        rule_messages: ['Insufficient remaining quota for requested quantity']
      }
    };
  }

  return {
    ok: true,
    data: {
      eligible: true,
      already_lifted_today: false,
      remaining_quantity_kg: ledger.remaining_quantity_kg,
      rule_messages: dailyRule ? [] : ['No explicit quota rule found; using ledger state']
    }
  };
}

function faceVerify(payload, actor) {
  const required = ['event_id', 'beneficiary_id', 'dealer_id', 'device_id', 'captured_image_base64'];
  const missing = required.filter(k => !payload[k]);
  if (missing.length) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Missing required fields', details: missing };
  }
  if (verificationEvents.some(v => v.event_id === payload.event_id)) {
    const existing = verificationEvents.find(v => v.event_id === payload.event_id);
    return { ok: true, data: existing, idempotent: true };
  }

  // Demo logic:
  // - beneficiary 1 => matched
  // - beneficiary 2 => failed (quota exhausted anyway)
  // - beneficiary 3 => review/exception
  let result_status = 'matched';
  let confidence_score = 0.977;
  let review_required = false;
  let reason_code = null;

  if (payload.beneficiary_id === 2) {
    result_status = 'failed';
    confidence_score = 0.421;
    review_required = true;
    reason_code = 'FACE_MISMATCH';
  } else if (payload.beneficiary_id === 3) {
    result_status = 'retry';
    confidence_score = 0.681;
    review_required = true;
    reason_code = 'LOW_LIGHT';
  }

  const item = {
    id: nextId(verificationEvents),
    event_id: payload.event_id,
    beneficiary_id: payload.beneficiary_id,
    dealer_id: payload.dealer_id,
    device_id: payload.device_id,
    biometric_type: 'face',
    result_status,
    confidence_score,
    captured_image_url: 'demo://captured-image',
    reason_code,
    review_required,
    created_at: nowISO(),
  };
  verificationEvents.push(item);
  writeAudit({
    userId: actor?.id,
    roleName: actor?.role,
    officeId: actor?.office_id,
    entityType: 'verification_event',
    entityId: item.id,
    actionType: 'verify',
    resultStatus: result_status === 'matched' ? 'success' : result_status,
    deviceId: payload.device_id,
    remarks: `Face verification result: ${result_status}`
  });
  return { ok: true, data: item };
}

function createDistribution(payload, actor) {
  const required = ['event_id', 'beneficiary_id', 'dealer_id', 'office_id', 'program_id', 'product_type', 'quantity_kg', 'verification_status', 'source_mode', 'device_id', 'transaction_time'];
  const missing = required.filter(k => payload[k] === undefined || payload[k] === null || payload[k] === '');
  if (missing.length) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Missing required fields', details: missing };
  }
  if (distributionTransactions.some(tx => tx.event_id === payload.event_id)) {
    const existing = distributionTransactions.find(tx => tx.event_id === payload.event_id);
    return { ok: true, data: existing, idempotent: true };
  }

  const transactionDate = (payload.transaction_date || payload.transaction_time || '').slice(0, 10);
  const eligibility = checkEligibility({
    beneficiary_id: payload.beneficiary_id,
    program_id: payload.program_id,
    product_type: payload.product_type,
    requested_quantity_kg: payload.quantity_kg,
    transaction_date: transactionDate,
  });
  if (!eligibility.ok) return eligibility;

  if (!eligibility.data.eligible) {
    writeAudit({
      userId: actor?.id,
      roleName: actor?.role,
      officeId: actor?.office_id,
      entityType: 'distribution_transaction',
      entityId: null,
      actionType: 'block',
      resultStatus: 'blocked',
      deviceId: payload.device_id,
      remarks: eligibility.data.rule_messages.join('; '),
    });
    return {
      ok: false,
      code: 'ELIGIBILITY_BLOCKED',
      message: 'Distribution blocked by business rules',
      details: eligibility.data,
    };
  }

  const verificationAllowed = ['matched', 'exception'];
  if (!verificationAllowed.includes(payload.verification_status)) {
    return {
      ok: false,
      code: 'VERIFICATION_REQUIRED',
      message: 'Distribution requires matched or controlled exception verification status',
    };
  }

  const program = programs.find(p => p.id === payload.program_id);
  const unitPrice = program?.price_per_kg || 0;
  const quantity = Number(payload.quantity_kg);
  const ledger = currentLedger(payload.beneficiary_id, payload.program_id, payload.product_type, transactionDate);

  const item = {
    id: nextId(distributionTransactions),
    transaction_code: createCode('TXN'),
    event_id: payload.event_id,
    beneficiary_id: payload.beneficiary_id,
    dealer_id: payload.dealer_id,
    office_id: payload.office_id,
    program_id: payload.program_id,
    product_type: payload.product_type,
    quantity_kg: quantity,
    unit_price: unitPrice,
    total_amount: quantity * unitPrice,
    transaction_date: transactionDate,
    transaction_time: payload.transaction_time,
    verification_status: payload.verification_status,
    quota_check_status: 'pass',
    duplicate_check_status: 'pass',
    source_mode: payload.source_mode,
    device_id: payload.device_id,
    latitude: payload.latitude || null,
    longitude: payload.longitude || null,
    remarks: payload.remarks || null,
    created_by: actor?.id || null,
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  distributionTransactions.push(item);

  if (ledger) {
    ledger.consumed_quantity_kg += quantity;
    ledger.remaining_quantity_kg -= quantity;
    ledger.last_transaction_at = payload.transaction_time;
  }

  writeAudit({
    userId: actor?.id,
    roleName: actor?.role,
    officeId: payload.office_id,
    entityType: 'distribution_transaction',
    entityId: item.id,
    actionType: 'distribute',
    resultStatus: 'success',
    deviceId: payload.device_id,
    remarks: `Distributed ${quantity} kg ${payload.product_type}`,
  });

  return { ok: true, data: item };
}

function pushSyncEvents(payload, actor) {
  if (!payload.device_id || !payload.dealer_id || !Array.isArray(payload.events)) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'device_id, dealer_id, and events are required' };
  }

  const results = [];

  for (const event of payload.events) {
    const existing = syncEvents.find(s => s.event_id === event.event_id);
    if (existing && existing.sync_status === 'acknowledged') {
      results.push({ event_id: event.event_id, sync_status: 'acknowledged', entity_id: existing.entity_id || null, conflict_reason: null });
      continue;
    }

    let syncRecord = existing;
    if (!syncRecord) {
      syncRecord = {
        id: nextId(syncEvents),
        event_id: event.event_id,
        entity_type: event.entity_type,
        entity_id: null,
        device_id: payload.device_id,
        dealer_id: payload.dealer_id,
        sync_status: 'queued',
        retry_count: 0,
        last_attempt_at: null,
        acknowledged_at: null,
        conflict_reason: null,
        payload_hash: event.payload_hash || null,
        created_at: nowISO(),
        updated_at: nowISO(),
      };
      syncEvents.push(syncRecord);
    }

    syncRecord.sync_status = 'sent';
    syncRecord.last_attempt_at = nowISO();
    syncRecord.retry_count += 1;

    let result;
    try {
      if (event.entity_type === 'beneficiary') {
        const created = createBeneficiary(event.payload, actor);
        if (!created.ok) throw created;
        syncRecord.entity_id = created.data.id;
      } else if (event.entity_type === 'verification') {
        const verified = faceVerify(event.payload, actor);
        if (!verified.ok) throw verified;
        syncRecord.entity_id = verified.data.id;
      } else if (event.entity_type === 'distribution') {
        const created = createDistribution(event.payload, actor);
        if (!created.ok) throw created;
        syncRecord.entity_id = created.data.id;
      } else {
        throw { ok: false, code: 'UNKNOWN_ENTITY_TYPE', message: `Unsupported entity_type: ${event.entity_type}` };
      }

      syncRecord.sync_status = 'acknowledged';
      syncRecord.acknowledged_at = nowISO();
      syncRecord.conflict_reason = null;
      result = { event_id: event.event_id, sync_status: 'acknowledged', entity_id: syncRecord.entity_id, conflict_reason: null };
    } catch (err) {
      const conflictCode = err?.code || 'SYNC_FAILED';
      syncRecord.sync_status = conflictCode === 'ELIGIBILITY_BLOCKED' ? 'conflicted' : 'failed';
      syncRecord.conflict_reason = err?.message || 'Unknown sync error';
      result = { event_id: event.event_id, sync_status: syncRecord.sync_status, entity_id: null, conflict_reason: syncRecord.conflict_reason };
    }

    writeAudit({
      userId: actor?.id,
      roleName: actor?.role,
      officeId: actor?.office_id,
      entityType: 'sync_event',
      entityId: syncRecord.id,
      actionType: 'sync',
      resultStatus: syncRecord.sync_status,
      deviceId: payload.device_id,
      remarks: `Sync processed for ${event.entity_type}`,
    });

    results.push(result);
  }

  return { ok: true, data: { results } };
}

function dashboardSummary() {
  const today = '2026-03-20';
  const todayTransactions = distributionTransactions.filter(tx => tx.transaction_date === today).length;
  const verifiedBeneficiaries = distributionTransactions.filter(tx => tx.verification_status === 'matched').length;
  const riskEvents = auditLogs.filter(a => ['blocked', 'conflicted', 'failed', 'retry', 'exception'].includes(a.result_status)).length;
  const totalSync = syncEvents.length || 1;
  const ackSync = syncEvents.filter(s => s.sync_status === 'acknowledged').length;
  const syncSuccessRate = Number(((ackSync / totalSync) * 100).toFixed(1));
  return {
    today_transactions: todayTransactions,
    verified_beneficiaries: verifiedBeneficiaries,
    risk_events: riskEvents,
    sync_success_rate: syncSuccessRate,
  };
}

function recentAuditFeed(limit = 20, filters = {}) {
  let items = [...auditLogs];
  if (filters.entity_type) items = items.filter(x => x.entity_type === filters.entity_type);
  if (filters.user_id) items = items.filter(x => x.user_id === Number(filters.user_id));
  if (filters.office_id) items = items.filter(x => x.office_id === Number(filters.office_id));
  if (filters.from) items = items.filter(x => x.created_at.slice(0, 10) >= filters.from);
  if (filters.to) items = items.filter(x => x.created_at.slice(0, 10) <= filters.to);
  items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return items.slice(0, limit);
}

// ------------------------------------------------------------
// Router
// ------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const { pathname, searchParams } = url;
    const method = req.method.toUpperCase();

    // Health check
    if (method === 'GET' && pathname === '/health') {
      return send(res, 200, { status: 'ok', service: 'oms-control-platform-demo', time: nowISO() });
    }

    // Login
    if (method === 'POST' && pathname === '/api/v1/auth/login') {
      const body = await parseBody(req);
      const user = users.find(u => u.username === body.username && u.password === body.password && u.status === 'active');
      if (!user) {
        writeAudit({ actionType: 'login', resultStatus: 'failure', remarks: `Failed login for ${body.username || 'unknown'}` });
        return sendError(res, 401, 'AUTH_FAILED', 'Invalid credentials');
      }
      const token = tokenFor(user);
      const refreshToken = tokenFor(user);
      sessions.set(token, user.id);
      writeAudit({ userId: user.id, roleName: user.role, officeId: user.office_id, entityType: 'user', entityId: user.id, actionType: 'login', resultStatus: 'success', deviceId: body.device_id || null, remarks: 'User login successful' });
      return send(res, 200, {
        access_token: token,
        refresh_token: refreshToken,
        user: {
          user_id: user.id,
          name: user.full_name,
          role: user.role,
          office_id: user.office_id,
          dealer_id: user.dealer_id,
        }
      });
    }

    // Auth-required routes from here
    if (pathname.startsWith('/api/v1/')) {
      const currentUser = getCurrentUser(req);
      if (!currentUser && pathname !== '/api/v1/auth/login') {
        return sendError(res, 401, 'UNAUTHORIZED', 'Missing or invalid bearer token');
      }

      if (method === 'GET' && pathname === '/api/v1/dealers/me') {
        const dealer = dealers.find(d => d.id === currentUser.dealer_id);
        if (!dealer) return sendError(res, 404, 'DEALER_NOT_FOUND', 'Dealer context not found');
        const office = offices.find(o => o.id === dealer.office_id);
        const activePrograms = dealerProgramAssignmentsForDealer(dealer.id).map(a => {
          const p = programs.find(x => x.id === a.program_id);
          return { program_id: p.id, program_name: p.program_name, product_type: p.product_type };
        });
        return send(res, 200, {
          dealer_id: dealer.id,
          dealer_code: dealer.dealer_code,
          dealer_name: dealer.dealer_name,
          office: office ? { office_id: office.id, office_name: office.office_name } : null,
          active_programs: activePrograms,
        });
      }

      if (method === 'POST' && pathname === '/api/v1/beneficiaries') {
        const body = await parseBody(req);
        const created = createBeneficiary(body, currentUser);
        if (!created.ok) return sendError(res, 400, created.code, created.message, created.details || null);
        return send(res, 201, {
          beneficiary_id: created.data.id,
          beneficiary_code: created.data.beneficiary_code,
          full_name: created.data.full_name,
          eligibility_status: created.data.eligibility_status,
          enrollment_status: created.data.enrollment_status,
        });
      }

      if (method === 'GET' && pathname.startsWith('/api/v1/beneficiaries/search')) {
        const q = searchParams.get('q') || '';
        const items = findBeneficiaryByCodeOrSearch(q).map(b => ({
          beneficiary_id: b.id,
          beneficiary_code: b.beneficiary_code,
          full_name: b.full_name,
          mobile_no: b.mobile_no,
          eligibility_status: b.eligibility_status,
        }));
        return send(res, 200, { items, count: items.length });
      }

      if (method === 'GET' && pathname.startsWith('/api/v1/beneficiaries/')) {
        const parts = pathname.split('/');
        const beneficiaryCode = parts[parts.length - 1];
        const snapshot = getBeneficiarySnapshot(beneficiaryCode);
        if (!snapshot) return sendError(res, 404, 'BENEFICIARY_NOT_FOUND', 'Beneficiary not found');
        return send(res, 200, snapshot);
      }

      if (method === 'POST' && pathname === '/api/v1/distributions/check-eligibility') {
        const body = await parseBody(req);
        const checked = checkEligibility(body);
        if (!checked.ok) return sendError(res, 404, checked.code, checked.message, checked.details || null);
        return send(res, 200, checked.data);
      }

      if (method === 'POST' && pathname === '/api/v1/verifications/face') {
        const body = await parseBody(req);
        const verified = faceVerify(body, currentUser);
        if (!verified.ok) return sendError(res, 400, verified.code, verified.message, verified.details || null);
        return send(res, 200, {
          verification_event_id: verified.data.id,
          result_status: verified.data.result_status,
          confidence_score: verified.data.confidence_score,
          review_required: verified.data.review_required,
          idempotent: !!verified.idempotent,
        });
      }

      if (method === 'POST' && pathname === '/api/v1/distributions') {
        const body = await parseBody(req);
        const created = createDistribution(body, currentUser);
        if (!created.ok) return sendError(res, 409, created.code, created.message, created.details || null);
        return send(res, 201, {
          transaction_id: created.data.id,
          transaction_code: created.data.transaction_code,
          quota_check_status: created.data.quota_check_status,
          duplicate_check_status: created.data.duplicate_check_status,
          status: 'accepted',
          idempotent: !!created.idempotent,
        });
      }

      if (method === 'POST' && pathname === '/api/v1/sync/events') {
        const body = await parseBody(req);
        const pushed = pushSyncEvents(body, currentUser);
        if (!pushed.ok) return sendError(res, 400, pushed.code, pushed.message, pushed.details || null);
        return send(res, 200, pushed.data);
      }

      if (method === 'GET' && pathname === '/api/v1/dashboard/summary') {
        return send(res, 200, dashboardSummary());
      }

      if (method === 'GET' && pathname === '/api/v1/audit/logs') {
        const filters = {
          entity_type: searchParams.get('entity_type') || null,
          user_id: searchParams.get('user_id') || null,
          office_id: searchParams.get('office_id') || null,
          from: searchParams.get('from') || null,
          to: searchParams.get('to') || null,
        };
        return send(res, 200, { items: recentAuditFeed(50, filters) });
      }
    }

    return sendError(res, 404, 'NOT_FOUND', 'Route not found');
  } catch (err) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message || 'Unknown server error');
  }
});

function dealerProgramAssignmentsForDealer(dealerId) {
  return [
    { dealer_id: 1, program_id: 1, office_id: 2, effective_from: '2026-01-01', is_active: true }
  ].filter(x => x.dealer_id === dealerId && x.is_active);
}

server.listen(PORT, () => {
  console.log(`OMS backend demo running at http://localhost:${PORT}`);
  console.log('Demo login: username=dealer0234 password=demo123');
});
