import { z } from "zod";
import { roles } from "@/types/domain";

const envSchema = z.object({
  GEMINI_API_KEY: z.string().optional(),
  NAVIDESK_AI_PROVIDER: z.enum(["mock", "gemini", "bedrock"]).optional().default("mock"),
  NAVIDESK_SESSION_ROLE: z.enum(roles).optional().default("admin"),
  AWS_REGION: z.string().optional().default("us-east-1"),
  AWS_BEDROCK_MODEL_ID: z.string().optional().default("us.anthropic.claude-3-5-haiku-20241022-v1:0"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  BEDROCK_API_KEY: z.string().optional()
});

export const env = envSchema.parse({
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NAVIDESK_AI_PROVIDER: process.env.NAVIDESK_AI_PROVIDER,
  NAVIDESK_SESSION_ROLE: "admin", // Forced to admin as requested
  AWS_REGION: process.env.AWS_REGION,
  AWS_BEDROCK_MODEL_ID: process.env.AWS_BEDROCK_MODEL_ID,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  BEDROCK_API_KEY: process.env.BEDROCK_API_KEY
});
