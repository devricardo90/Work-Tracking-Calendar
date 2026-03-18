import { z } from "zod";

export const entryPayloadSchema = z.object({
  workDate: z.string(),
  hoursWorked: z.coerce.number().positive().max(24),
  location: z.string().trim().min(2).max(120),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const monthQuerySchema = z.object({
  month: z.string(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const dateParamSchema = z.object({
  workDate: z.string(),
});

export type EntryPayload = z.infer<typeof entryPayloadSchema>;
