import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured.");
}

export default defineConfig({
  schema: "./src/server/db/stage-b-schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
  schemaFilter: ["dhoip"],
  strict: true,
  verbose: true,
});
