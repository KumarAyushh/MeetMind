// AppError = an error we throw ON PURPOSE, carrying the HTTP status to send.
// Route code can just write `throw AppError.notFound("Meeting not found")`
// and the error handler middleware turns it into a JSON response.
// Anything that is NOT an AppError is treated as an unexpected bug (500).
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    // A stable, machine-readable code the frontend can switch on,
    // e.g. "NOT_FOUND". `message` is the human-readable text.
    public readonly code: string,
    message: string,
    // Optional extra info, e.g. which form fields failed validation.
    public readonly details?: unknown,
  ) {
    super(message);
    //this.name = "AppError" so that when our custom error is 
    // logged or inspected, it identifies itself as an AppError instead of the generic Error.
    this.name = "AppError";
  }

  // Shortcuts for the most common cases.
  static badRequest(message: string, details?: unknown) {
    return new AppError(400, "BAD_REQUEST", message, details);
  }
  static unauthorized(message = "Authentication required") {
    return new AppError(401, "UNAUTHORIZED", message);
  }
  static forbidden(message = "You do not have access to this resource") {
    return new AppError(403, "FORBIDDEN", message);
  }
  static notFound(message = "Resource not found") {
    return new AppError(404, "NOT_FOUND", message);
  }
  static conflict(message: string) {
    return new AppError(409, "CONFLICT", message);
  }
}
