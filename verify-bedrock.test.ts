import { expect, test } from "vitest";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { env } from "./lib/env";

test("Bedrock connectivity and model access", async () => {
  console.log("Checking Bedrock configuration...");
  console.log("Region:", env.AWS_REGION);
  console.log("Model ID:", env.AWS_BEDROCK_MODEL_ID);
  console.log("Provider:", env.NAVIDESK_AI_PROVIDER);

  if (env.NAVIDESK_AI_PROVIDER !== "bedrock") {
    console.log("Provider is not set to 'bedrock'. Current provider:", env.NAVIDESK_AI_PROVIDER);
    return;
  }

  const client = new BedrockRuntimeClient({
    region: env.AWS_REGION,
    credentials:
      env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY
          }
        : undefined
  });

  const command = new ConverseCommand({
    modelId: env.AWS_BEDROCK_MODEL_ID,
    messages: [
      {
        role: "user",
        content: [{ text: "Hello, are you Claude Haiku? Respond with 'Yes' if you are." }]
      }
    ]
  });

  try {
    const response = await client.send(command);
    console.log("Bedrock response received:", response.output?.message?.content?.[0]?.text);
    expect(response.output?.message?.content?.[0]?.text).toBeDefined();
  } catch (error: any) {
    console.error("Bedrock connectivity failed:", error.message);
    throw error;
  }
}, 15000); // 15s timeout
