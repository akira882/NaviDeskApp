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

  // Lower threshold for strong match (improved scoring gives higher scores)
  const hasStrongMatch = top[0].score >= 10;

  if (!hasStrongMatch) {
    return {
      mode: "fallback",
      message: "根拠が弱いため、断定回答は避けます。関連度の高い記事とFAQを確認してください。",
      suggestions: top
    };
  }

  // Build context from top search results with full content
  const contextDocs = top
    .map((item, idx) => {
      if (item.type === "article") {
        const article = params.state.articles.find((a) => a.id === item.id);
        if (!article) {
          return `【根拠${idx + 1}】カテゴリ: ${item.categoryName}, タイプ: 記事\nタイトル: ${item.title}\n概要: ${item.summary}`;
        }
        return `【根拠${idx + 1}】カテゴリ: ${item.categoryName}, タイプ: 記事\nタイトル: ${article.title}\n概要: ${article.summary}\n\n本文:\n${article.content}`;
      } else {
        const faq = params.state.faqs.find((f) => f.id === item.id);
        if (!faq) {
          return `【根拠${idx + 1}】カテゴリ: ${item.categoryName}, タイプ: FAQ\nタイトル: ${item.title}\n概要: ${item.summary}`;
        }
        return `【根拠${idx + 1}】カテゴリ: ${item.categoryName}, タイプ: FAQ\n質問: ${faq.question}\n回答: ${faq.answer}`;
      }
    })
    .join("\n\n---\n\n");

  const prompt = `あなたは社内マニュアルの案内アシスタントです。以下の社内記事とFAQの内容**のみ**を使って、質問に答えてください。

【重要な制約】
- 提供された記事とFAQの内容以外のことは一切言わないでください
- 制度や手順を推測したり、創作したり、一般的な知識を付け加えたりしないでください
- 根拠が不十分な場合は「提供された情報だけでは不明です」と答えてください
- 記事やFAQに書かれていない情報を補足しないでください

【提供される社内情報】
${contextDocs}

【質問】
${params.question}

【回答形式】
- 記事やFAQの内容に基づいて、簡潔に答えてください
- 手順がある場合は、記事に書かれている通りに箇条書きで示してください
- どの根拠（【根拠1】【根拠2】など）を参照したかを明記してください
- 記事に書かれていないことは絶対に追加しないでください`;

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
