import type { ShipmentDocument, ShipmentDocumentStatus } from "@prisma/client";
import type { ImageService } from "@receipt-radar/api/services/imageService.js";
import type { OcrProvider } from "@receipt-radar/api/providers/ocrProvider.js";
import type { StorageProvider } from "@receipt-radar/api/providers/storageProvider.js";
import {
  ShipmentDocumentRepository,
  type ListShipmentDocumentsFilters,
  type ShipmentDocumentListResult,
  type UpdateShipmentDocumentInput
} from "../repositories/shipmentDocumentRepository.js";
import { BarcodeService } from "./barcodeService.js";
import { PdfTextService } from "./pdfTextService.js";
import {
  extractTrackingNumber,
  inferCarrierFromBarcode
} from "../utils/trackingNumberExtractor.js";
import { classifyDocument } from "../utils/documentClassifier.js";
import { extractRecipient } from "../utils/recipientExtractor.js";
import { diffCorrections } from "../utils/fieldCorrectionDiff.js";
import type { CustomerMatchService } from "./customerMatchService.js";
import type { FieldCorrectionRepository } from "../repositories/fieldCorrectionRepository.js";
import { HttpError } from "../utils/httpError.js";
import type { FieldCorrection } from "@prisma/client";

export interface CreateFromUploadInput {
  file: Express.Multer.File;
  organizationId: string;
  uploadedById: string;
}

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

    return this.repository.create({
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

    return this.repository.create({
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
    return this.repository.update(id, patch, { organizationId, editedById, corrections });
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
    if (barcode) {
      const carrier = inferCarrierFromBarcode(barcode.raw);
      if (carrier) {
        return {
          trackingNumber: barcode.raw,
          carrier,
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
