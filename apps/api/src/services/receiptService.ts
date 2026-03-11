import type { OcrProvider } from "../providers/ocrProvider.js";
import { ReceiptRepository } from "../repositories/receiptRepository.js";
import { ImageService } from "./imageService.js";
import { ReceiptExtractor } from "./receiptExtractor.js";
import type { ParsedReceipt, ReceiptFilters, ReceiptRecord, ReceiptStatus } from "../types/receipt.js";
import { HttpError } from "../utils/httpError.js";

const deriveStatus = (parsed: ParsedReceipt): ReceiptStatus => {
  const requiredFields = [parsed.merchantName, parsed.receiptDate, parsed.total];
  const averageConfidence = Object.values(parsed.confidence).reduce((sum, value) => sum + value, 0) / Object.values(parsed.confidence).length;
  return requiredFields.every((field) => field !== null) && averageConfidence >= 0.7 ? "processed" : "needs_review";
};

export class ReceiptService {
  constructor(
    private readonly repository: ReceiptRepository,
    private readonly ocrProvider: OcrProvider,
    private readonly extractor: ReceiptExtractor,
    private readonly imageService: ImageService
  ) {}

  async createFromUpload(file: Express.Multer.File, userId?: string): Promise<ReceiptRecord> {
    const processedBuffer = await this.imageService.preprocess(file.buffer);
    const imageUrl = await this.imageService.save(processedBuffer);
    const ocrResult = await this.ocrProvider.extractReceiptText(processedBuffer);

    if (!ocrResult.rawText.trim() || ocrResult.lines.length < 3) {
      throw new HttpError(422, "Image does not appear to contain a complete or readable receipt.");
    }

    const confidences = ocrResult.blocks.map(b => b.confidence).filter(c => c !== undefined) as number[];
    if (confidences.length > 0) {
      const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
      if (avgConfidence < 0.6) {
        throw new HttpError(422, "Image quality is too low or blurry to extract text reliably. Please retake the photo.");
      }
    }

    const parsed = this.extractor.parse(ocrResult);
    const status = deriveStatus(parsed);
    return this.repository.create({ imageUrl, parsed, rawOcr: ocrResult.raw, status, userId });
  }

  async list(filters: ReceiptFilters, userId?: string) {
    return this.repository.list(filters, userId);
  }

  async getById(id: string, userId?: string) {
    const receipt = await this.repository.getById(id, userId);
    if (!receipt) {
      throw new HttpError(404, "Receipt not found.");
    }
    return receipt;
  }

  async update(id: string, parsed: Partial<ParsedReceipt>, userId?: string) {
    await this.getById(id, userId);
    const updated = await this.repository.update(id, parsed, userId);
    if (!updated) {
      throw new HttpError(404, "Receipt not found.");
    }
    return updated;
  }
}
