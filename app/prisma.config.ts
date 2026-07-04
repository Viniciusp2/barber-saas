import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    // O CLI (migrate/introspect) precisa da conexão direta/session-mode;
    // o runtime da aplicação usa o pooler (DATABASE_URL) via driver adapter em src/lib/prisma.ts.
    url: env("DIRECT_URL"),
  },
});
