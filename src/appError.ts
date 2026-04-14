import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode = 400,
    public readonly code = "BAD_REQUEST",
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
  }
}

export function apiErrorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      details: err.details
    });
    return;
  }
  res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: "Unexpected server error" });
}
