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

  async createFromUpload(file: Express.Multer.File): Promise<ReceiptRecord> {
    const processedBuffer = await this.imageService.preprocess(file.buffer);
    const imageUrl = await this.imageService.save(processedBuffer);
    const ocrResult = await this.ocrProvider.extractReceiptText(processedBuffer);

    if (!ocrResult.rawText.trim()) {
      throw new HttpError(422, "Unable to extract text from this receipt image.");
    }

    const parsed = this.extractor.parse(ocrResult);
    const status = deriveStatus(parsed);
    return this.repository.create({ imageUrl, parsed, rawOcr: ocrResult.raw, status });
  }

  async list(filters: ReceiptFilters) {
    return this.repository.list(filters);
  }

  async getById(id: string) {
    const receipt = await this.repository.getById(id);
    if (!receipt) {
      throw new HttpError(404, "Receipt not found.");
    }
    return receipt;
  }

  async update(id: string, parsed: Partial<ParsedReceipt>) {
    await this.getById(id);
    const updated = await this.repository.update(id, parsed);
    if (!updated) {
      throw new HttpError(404, "Receipt not found.");
    }
    return updated;
  }
}