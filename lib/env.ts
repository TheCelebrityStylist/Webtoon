import { z } from "zod";

const postgresUrl = z.string().url().refine(
  (value) => value.startsWith("postgres://") || value.startsWith("postgresql://"),
  "Expected a PostgreSQL connection URL",
);

const schema = z.object({
  DATABASE_URL: postgresUrl,
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = schema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
