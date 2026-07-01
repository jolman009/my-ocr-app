import { describe, it, expect, vi } from "vitest";
import { ShipmentDocumentService } from "../src/services/shipmentDocumentService.js";
import { HttpError } from "../src/utils/httpError.js";

// Batch upload (#23) orchestration lives in createBatchFromUploads, which just
// loops over createFromUpload. We stub createFromUpload directly so these tests
// stay focused on batch semantics (ordering, per-file isolation, mime gating,
// summary counts) without wiring the full barcode/OCR/storage stack.
const makeService = () =>
  new ShipmentDocumentService(
    null as never,
    null as never,
    null as never,
    null as never,
    null as never,
    null as never,
    null as never,
    null as never
  );

const file = (originalname: string, mimetype = "image/png"): Express.Multer.File =>
  ({ originalname, mimetype, buffer: Buffer.from("x") }) as Express.Multer.File;

describe("ShipmentDocumentService.createBatchFromUploads (#23)", () => {
  it("processes every file and reports a per-file document + summary", async () => {
    const service = makeService();
    const spy = vi
      .spyOn(service, "createFromUpload")
      .mockImplementation(async ({ file: f }) => ({ id: `doc-${f.originalname}` }) as never);

    const result = await service.createBatchFromUploads({
      files: [file("a.png"), file("b.png")],
      organizationId: "org1",
      uploadedById: "u1"
    });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(result.summary).toEqual({ total: 2, succeeded: 2, failed: 0 });
    expect(result.results.map((r) => r.document?.id)).toEqual(["doc-a.png", "doc-b.png"]);
    expect(result.results.every((r) => r.error === null)).toBe(true);
    // Order + index are preserved.
    expect(result.results.map((r) => r.index)).toEqual([0, 1]);
  });

  it("isolates a failing file — the rest of the batch still processes", async () => {
    const service = makeService();
    vi.spyOn(service, "createFromUpload").mockImplementation(async ({ file: f }) => {
      if (f.originalname === "bad.png") throw new HttpError(422, "PDF has no extractable text.");
      return { id: `doc-${f.originalname}` } as never;
    });

    const result = await service.createBatchFromUploads({
      files: [file("a.png"), file("bad.png"), file("c.png")],
      organizationId: "org1",
      uploadedById: "u1"
    });

    expect(result.summary).toEqual({ total: 3, succeeded: 2, failed: 1 });
    expect(result.results[1]).toMatchObject({
      index: 1,
      filename: "bad.png",
      document: null,
      error: "PDF has no extractable text."
    });
    expect(result.results[0].document?.id).toBe("doc-a.png");
    expect(result.results[2].document?.id).toBe("doc-c.png");
  });

  it("rejects an unsupported mime type without invoking the pipeline", async () => {
    const service = makeService();
    const spy = vi
      .spyOn(service, "createFromUpload")
      .mockResolvedValue({ id: "doc" } as never);

    const result = await service.createBatchFromUploads({
      files: [file("notes.txt", "text/plain"), file("ok.png")],
      organizationId: "org1",
      uploadedById: "u1"
    });

    expect(result.summary).toEqual({ total: 2, succeeded: 1, failed: 1 });
    expect(result.results[0]).toMatchObject({
      filename: "notes.txt",
      document: null,
      error: "Unsupported file type: text/plain."
    });
    // The pipeline only ran for the valid file.
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0].file.originalname).toBe("ok.png");
  });

  it("masks unexpected (non-HttpError) failures behind a generic message", async () => {
    const service = makeService();
    vi.spyOn(service, "createFromUpload").mockRejectedValue(new Error("db exploded"));

    const result = await service.createBatchFromUploads({
      files: [file("a.png")],
      organizationId: "org1",
      uploadedById: "u1"
    });

    expect(result.results[0].error).toBe("Failed to process file.");
    expect(result.results[0].error).not.toContain("db exploded");
  });

  it("falls back to a positional filename when originalname is empty", async () => {
    const service = makeService();
    vi.spyOn(service, "createFromUpload").mockResolvedValue({ id: "doc" } as never);

    const result = await service.createBatchFromUploads({
      files: [file("")],
      organizationId: "org1",
      uploadedById: "u1"
    });

    expect(result.results[0].filename).toBe("file-1");
  });
});
