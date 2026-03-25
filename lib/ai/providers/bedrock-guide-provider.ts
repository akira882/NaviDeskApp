import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { searchContent } from "@/lib/content-helpers";
import { env } from "@/lib/env";
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
  const hasStrongMatch = top[0].score >= 2;

  if (!hasStrongMatch) {
    return {
      mode: "fallback",
      message: "根拠が弱いため、断定回答は避けます。関連度の高い記事とFAQを確認してください。",
      suggestions: top
    };
  }

  // Build context from top search results
  const contextDocs = top
    .map(
      (item, idx) =>
        `【根拠${idx + 1}】カテゴリ: ${item.categoryName}, タイプ: ${item.type === "article" ? "記事" : "FAQ"}\nタイトル: ${item.title}\n概要: ${item.summary}`
    )
    .join("\n\n");

  const prompt = `以下の社内マニュアルとFAQだけを使って、質問に答えてください。
根拠が不十分な場合は「提供された情報だけでは不明です」と答えてください。
制度や手順を推測したり創作したりしないでください。

${contextDocs}

質問: ${params.question}

回答は簡潔に、1-2文で答えてください。そして、どの根拠を参照したかを明記してください。`;

  try {
    // Initialize Bedrock client with AWS credentials from environment
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

    const aiAnswer = response.output?.message?.content?.[0]?.text;

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
