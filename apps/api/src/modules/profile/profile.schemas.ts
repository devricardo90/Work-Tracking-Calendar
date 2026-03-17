import { z } from "zod";

export const profilePayloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  language: z.string().trim().min(2).max(10),
  savedLocations: z.array(z.string().trim().min(2).max(120)).max(20),
});

export type ProfilePayload = z.infer<typeof profilePayloadSchema>;
