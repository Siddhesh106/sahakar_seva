# 🚀 SahakarSeva — Cooperative Gig Services Platform
### SIH26089: Household & Community Services Cooperative
*Smart India Hackathon 2026 | Ministry of Cooperation*

[![GitHub repo](https://img.shields.io/badge/GitHub-Siddhesh106%2Fsahakar__seva-blue?logo=github)](https://github.com/Siddhesh106/sahakar_seva)
[![Database](https://img.shields.io/badge/Prisma-Supabase%20Postgres-3ECF8E?logo=supabase)](https://supabase.com)
[![Frontend](https://img.shields.io/badge/React%2018-Vite%20%2B%20Tailwind-61DAFB?logo=react)](https://vitejs.dev)

---

## 1. Project Overview & Problem Statement

Private gig platforms levy **20% to 35% commission fees** on unorganized blue-collar service workers while functioning as opaque black boxes for job matching. Workers have no safety net, zero credit access, and face arbitrary algorithmic penalties.

**SahakarSeva** replaces extractive corporate intermediaries with a **worker-owned cooperative platform**:
- **8.5% Capped Platform Fee**: 91.5%+ of all customer payments flow directly into the worker's wallet.
- **Transparent Fair-Match Engine**: An open, explainable scoring formula that balances proximity, member rating, and idle-turn fairness to prevent worker starvation.
- **Institutional Social Security**: Direct integration with the national **e-Shram** registry and **PACS (Primary Agricultural Credit Societies)** micro-credit advance against pending earnings.
- **Cooperative Profit-Sharing**: Quarterly surplus dividends returned to worker-members.

---

## 2. Core Architecture

```
sahakar-seva/
├── backend/                   # Express.js REST API & Core Services
│   ├── prisma/schema.prisma   # 11 Postgres Models & Enums
│   ├── src/
│   │   ├── services/
│   │   │   ├── matchEngine.js # Fair-Match scoring & 90s sequential cascade
│   │   │   ├── aiService.js   # Natural language request parser & fallback
│   │   │   ├── paymentService.js # UPI intent generation & 8.5% fee split
│   │   │   ├── whatsappService.js # Webhook processor (1, 2, START, DONE)
│   │   │   └── eshramService.js # e-Shram UAN & PACS advance credit
│   │   └── index.js           # Server entry point (Port 3000)
├── frontend-customer/         # Customer Web App (Port 5173)
├── frontend-worker/           # Worker Web App with 3-Bar Transparency (Port 5174)
├── frontend-admin/            # Cooperative Admin Dashboard (Port 5175)
├── docs/                      # PRD.md, Architecture.md, API.md, DEMO_WALKTHROUGH.md
└── .env.example               # Configuration template
```

---

## 3. Fair-Match Algorithm (The Technical Differentiator)

When a customer books a service, candidates within a 5km radius are scored using:

$$\text{Total Score} = (0.4 \times \text{Proximity}) + (0.3 \times \text{Rating}) + (0.3 \times \text{Fairness})$$

$$\text{Proximity Score} = \max\left(0, 1 - \frac{\text{distance (km)}}{5.0}\right)$$
$$\text{Rating Score} = \frac{\text{rating\_avg}}{5.0}$$
$$\text{Fairness Score} = \min\left(\frac{\text{idle hours since last completed job}}{72.0}, 1.0\right)$$

- **90-Second Cascade**: The top-scoring candidate receives the offer first. If declined or expired, the offer automatically cascades to candidate #2.
- **Explainable 3-Bar UI**: Stored as immutable audit records in `match_offers` and visualized on the worker's offer screen.

---

## 4. Quick Start & Setup Guide

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm or pnpm

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/Siddhesh106/sahakar_seva.git
cd sahakar_seva

# Install dependencies for backend and frontends
npm install
cd backend && npm install
cd ../frontend-customer && npm install
cd ../frontend-worker && npm install
cd ../frontend-admin && npm install
```

### 2. Database Configuration (Supabase Postgres)
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```

Configure your Supabase credentials:
```env
# 1. Runtime / App connection (pooled port 6543)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# 2. Migration direct connection (port 5432)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# 3. Supabase Project
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
```

*Note: In `DEMO_MODE=true`, the system seamlessly runs with the local database if Supabase credentials are not provided.*

### 3. Database Migration & Seeding
```bash
cd backend
npx prisma db push
node prisma/seed.js
```

### 4. Running the Platform
Open 4 terminal windows:

```bash
# Terminal 1: Backend API (Port 3000)
cd backend && npm start

# Terminal 2: Customer App (Port 5173)
cd frontend-customer && npm run dev

# Terminal 3: Worker App (Port 5174)
cd frontend-worker && npm run dev

# Terminal 4: Cooperative Admin (Port 5175)
cd frontend-admin && npm run dev
```

---

## 5. Demo Credentials (Mock OTP: `123456`)

| Role | Mobile | Name | Highlights |
|---|---|---|---|
| **Customer** | `9000000001` | Amit Jain | Saved addresses in Pune center |
| **Worker A (Fair-Match Winner)** | `9000000013` | Amit Patil | Electrical, 4.8★, Idle 65h (Wins offer via Fairness score) |
| **Worker B (Recently Completed)** | `9000000012` | Priya Sharma | Electrical, 4.9★, Idle 2h (Closer distance, but lower total score) |
| **Worker C (Pending KYC)** | `9000000024` | Neha Thorat | Unverified KYC awaiting Admin review |
| **Coop Admin** | `9000000099` | Admin Desai | Pune Cooperative Services Executive |

---

## 6. Live Demo Script (The 3-Minute Journey)

1. **Customer Request & AI Parse**:
   - Open Customer App (`http://localhost:5173`) and log in as `9000000001`.
   - In the AI Service Assistant bar, type: *"My bedroom ceiling fan stopped rotating and I need an electrician urgently today"*.
   - Click **AI Understand & Book** $\rightarrow$ Category is auto-selected as **Electrical Works** with **high urgency**.
   - Click **Confirm & Request Service** $\rightarrow$ Status changes to **MATCHING**.

2. **Fair-Match Engine in Action**:
   - Open Worker App (`http://localhost:5174`) in Incognito mode and log in as Amit Patil (`9000000013`).
   - See the **Job Offer Popup** with 90-second countdown and **3-Bar Score Breakdown**:
     - *Proximity (40%)*: ~80.8%
     - *Rating (30%)*: ~96.0% (4.8★)
     - *Fair Turn (30%)*: ~90.3% (Idle 65 hours)
     - *Total Match*: **88.2%**
   - Click **ACCEPT JOB**.

3. **Active Job Execution**:
   - Worker clicks **MARK STARTED** $\rightarrow$ Customer timeline shows **IN PROGRESS**.
   - Worker clicks **MARK COMPLETED** $\rightarrow$ Service completed.

4. **Cooperative Payment & Rating**:
   - Customer sees payment card: ₹350 total $\rightarrow$ ₹29.75 Coop Fee (8.5%) + ₹320.25 Worker Payout.
   - Customer clicks **Pay Now via UPI** $\rightarrow$ ₹320.25 is credited directly into Amit Patil's wallet.
   - Customer leaves 5-Star review.

5. **Institutional Social Security & Admin Dashboard**:
   - Worker navigates to **Social Security** $\rightarrow$ Clicks **One-Tap Link e-Shram** (issues UAN) and requests a **PACS Credit Advance** of ₹1,500.
   - Open Admin Dashboard (`http://localhost:5175`) $\rightarrow$ View live metrics, verify pending KYC worker Neha Thorat, and inspect the **Quarterly Profit-Share Surplus Ledger**.

---

## 7. License
Licensed under the Apache 2.0 License. Developed for Smart India Hackathon 2026.
