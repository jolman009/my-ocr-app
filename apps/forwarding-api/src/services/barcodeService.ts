import { readBarcodesFromImageFile } from "zxing-wasm/reader";

/**
 * Reads barcodes/QR codes from an image buffer using zxing-wasm.
 * Returns the first valid decode result, or null if no barcode is found.
 *
 * Tuned for shipping labels — Code128 is by far the most common on UPS,
 * USPS, and FedEx labels. QRCode covers DHL/Amazon, DataMatrix covers
 * some carrier internal codes. PDF417 covers some USPS tracking blocks.
 */

const SHIPPING_FORMATS = [
  "Code128",
  "QRCode",
  "DataMatrix",
  "Code39",
  "EAN-13",
  "PDF417"
] as const;

export interface BarcodeDecode {
  raw: string;
  format: string;
}

export class BarcodeService {
  async decode(buffer: Buffer): Promise<BarcodeDecode | null> {
    try {
      // zxing-wasm wants a Blob. Node 18+ has native Blob.
      const blob = new Blob([new Uint8Array(buffer)]);
      const results = await readBarcodesFromImageFile(blob, {
        formats: [...SHIPPING_FORMATS],
        tryInvert: true,
        tryRotate: true,
        returnErrors: false
      });

      const valid = results.find((result) => result.isValid && result.text);
      if (!valid) {
        return null;
      }

      return {
        raw: valid.text,
        format: valid.format
      };
    } catch (error) {
      // Wasm init failures, corrupted images, etc. — treat as "no barcode"
      // so the upstream pipeline falls back to OCR extraction. Log in dev
      // so recurring decode failures are visible.
      if (process.env.NODE_ENV !== "production") {
        console.warn("[barcode] decode error:", error instanceof Error ? error.message : error);
      }
      return null;
    }
  }
}
