# OMS (Open Market Sales) National Control Platform
## Developer Manual & User Guides (Bilingual)

**Document Version:** 1.0  
**Date:** March 20, 2026  
**Prepared for:** Ministry of Food, Government of Bangladesh  
**Prepared by:** Manus AI Documentation Team  

---

## Part 1: Developer Manual

### 1.1 Development Environment Setup

**Prerequisites:**

Before setting up the development environment, ensure you have the following installed:

- Git (version 2.30+)
- Node.js (version 18+)
- npm or pnpm (version 8+)
- Docker (version 24+)
- PostgreSQL (version 15+)
- Redis (version 7+)

**Clone the Repository:**

```bash
git clone https://github.com/dgfood/oms-platform.git
cd oms-platform
```

**Install Dependencies:**

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install

# Mobile app dependencies (Android Studio required)
cd ../mobile
# Open with Android Studio
```

**Environment Configuration:**

Create a `.env` file in the backend directory:

```
DATABASE_URL=postgresql://user:password@localhost:5432/oms_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key_here
SMS_GATEWAY_API_KEY=your_sms_gateway_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
NODE_ENV=development
PORT=3000
```

**Database Setup:**

```bash
# Create database
createdb oms_db

# Run migrations
npm run migrate

# Seed test data
npm run seed
```

**Start Development Servers:**

```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Redis (if not running as service)
redis-server
```

### 1.2 Project Structure

```
oms-platform/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── dealer.service.ts
│   │   │   ├── beneficiary.service.ts
│   │   │   ├── transaction.service.ts
│   │   │   ├── auth.service.ts
│   │   │   └── analytics.service.ts
│   │   ├── controllers/
│   │   │   ├── dealer.controller.ts
│   │   │   ├── beneficiary.controller.ts
│   │   │   ├── transaction.controller.ts
│   │   │   └── auth.controller.ts
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── dealer.model.ts
│   │   │   ├── beneficiary.model.ts
│   │   │   ├── transaction.model.ts
│   │   │   └── office.model.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   ├── seeds/
│   │   │   └── connection.ts
│   │   └── app.ts
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DealerManagement.tsx
│   │   │   ├── BeneficiaryManagement.tsx
│   │   │   ├── TransactionHistory.tsx
│   │   │   └── Reports.tsx
│   │   ├── components/
│   │   │   ├── Navigation.tsx
│   │   │   ├── Charts.tsx
│   │   │   ├── Forms.tsx
│   │   │   └── Tables.tsx
│   │   ├── services/
│   │   │   ├── api.service.ts
│   │   │   ├── auth.service.ts
│   │   │   └── storage.service.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useFetch.ts
│   │   │   └── useForm.ts
│   │   └── App.tsx
│   ├── public/
│   └── package.json
├── mobile/
│   ├── app/
│   │   ├── src/
│   │   │   ├── activities/
│   │   │   ├── fragments/
│   │   │   ├── services/
│   │   │   ├── database/
│   │   │   └── utils/
│   │   └── build.gradle
│   └── settings.gradle
└── docker-compose.yml
```

### 1.3 API Development Guidelines

**Creating a New Endpoint:**

```typescript
// backend/src/controllers/dealer.controller.ts
import { Request, Response } from 'express';
import { DealerService } from '../services/dealer.service';

export class DealerController {
  private dealerService = new DealerService();

  async createDealer(req: Request, res: Response) {
    try {
      const { dealer_name, registration_number, phone_number, address, office_id } = req.body;
      
      // Validate input
      if (!dealer_name || !registration_number || !phone_number) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create dealer
      const dealer = await this.dealerService.createDealer({
        dealer_name,
        registration_number,
        phone_number,
        address,
        office_id,
        created_by: req.user.user_id,
      });

      // Log action
      await this.auditLog('CREATE_DEALER', 'dealers', dealer.dealer_id, null, dealer);

      res.status(201).json(dealer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDealerById(req: Request, res: Response) {
    try {
      const { dealer_id } = req.params;
      const dealer = await this.dealerService.getDealerById(dealer_id);

      if (!dealer) {
        return res.status(404).json({ error: 'Dealer not found' });
      }

      res.status(200).json(dealer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

**Service Layer Implementation:**

```typescript
// backend/src/services/dealer.service.ts
import { Database } from '../database/connection';

export class DealerService {
  private db = new Database();

  async createDealer(dealerData: any) {
    const query = `
      INSERT INTO dealers (
        dealer_name, registration_number, phone_number, address,
        office_id, status, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW())
      RETURNING *;
    `;

    const values = [
      dealerData.dealer_name,
      dealerData.registration_number,
      dealerData.phone_number,
      dealerData.address,
      dealerData.office_id,
      dealerData.created_by,
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getDealerById(dealerId: string) {
    const query = 'SELECT * FROM dealers WHERE dealer_id = $1;';
    const result = await this.db.query(query, [dealerId]);
    return result.rows[0];
  }

  async approveDeal(dealerId: string, approvedBy: string) {
    const query = `
      UPDATE dealers
      SET status = 'approved', approval_date = NOW(), approval_by = $2
      WHERE dealer_id = $1
      RETURNING *;
    `;

    const result = await this.db.query(query, [dealerId, approvedBy]);
    return result.rows[0];
  }
}
```

### 1.4 Testing Guidelines

**Unit Tests:**

```typescript
// backend/tests/unit/dealer.service.test.ts
import { DealerService } from '../../src/services/dealer.service';

describe('DealerService', () => {
  let dealerService: DealerService;

  beforeEach(() => {
    dealerService = new DealerService();
  });

  test('should create a new dealer', async () => {
    const dealerData = {
      dealer_name: 'Test Dealer',
      registration_number: 'BRN-2024-001',
      phone_number: '+8801700000001',
      address: 'Test Address',
      office_id: 'office-123',
      created_by: 'user-123',
    };

    const result = await dealerService.createDealer(dealerData);

    expect(result).toBeDefined();
    expect(result.dealer_name).toBe('Test Dealer');
    expect(result.status).toBe('pending');
  });

  test('should retrieve dealer by ID', async () => {
    const dealerId = 'dealer-123';
    const result = await dealerService.getDealerById(dealerId);

    expect(result).toBeDefined();
    expect(result.dealer_id).toBe(dealerId);
  });
});
```

**Integration Tests:**

```typescript
// backend/tests/integration/dealer.api.test.ts
import request from 'supertest';
import { app } from '../../src/app';

describe('Dealer API', () => {
  test('POST /api/v1/dealers should create a dealer', async () => {
    const response = await request(app)
      .post('/api/v1/dealers')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        dealer_name: 'Test Dealer',
        registration_number: 'BRN-2024-001',
        phone_number: '+8801700000001',
        address: 'Test Address',
        office_id: 'office-123',
      });

    expect(response.status).toBe(201);
    expect(response.body.dealer_name).toBe('Test Dealer');
  });

  test('GET /api/v1/dealers/:id should retrieve dealer', async () => {
    const response = await request(app)
      .get('/api/v1/dealers/dealer-123')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body.dealer_id).toBe('dealer-123');
  });
});
```

### 1.5 Deployment

**Build for Production:**

```bash
# Backend
cd backend
npm run build

# Frontend
cd ../frontend
npm run build

# Docker build
docker build -t oms-platform:latest .
```

**Deploy to Kubernetes:**

```bash
# Create namespace
kubectl create namespace oms

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml -n oms

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml -n oms

# Deploy database
kubectl apply -f k8s/database-statefulset.yaml -n oms

# Check deployment status
kubectl get pods -n oms
```

---

## Part 2: System Administrator Manual (বাংলায়)

### ২.১ সিস্টেম ইনস্টলেশন

**প্রয়োজনীয় সফটওয়্যার:**
- Windows Server 2019 বা Linux (Ubuntu 20.04+)
- PostgreSQL ডাটাবেস সার্ভার
- Redis ক্যাশ সার্ভার
- Docker কন্টেইনার প্ল্যাটফর্ম

**ইনস্টলেশন ধাপ:**

১. সার্ভারে Docker ইনস্টল করুন
২. OMS প্ল্যাটফর্ম রিপোজিটরি ক্লোন করুন
३. `docker-compose.yml` ফাইল কনফিগার করুন
४. `docker-compose up -d` কমান্ড চালান
५. ওয়েব ব্রাউজারে `http://localhost:3000` খুলুন

### २.२ ব্যবহারকারী ব্যবস্থাপনা

**নতুন ব্যবহারকারী তৈরি করা:**

१. ওয়েব অ্যাপ্লিকেশনে লগইন করুন
२. "ব্যবহারকারী ব্যবস্থাপনা" মেনু খুলুন
३. "নতুন ব্যবহারকারী" বোতাম ক্লিক করুন
४. ব্যবহারকারীর তথ্য পূরণ করুন:
   - ব্যবহারকারীর নাম
   - ইমেইল ঠিকানা
   - পূর্ণ নাম
   - অফিস নির্বাচন করুন
   - ভূমিকা নির্বাচন করুন (সুপার ইউজার, পরিদর্শক, দোকানদার)
५. "সংরক্ষণ" বোতাম ক্লিক করুন

---

## Part 3: Dealer User Manual (বাংলায়)

### ३.१ মোবাইল অ্যাপ ইনস্টলেশন

**প্রয়োজনীয় জিনিস:**
- Android ফোন (সংস্করণ ৮.০+)
- ইন্টারনেট সংযোগ (প্রাথমিক ডাউনলোডের জন্য)

**ইনস্টলেশন ধাপ:**

१. Google Play Store খুলুন
२. "OMS Distribution" অনুসন্ধান করুন
३. "ইনস্টল" বোতাম ক্লিক করুন
४. অ্যাপ্লিকেশন খুলুন

### ३.२ লগইন করা

१. অ্যাপ খুলুন
२. আপনার ব্যবসায়িক নিবন্ধন নম্বর প্রবেশ করুন
३. আপনার পাসওয়ার্ড প্রবেশ করুন
४. "লগইন" বোতাম ক্লিক করুন

### ३.३ উপকারভোগী নিবন্ধন

१. হোম স্ক্রীনে "নতুন উপকারভোগী" বোতাম ক্লিক করুন
२. উপকারভোগীর জাতীয় পরিচয়পত্র নম্বর প্রবেশ করুন
३. উপকারভোগীর নাম প্রবেশ করুন
४. ফোন নম্বর প্রবেশ করুন (ঐচ্ছিক)
५. ঠিকানা প্রবেশ করুন
६. বিভাগ নির্বাচন করুন (বিধবা, বয়স্ক, প্রতিবন্ধী, দরিদ্র পরিবার)
७. ক্যামেরা আইকন ক্লিক করে উপকারভোগীর ছবি তুলুন
८. "নিবন্ধন সম্পন্ন" বোতাম ক্লিক করুন

### ३.४ খাদ্য বিতরণ রেকর্ড করা

१. হোম স্ক্রীনে "খাদ্য বিতরণ" বোতাম ক্লিক করুন
२. উপকারভোগীর জাতীয় পরিচয়পত্র নম্বর অনুসন্ধান করুন বা ফোন নম্বর প্রবেশ করুন
३. উপকারভোগীর তালিকা থেকে সঠিক ব্যক্তি নির্বাচন করুন
४. ক্যামেরা আইকন ক্লিক করে উপকারভোগীর বর্তমান ছবি তুলুন
५. সিস্টেম মুখ যাচাই করবে
६. যদি যাচাই সফল হয়, পরিমাণ প্রবেশ করুন (সাধারণত ২ কেজি)
७. পণ্য নির্বাচন করুন (চাল বা ময়দা)
८. "বিতরণ সম্পন্ন" বোতাম ক্লিক করুন

**সম্ভাব্য সমস্যা এবং সমাধান:**

- **মুখ যাচাই ব্যর্থ:** উপকারভোগীর মুখ স্পষ্টভাবে দৃশ্যমান নিশ্চিত করুন এবং আবার চেষ্টা করুন
- **ডুপ্লিকেট সনাক্ত:** উপকারভোগী ইতিমধ্যে আজ খাদ্য পেয়েছেন। তত্ত্বাবধায়কের অনুমোদন প্রয়োজন
- **কোটা অতিক্রম:** উপকারভোগী তাদের মাসিক সীমা অতিক্রম করতে পারবেন না। পরিমাণ হ্রাস করুন

---

## Part 4: Beneficiary User Guide (বাংলায়)

### ४.१ খাদ্য সংগ্রহ করা

१. আপনার নিকটতম OMS দোকানে যান
२. দোকানদারকে আপনার জাতীয় পরিচয়পত্র বা ফোন নম্বর দিন
३. দোকানদার আপনার তথ্য সিস্টেমে খুঁজে বের করবেন
४. দোকানদার আপনার ছবি তুলবেন এবং সিস্টেম যাচাই করবে
५. যাচাই সফল হলে, আপনি আপনার খাদ্য পাবেন

**গুরুত্বপূর্ণ নোট:**
- প্রতিদিন সর্বোচ্চ ২ কেজি খাদ্য পান
- প্রতি মাসে সর্বোচ্চ ৪০ কেজি খাদ্য পান
- একই দিনে একাধিক দোকান থেকে খাদ্য পেতে পারবেন না
- আপনার জাতীয় পরিচয়পত্র সবসময় নিয়ে আসুন

---

## Part 5: Inspector Manual (বাংলায়)

### ५.१ বিক্রয় কার্যকলাপ পর্যবেক্ষণ

१. ওয়েব অ্যাপ্লিকেশনে লগইন করুন
२. "পর্যবেক্ষণ" ট্যাব খুলুন
३. আজকের বিক্রয় সারসংক্ষেপ দেখুন:
   - মোট লেনদেন সংখ্যা
   - মোট পরিমাণ বিতরণ করা হয়েছে
   - অনন্য উপকারভোগী সংখ্যা
   - ডুপ্লিকেট চেষ্টা ব্লক করা হয়েছে
   - কোটা লঙ্ঘন প্রতিরোধ করা হয়েছে

### ५.२ শারীরিক পরিদর্শন পরিচালনা

१. "পরিদর্শন" মেনু খুলুন
२. "নতুন পরিদর্শন" বোতাম ক্লিক করুন
३. দোকানদার নির্বাচন করুন
४. পরিদর্শনের তারিখ এবং সময় নির্ধারণ করুন
५. পরিদর্শন সম্পন্ন করার পরে, "পরিদর্শন প্রতিবেদন" বোতাম ক্লিক করুন
६. পরিদর্শনের ফলাফল পূরণ করুন:
   - মজুদ যাচাইকরণ
   - উপকারভোগী সাক্ষাৎকার
   - পর্যবেক্ষণ এবং মন্তব্য
   - সুপারিশ
७. "প্রতিবেদন জমা দিন" বোতাম ক্লিক করুন

---

## Part 6: Troubleshooting Guide

### ६.१ সাধারণ সমস্যা এবং সমাধান

**সমস্যা: মোবাইল অ্যাপ সংযোগ করতে পারে না**

সমাধান:
१. ইন্টারনেট সংযোগ পরীক্ষা করুন
२. অ্যাপ পুনরায় চালু করুন
३. ফোন পুনরায় চালু করুন
४. অ্যাপ আপডেট করুন

**সমস্যা: লেনদেন রেকর্ড হচ্ছে না**

সমাধান:
१. ইন্টারনেট সংযোগ পরীক্ষা করুন
२. সার্ভার স্ট্যাটাস পরীক্ষা করুন
३. অ্যাপ ক্যাশ সাফ করুন
४. অ্যাপ পুনরায় ইনস্টল করুন

**সমস্যা: মুখ যাচাই ব্যর্থ হচ্ছে**

সমাধান:
१. উজ্জ্বল আলোতে ছবি তুলুন
२. উপকারভোগীর মুখ সরাসরি ক্যামেরার দিকে রাখুন
३. চশমা বা মুখোশ সরান
४. আবার চেষ্টা করুন

---

## Part 7: Support & Contact Information

**Technical Support:**
- Email: support@dgfood.gov.bd
- Phone: +88-02-9861858
- Hours: Monday-Friday, 9:00 AM - 5:00 PM

**System Administrator:**
- Email: admin@dgfood.gov.bd
- Phone: +88-02-9861859

**Emergency Support:**
- 24/7 Hotline: +88-02-9861860

---

## Conclusion

This comprehensive manual provides guidance for developers, system administrators, dealers, beneficiaries, and inspectors. For additional support, please contact the technical support team.

