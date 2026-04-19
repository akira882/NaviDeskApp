import { AppShell } from "@/components/app-shell";
import { AiGuideClient } from "@/components/ai-guide-client";

export default async function AiGuidePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const initialQuestion = typeof q === "string" ? q.slice(0, 500) : "";

  return (
    <AppShell
      title="AI案内"
      description="自然文で質問すると、社内記事と FAQ を先に検索して案内します。根拠が弱い場合は通常検索候補にフォールバックします。"
    >
      <AiGuideClient initialQuestion={initialQuestion} />
    </AppShell>
  );
}
