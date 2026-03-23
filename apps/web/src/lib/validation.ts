import { z } from "zod";

export const authNameSchema = z.string().trim().min(2, "Name must have at least 2 characters.").max(120);

export const signInFormSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must have at least 8 characters.").max(128),
});

export const reportRecipientSchema = z.email("Enter a valid recipient email address.");

export const signUpFormSchema = signInFormSchema.extend({
  name: authNameSchema,
});

export const profileLanguageSchema = z.enum(["en", "pt-BR", "es"]);

export const savedLocationSchema = z
  .string()
  .trim()
  .min(2, "Location must have at least 2 characters.")
  .max(120, "Location must have at most 120 characters.");

export const entryStatusSchema = z.enum(["worked", "day-off", "no-work"]);

export const profileFormSchema = z.object({
  name: authNameSchema,
  language: profileLanguageSchema,
  savedLocations: z
    .array(savedLocationSchema)
    .max(20, "You can save up to 20 locations.")
    .refine(
      (locations) => new Set(locations.map((location) => location.toLocaleLowerCase())).size === locations.length,
      "Saved locations must be unique.",
    ),
});

export const entryFormSchema = z
  .object({
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD."),
    entryStatus: entryStatusSchema,
    hoursWorked: z.coerce.number().min(0, "Hours worked cannot be negative.").max(24, "Hours worked cannot exceed 24."),
    location: z.string().trim().max(120, "Location must have at most 120 characters."),
    notes: z.string().trim().max(1000, "Notes must have at most 1000 characters.").optional().or(z.literal("")),
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

      if (value.location.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["location"],
          message: "Location must have at least 2 characters.",
        });
      }
    } else if (value.hoursWorked !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hoursWorked"],
        message: "Non-working days must use 0 hours.",
      });
    }
  });

export type SignInFormValues = z.infer<typeof signInFormSchema>;
export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type EntryFormValues = z.infer<typeof entryFormSchema>;
