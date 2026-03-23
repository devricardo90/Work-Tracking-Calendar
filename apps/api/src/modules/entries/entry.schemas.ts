import { z } from "zod";

export const entryStatusSchema = z.enum(["worked", "day-off", "no-work"]);

export const entryPayloadSchema = z
  .object({
    workDate: z.string(),
    entryStatus: entryStatusSchema,
    hoursWorked: z.coerce.number().min(0).max(24),
    location: z.string().trim().max(120).optional().or(z.literal("")),
    latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
    longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
    notes: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (value.entryStatus === "worked") {
      if (value.hoursWorked <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hoursWorked"],
          message: "Hours worked must be greater than 0.",
        });
      }

      if (!value.location || value.location.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["location"],
          message: "Location must have at least 2 characters.",
        });
      }
    } else {
      if (value.hoursWorked !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hoursWorked"],
          message: "Non-working days must use 0 hours.",
        });
      }
    }
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
