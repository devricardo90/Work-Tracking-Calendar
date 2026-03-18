import type { FastifyPluginAsync, FastifyReply } from "fastify";
import { toNodeHandler } from "better-auth/node";

import { auth } from "../../../auth.js";

const authHandler = toNodeHandler(auth);

export const authRoutes: FastifyPluginAsync = async (app) => {
  const setCorsHeaders = (reply: FastifyReply) => {
    reply.raw.setHeader("Access-Control-Allow-Origin", app.config.CORS_ORIGIN);
    reply.raw.setHeader("Access-Control-Allow-Credentials", "true");
  };

  app.all("/api/auth", async (request, reply) => {
    setCorsHeaders(reply);
    Object.assign(request.raw, {
      body: request.body,
    });
    reply.hijack();
    await authHandler(request.raw, reply.raw);
  });

  app.all("/api/auth/*", async (request, reply) => {
    setCorsHeaders(reply);
    Object.assign(request.raw, {
      body: request.body,
    });
    reply.hijack();
    await authHandler(request.raw, reply.raw);
  });
};
