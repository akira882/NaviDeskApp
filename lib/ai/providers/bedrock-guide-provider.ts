import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { searchContent } from "@/lib/content-helpers";
import { env } from "@/lib/env";
import { buildContextDocs, buildGuidePrompt } from "@/lib/ai/providers/guide-provider-shared";
import type { AiResponse, Category, PortalContentState, Role } from "@/types/domain";

/**
 * Bedrock AI Guide Provider
 * IMPORTANT: This provider uses AWS credentials and MUST only run on the server side.
 * Never expose AWS credentials to the browser.
 */
export async function bedrockGuideProvider(params: {
  question: string;
  role: Role;
  state: PortalContentState;
  categories: Category[];
}): Promise<AiResponse> {
  // First, search for relevant content
  const suggestions = searchContent(params.state, params.categories, params.question, params.role);

  if (suggestions.length === 0) {
    return {
      mode: "fallback",
      message:
        "社内記事とFAQから根拠を見つけられませんでした。制度や手順を推測せず、通常検索候補のみ提示します。",
      suggestions: []
    };
  }

  const top = suggestions.slice(0, 3);

  if (top[0].score < 10) {
    return {
      mode: "fallback",
      message: "根拠が弱いため、断定回答は避けます。関連度の高い記事とFAQを確認してください。",
      suggestions: top
    };
  }

  const contextDocs = buildContextDocs(top, params.state);
  const prompt = buildGuidePrompt(contextDocs, params.question);

  try {
    let aiAnswer: string | undefined;

    // Use Bedrock API Key if available (Inference Profile authentication)
    if (env.BEDROCK_API_KEY) {
      // Bedrock Inference Profile API endpoint
      // Note: API Keys are used with Inference Profiles, not standard model IDs
      const apiEndpoint = `https://api.us-east-1.ai.aws.dev/converse`;

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.BEDROCK_API_KEY}`
        },
        body: JSON.stringify({
          modelId: env.AWS_BEDROCK_MODEL_ID,
          messages: [
            {
              role: "user",
              content: [{ text: prompt }]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Bedrock API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      aiAnswer = data.output?.message?.content?.[0]?.text;
    } else {
      // Fall back to IAM credentials (original implementation)
      const client = new BedrockRuntimeClient({
        region: env.AWS_REGION,
        credentials:
          env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
            ? {
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY
              }
            : undefined // Use default credential provider chain if not specified
      });

      const command = new ConverseCommand({
        modelId: env.AWS_BEDROCK_MODEL_ID,
        messages: [
          {
            role: "user",
            content: [{ text: prompt }]
          }
        ]
      });

      const response = await client.send(command);
      aiAnswer = response.output?.message?.content?.[0]?.text;
    }

    if (!aiAnswer) {
      // Fallback if AI response is empty
      return {
        mode: "fallback",
        message: "AI応答を取得できませんでした。関連度の高い記事とFAQを確認してください。",
        suggestions: top
      };
    }

    return {
      mode: "answer",
      answer: aiAnswer,
      citations: top
    };
  } catch (error) {
    // Log error on server side (in production, use proper logging)
    console.error("Bedrock API error:", error);

    // Fallback to search results on error
    return {
      mode: "fallback",
      message:
        "AI案内の取得中にエラーが発生しました。根拠候補から直接確認してください。",
      suggestions: top
    };
  }
}
