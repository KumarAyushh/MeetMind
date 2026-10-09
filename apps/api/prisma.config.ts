// Prisma CLI configuration (Prisma 7+). The CLI reads this file for commands
// like `prisma migrate dev` and `prisma generate`.

// This file is outside tsconfig.json's "include" (which only covers src/), so
// the editor checks it with default settings that don't load Node's types.
// This directive loads them, so `process` and `node:fs` are recognised.
/// <reference types="node" />
import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Our single .env lives at the monorepo root, not in apps/api, so load it
// explicitly. In production there is no file; the host sets real env vars.
const rootEnvFile = new URL("../../.env", import.meta.url);
if (existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Plain process.env (not Prisma's env() helper, which throws when unset)
    // so `prisma generate` still works in CI where no database exists.
    url: process.env["DATABASE_URL"],
  },
});
