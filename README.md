# 🏠 Donation Manager

REST API for managing shelter donations — registration, distribution tracking, and reporting.

Built with **Node.js**, **TypeScript**, and **Express**.

## Features

- **Donation Registration** — Record donations with donor name, type, quantity, and date
- **Distribution Tracking** — Log when donations are distributed, with inventory validation
- **Inventory Reports** — View current stock levels grouped by donation type
- **Donor Reports** — See aggregated contributions per donor
- **Input Validation** — Clear error messages for malformed requests
- **In-Memory Storage** — Structured for easy database migration

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode (hot reload)
npm run dev

# Build and run production
npm run build
npm start
```

The server starts at `http://localhost:3000` (configurable via `PORT` env var).

## API Endpoints

### Health Check
```
GET /api/health
```

### Donations

| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| POST   | `/api/donations`     | Register a new donation  |
| GET    | `/api/donations`     | List all donations       |
| GET    | `/api/donations/:id` | Get a specific donation  |

**Create donation body:**
```json
{
  "donorName": "Alice Johnson",
  "type": "food",
  "quantity": 50,
  "unit": "lbs",
  "date": "2025-01-15T10:00:00Z",
  "notes": "Canned goods from food drive"
}
```

Supported types: `money`, `food`, `clothing`, `hygiene`, `medical`, `bedding`, `other`

### Distributions

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| POST   | `/api/distributions`   | Log a distribution       |
| GET    | `/api/distributions`   | List all distributions   |

**Create distribution body:**
```json
{
  "type": "food",
  "quantity": 20,
  "unit": "lbs",
  "recipientDescription": "Weekly meal service",
  "notes": "Distributed to 15 families"
}
```

> ⚠️ Distribution will fail with `409` if requested quantity exceeds available inventory.

### Reports

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | `/api/reports/inventory`  | Current stock by donation type     |
| GET    | `/api/reports/donors`     | Total contributions per donor      |

**Inventory report example:**
```json
{
  "generatedAt": "2025-01-15T12:00:00Z",
  "summary": [
    {
      "type": "food",
      "totalReceived": 150,
      "totalDistributed": 60,
      "currentStock": 90,
      "unit": "lbs"
    }
  ]
}
```

**Donor report example:**
```json
{
  "generatedAt": "2025-01-15T12:00:00Z",
  "totalDonors": 2,
  "donors": [
    {
      "donorName": "Alice Johnson",
      "totalDonations": 520,
      "contributions": [
        { "type": "food", "totalQuantity": 20, "unit": "lbs" },
        { "type": "money", "totalQuantity": 500, "unit": "dollars" }
      ]
    }
  ]
}
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Project Structure

```
src/
├── index.ts                 # Server entry point
├── app.ts                   # Express app setup (testable)
├── models/
│   └── donation.ts          # TypeScript interfaces & enums
├── services/
│   ├── storage.ts           # Generic in-memory store
│   └── donationService.ts   # Business logic
├── routes/
│   ├── donations.ts         # Donation CRUD routes
│   ├── distributions.ts     # Distribution routes
│   └── reports.ts           # Report endpoints
└── middleware/
    ├── validate.ts          # Request validation
    └── errorHandler.ts      # Global error handling

tests/
├── donations.test.ts        # Donation endpoint tests
├── distributions.test.ts    # Distribution + inventory tests
└── reports.test.ts          # Report generation tests
```

## Design Decisions

- **App/Server split** — `app.ts` exports the Express app for testing with supertest; `index.ts` starts the server
- **Service layer** — Business logic lives in `DonationService`, keeping routes as thin controllers
- **Generic storage** — `InMemoryStore<T>` can be swapped for a database adapter without changing service code
- **Inventory validation** — Distributions check available stock before proceeding (prevents negative inventory)
- **Aggregated errors** — Validation collects all errors before responding (not just the first one)

## License

MIT
