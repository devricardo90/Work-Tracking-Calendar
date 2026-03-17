import { z } from "zod";

const optionalEnvString = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : undefined))
  .optional();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  CORS_ORIGIN: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: optionalEnvString,
  GOOGLE_CLIENT_SECRET: optionalEnvString,
  DEFAULT_USER_NAME: z.string().min(1).default("Worker Hours User"),
  DEFAULT_USER_EMAIL: z.email().default("worker@example.com"),
  DEFAULT_USER_LANGUAGE: z.string().min(2).max(10).default("en"),
});

export type AppConfig = z.infer<typeof envSchema>;

export function getConfig(): AppConfig {
  return envSchema.parse(process.env);
}
