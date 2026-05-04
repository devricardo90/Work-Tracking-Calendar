import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { loadLocalEnv } from "./src/load-env.js";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL ?? "";
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3333/api/auth",
  secret:
    process.env.BETTER_AUTH_SECRET ?? "change-this-secret-to-a-long-random-string",
  trustedOrigins: [process.env.CORS_ORIGIN ?? "http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
    customRules: {
      "/sign-in/*": {
        window: 60,
        max: 5,
      },
      "/sign-up/*": {
        window: 60,
        max: 3,
      },
      "/sign-in/social": {
        window: 60,
        max: 5,
      },
    },
  },
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},
  user: {
    additionalFields: {
      language: {
        type: "string",
        required: false,
        defaultValue: process.env.DEFAULT_USER_LANGUAGE ?? "en",
      },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export default auth;
