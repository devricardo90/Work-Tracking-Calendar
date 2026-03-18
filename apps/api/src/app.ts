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
    logger: config.NODE_ENV !== "test",
  });

  app.decorate("config", config);
  app.decorate("prisma", prisma);

  await app.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(jwt, {
    secret: config.JWT_SECRET,
  });

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

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  await app.register(entryRoutes);
  await app.register(profileRoutes);
  await app.register(reportRoutes);
  await app.register(authRoutes);

  return app;
}
