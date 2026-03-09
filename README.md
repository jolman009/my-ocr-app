# Receipt OCR Workspace

A full-stack receipt OCR application that lets users upload or capture receipt images, automatically extract structured data using OCR, and review/refine the results. Supports exporting processed receipt data to CSV and Excel.

## Tech Stack

**Backend** — Express, TypeScript, Prisma, PostgreSQL, Sharp, Zod
**Frontend** — React 19, Vite, Tailwind CSS, React Query, React Hook Form, React Router
**OCR** — Google Cloud Vision (production) / Mock provider (development)
**Infrastructure** — Docker Compose, npm workspaces

## Project Structure

```
my-ocr-app/
├── apps/
│   ├── api/                # Express backend (port 4000)
│   │   ├── src/
│   │   │   ├── controllers/    # HTTP request handlers
│   │   │   ├── services/       # Business logic (OCR, extraction, export)
│   │   │   ├── repositories/   # Data access (Prisma)
│   │   │   ├── providers/      # OCR provider implementations
│   │   │   ├── routes/         # Route definitions
│   │   │   ├── middleware/     # Error handling
│   │   │   ├── config/        # Env validation (Zod)
│   │   │   └── types/         # TypeScript interfaces
│   │   ├── prisma/             # Schema & migrations
│   │   └── test/
│   └── web/                # React frontend (port 5173)
│       └── src/
│           ├── pages/          # Dashboard, ReceiptDetail
│           ├── components/     # Uploader, ReviewForm, Table, Camera, Export
│           ├── api/            # Fetch-based API client
│           ├── hooks/          # Custom React hooks
│           └── types/
├── docs/                   # Google Vision setup guide
├── docker-compose.yml      # PostgreSQL container
├── .env.example
└── package.json            # Workspace root
```

## Features

- **Upload & Capture** — Drag-and-drop, file picker, or webcam capture for receipt images
- **Automatic OCR** — Text extraction and intelligent parsing of merchant, date, address, items, and totals
- **Review & Edit** — Web UI for correcting extracted data with form validation
- **Status Tracking** — Receipts marked as `processed`, `needs_review`, or `failed`
- **Filtering** — Filter by merchant, status, and date range
- **Export** — Download receipt data as CSV or Excel (with separate sheets for receipts and items)

## Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL 15+ (or Docker)
- npm v7+ (workspace support)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example apps/api/.env
   ```
   Update `DATABASE_URL` if your PostgreSQL credentials differ from the defaults.

3. **Start the database** (if using Docker):
   ```bash
   docker-compose up -d
   ```

4. **Run migrations:**
   ```bash
   npm run prisma:migrate --workspace api
   ```

5. **Start development servers** (in separate terminals):
   ```bash
   npm run dev:api    # API at http://localhost:4000
   npm run dev:web    # Web at http://localhost:5173
   ```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/receipt_ocr` | PostgreSQL connection string |
| `PORT` | `4000` | API server port |
| `WEB_ORIGIN` | `http://localhost:5173` | Frontend URL (CORS) |
| `OCR_PROVIDER` | `mock` | `mock` or `google-vision` |
| `UPLOAD_DIR` | `uploads` | Directory for receipt images |
| `GOOGLE_CLOUD_PROJECT` | — | GCP project ID (for google-vision) |
| `GOOGLE_APPLICATION_CREDENTIALS` | — | Path to GCP service account key (for google-vision) |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/receipts` | Upload a receipt image (multipart/form-data) |
| `GET` | `/api/receipts` | List receipts (supports `page`, `limit`, `merchant`, `dateFrom`, `dateTo`, `status` query params) |
| `GET` | `/api/receipts/:id` | Get a single receipt |
| `PATCH` | `/api/receipts/:id` | Update receipt data |
| `GET` | `/api/exports/receipts.csv` | Export receipts as CSV |
| `GET` | `/api/exports/receipts.xlsx` | Export receipts as Excel |
| `GET` | `/api/health` | Health check |

## OCR Providers

- **Mock** — Returns fixture data without calling an external service. Useful for development and testing.
- **Google Cloud Vision** — Real OCR using Google Cloud Vision API. See [`docs/GOOGLE_VISION_SETUP.md`](docs/GOOGLE_VISION_SETUP.md) for setup instructions. Free tier: 1,000 requests/month.

## Scripts

```bash
npm run dev:api         # Start backend dev server
npm run dev:web         # Start frontend dev server
npm run build           # Build both apps
npm run test            # Run all tests
npm run lint            # Type-check all workspaces
```

## Database

Uses PostgreSQL with Prisma ORM. Three models:

- **User** — Optional user association
- **Receipt** — Core entity with merchant, date, amounts, status, confidence scores, and raw OCR data
- **ReceiptItem** — Line items with name, quantity, unit price, and total

Manage with Prisma:
```bash
npm run prisma:migrate --workspace api    # Run migrations
npm run prisma:generate --workspace api   # Regenerate client
```

## Production Notes

- Set `OCR_PROVIDER=google-vision` with valid GCP credentials
- Configure persistent/cloud storage for uploaded images (currently local `uploads/` directory)
- Add authentication (none implemented)
- Add rate limiting
- Set `WEB_ORIGIN` to your production frontend URL
