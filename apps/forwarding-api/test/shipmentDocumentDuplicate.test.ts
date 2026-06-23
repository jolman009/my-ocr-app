import { describe, it, expect, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { ShipmentDocumentService } from "../src/services/shipmentDocumentService.js";
import { HttpError } from "../src/utils/httpError.js";

// The dedup guard (#21) lives in update()'s error translation. We exercise it
// with a stubbed repository — the other constructor deps aren't touched on this
// path, so passing null is safe.
const makeService = (repo: unknown) =>
  new ShipmentDocumentService(
    repo as never,
    null as never,
    null as never,
    null as never,
    null as never,
    null as never,
    null as never,
    null as never
  );

const existingDoc = {
  id: "d1",
  organizationId: "org1",
  trackingNumber: "1Z999AA10123456784",
  status: "needs_review"
} as never;

const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError("duplicate key value", {
    code: "P2002",
    clientVersion: "6.19.2"
  });

describe("ShipmentDocumentService.update — duplicate accept guard (#21)", () => {
  it("translates a unique-constraint violation into a 409", async () => {
    const repo = {
      findById: vi.fn().mockResolvedValue(existingDoc),
      update: vi.fn().mockRejectedValue(uniqueViolation())
    };
    const service = makeService(repo);

    await expect(
      service.update("d1", "org1", { status: "processed" }, "u1")
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(repo.update).toHaveBeenCalledOnce();
  });

  it("propagates non-unique errors unchanged", async () => {
    const boom = new Error("connection reset");
    const repo = {
      findById: vi.fn().mockResolvedValue(existingDoc),
      update: vi.fn().mockRejectedValue(boom)
    };
    const service = makeService(repo);

    await expect(
      service.update("d1", "org1", { status: "processed" }, "u1")
    ).rejects.toBe(boom);
  });

  it("returns the updated document when there is no conflict", async () => {
    const updated = { ...(existingDoc as object), status: "processed" };
    const repo = {
      findById: vi.fn().mockResolvedValue(existingDoc),
      update: vi.fn().mockResolvedValue(updated)
    };
    const service = makeService(repo);

    const result = await service.update("d1", "org1", { status: "processed" }, "u1");
    expect(result).toBe(updated);
  });

  it("rejects with a 404 (not a 409) when the document is missing", async () => {
    const repo = {
      findById: vi.fn().mockResolvedValue(null),
      update: vi.fn()
    };
    const service = makeService(repo);

    await expect(
      service.update("missing", "org1", { status: "processed" }, "u1")
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(repo.update).not.toHaveBeenCalled();
  });
});

// Sanity: HttpError carries statusCode (the property the matchers above rely on).
describe("HttpError", () => {
  it("exposes statusCode", () => {
    expect(new HttpError(409, "x").statusCode).toBe(409);
  });
});
