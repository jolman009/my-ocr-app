import { Prisma } from "@prisma/client";

/**
 * True when the error is a Prisma unique-constraint violation (P2002). Used to
 * translate the duplicate-tracking partial unique index into a friendly 409
 * instead of an opaque 500 (#21).
 */
export const isUniqueConstraintError = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
