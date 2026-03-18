import type { FastifyPluginAsync } from "fastify";

import { handleRouteError } from "../../lib/http-errors.js";
import { requireAuthenticatedUser } from "../auth/auth-session.js";
import { profilePayloadSchema } from "./profile.schemas.js";
import { getProfile, updateProfile } from "./profile.service.js";

export const profileRoutes: FastifyPluginAsync = async (app) => {
  app.get("/profile", async (request, reply) => {
    try {
      const user = await requireAuthenticatedUser(request);
      const profile = await getProfile(app.prisma, user.id);

      reply.send({ profile });
    } catch (error) {
      handleRouteError(reply, error);
    }
  });

  app.put("/profile", async (request, reply) => {
    try {
      const user = await requireAuthenticatedUser(request);
      const payload = profilePayloadSchema.parse(request.body);
      const profile = await updateProfile(app.prisma, user.id, payload);

      reply.send({ profile });
    } catch (error) {
      handleRouteError(reply, error);
    }
  });
};
