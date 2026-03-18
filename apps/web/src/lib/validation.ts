import { z } from "zod";

export const authNameSchema = z.string().trim().min(2, "Name must have at least 2 characters.").max(120);

export const signInFormSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must have at least 8 characters.").max(128),
});

export const signUpFormSchema = signInFormSchema.extend({
  name: authNameSchema,
});

export const profileLanguageSchema = z.enum(["en", "pt-BR", "es"]);

export const savedLocationSchema = z
  .string()
  .trim()
  .min(2, "Location must have at least 2 characters.")
  .max(120, "Location must have at most 120 characters.");

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

export const entryFormSchema = z.object({
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD."),
  hoursWorked: z.coerce.number().positive("Hours worked must be greater than 0.").max(24, "Hours worked cannot exceed 24."),
  location: savedLocationSchema,
  notes: z.string().trim().max(1000, "Notes must have at most 1000 characters.").optional().or(z.literal("")),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;
export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type EntryFormValues = z.infer<typeof entryFormSchema>;
