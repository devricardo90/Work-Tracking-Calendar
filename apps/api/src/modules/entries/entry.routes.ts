import type { FastifyPluginAsync } from "fastify";
import { ZodError } from "zod";

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
      const query = monthQuerySchema.parse(request.query);
      const entries = await listEntriesByMonth(app.prisma, app.config, query.month);

      reply.send({ entries });
    } catch (error) {
      handleRouteError(reply, error);
    }
  });

  app.get("/entries/:workDate", async (request, reply) => {
    try {
      const params = dateParamSchema.parse(request.params);
      const entry = await getEntryByDate(app.prisma, app.config, params.workDate);

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
      const payload = entryPayloadSchema.parse(request.body);
      const entry = await createEntry(app.prisma, app.config, payload);

      reply.code(201).send({ entry });
    } catch (error) {
      handleRouteError(reply, error);
    }
  });

  app.put("/entries/:id", async (request, reply) => {
    try {
      const params = idParamSchema.parse(request.params);
      const payload = entryPayloadSchema.parse(request.body);
      const entry = await updateEntry(app.prisma, app.config, params.id, payload);

      reply.send({ entry });
    } catch (error) {
      handleRouteError(reply, error);
    }
  });

  app.delete("/entries/:id", async (request, reply) => {
    try {
      const params = idParamSchema.parse(request.params);
      await deleteEntry(app.prisma, app.config, params.id);

      reply.code(204).send();
    } catch (error) {
      handleRouteError(reply, error);
    }
  });
};

function handleRouteError(reply: { code: (statusCode: number) => any }, error: unknown) {
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
