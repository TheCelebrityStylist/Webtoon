import { z } from "zod";

export const projectInput = z.object({
  title: z.string().trim().min(2).max(120),
  logline: z.string().trim().min(10).max(300),
  synopsis: z.string().trim().min(20).max(5000),
  genre: z.enum(["ACTION", "COMEDY", "DRAMA", "FANTASY", "HORROR", "MYSTERY", "ROMANCE", "SCI_FI", "SLICE_OF_LIFE"]),
  language: z.string().trim().regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Use a language code such as en or nl-NL"),
  audience: z.string().trim().min(2).max(120),
});

export const characterInput = z.object({
  name: z.string().trim().min(1).max(100), aliases: z.string().trim().max(300),
  pronouns: z.string().trim().max(60), role: z.string().trim().min(2).max(100),
  lifeStage: z.string().trim().max(100), appearance: z.string().trim().max(2000),
  personality: z.string().trim().max(2000), speechStyle: z.string().trim().max(1000),
  motivations: z.string().trim().max(2000), goals: z.string().trim().max(2000),
  fears: z.string().trim().max(2000), secrets: z.string().trim().max(2000),
  locationId: z.string().cuid().optional().or(z.literal("")),
});
export const locationInput = z.object({ name: z.string().trim().min(2).max(120), description: z.string().trim().max(3000) });
export const worldRuleInput = z.object({ title: z.string().trim().min(2).max(120), description: z.string().trim().min(10).max(3000) });
export type ProjectInput = z.infer<typeof projectInput>;

