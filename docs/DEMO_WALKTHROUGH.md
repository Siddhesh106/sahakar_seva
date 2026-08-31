# SahakarSeva — Live Demo Walkthrough Guide

This document guides you through running a complete end-to-end demo of **SahakarSeva** (Cooperative Gig Services Platform for Household & Community Services).

---

## 1. System Architecture Recap

- **Backend API**: Node.js + Express + Prisma ORM + SQLite (dev.db)
- **Customer Web App**: React 18 + Vite (Port `5173`)
- **Worker Web App**: React 18 + Vite (Port `5174`)
- **Cooperative Admin Dashboard**: React 18 + Vite (Port `5175`)
- **Match Engine**: Fair-Match sequential scoring (`Proximity 40% + Rating 30% + Fairness 30%`)

---

## 2. Seed Demo Credentials

All test accounts use the mock OTP: **`123456`**

| Role | Phone | Name | Details |
|---|---|---|---|
| **Customer 1** | `9000000001` | Amit Jain | Saved address at MG Road, Pune |
| **Customer 2** | `9000000002` | Sneha Reddy | Saved address at FC Road, Pune |
| **Worker 1 (Electrical)** | `9000000013` | Amit Patil | Online, Verified, Skilled in Electrical & Plumbing |
| **Worker 2 (Plumbing)** | `9000000012` | Priya Sharma | Online, Verified, Skilled in Plumbing & Electrical |
| **Worker 3 (Cleaning)** | `9000000011` | Rajesh Kumar | Online, Verified, Skilled in Cleaning & Cooking |
| **Worker 4 (Pending KYC)**| `9000000024` | Neha Thorat | Offline, Pending KYC |
| **Coop Admin** | `9000000099` | Admin Desai | Pune Cooperative Services |

---

## 3. Step-by-Step E2E Walkthrough Flow

### Step A: Start the Backend & Frontends
1. Terminal 1: `cd backend && npm run dev`
2. Terminal 2: `cd frontend-customer && npm run dev`
3. Terminal 3: `cd frontend-worker && npm run dev`
4. Terminal 4: `cd frontend-admin && npm run dev`

---

### Step B: The Customer Booking Flow
1. Open **Customer App** at `http://localhost:5173`
2. Log in with phone `9000000001`, OTP `123456`.
3. Select **Electrical Service** (₹350 base price).
4. Pick location **12 MG Road, Pune** (or pick on map) and schedule for today.
5. Add notes: *"Ceiling fan issue in bedroom"*.
6. Click **Request Service**.
7. The Customer App transitions to the **Matching screen** ("Finding a verified cooperative member near you...").

---

### Step C: Worker Job Offer & Transparency Breakdown
1. Open **Worker App** in an Incognito window or second browser at `http://localhost:5174`
2. Log in with worker phone `9000000013` (Amit Patil), OTP `123456`.
3. Ensure availability toggle is **ONLINE**.
4. The pending job offer popup appears with a 90-second countdown!
5. **Key Demo Highlight — Transparency Breakdown**:
   - Proximity Score: **~92%** (Nearby)
   - Rating Score: **~90%** (4.5★)
   - Fair Turn Score: **~85%** (Idle for 60+ hrs)
   - Total Score: **89.5%**
6. Click **ACCEPT JOB**.

---

### Step D: Active Job & Status Transitions
1. Worker App shows **Active Job Screen** with Customer name (Amit Jain) and address.
2. Worker clicks **MARK STARTED** -> Status changes to `in_progress`.
3. On Customer App (refresh/poll), status changes to **Job In Progress**.
4. Worker completes the job and clicks **MARK COMPLETED**.

---

### Step E: Customer Payment & Rating
1. Customer App shows **Payment Screen** with price breakdown:
   - Base Price: ₹350
   - Cooperative Fee (8.5%): ₹29.75
   - Worker Payout: ₹320.25
2. Customer clicks **Pay via UPI** -> Simulates instant payment webhook success.
3. Customer completes the **Rate & Review** modal (5 stars + "Great work fixing the fan!").
4. Worker's wallet balance is automatically credited with ₹320.25!

---

### Step F: Social Security Integration (Worker App)
1. In Worker App, navigate to **Social Security** tab.
2. Click **Link e-Shram** -> Receives instant e-Shram UAN (`UAN-xxxxxxxxx`).
3. Click **Request PACS Credit** -> Enter ₹2,000 -> Approved against PACS earnings credit limit!

---

### Step G: Cooperative Admin Verification & Profit-Share
1. Open **Admin Dashboard** at `http://localhost:5175`
2. Log in with `9000000099`, OTP `123456`.
3. View **Overview**: Active Workers, Jobs Completed, Surplus Collected.
4. Go to **Worker Verification Queue**: Approve pending KYC for worker Neha Thorat (`9000000024`).
5. Go to **Profit-Share Report**: View quarterly surplus breakdown and per-member dividend distribution preview!

---

## 4. WhatsApp Bot Interaction (Alternative No-App Flow)

To test the WhatsApp webhook flow directly via API or cURL:

```bash
# Simulating worker receiving job offer via WhatsApp:
curl -X POST http://localhost:3000/api/v1/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{"phone": "9000000013", "message": "1"}'
```
- Message `"1"` -> Accepts pending offer
- Message `"2"` -> Declines pending offer
- Message `"START"` -> Marks job in progress
- Message `"DONE"` -> Marks job completed & triggers wallet payout
