// The one PrismaClient for the whole app (a "singleton").
// Each PrismaClient owns a pool of database connections, so creating one per
// request would quickly exhaust Postgres. ES modules are only evaluated once,
// so every `import { prisma }` gets this same instance.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env, isProduction } from "./env.js";

// Prisma 7 talks to Postgres through a "driver adapter": the standard `pg`
// driver does the networking, Prisma builds the queries and types.
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  // Print every SQL query in development (handy for learning what Prisma does).
  log: isProduction ? ["error"] : ["query", "warn", "error"],
});
