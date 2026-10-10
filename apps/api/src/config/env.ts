// Loads and validates environment variables ONCE at startup.


// Every other file imports `env` from here instead of touching process.env,
// so we get typed values (API_PORT is a number, not a string) and the server
// refuses to boot with a clear message if something is missing.
import { existsSync } from "node:fs";
import { z } from "zod";

// The .env file sits at the monorepo root. This file lives in apps/api/src/config/
// (or apps/api/dist/config/ after a build), so the root is four levels up.
// In production there is no .env file; the host provides real env vars.
const rootEnvFile = new URL("../../../../.env", import.meta.url);
if (existsSync(rootEnvFile)) process.loadEnvFile(rootEnvFile);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // z.coerce turns the string "4000" from process.env into the number 4000.
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  // The frontend's origin, used for CORS now and Socket.io in Phase 9.
  WEB_ORIGIN: z.url().default("http://localhost:5173"),
  // JWT secrets and the Gemini key get added here in the phases that use them,
  // so we never demand a value before the code actually needs it.
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast: a server with a bad config is worse than one that won't start.
  console.error("Invalid environment variables:\n" + z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
