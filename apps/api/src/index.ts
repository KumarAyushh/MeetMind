// Entry point: starts the HTTP server and shuts it down cleanly.
// Folder layout inside src/:
//   config/      env validation + Prisma and Redis clients
//   routes/      HTTP endpoints (auth, workspaces, meetings, tasks, search)
//   services/    business logic (member resolution, RAG, digest)
//   workers/     BullMQ workers that run AI extraction in the background
//   lib/         small helpers (AppError) and later the LLM + Socket.io clients
//   middleware/  auth checks, workspace-role checks, error handling
//   generated/   Prisma client output (git-ignored; rebuilt by `prisma generate`)
import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { redis } from "./config/redis.js";

const server = app.listen(env.API_PORT, () => {
  console.log(`API listening on http://localhost:${env.API_PORT} (${env.NODE_ENV})`);
});

// Graceful shutdown: on Ctrl+C (SIGINT) or a stop signal from Docker or the
// hosting platform (SIGTERM), stop accepting new requests, let in-flight ones
// finish, then close the DB and Redis connections so nothing is left half-done.
async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  });
  // If something hangs (e.g. a slow request), force-exit after 10 seconds.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
