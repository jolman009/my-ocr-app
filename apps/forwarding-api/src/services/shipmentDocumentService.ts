import type { ShipmentDocument, ShipmentDocumentStatus } from "@prisma/client";
import type { ImageService } from "@receipt-radar/api/services/imageService.js";
import type { OcrProvider } from "@receipt-radar/api/providers/ocrProvider.js";
import type { StorageProvider } from "@receipt-radar/api/providers/storageProvider.js";
import {
  ShipmentDocumentRepository,
  type CreateShipmentDocumentInput,
  type ListShipmentDocumentsFilters,
  type ShipmentDocumentListResult,
  type UpdateShipmentDocumentInput
} from "../repositories/shipmentDocumentRepository.js";
import { BarcodeService } from "./barcodeService.js";
import { PdfTextService } from "./pdfTextService.js";
import {
  extractTrackingNumber,
  parseBarcodeTracking
} from "../utils/trackingNumberExtractor.js";
import { classifyDocument } from "../utils/documentClassifier.js";
import { extractRecipient } from "../utils/recipientExtractor.js";
import { diffCorrections } from "../utils/fieldCorrectionDiff.js";
import type { CustomerMatchService } from "./customerMatchService.js";
import type { FieldCorrectionRepository } from "../repositories/fieldCorrectionRepository.js";
import { HttpError } from "../utils/httpError.js";
import { isUniqueConstraintError } from "../utils/prismaErrors.js";
import type { FieldCorrection } from "@prisma/client";

export interface CreateFromUploadInput {
  file: Express.Multer.File;
  organizationId: string;
  uploadedById: string;
}

export interface CreateBatchFromUploadsInput {
  files: Express.Multer.File[];
  organizationId: string;
  uploadedById: string;
}

/** Per-file outcome in a batch upload. Exactly one of document/error is set. */
export interface BatchUploadItemResult {
  index: number;
  filename: string;
  document: ShipmentDocument | null;
  error: string | null;
}

export interface BatchUploadResult {
  results: BatchUploadItemResult[];
  summary: { total: number; succeeded: number; failed: number };
}

/** MIME types accepted by both the single- and batch-upload endpoints. */
export const ACCEPTED_UPLOAD_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf"
]);

const BARCODE_CONFIDENCE = 0.95;
const OCR_EXTRACTION_CONFIDENCE = 0.6;
const UNRECOGNIZED_BARCODE_CONFIDENCE = 0.4;
const NOT_FOUND_CONFIDENCE = 0.2;

export class ShipmentDocumentService {
  constructor(
    private readonly repository: ShipmentDocumentRepository,
    private readonly barcodeService: BarcodeService,
    private readonly ocrProvider: OcrProvider,
    private readonly imageService: ImageService,
    private readonly storageProvider: StorageProvider,
    private readonly pdfTextService: PdfTextService,
    private readonly customerMatchService: CustomerMatchService,
    private readonly fieldCorrectionRepository: FieldCorrectionRepository
  ) {}

  async createFromUpload(input: CreateFromUploadInput): Promise<ShipmentDocument> {
    if (input.file.mimetype === "application/pdf") {
      return this.createFromPdfUpload(input);
    }
    return this.createFromImageUpload(input);
  }

  /**
   * Processes many uploads in one request (#23). Files are handled
   * **sequentially on purpose**: each one runs barcode decode + OCR + image
   * storage, which is CPU- and memory-heavy, so fanning out concurrently could
   * exhaust the free-tier instance. True async fan-out is deferred to #24.
   *
   * A single bad file never fails the batch — its slot carries an `error`
   * string while the rest still process. Duplicate detection (#21) still runs
   * per file, so two identical tracking numbers within one batch behave exactly
   * as two separate uploads (first processes, repeat → needs_review).
   */
  async createBatchFromUploads(
    input: CreateBatchFromUploadsInput
  ): Promise<BatchUploadResult> {
    const results: BatchUploadItemResult[] = [];

    for (let index = 0; index < input.files.length; index++) {
      const file = input.files[index];
      const filename = file.originalname || `file-${index + 1}`;

      if (!ACCEPTED_UPLOAD_MIME_TYPES.has(file.mimetype)) {
        results.push({
          index,
          filename,
          document: null,
          error: `Unsupported file type: ${file.mimetype}.`
        });
        continue;
      }

      try {
        const document = await this.createFromUpload({
          file,
          organizationId: input.organizationId,
          uploadedById: input.uploadedById
        });
        results.push({ index, filename, document, error: null });
      } catch (error) {
        // Known validation failures (e.g. image-only PDF) surface their own
        // message; anything unexpected is logged and reported generically so
        // one broken file can't leak internals or abort the batch.
        const isHttp = error instanceof HttpError;
        if (!isHttp && process.env.NODE_ENV !== "production") {
          console.error(`[shipment] batch item ${index} (${filename}) failed:`, error);
        }
        results.push({
          index,
          filename,
          document: null,
          error: isHttp ? error.message : "Failed to process file."
        });
      }
    }

    const succeeded = results.filter((r) => r.document !== null).length;
    return {
      results,
      summary: {
        total: results.length,
        succeeded,
        failed: results.length - succeeded
      }
    };
  }

  private async createFromImageUpload(input: CreateFromUploadInput): Promise<ShipmentDocument> {
    const original = input.file.buffer;

    // Barcode-first: try the original buffer before preprocessing, since
    // grayscale/normalize steps in imageService.preprocess() can hurt some
    // barcode decoders. Run in parallel with image storage for speed.
    const [barcode, imageUrl] = await Promise.all([
      this.barcodeService.decode(original),
      this.storageProvider.save(original, this.inferExtension(input.file.mimetype))
    ]);

    // Always run OCR too — we want ocrRawText for search + manual review,
    // and it's our fallback source for tracking number when barcode misses.
    let ocrRawText: string | null = null;
    let ocrRawJson: unknown = null;
    try {
      const preprocessed = await this.imageService.preprocess(original);
      const ocrResult = await this.ocrProvider.extractReceiptText(preprocessed);
      ocrRawText = ocrResult.rawText;
      ocrRawJson = ocrResult.raw;
    } catch (error) {
      // OCR failure is non-fatal — barcode may still have given us a tracking
      // number. Log but continue.
      if (process.env.NODE_ENV !== "production") {
        console.warn("[shipment] OCR failed:", error instanceof Error ? error.message : error);
      }
    }

    // Barcode wins if present; otherwise try OCR text extraction.
    const resolution = this.resolveTracking(barcode, ocrRawText);

    // Coarse document-type classification from the OCR text. A resolved carrier
    // tracking number is a strong signal the document is a shipping label.
    const classification = classifyDocument(ocrRawText, {
      hasCarrierTracking: Boolean(resolution.carrier)
    });

    // Parse the recipient and route to a customer account (mailbox-first).
    const recipient = extractRecipient(ocrRawText);
    const customerMatch = await this.customerMatchService.match(input.organizationId, recipient);

    return this.persistDocument({
      organizationId: input.organizationId,
      uploadedById: input.uploadedById,
      imageUrl,
      trackingNumber: resolution.trackingNumber,
      carrier: resolution.carrier,
      barcodeRaw: barcode?.raw ?? null,
      barcodeFormat: barcode?.format ?? null,
      ocrRawText,
      ocrRawJson,
      documentType: classification.type,
      recipientName: recipient.recipientName,
      mailboxNumber: recipient.mailboxNumber,
      matchedCustomerId: customerMatch?.customerId ?? null,
      customerMatchConfidence: customerMatch?.confidence ?? null,
      confidence: resolution.confidence,
      status: resolution.status
    });
  }

  private async createFromPdfUpload(input: CreateFromUploadInput): Promise<ShipmentDocument> {
    const buffer = input.file.buffer;

    // PDF flow: barcode is skipped (zxing wants raster pixels), and embedded
    // text plays the role of OCR text. The same resolveTracking() pipeline
    // then runs the carrier-tracking regex against it.
    const [pdfResult, imageUrl] = await Promise.all([
      this.pdfTextService.extractText(buffer),
      this.storageProvider.save(buffer, "pdf")
    ]);

    if (!pdfResult.hasEmbeddedText) {
      throw new HttpError(
        422,
        "PDF has no extractable text. Scanned/image-only PDFs are not yet supported."
      );
    }

    const resolution = this.resolveTracking(null, pdfResult.text);

    const classification = classifyDocument(pdfResult.text, {
      hasCarrierTracking: Boolean(resolution.carrier)
    });

    const recipient = extractRecipient(pdfResult.text);
    const customerMatch = await this.customerMatchService.match(input.organizationId, recipient);

    return this.persistDocument({
      organizationId: input.organizationId,
      uploadedById: input.uploadedById,
      imageUrl,
      trackingNumber: resolution.trackingNumber,
      carrier: resolution.carrier,
      barcodeRaw: null,
      barcodeFormat: null,
      ocrRawText: pdfResult.text,
      ocrRawJson: { source: "pdfjs-dist", pageCount: pdfResult.pageCount },
      documentType: classification.type,
      recipientName: recipient.recipientName,
      mailboxNumber: recipient.mailboxNumber,
      matchedCustomerId: customerMatch?.customerId ?? null,
      customerMatchConfidence: customerMatch?.confidence ?? null,
      confidence: resolution.confidence,
      status: resolution.status
    });
  }

  /**
   * Persists a freshly-extracted document, applying duplicate detection (#21).
   * If the tracking number already exists in the org, the document is still
   * saved (soft-block) but forced to `needs_review` and linked to the original
   * via `duplicateOfId`. A unique-index trip (concurrent scan accepted in the
   * gap between check and insert) is retried the same way rather than 500ing.
   */
  private async persistDocument(
    data: CreateShipmentDocumentInput
  ): Promise<ShipmentDocument> {
    let toCreate = data;
    if (toCreate.trackingNumber) {
      const original = await this.repository.findDuplicate(
        toCreate.organizationId,
        toCreate.trackingNumber
      );
      if (original) {
        toCreate = { ...toCreate, status: "needs_review", duplicateOfId: original.id };
      }
    }

    try {
      return await this.repository.create(toCreate);
    } catch (error) {
      if (isUniqueConstraintError(error) && toCreate.trackingNumber) {
        const original = await this.repository.findDuplicate(
          toCreate.organizationId,
          toCreate.trackingNumber
        );
        return this.repository.create({
          ...toCreate,
          status: "needs_review",
          duplicateOfId: original?.id ?? toCreate.duplicateOfId ?? null
        });
      }
      throw error;
    }
  }

  async list(filters: ListShipmentDocumentsFilters): Promise<ShipmentDocumentListResult> {
    return this.repository.list(filters);
  }

  async getById(id: string, organizationId: string): Promise<ShipmentDocument> {
    const document = await this.repository.findById(id, organizationId);
    if (!document) {
      throw new HttpError(404, "Shipment document not found.");
    }
    return document;
  }

  /**
   * Applies an operator's review edits (accept / correct / reject). The
   * getById call enforces multi-tenant ownership before the update touches the
   * row — the document must belong to the caller's organization.
   */
  async update(
    id: string,
    organizationId: string,
    patch: UpdateShipmentDocumentInput,
    editedById: string | null
  ): Promise<ShipmentDocument> {
    const existing = await this.getById(id, organizationId);
    // Audit only the fields that actually changed (#20).
    const corrections = diffCorrections(
      existing as unknown as Record<string, unknown>,
      patch as Record<string, unknown>
    );
    try {
      return await this.repository.update(id, patch, { organizationId, editedById, corrections });
    } catch (error) {
      // Accept guard (#21): the partial unique index rejects accepting a second
      // document that shares an already-processed tracking number.
      if (isUniqueConstraintError(error)) {
        throw new HttpError(
          409,
          "Another accepted document already has this tracking number. Edit the tracking number or reject this duplicate."
        );
      }
      throw error;
    }
  }

  /** Edit history for a document (audit trail), newest first. Org-scoped. */
  async listCorrections(id: string, organizationId: string): Promise<FieldCorrection[]> {
    await this.getById(id, organizationId);
    return this.fieldCorrectionRepository.listByDocument(id);
  }

  private resolveTracking(
    barcode: { raw: string; format: string } | null,
    ocrRawText: string | null
  ): {
    trackingNumber: string | null;
    carrier: string | null;
    confidence: number;
    status: ShipmentDocumentStatus;
  } {
    // Best outcome: barcode decoded AND the decoded text matches a known
    // carrier's tracking format. This is the only path with high confidence.
    // parseBarcodeTracking strips GS1 control chars + USPS routing prefixes so
    // we store the real tracking number, not the raw barcode payload.
    if (barcode) {
      const parsed = parseBarcodeTracking(barcode.raw);
      if (parsed) {
        return {
          trackingNumber: parsed.trackingNumber,
          carrier: parsed.carrier,
          confidence: BARCODE_CONFIDENCE,
          status: "processed"
        };
      }
    }

    // Barcode missing OR decoded to something that isn't a carrier tracking
    // number (e.g., a routing code on a UPS label). Try OCR extraction —
    // the printed tracking number is usually visible in the label text even
    // when the small barcode encodes something else.
    if (ocrRawText) {
      const extracted = extractTrackingNumber(ocrRawText);
      if (extracted) {
        return {
          trackingNumber: extracted.trackingNumber,
          carrier: extracted.carrier,
          confidence: OCR_EXTRACTION_CONFIDENCE,
          status: "needs_review"
        };
      }
    }

    // Nothing recognized. If we at least decoded a barcode, keep its raw
    // text as the trackingNumber so operators can still find the document
    // by whatever identifier is on the label — but flag for review with
    // low confidence so the human review queue surfaces it.
    if (barcode) {
      return {
        trackingNumber: barcode.raw,
        carrier: null,
        confidence: UNRECOGNIZED_BARCODE_CONFIDENCE,
        status: "needs_review"
      };
    }

    return {
      trackingNumber: null,
      carrier: null,
      confidence: NOT_FOUND_CONFIDENCE,
      status: "needs_review"
    };
  }

  private inferExtension(mimetype: string): string {
    if (mimetype === "image/jpeg" || mimetype === "image/jpg") return "jpg";
    if (mimetype === "image/png") return "png";
    if (mimetype === "image/webp") return "webp";
    if (mimetype === "application/pdf") return "pdf";
    return "png";
  }
}
