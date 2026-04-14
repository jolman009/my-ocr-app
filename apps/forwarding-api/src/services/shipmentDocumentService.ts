import type { ShipmentDocument, ShipmentDocumentStatus } from "@prisma/client";
import type { ImageService } from "@receipt-radar/api/services/imageService.js";
import type { OcrProvider } from "@receipt-radar/api/providers/ocrProvider.js";
import type { StorageProvider } from "@receipt-radar/api/providers/storageProvider.js";
import {
  ShipmentDocumentRepository,
  type ListShipmentDocumentsFilters,
  type ShipmentDocumentListResult
} from "../repositories/shipmentDocumentRepository.js";
import { BarcodeService } from "./barcodeService.js";
import {
  extractTrackingNumber,
  inferCarrierFromBarcode
} from "../utils/trackingNumberExtractor.js";
import { HttpError } from "../utils/httpError.js";

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
    private readonly storageProvider: StorageProvider
  ) {}

  async createFromUpload(input: CreateFromUploadInput): Promise<ShipmentDocument> {
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
    return "png";
  }
}
