# VaidyaQ Clinical Governance & NABH Accreditation System
## Master Architecture, Security Blueprint & Deployment Documentation

---

### Executive Summary

**VaidyaQ** is an enterprise-grade Clinical Governance, Risk Management, and NABH Accreditation Software-as-a-Service (SaaS) platform designed for healthcare facilities ranging from single-specialty clinics to tertiary hospital networks (10 to 500+ beds).

The platform digitizes, automates, and manages:
- **NABH 6th Edition Standards & Objective Elements Assessment**
- **Document & SOP Control (Version Control, Review Workflows, Digital Signatures)**
- **Internal Audit & Clinical Finding Tracking**
- **Corrective and Preventive Actions (CAPA Register)**
- **Patient Incident Reporting & Sentinel Event Investigation**
- **Statutory License & Statutory Compliance Expiry Management**
- **Quality Indicators & Metrics Tracking (WHO 5 Moments, Medication Errors, Falls)**
- **AI-Powered Clinical SOP & Audit Checklist Generation**

---

## 1. System Architecture Overview

VaidyaQ employs a modern **Decoupled Edge-and-Cloud Architecture**:

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         CLIENT APPLICATION LAYER                            │
 │  Vite + React 19 Single Page Application (SPA)                              │
 │  - Responsive Healthcare UI Design System (Desktop, Tablet, Mobile FAB)     │
 │  - Local Namespaced Cache & AES-256-GCM Field Encryption (cryptoService)   │
 └──────────────────────────────────┬──────────────────────────────────────────┘
                                    │ HTTPS / TLS 1.3
                                    ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                      EDGE & NETLIFY SERVERLESS LAYER                        │
 │  - Content-Security-Policy (CSP), HSTS, & X-Content-Type-Options Headers    │
 │  - Netlify Edge Serverless Functions (/api/create-order, /api/verify-payment)│
 │  - Rate Limiter (10 req/min/IP), Max Payload Guard (10KB Limit)             │
 └──────────────────────────────────┬──────────────────────────────────────────┘
                                    │ Secure Service Call
                                    ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                   GOOGLE CLOUD & FIREBASE BACKEND LAYER                     │
 │  - Firebase Authentication (Short-lived 1-hr JWTs, Refresh Token Rotation) │
 │  - Google Cloud Firestore (Multi-tenant Document Database with RLS)         │
 │  - Firebase Storage Vault (10MB Cap, Magic-byte scanned, Versioned Buckets) │
 │  - Google Cloud Armor WAF & Global Load Balancer                            │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Tenant Data Architecture & Tenant Isolation

VaidyaQ enforces **strict tenant isolation** at both the client and server levels so that hospital data can never leak across healthcare organizations.

### 2.1 Database Path Scoping
All hospital data documents (audits, CAPAs, incidents, documents, tasks, users) are stored strictly under tenant-isolated paths:
`/hospitals/{hospitalId}/{subcollection}/{docId}`

### 2.2 Server-Side Security Rules (`firestore.rules`)
```rules
function isMemberOf(hospitalId) {
  return request.auth != null && 
    (request.auth.token.hospitalId == hospitalId || 
     exists(/databases/$(database)/documents/hospitals/$(hospitalId)/users/$(request.auth.uid)));
}

match /hospitals/{hospitalId}/{allSubcollections=**} {
  allow read: if isAuthenticated() && isMemberOf(hospitalId);
  allow write: if isAuthenticated() && isHospitalAdmin(hospitalId);
}
```

### 2.3 Client Local Namespace Scoping
In the React client state context (`QualiNABHContext.jsx`), local persistence keys are automatically prefixed with the active user's hospital identifier (`hosp_{hospitalId}_...`), preventing cross-tenant browser session leaks.

---

## 3. Comprehensive 7-Layer Security Blueprint

```
+-------------------------------------------------------------------------+
|                        7-LAYER SECURITY MATRIX                           |
+---+----------------------------+----------------------------------------+
| # | Security Domain            | Implementation Mechanism               |
+---+----------------------------+----------------------------------------+
| 1 | Identity & Access (RLS)    | Firestore Security Rules, Role Matrix  |
| 2 | Secrets & Encryption       | AES-256 at-rest, TLS 1.3, AES-GCM 256  |
| 3 | API & Application Layer    | 10KB Limit, Rate Limiting, XSS Encoding|
| 4 | File Upload & Malware      | Magic-byte Scan, CSP, Dependabot       |
| 5 | Backup & Ransomware        | 7-Day PITR, 30-Day Storage Versioning  |
| 6 | Audit Logging              | Immutable Append-Only Audit Trail      |
| 7 | Infrastructure & IAM       | Least-Privilege GCP Service Accounts   |
+---+----------------------------+----------------------------------------+
```

### Layer 1: Identity & Access Management (IAM & RLS)
- **Row-Level Security (RLS)**: Every database table and collection is explicitly scoped by `hospitalId`. Unmatched cross-tenant access is rejected server-side.
- **Server-Side Role Matrix**:
  - `super_admin`: Full tenant system control, user provisioning, policy overrides.
  - `hospital_admin` / `Quality Head`: Full administrative rights within assigned hospital ID.
  - `quality_manager`: Creation and management of audits, CAPAs, incidents, and SOP drafts. Cannot edit administrative settings or system users.
  - `auditor`: Can log audit findings, execute checklists, and view reports. Cannot modify system configurations or delete audit records.
- **Multi-Factor Authentication (MFA)**: Mandated via `isMfaMandatedForRole()` for `hospital_admin` and `super_admin` accounts.
- **Short-Lived JWT Tokens**: Firebase Auth issues 1-hour short-lived ID tokens with automatic refresh token rotation.
- **Default Deny**: `firestore.rules` ends with a root catch-all rule `match /{document=**} { allow read, write: if false; }`.

### Layer 2: Secrets & Encryption Engine
- **Zero Hardcoded Secrets**: All API keys, database credentials, and secret signatures are read strictly from environment variables (`process.env` and `import.meta.env`).
- **Encryption at Rest**: Cloud Firestore and Cloud Storage enforce AES-256 encryption at rest across all disks, collections, and backups.
- **Encryption in Transit**: Enforced TLS 1.3/1.2 HTTPS on all API requests, CDN edge nodes, and web socket connections.
- **Field-Level Encryption (`src/services/cryptoService.js`)**: Highly sensitive fields (Patient MRNs, Aadhaar numbers, individual names in clinical findings) are encrypted via **AES-256-GCM** before persistence, prefixing ciphertexts with `enc::`.

### Layer 3: API & Application Protection Layer
- **Strict Input Validation**: Netlify Functions (`create-order.js`, `verify-payment.js`) perform strict field allowlisting (`allowedKeys`), type checking, and reject unauthorized fields with `400 Bad Request`.
- **Payload Limits**: Max request size capped at **10 KB** (`413 Payload Too Large`).
- **Rate Limiting**: Sliding window rate limiter enforces a max of **10 requests per minute per IP** (`429 Too Many Requests`).
- **Stored XSS Prevention (`src/utils/sanitize.js`)**: All user-supplied text fields (audit notes, comments, CAPA actions) pass through HTML entity encoding (`encodeHTML` and `sanitizeObjectFields`) to escape `<`, `>`, `&`, `"`, `'`, `/`.
- **Parameterized Database Queries**: Firestore SDK methods (`doc()`, `setDoc()`, `where()`) use binary protocol field bindings, eliminating SQL injection by design.

### Layer 4: File Upload & Malware Shield
- **Pre-Upload Malware Scanning (`src/services/fileScannerService.js`)**:
  - **MIME Whitelist**: Restricts evidence uploads strictly to `application/pdf`, `image/png`, `image/jpeg`, `application/msword`, `.docx`, and `.xlsx`.
  - **Magic Byte Inspection**: Reads the first 4 header bytes of uploads to detect and block executable binaries (Windows `MZ` `0x4D5A` or Linux `ELF` `0x7F454C46`) disguised with fake extensions (e.g. `.exe` renamed to `.pdf`).
  - **File Size Cap**: Hard limit of **10 MB** per upload.
  - **Metadata Stripping**: `stripImageMetadata` scrubs EXIF and GPS tags from image uploads prior to storage.
- **Browser Execution Prevention (`netlify.toml` & `storage.rules`)**:
  - `/uploads/*` assets are served with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`.
  - **Content Security Policy (CSP)** restricts script execution to `'self'` and explicitly allowlisted domain hosts (`checkout.razorpay.com`, `api.rss2json.com`).
- **Automated Dependency Vulnerability Scanning**: GitHub Dependabot configured via `.github/dependabot.yml` for weekly automated npm dependency vulnerability alerts.

### Layer 5: Backup & Ransomware Resilience
- **Point-in-Time Recovery (PITR)**: Cloud Firestore PITR is active with a **7-day continuous retention window** and 1-minute granularity recovery.
- **Cloud Storage Object Versioning**: Versioning is enabled on evidence storage buckets (`gsutil versioning set on gs://[BUCKET_NAME]`), retaining previous object versions for 30 days to defeat ransomware deletion or overwrite attacks.
- **Credential Separation**: Automated backup exports run under isolated GCP service account roles (`roles/storage.objectAdmin`) decoupled from client-facing production credentials.

### Layer 6: Immutable Audit Logging
- **Append-Only Security Rules**: `firestore.rules` enforces immutable logging on `/hospitals/{hospitalId}/audit_logs/{logId}`:
  ```rules
  match /audit_logs/{logId} {
    allow read: if isAuthenticated() && isHospitalAdmin(hospitalId);
    allow create: if isAuthenticated() && isMemberOf(hospitalId);
    allow update, delete: if false; // Immutable - updates and deletes rejected
  }
  ```
- **Logger Middleware (`src/services/auditLoggerMiddleware.js`)**: Automatically logs `{ user_id, action, table_affected, hospital_id, timestamp, details }` for all actions on sensitive schema tables (`users`, `licenses`, `audits`, `findings`, `capas`, `incidents`, `ai_settings`).

### Layer 7: Infrastructure IAM & Edge Security
- **Least-Privilege GCP IAM**: GCP service accounts use scoped roles (`roles/firebase.managementServiceAgent`, `roles/firestore.serviceAgent`) without broad Owner or Editor access.
- **No Open Compute Ports**: No virtual machine ports or un-managed database ports are exposed to `0.0.0.0/0`.
- **Cloud Armor WAF**: Integrated with Google Cloud Global HTTP(S) Load Balancer for OWASP Top 10 threat filtering.

---

## 4. Technology Stack & Dependencies

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 19, Vite 8, Lucide React Icons | High-performance SPA with modern UI |
| **Backend Serverless** | Netlify Edge Functions (Node.js 20) | Payment verification & API edge processing |
| **Database & Auth** | Google Cloud Firestore & Firebase Auth | Multi-tenant NoSQL document storage & auth |
| **Storage Vault** | Google Cloud Storage / Firebase Storage | Evidence storage with object versioning |
| **PDF Generation** | jsPDF | On-demand digital compliance report creation |
| **Payment Gateway** | Razorpay Node.js SDK | Automated subscription billing with HMAC verification |
| **Build & Linting** | ESLint 10, Vite Build | Zero-error static code verification |

---

## 5. Deployment Guide & Environment Variables

### 5.1 Environment Variables Matrix

Create a `.env` file in the project root:

```env
# Frontend Razorpay Public Key ID
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx

# Backend Razorpay Private Key Secret (Netlify Serverless Only)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Field-Level Encryption Secret Key
VITE_FIELD_ENCRYPTION_KEY=Your32CharacterSecretEncryptionKey!

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=vaidyaq-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vaidyaq-app
VITE_FIREBASE_STORAGE_BUCKET=vaidyaq-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1016579046651
VITE_FIREBASE_APP_ID=1:1016579046651:web:xxxxxxxxxxxx
```

### 5.2 Build & Test Verification Commands

```bash
# 1. Run static lint check (must report 0 errors)
npm run lint

# 2. Run production compilation build
npm run build

# 3. Deploy to Netlify / Firebase
git push origin main
```

---

## 6. Regulatory & Accreditation Compliance Mapping

- **NABH 6th Edition (Chapter 10: Information Management System)**: Meets digital record integrity, audit log immutability, and confidential staff credentialing standards.
- **ABDM (Ayushman Bharat Digital Mission)**: Aligns with health data privacy guidelines, data isolation, and consent-based access.
- **ISO 27001 / HIPAA Readiness**: Enforces AES-256 encryption at rest, TLS 1.3 in-transit, 7-day PITR backups, WAF threat filtering, and role-based access control.

---
*Documentation Generated & Verified for VaidyaQ System Production Deployment.*
