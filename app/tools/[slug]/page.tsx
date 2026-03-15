import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { listVisibleArticles } from "@/lib/content-helpers";
import { buildInitialStateForRole } from "@/lib/server/initial-state";
import { getSessionRole } from "@/lib/server/session";
import { findQuickLinkGuideBySlug, listQuickLinkGuideParams } from "@/lib/quick-link-catalog";

export function generateStaticParams() {
  return listQuickLinkGuideParams();
}

export default async function QuickLinkGuidePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = getSessionRole();
  const initialState = buildInitialStateForRole(role);
  const visibleArticles = listVisibleArticles(initialState, role);
  const visibleArticleSlugs = new Set(visibleArticles.map((article) => article.slug));
  const guide = findQuickLinkGuideBySlug(slug, visibleArticleSlugs);

  if (!guide) {
    notFound();
  }

  const relatedResources = guide.relatedResources;

  return (
    <AppShell title={guide.title} description={guide.pageDescription}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-ink">利用ガイド</h2>
              <p className="text-sm leading-6 text-slate-600">{guide.summary}</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-ink">よく使う操作</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {guide.primaryActions.map((action) => (
                  <li key={action} className="rounded-xl border border-slate-200 p-3">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3">
              <h3 className="text-base font-semibold text-ink">申請前チェック</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {guide.checkpoints.map((checkpoint) => (
                  <li key={checkpoint} className="rounded-xl bg-surface-muted p-3">
                    {checkpoint}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <h3 className="text-base font-semibold text-ink">関連ページ</h3>
              <div className="space-y-2">
                {relatedResources.map((resource) => (
                  <Link
                    key={resource.href}
                    href={resource.href as Route}
                    className="block rounded-xl border border-slate-200 p-4 text-sm font-medium text-ink hover:bg-slate-50"
                  >
                    {resource.label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
