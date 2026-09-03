# SahakarSeva — Complete REST API Specification
**Base URL**: `http://localhost:3000/api/v1`

---

## 1. Authentication Endpoints

### `POST /auth/otp/request`
- **Access**: Public
- **Body**: `{ "phone": "9000000001" }`
- **Response**: `{ "success": true, "message": "OTP sent successfully" }`

### `POST /auth/otp/verify`
- **Access**: Public
- **Body**: `{ "phone": "9000000001", "otp": "123456" }`
- **Response**: `{ "token": "JWT_STRING", "user": { ... }, "isNewUser": false }`

---

## 2. AI Service Endpoints

### `POST /ai/parse-request`
- **Access**: Public / Authenticated
- **Body**: `{ "text": "My bedroom fan stopped working and need electrician today" }`
- **Response**:
```json
{
  "parsed": {
    "category": "electrical",
    "service_type": "fan_repair",
    "urgency": "high",
    "summary": "fan repair (high urgency)"
  }
}
```

---

## 3. Booking & Matching Endpoints

### `POST /bookings`
- **Access**: Customer
- **Body**:
```json
{
  "category_id": "cat_electrical",
  "address_text": "12 MG Road, Pune",
  "lat": 18.5204,
  "lng": 73.8567,
  "scheduled_time": "2026-09-03T10:00:00Z",
  "notes": "Ceiling fan repair"
}
```
- **Response**: `{ "booking": { "id": "uuid", "status": "matching", "price": 350 } }`

### `GET /match/pending`
- **Access**: Worker
- **Response**: Active pending match offer with 3-bar scores (`proximity_score`, `rating_score`, `fairness_score`, `total_score`, `expires_at`).

### `POST /match/:offerId/accept`
- **Access**: Worker
- **Response**: `{ "booking": { "id": "uuid", "status": "assigned" } }`

### `POST /match/:offerId/decline`
- **Access**: Worker
- **Response**: `{ "next_offer_triggered": true }`

---

## 4. Payment & Rating Endpoints

### `POST /payments/initiate`
- **Access**: Customer
- **Body**: `{ "booking_id": "uuid" }`
- **Response**: `{ "upi_intent_url": "upi://pay?...", "payment": { "amount": 350, "platform_fee": 29.75, "worker_payout": 320.25 } }`

### `POST /payments/webhook`
- **Access**: Public / Webhook
- **Body**: `{ "booking_id": "uuid", "status": "success" }`
- **Response**: `{ "success": true }`

### `POST /ratings`
- **Access**: Authenticated
- **Body**: `{ "booking_id": "uuid", "to_user_id": "uuid", "stars": 5, "comment": "Great work" }`
- **Response**: `{ "rating": { ... } }`

---

## 5. Social Security & WhatsApp Endpoints

### `POST /social-security/eshram-link`
- **Access**: Worker
- **Response**: `{ "eshram_status": "linked", "eshram_id": "UAN-1234567890" }`

### `POST /social-security/pacs-credit-request`
- **Access**: Worker
- **Body**: `{ "amount": 1500 }`
- **Response**: `{ "status": "approved", "amount": 1500, "credit_limit": 3500, "pacs_id": "PACS-ABC" }`

### `POST /whatsapp/webhook`
- **Access**: Public / WhatsApp Provider
- **Body**: `{ "phone": "9000000013", "message": "1" }`
- **Response**: HTTP 200
