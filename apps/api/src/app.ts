// Builds and configures the Express app, WITHOUT starting it.
// Keeping this separate from index.ts (which calls listen) lets the
// integration tests in Phase 13 import the app and send it fake requests.
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { healthRouter } from "./routes/health.js";

export const app = express();

// --- Global middleware (runs for every request, in this order) ---
app.use(helmet()); // sets security-related HTTP headers
// Only our own frontend may call this API from a browser. `credentials`
// lets the browser send cookies (needed for the refresh token in Phase 4).
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
// Parse JSON bodies into req.body. Raised from the 100kb default because a
// long meeting transcript can be a few hundred KB.
app.use(express.json({ limit: "1mb" }));

// --- Routes ---
app.use("/health", healthRouter);
// Later phases add: /api/auth, /api/workspaces, /api/meetings, /api/tasks ...

// --- Error handling (must be registered LAST) ---
app.use(notFoundHandler);
app.use(errorHandler);
