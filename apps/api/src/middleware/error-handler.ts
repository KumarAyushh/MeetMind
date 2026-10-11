// Central place where every error becomes an HTTP response.
// Every error response has the same shape, so the frontend handles errors one way:
//   { "error": { "code": "NOT_FOUND", "message": "...", "details": ... } }
import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError, z } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../lib/app-error.js";
import { isProduction } from "../config/env.js";

// Runs when no route matched the request.
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.path} not found`));
};

// Express recognises an error handler by its FOUR parameters (err, req, res, next).
// In Express 5, errors thrown inside async route handlers are forwarded here
// automatically; no try/catch is needed in every route.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const appError = toAppError(err);

  // Only log real bugs. 4xx errors are expected (bad input, missing auth, ...).
  if (appError.statusCode >= 500) console.error(err);

  res.status(appError.statusCode).json({
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details !== undefined && { details: appError.details }),
    },
  });
};

// Converts any thrown value into an AppError.
function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  // Request body/params failed a Zod schema.
  if (err instanceof ZodError) {
    return AppError.badRequest("Validation failed", z.flattenError(err).fieldErrors);
  }

  // Well-known database errors that are really the client's fault.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return AppError.conflict("A record with this value already exists");
    if (err.code === "P2025") return AppError.notFound("Record not found");
  }

  // express.json() throws this when the request body isn't valid JSON.
  if (err instanceof SyntaxError && "body" in err) {
    return AppError.badRequest("Malformed JSON in request body");
  }

  // Unknown error: a bug. Hide the internal message in production so we
  // don't leak details (SQL, file paths) to users.
  const message = !isProduction && err instanceof Error ? err.message : "Something went wrong";
  return new AppError(500, "INTERNAL_SERVER_ERROR", message);
}
