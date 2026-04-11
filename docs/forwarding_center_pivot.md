# Forwarding Center Pivot — Strategic Plan

> **Status (2026-04-11):** Pivot committed. Direction is monorepo with parallel `apps/forwarding-*` workspaces sharing existing infra (OCR provider, storage, auth, image pipeline) via direct imports — no premature extraction to `packages/*`. Receipt Radar (the freelancer app) coasts during this build. Same Supabase project, new Render service for the forwarding API. Mobile-first for V0; web admin lives in MVP scope. Multi-tenant from day one — `Organization` model is non-negotiable.
>
> See the V0 scope and critique notes in chat history (2026-04-11). The MVP scope below is the destination, not the next sprint — V0 is the next sprint.

## The MVP target

For a forwarding center, the MVP should do six things:

accept images and PDFs

classify the document as label / invoice / packing slip / customs form

extract tracking number, carrier, sender, recipient, destination, account/reference number, declared value, weight

read barcodes / QR codes

route uncertain extractions into a review queue

make every processed document searchable by tracking number, customer, and status

That is enough to be useful. Anything beyond that is phase two.

Add these dependencies first

API

These are the strongest additions for an MVP.

Job queue

bullmq

ioredis

Why: OCR and parsing should run asynchronously, not inside the request cycle.

Barcode decoding

a barcode engine such as zxing-wasm, @zxing/library, or another production-grade decoder

Why: forwarding centers live on tracking numbers, and barcodes are often more reliable than OCR text.

PDF ingestion

pdf-parse or pdfjs-dist

Why: shipping docs and invoices often arrive as PDFs, not just camera images.

Structured document extraction upgrade

keep @google-cloud/vision for baseline OCR

add @google-cloud/documentai or an LLM-based structured extraction fallback only for hard cases

Why: Vision gets text; logistics needs fields.

Fuzzy matching

fuse.js

Why: match extracted recipient/account names to existing customer records when OCR is imperfect.

Logging / auditability

pino

pino-http

Why: forwarding centers need traceability when a package is misrouted or reviewed manually.

File inspection

file-type

Why: detect whether an upload is JPEG, PNG, PDF, etc. before processing.

Web

Your current web app can upload and review receipts, but logistics needs heavier review tooling.

@tanstack/react-table

for intake queues, review tables, and search results

react-pdf

for in-browser PDF review

@zxing/browser

for live webcam barcode scanning in browser workflows

socket.io-client or SSE support

for real-time processing status

recharts or similar

optional, for simple ops dashboards

Mobile

Your mobile app already has camera and upload foundations .

For MVP, the mobile side mainly needs:

barcode scanning support through Expo camera capabilities

better capture workflow for labels and invoices

offline upload queue for warehouse floors with bad connectivity

Features you need to add

1\. Replace “receipt” with a logistics document model

Do not force forwarding-center data into Receipt.

Add new models such as:

ShipmentDocument

Shipment

Package

Address

CustomerAccount

ProcessingException

FieldCorrection

At minimum, ShipmentDocument should hold:

documentType

carrier

trackingNumber

referenceNumber

senderName

recipientName

destinationAddress

originAddress

declaredValue

weight

status

confidence

ocrRawText

ocrRawJson

barcodeRaw

reviewRequired

2\. Document classifier

Before extraction, classify each upload into:

shipping label

commercial invoice

packing slip

customs declaration

unknown

For MVP, this can be:

rules + OCR keywords first

AI fallback only when confidence is low

3\. Barcode-first extraction

Tracking numbers are gold. Read them before relying on OCR text.

MVP rule:

if barcode exists, trust it first

OCR becomes secondary validation

4\. Field-level confidence scoring

Do not just store one overall status. Store confidence per field:

tracking number confidence

address confidence

declared value confidence

carrier confidence

That gives staff something solid to review.

5\. Review queue

This is mandatory.

A forwarding-center MVP is not complete without:

“needs review” queue

image/PDF preview

editable extracted fields

accept / correct / reject flow

audit trail of human edits

6\. Duplicate tracking detection

Add a rule that flags:

repeated tracking numbers

same document uploaded twice

same tracking tied to different customers

That saves real operational pain.

7\. Customer/account matching

If the forwarding center already has customer IDs, suite numbers, or mailbox numbers, parse and match them automatically.

This is one of the highest-value features because it turns OCR into routing.

8\. Searchable document archive

Staff should be able to search by:

tracking number

carrier

customer account

recipient

date

status

9\. Upload pipeline for PDFs and images

Your current app is image-centered. The MVP needs:

image upload

PDF upload

multi-page document support

batch processing

The AI parts that actually matter

Do not get distracted by the shiny nonsense.

For MVP, “AI-driven” should mean:

document classification

field extraction

confidence scoring

fuzzy entity matching

exception prioritization

It does not need:

a chatbot

route optimization

fraud modeling

generative summaries

autonomous agents

Those come later.

The cleanest MVP stack for your repo

Keep

Express + TypeScript + Prisma + PostgreSQL

React web app

Expo mobile app

Google Vision as base OCR

local/S3 storage

CSV/XLSX export

Add

async queue

barcode decoding

PDF support

logistics document models

review queue

fuzzy customer matching

audit logging

That is the narrow road. It gets you to a real product instead of a bloated prototype.

Suggested database shift

Your current schema is receipt-specific .

I would evolve it like this:

keep User

keep receipt flow only if you want backward compatibility

add:

CustomerAccount

Shipment

ShipmentDocument

Package

DocumentField

DocumentReview

ProcessingJob

A good MVP trick is to store extracted fields twice:

normalized columns for search

raw JSON for traceability

That lets you move fast without boxing yourself in.

What I would build first inside my-ocr-app

Sprint 1

add ShipmentDocument model

add document type enum

accept image + PDF uploads

extract tracking number / carrier / recipient / declared value / weight

add barcode reading

save confidence and raw OCR

Sprint 2

build review queue UI

add editable extraction screen

add duplicate tracking detection

add customer/account match

add search screen

Sprint 3

add batch upload

add async jobs with queue

add simple dashboard: processed / needs review / failed

add export by shipment document type

MVP TODO checklist

Create logistics Prisma models instead of overloading Receipt

Add document type enum: label, invoice, packing slip, customs, unknown

Add PDF ingestion

Add barcode/QR decoding

Add async OCR job queue

Add field-level confidence scoring

Add “needs review” exception queue

Add human correction audit log

Add duplicate tracking detection

Add customer/account fuzzy matching

Add search by tracking number, account, carrier, status

Add batch upload support

Add role-safe logging and observability

Keep CSV/XLSX export, but shift it to logistics fields

My straight recommendation

Do not mutate the app by sprinkling forwarding-center fields on top of Receipt. Build a new logistics slice beside it.

Your current repo is already strong as a document ingestion platform. The leap to forwarding centers happens when you add:

barcode intelligence

document classification

logistics entities

review workflow

account matching

That combination is your MVP.