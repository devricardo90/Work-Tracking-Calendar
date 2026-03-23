import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import apiReference from "@scalar/fastify-api-reference";

import { getConfig } from "./config.js";
import { createPrismaClient, type AppPrismaClient } from "./lib/prisma.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { entryRoutes } from "./modules/entries/entry.routes.js";
import { profileRoutes } from "./modules/profile/profile.routes.js";
import { reportRoutes } from "./modules/reports/report.routes.js";

declare module "fastify" {
  interface FastifyInstance {
    config: ReturnType<typeof getConfig>;
    prisma: AppPrismaClient;
  }
}

export async function buildApp() {
  const config = getConfig();
  const prisma = createPrismaClient(config.DATABASE_URL);
  const app = fastify({
    logger:
      config.NODE_ENV === "test"
        ? false
        : {
            redact: {
              censor: "[REDACTED]",
              paths: [
                "req.headers.authorization",
                "req.headers.cookie",
                "req.headers.set-cookie",
                "req.body.password",
                "req.body.newPassword",
                "req.body.currentPassword",
                "req.body.token",
                "req.body.refreshToken",
                "req.body.idToken",
                "res.headers.set-cookie",
              ],
            },
          },
  });

  app.decorate("config", config);
  app.decorate("prisma", prisma);

  app.get("/config/status", async () => {
    return {
      auth: {
        emailPassword: true,
        google: Boolean(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET),
      },
      reports: {
        email: Boolean(config.SMTP_HOST && config.SMTP_PORT && config.SMTP_FROM),
      },
    };
  });

  await app.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(jwt, {
    secret: config.JWT_SECRET,
  });

  const docsEnabled = config.API_DOCS_ENABLED ?? config.NODE_ENV !== "production";

  if (docsEnabled) {
    await app.register(swagger, {
      openapi: {
        info: {
          title: "Worker Hours API",
          version: "1.0.0",
        },
        servers: [
          {
            url: `http://localhost:${config.PORT}`,
            description: "Local API",
          },
        ],
      },
    });

    await app.register(apiReference, {
      routePrefix: "/docs/api",
      configuration: {
        title: "Worker Hours API",
        theme: "kepler",
      },
    });
  }

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (reply.sent) {
      return;
    }

    reply.code(500).send({
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  await app.register(entryRoutes);
  await app.register(profileRoutes);
  await app.register(reportRoutes);
  await app.register(authRoutes);

  return app;
}
