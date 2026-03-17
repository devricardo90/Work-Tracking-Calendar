import type { FastifyPluginAsync, FastifyReply } from "fastify";
import { ZodError } from "zod";

import { AuthenticationError, requireAuthenticatedUser } from "../auth/auth-session.js";
import {
  createEntry,
  deleteEntry,
  EntryConflictError,
  EntryNotFoundError,
  getEntryByDate,
  listEntriesByMonth,
  updateEntry,
} from "./entry.service.js";
import {
  dateParamSchema,
  entryPayloadSchema,
  idParamSchema,
  monthQuerySchema,
} from "./entry.schemas.js";

export const entryRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (_request, reply) => {
    reply.send({
      message: "Worker Hours API",
      docs: "/docs",
    });
  });

  app.get("/health", async () => {
    await app.prisma.$queryRaw`SELECT 1`;

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  });

  app.get("/entries", async (request, reply) => {
    try {
      const user = await requireAuthenticatedUser(request);
      const query = monthQuerySchema.parse(request.query);
      const entries = await listEntriesByMonth(app.prisma, user.id, query.month);

      reply.send({ entries });
    } catch (error) {
      handleRouteError(reply, error);
    }
  });

  app.get("/entries/:workDate", async (request, reply) => {
    try {
      const user = await requireAuthenticatedUser(request);
      const params = dateParamSchema.parse(request.params);
      const entry = await getEntryByDate(app.prisma, user.id, params.workDate);

      if (!entry) {
        reply.code(404).send({ message: "Entry not found" });
        return;
      }

      reply.send({ entry });
    } catch (error) {
      handleRouteError(reply, error);
    }
  });

  app.post("/entries", async (request, reply) => {
    try {
      const user = await requireAuthenticatedUser(request);
      const payload = entryPayloadSchema.parse(request.body);
      const entry = await createEntry(app.prisma, user.id, payload);

      reply.code(201).send({ entry });
    } catch (error) {
      handleRouteError(reply, error);
    }
  });

  app.put("/entries/:id", async (request, reply) => {
    try {
      const user = await requireAuthenticatedUser(request);
      const params = idParamSchema.parse(request.params);
      const payload = entryPayloadSchema.parse(request.body);
      const entry = await updateEntry(app.prisma, user.id, params.id, payload);

      reply.send({ entry });
    } catch (error) {
      handleRouteError(reply, error);
    }
  });

  app.delete("/entries/:id", async (request, reply) => {
    try {
      const user = await requireAuthenticatedUser(request);
      const params = idParamSchema.parse(request.params);
      await deleteEntry(app.prisma, user.id, params.id);

      reply.code(204).send();
    } catch (error) {
      handleRouteError(reply, error);
    }
  });
};

function handleRouteError(reply: FastifyReply, error: unknown) {
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

  if (error instanceof EntryConflictError) {
    reply.code(409).send({ message: error.message });
    return;
  }

  if (error instanceof EntryNotFoundError) {
    reply.code(404).send({ message: error.message });
    return;
  }

  if (error instanceof Error) {
    reply.code(400).send({ message: error.message });
    return;
  }

  reply.code(500).send({ message: "Internal server error" });
}
