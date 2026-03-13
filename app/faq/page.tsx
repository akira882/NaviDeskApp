import { AppShell } from "@/components/app-shell";
import { FAQSearchClient } from "@/components/faq-search-client";
import { categoryRepository } from "@/data/repositories/content-repository";

export default async function FAQPage({
  searchParams
}: {
  searchParams: Promise<{ highlight?: string }>;
}) {
  const params = await searchParams;

  return (
    <AppShell
      title="FAQ検索"
      description="質問文・キーワード・カテゴリから FAQ を絞り込みます。業務で繰り返し発生する問い合わせを先回りして自己解決しやすくします。"
    >
      <FAQSearchClient categories={categoryRepository.list()} highlightId={params.highlight} />
    </AppShell>
  );
}
