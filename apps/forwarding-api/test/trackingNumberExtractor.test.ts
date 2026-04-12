import { describe, it, expect } from "vitest";
import {
  extractTrackingNumber,
  inferCarrierFromBarcode
} from "../src/utils/trackingNumberExtractor.js";

describe("extractTrackingNumber", () => {
  it("detects a UPS tracking number", () => {
    const text = "SHIP TO\nJOHN SMITH\n1Z 999A A1 0123 4567 84\nNEXT DAY AIR";
    const result = extractTrackingNumber(text);
    expect(result?.carrier).toBe("UPS");
    expect(result?.trackingNumber).toBe("1Z999AA10123456784");
  });

  it("detects a UPS tracking number without spaces", () => {
    const result = extractTrackingNumber("TRK 1Z999AA10123456784 STATUS: OK");
    expect(result?.carrier).toBe("UPS");
    expect(result?.trackingNumber).toBe("1Z999AA10123456784");
  });

  it("detects a USPS 22-digit tracking number", () => {
    const result = extractTrackingNumber("USPS TRACKING #\n9400 1111 2022 2000 0000 12");
    expect(result?.carrier).toBe("USPS");
    expect(result?.trackingNumber).toContain("9400");
  });

  it("detects a FedEx 12-digit tracking number", () => {
    const result = extractTrackingNumber("TRACKING\n123456789012\nFEDEX GROUND");
    expect(result?.carrier).toBe("FedEx");
    expect(result?.trackingNumber).toBe("123456789012");
  });

  it("detects a DHL 10-digit tracking number", () => {
    const result = extractTrackingNumber("WAYBILL\n1234567890\nDHL EXPRESS");
    expect(result?.carrier).toBe("DHL");
    expect(result?.trackingNumber).toBe("1234567890");
  });

  it("returns null for text with no tracking number", () => {
    expect(extractTrackingNumber("Just some random receipt text")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(extractTrackingNumber("")).toBeNull();
  });

  it("prefers UPS over FedEx when both patterns match", () => {
    // UPS rule is listed first in CARRIER_PATTERNS.
    const text = "1Z999AA10123456784 and 123456789012";
    const result = extractTrackingNumber(text);
    expect(result?.carrier).toBe("UPS");
  });

  it("doesn't misread a USPS number as FedEx", () => {
    const text = "9400111120222000000012";
    const result = extractTrackingNumber(text);
    expect(result?.carrier).toBe("USPS");
  });
});

describe("inferCarrierFromBarcode", () => {
  it("identifies UPS barcode format", () => {
    expect(inferCarrierFromBarcode("1Z999AA10123456784")).toBe("UPS");
  });

  it("identifies USPS barcode format", () => {
    expect(inferCarrierFromBarcode("9400111120222000000012")).toBe("USPS");
  });

  it("identifies FedEx 12-digit format", () => {
    expect(inferCarrierFromBarcode("123456789012")).toBe("FedEx");
  });

  it("identifies DHL 10-digit format", () => {
    expect(inferCarrierFromBarcode("1234567890")).toBe("DHL");
  });

  it("returns null for unknown format", () => {
    expect(inferCarrierFromBarcode("ABCDEF")).toBeNull();
  });
});
