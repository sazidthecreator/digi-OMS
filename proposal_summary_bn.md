
# প্রস্তাবনার সংক্ষিপ্ত সারসংক্ষেপ (বাংলা)

## জাতীয় OMS Supply Chain & Identity Verification Platform

খাদ্য অধিদপ্তরের জন্য প্রস্তাবিত এই সমাধানটি কেবল একটি সফটওয়্যার অ্যাপ নয়; এটি একটি **জাতীয় OMS কন্ট্রোল প্ল্যাটফর্ম**। এর লক্ষ্য হলো সঠিক সুবিধাভোগীকে সঠিক পরিমাণ খাদ্যশস্য পৌঁছে দেওয়া, একই দিনে একাধিক উত্তোলন বন্ধ করা, মাসিক কোটা নিয়ন্ত্রণ করা, দুর্বল ইন্টারনেটেও ফিল্ড অপারেশন চালু রাখা, এবং কেন্দ্রীয়ভাবে স্বচ্ছ, অডিটযোগ্য ও ডেটা-চালিত নজরদারি নিশ্চিত করা।

বর্তমান চাহিদাপত্রে বায়োমেট্রিক যাচাইকরণ বিষয়ে দুই ধরনের সংকেত পাওয়া যায়—শিরোনামে **fingerprint** এবং স্কোপে **face authentication**। এই প্রেক্ষিতে আমাদের সুপারিশ হলো একটি **biometric verification layer** তৈরি করা, যাতে ফিল্ড-অপারেশনের জন্য face-first পদ্ধতি ব্যবহার করা যায়, তবে ভবিষ্যতে নীতিগত সিদ্ধান্ত অনুযায়ী fingerprint বা multi-modal verification যুক্ত করা সম্ভব থাকে।

প্রস্তাবিত সমাধান চারটি ভিত্তির উপর দাঁড়ানো:

1. **Identity Assurance** — প্রতিটি বিতরণে সুবিধাভোগীর পরিচয় যাচাই
2. **Leakage Control** — duplicate lifting ও quota misuse প্রতিরোধ
3. **Offline-First Continuity** — লোকাল ডেটা ও conditional sync সহ ফিল্ড অপারেশন
4. **Governance & Intelligence** — ড্যাশবোর্ড, অডিট, anomaly detection, demand forecasting

## প্রস্তাবিত সিস্টেমের প্রধান অংশ

### 1) Dealer Android App
- সুবিধাভোগী নিবন্ধন
- ফেস ভেরিফিকেশন
- চাল/আটা বিতরণ
- অফলাইনে লোকাল সেভ
- নেটওয়ার্ক এলে সিঙ্ক

### 2) Central Web Control Tower
- ডিলার ও অফিস মনিটরিং
- OMS program / office setup
- অডিট রিপোর্ট
- exception review
- region-wise demand visibility

### 3) Biometric Verification Layer
- live face capture
- enrolled profile-এর সাথে 1:1 verification
- match / retry / exception decision
- future fingerprint readiness

### 4) Audit & Analytics Layer
- transaction audit trail
- duplicate / exception alert
- dealer risk signal
- demand trend ও policy insight

## কেন এই পদ্ধতি কার্যকর

- এটি **Bangladesh field reality** মাথায় রেখে ডিজাইন করা — low bandwidth, intermittent connectivity, common Android devices
- এটি **same-day duplicate lifting** এবং **monthly quota control**-কে কেন্দ্রীয় ফিচার হিসেবে ধরে
- এটি **central oversight** নিশ্চিত করে — কোন ডিলার কী করল, কখন করল, কোন beneficiary-কে কত দিল, তা audit trail-এ পাওয়া যাবে
- এটি ধাপে ধাপে বাস্তবায়নযোগ্য — MVP → Pilot → National Rollout
- এটি long-term government ownership নিশ্চিত করে — source code handover, API docs, user manual, developer manual, training

## বাস্তবায়ন ধাপ

### Phase 1 — MVP
- dealer login
- beneficiary registration
- face verification
- food distribution
- duplicate prevention
- offline sync
- dashboard
- audit log

### Phase 2 — Pilot
- field validation
- biometric tuning
- sync conflict handling
- training feedback
- dashboard refinement

### Phase 3 — National Rollout
- wider coverage
- stronger analytics
- integration hardening
- documentation & handover

## চূড়ান্ত বার্তা

এই প্রস্তাবনার মূল প্রতিশ্রুতি হলো:

**সঠিক সুবিধাভোগী, সঠিক কোটা, সঠিক প্রমাণ, এবং সঠিক নজরদারি।**
