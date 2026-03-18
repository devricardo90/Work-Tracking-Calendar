import { z } from "zod";

export const monthlyReportQuerySchema = z.object({
  month: z.string(),
});

export const monthlyReportEmailPayloadSchema = z.object({
  month: z.string(),
  email: z.email(),
});

export type MonthlyReportQuery = z.infer<typeof monthlyReportQuerySchema>;
export type MonthlyReportEmailPayload = z.infer<typeof monthlyReportEmailPayloadSchema>;
