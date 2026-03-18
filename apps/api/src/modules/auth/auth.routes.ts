import type { FastifyPluginAsync } from "fastify";
import { toNodeHandler } from "better-auth/node";

import { auth } from "../../../auth.js";

const authHandler = toNodeHandler(auth);

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.all("/api/auth", async (request, reply) => {
    // Fastify may already have consumed the raw request stream for parsed bodies.
    // Expose the parsed body on the raw request so Better Auth can build the Request.
    Object.assign(request.raw, {
      body: request.body,
    });
    reply.hijack();
    await authHandler(request.raw, reply.raw);
  });

  app.all("/api/auth/*", async (request, reply) => {
    Object.assign(request.raw, {
      body: request.body,
    });
    reply.hijack();
    await authHandler(request.raw, reply.raw);
  });
};
