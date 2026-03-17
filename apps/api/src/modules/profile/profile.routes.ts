import type { FastifyPluginAsync, FastifyReply } from "fastify";
import { ZodError } from "zod";

import { AuthenticationError, requireAuthenticatedUser } from "../auth/auth-session.js";
import { profilePayloadSchema } from "./profile.schemas.js";
import { getProfile, updateProfile } from "./profile.service.js";

export const profileRoutes: FastifyPluginAsync = async (app) => {
  app.get("/profile", async (request, reply) => {
    try {
      const user = await requireAuthenticatedUser(request);
      const profile = await getProfile(app.prisma, user.id);

      reply.send({ profile });
    } catch (error) {
      handleProfileRouteError(reply, error);
    }
  });

  app.put("/profile", async (request, reply) => {
    try {
      const user = await requireAuthenticatedUser(request);
      const payload = profilePayloadSchema.parse(request.body);
      const profile = await updateProfile(app.prisma, user.id, payload);

      reply.send({ profile });
    } catch (error) {
      handleProfileRouteError(reply, error);
    }
  });
};

function handleProfileRouteError(reply: FastifyReply, error: unknown) {
  if (error instanceof ZodError) {
    reply.code(400).send({
      message: "Invalid request",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof AuthenticationError) {
    reply.code(401).send({ message: error.message });
    return;
  }

  if (error instanceof Error) {
    reply.code(400).send({ message: error.message });
    return;
  }

  reply.code(500).send({ message: "Internal server error" });
}
