# Claims Management API

A lightweight RESTful backend built with Node.js, Express, and Supabase PostgreSQL. It manages insurance claims lifecycle, multi-currency payment ledgers, dynamic currency conversion, and calculated settlement balances.

---

## Technical Stack

* **Runtime:** Node.js (TypeScript)
* **Framework:** Express.js
* **Database:** Supabase PostgreSQL

---

## Core Domain Rules

* **Historical Immutability:** `loss_date`, `date_notified`, and base claim `currency` are read-only once created to maintain audit integrity.
* **Date Validation:** `date_notified` must be equal to or after `loss_date`.
* **Computed Claim Status:**
  * `approved_amount = NULL` → `"Reserved, not yet settled"`
  * `approved_amount != NULL` and `outstanding_balance > 0` → `"Settled, payment outstanding"`
  * `approved_amount != NULL` and `outstanding_balance <= 0` → `"Settled and paid"`
* **Exchange Rate Formula:**
  amount_in_claim_currency = payment_amount * exchange_rate

---

## API Reference

### 1. Claims

#### `GET /claims`

Retrieve a list of all claims with derived financial totals (`total_paid` and `outstanding_balance`).

#### `POST /claims`

Create a new claim record.

* **Request Body:**
  
  ```json
  {
    "policyNumber": "POL-2026-8910",
    "insuredName": "John Doe",
    "lossNature": "Vehicle Collision",
    "lossDate": "2026-08-10",
    "dateNotified": "2026-08-12",
    "currency": "GHS",
    "estimatedLossAmount": 50000.00,
    "approvedAmount": null
  }

#### `GET /claims/:id`

Fetch details for a single claim along with its associated payment ledger.

#### `PATCH /claims/:id`

Update editable claim properties (`insuredName`, `lossNature`, `approvedAmount`).

* **Request Body:**
  
```json
{
  "insuredName": "John Doe",
  "lossNature": "Vehicle Collision (Rear-end)",
  "approvedAmount": 45000.00
}

```

---

### 2. Payments Ledger

#### `POST /payments?claimId={}`

Record a new payment transaction against a claim.

* **Request Body:*
  
```json
{
  "paymentDate": "2026-08-20",
  "paymentCurrency": "USD",
  "paymentAmount": 2000.00,
  "exchangeRate": 15.25,
  "referenceNote": "Partial settlement via wire transfer"
}

```

#### `GET /claims/:id/payments`

Retrieve the full payment history for a specific claim.

---

### 3. Analytics & Summaries

#### `GET /claims/metrics`

Retrieve important metrics (`total_estimated_loss`,
`total_paid`, `outstanding_balance`).

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=4000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CORS_ORIGIN=http://localhost:3000

```

---

## Quick Start

```bash
# Install dependencies
npm install

# Run database seeding
npm run seed-claims 
npm run seed-payments

# Start development server
npm run dev
```
