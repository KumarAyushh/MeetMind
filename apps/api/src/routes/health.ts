// GET /health: reports whether the API can reach its dependencies.
// Useful while developing and later for deployment platforms, which poll a
// health URL to decide whether the server is up.
import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { redis } from "../config/redis.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  // Check both services at the same time. allSettled (unlike Promise.all)
  // waits for both even if one fails, so we can report each one separately.
  const [db, cache] = await Promise.allSettled([
    withTimeout(prisma.$queryRaw`SELECT 1`), // cheapest possible query
    withTimeout(redis.ping()),
  ]);

  const status = {
    database: db.status === "fulfilled" ? "up" : "down",
    redis: cache.status === "fulfilled" ? "up" : "down",
  };
  const healthy = status.database === "up" && status.redis === "up";

  // 503 = "Service Unavailable": the server runs but can't do its job.
  res.status(healthy ? 200 : 503).json({ status: healthy ? "ok" : "degraded", ...status });
});

// Rejects if `promise` takes longer than `ms`. Needed because our Redis client
// (maxRetriesPerRequest: null, for BullMQ) holds commands until Redis comes
// back, so a ping to a dead Redis would otherwise never settle.
function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms).unref()),
  ]);
}
