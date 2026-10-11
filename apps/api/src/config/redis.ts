// Shared Redis connection (used by BullMQ in Phase 8, and later caching/rate limits).
import { Redis } from "ioredis";
import { env } from "./env.js";

export const redis = new Redis(env.REDIS_URL, {
  // Required by BullMQ: its workers use blocking commands that wait for jobs
  // indefinitely, and ioredis's default retry limit would make them throw.
  maxRetriesPerRequest: null,
});

// Without an "error" listener, a connection problem crashes the process with
// an unhandled event. ioredis reconnects on its own; we just log it.
redis.on("error", (err) => {
  console.error("[redis] connection error:", err.message);
});
