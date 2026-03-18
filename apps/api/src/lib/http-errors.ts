import { Prisma } from "@prisma/client";
import type { FastifyReply } from "fastify";
import { ZodError } from "zod";

import { MailerConfigurationError } from "./mailer.js";
import { ReportRateLimitError } from "./report-rate-limit.js";
import { AuthenticationError } from "../modules/auth/auth-session.js";
import { EntryConflictError, EntryNotFoundError } from "../modules/entries/entry.service.js";

export type RouteIssue = {
  path: string;
  message: string;
};

type ErrorResponsePayload = {
  message: string;
  code?: string;
  issues?: RouteIssue[];
};

function sendError(reply: FastifyReply, statusCode: number, payload: ErrorResponsePayload) {
  reply.code(statusCode).send(payload);
}

export function handleRouteError(reply: FastifyReply, error: unknown) {
  if (error instanceof ZodError) {
    sendError(reply, 400, {
      message: "Invalid request",
      code: "INVALID_REQUEST",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof AuthenticationError) {
    sendError(reply, 401, {
      message: error.message,
      code: "AUTHENTICATION_REQUIRED",
    });
    return;
  }

  if (error instanceof EntryConflictError) {
    sendError(reply, 409, {
      message: error.message,
      code: "ENTRY_CONFLICT",
    });
    return;
  }

  if (error instanceof EntryNotFoundError) {
    sendError(reply, 404, {
      message: error.message,
      code: "ENTRY_NOT_FOUND",
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    sendError(reply, 404, {
      message: "Resource not found",
      code: "RESOURCE_NOT_FOUND",
    });
    return;
  }

  if (error instanceof MailerConfigurationError) {
    sendError(reply, 503, {
      message: error.message,
      code: "EMAIL_NOT_CONFIGURED",
    });
    return;
  }

  if (error instanceof ReportRateLimitError) {
    sendError(reply, 429, {
      message: error.message,
      code: "REPORT_RATE_LIMITED",
    });
    return;
  }

  if (error instanceof Error) {
    reply.log.error(error);
  } else {
    reply.log.error({ error }, "Unknown route error");
  }

  sendError(reply, 500, {
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
}
