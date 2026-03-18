import type { FastifyPluginAsync } from "fastify";

import { handleRouteError } from "../../lib/http-errors.js";
import { enforceReportRateLimit } from "../../lib/report-rate-limit.js";
import { requireAuthenticatedUser } from "../auth/auth-session.js";
import { monthlyReportEmailPayloadSchema, monthlyReportQuerySchema } from "./report.schemas.js";
import { generateMonthlyPdfReport, sendMonthlyPdfReportByEmail } from "./report.service.js";

export const reportRoutes: FastifyPluginAsync = async (app) => {
  app.get("/reports/monthly.pdf", async (request, reply) => {
    try {
      const user = await requireAuthenticatedUser(request);
      enforceReportRateLimit(user.id, "pdf");
      const query = monthlyReportQuerySchema.parse(request.query);
      const report = await generateMonthlyPdfReport(app.prisma, user.id, query.month);

      reply
        .header("Content-Type", "application/pdf")
        .header("Content-Disposition", `inline; filename="${report.fileName}"`)
        .send(report.pdf);
    } catch (error) {
      handleRouteError(reply, error);
    }
  });

  app.post("/reports/monthly/email", async (request, reply) => {
    try {
      const user = await requireAuthenticatedUser(request);
      enforceReportRateLimit(user.id, "email");
      const payload = monthlyReportEmailPayloadSchema.parse(request.body);
      const result = await sendMonthlyPdfReportByEmail(app.prisma, user.id, payload);

      reply.send(result);
    } catch (error) {
      handleRouteError(reply, error);
    }
  });
};
