import { z } from "zod";

const envSchema = z.object({
  GEMINI_API_KEY: z.string().optional(),
  NAVIDESK_AI_PROVIDER: z.enum(["mock", "gemini"]).optional().default("mock")
});

export const env = envSchema.parse({
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NAVIDESK_AI_PROVIDER: process.env.NAVIDESK_AI_PROVIDER
});
