import { describe, it, expect } from "vitest";
import {
  extractTrackingNumber,
  inferCarrierFromBarcode,
  parseBarcodeTracking
} from "../src/utils/trackingNumberExtractor.js";

// GS1 group separator (0x1d) — the control char USPS labels put between the
// routing segment and the Intelligent Mail barcode. Built by char code so the
// source file carries no control-char literals.
const GS = String.fromCharCode(0x1d);

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

// Real decoded barcode payloads captured during the 2026-06-23 operator test
// (9 packages, only 2 cleanly processed). These are the regression fixtures the
// carrier-coverage fixes are built around.
describe("parseBarcodeTracking — real operator-test payloads", () => {
  it("reads Amazon Logistics (TBA + 12)", () => {
    expect(parseBarcodeTracking("TBA332095788698")).toEqual({
      carrier: "Amazon",
      trackingNumber: "TBA332095788698"
    });
  });

  it("reads UPS 1Z barcodes", () => {
    expect(parseBarcodeTracking("1Z24915X1311335644")).toEqual({
      carrier: "UPS",
      trackingNumber: "1Z24915X1311335644"
    });
    expect(parseBarcodeTracking("1ZY380860335320960")).toEqual({
      carrier: "UPS",
      trackingNumber: "1ZY380860335320960"
    });
  });

  it("reads a long USPS IMpb (34-digit, 96-prefixed)", () => {
    expect(parseBarcodeTracking("9622080430000623566000574264448501")).toEqual({
      carrier: "USPS",
      trackingNumber: "9622080430000623566000574264448501"
    });
  });

  it("recovers the USPS IMpb from a routing-prefixed payload with a GS separator", () => {
    // "420" + ZIP(78526) + GS + IMpb — must strip the routing segment.
    const raw = `42078526${GS}9261299999154920017`;
    expect(parseBarcodeTracking(raw)).toEqual({
      carrier: "USPS",
      trackingNumber: "9261299999154920017"
    });
  });

  it("REJECTS the bare '420'+ZIP routing barcode (was a false FedEx + dup)", () => {
    // The core bug: a 12-digit ZIP-routing code printed on every package to the
    // same ZIP was read as FedEx at 0.95 and collided as a duplicate.
    expect(parseBarcodeTracking("420785265129")).toBeNull();
    expect(inferCarrierFromBarcode("420785265129")).toBeNull();
  });

  it("does not treat a GS1/PDF417 data block as a tracking number", () => {
    const raw = `[)>${String.fromCharCode(0x1e)}01${GS}0278550${GS}840${GS}417`;
    expect(parseBarcodeTracking(raw)).toBeNull();
  });
});

describe("parseBarcodeTracking — carrier guards", () => {
  it("accepts a genuine 12-digit FedEx number", () => {
    expect(parseBarcodeTracking("123456789012")).toEqual({
      carrier: "FedEx",
      trackingNumber: "123456789012"
    });
  });

  it("accepts a 15-digit FedEx number", () => {
    expect(parseBarcodeTracking("123456789012345")).toEqual({
      carrier: "FedEx",
      trackingNumber: "123456789012345"
    });
  });

  it("does not misread a 12-digit USPS-prefixed number as FedEx", () => {
    expect(parseBarcodeTracking("961234567890")).toBeNull();
  });

  it("reads a 10-digit DHL number", () => {
    expect(parseBarcodeTracking("9877146308")).toEqual({
      carrier: "DHL",
      trackingNumber: "9877146308"
    });
  });

  it("returns null for empty/garbage input", () => {
    expect(parseBarcodeTracking("")).toBeNull();
    expect(parseBarcodeTracking("HELLO")).toBeNull();
  });
});

describe("extractTrackingNumber — OCR coverage additions", () => {
  it("finds an Amazon number in label text", () => {
    expect(extractTrackingNumber("SHIP TO ... TBA332095788698 ... THANKS")).toEqual({
      carrier: "Amazon",
      trackingNumber: "TBA332095788698"
    });
  });

  it("does NOT extract the '420'+ZIP routing code as FedEx", () => {
    expect(
      extractTrackingNumber("ZIP ROUTE 420785265129 BROWNSVILLE TX")
    ).toBeNull();
  });
});
