import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError.js";

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message, details: error.details });
    return;
  }

  if (error instanceof Error && "name" in error && error.name === "ZodError") {
    res.status(400).json({ message: "Invalid request payload.", details: error });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error." });
};
