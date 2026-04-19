import type { PortalContentState, SearchResult } from "@/types/domain";

export function buildContextDocs(top: SearchResult[], state: PortalContentState): string {
  return top
    .map((item, idx) => {
      if (item.type === "article") {
        const article = state.articles.find((a) => a.id === item.id);
        if (!article) {
          return `【根拠${idx + 1}】カテゴリ: ${item.categoryName}, タイプ: 記事\nタイトル: ${item.title}\n概要: ${item.summary}`;
        }
        return `【根拠${idx + 1}】カテゴリ: ${item.categoryName}, タイプ: 記事\nタイトル: ${article.title}\n概要: ${article.summary}\n\n本文:\n${article.content}`;
      } else {
        const faq = state.faqs.find((f) => f.id === item.id);
        if (!faq) {
          return `【根拠${idx + 1}】カテゴリ: ${item.categoryName}, タイプ: FAQ\nタイトル: ${item.title}\n概要: ${item.summary}`;
        }
        return `【根拠${idx + 1}】カテゴリ: ${item.categoryName}, タイプ: FAQ\n質問: ${faq.question}\n回答: ${faq.answer}`;
      }
    })
    .join("\n\n---\n\n");
}

export function buildGuidePrompt(contextDocs: string, question: string): string {
  return `あなたは社内マニュアルの案内アシスタントです。以下の社内記事とFAQの内容**のみ**を使って、質問に答えてください。

【重要な制約】
- 提供された記事とFAQの内容以外のことは一切言わないでください
- 制度や手順を推測したり、創作したり、一般的な知識を付け加えたりしないでください
- 根拠が不十分な場合は「提供された情報だけでは不明です」と答えてください
- 記事やFAQに書かれていない情報を補足しないでください

【提供される社内情報】
${contextDocs}

【質問】
${question}

【回答形式】
- 記事やFAQの内容に基づいて、簡潔に答えてください
- 手順がある場合は、記事に書かれている通りに箇条書きで示してください
- どの根拠（【根拠1】【根拠2】など）を参照したかを明記してください
- 記事に書かれていないことは絶対に追加しないでください`;
}
