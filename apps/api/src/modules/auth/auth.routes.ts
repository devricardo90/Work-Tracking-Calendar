import type { FastifyPluginAsync } from "fastify";
import { toNodeHandler } from "better-auth/node";

import { auth } from "../../../auth.js";

const authHandler = toNodeHandler(auth);

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.all("/api/auth", async (request, reply) => {
    reply.hijack();
    await authHandler(request.raw, reply.raw);
  });

  app.all("/api/auth/*", async (request, reply) => {
    reply.hijack();
    await authHandler(request.raw, reply.raw);
  });
};
