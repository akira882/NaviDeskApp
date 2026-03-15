"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useContent } from "@/components/content-provider";
import { useRole } from "@/components/role-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  announcementFormSchema,
  articleFormSchema,
  faqFormSchema,
  quickLinkFormSchema,
  type AnnouncementFormValues,
  type ArticleFormValues,
  type FAQFormValues,
  type QuickLinkFormValues
} from "@/lib/schemas";
import { listFailedSearchThemes } from "@/lib/content-helpers";
import { getFreshnessLabel, getFreshnessStatus, getFreshnessTone, listReviewPriorityItems } from "@/lib/content-governance";
import { canApproveContent } from "@/lib/roles";
import { formatDate, splitTags } from "@/lib/utils";
import type { Article, Announcement, ApprovalStatus, Category, FAQ, QuickLink, Role } from "@/types/domain";

type ResourceType = "article" | "faq" | "announcement" | "quick-link";

export function AdminDashboard({ categories }: { categories: Category[] }) {
  const { role } = useRole();
  const content = useContent();
  const canApprove = canApproveContent(role);
  const [resourceType, setResourceType] = useState<ResourceType>("article");
  const [filterQuery, setFilterQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<ApprovalStatus | "all">("all");
  const [selectedReviewKey, setSelectedReviewKey] = useState<string | null>(null);
  const [reviewCommentDraft, setReviewCommentDraft] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [editingQuickLinkId, setEditingQuickLinkId] = useState<string | null>(null);

  const categoryNameMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const articleForm = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: getArticleDefaults(categories)
  });
  const faqForm = useForm<FAQFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: getFaqDefaults(categories)
  });
  const announcementForm = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: { title: "", body: "", status: "draft" }
  });
  const quickLinkForm = useForm<QuickLinkFormValues>({
    resolver: zodResolver(quickLinkFormSchema),
    defaultValues: getQuickLinkDefaults(categories)
  });

  const sortedQuickLinks = useMemo(
    () => [...content.quickLinks].sort((a, b) => a.sortOrder - b.sortOrder),
    [content.quickLinks]
  );
  const filteredArticles = useMemo(
    () =>
      content.articles.filter((article) => {
        const matchesQuery = filterQuery
          ? `${article.title} ${article.summary} ${article.tags.join(" ")}`.toLowerCase().includes(filterQuery.toLowerCase())
          : true;
        const matchesApproval = approvalFilter === "all" ? true : article.approvalStatus === approvalFilter;
        return matchesQuery && matchesApproval;
      }),
    [approvalFilter, content.articles, filterQuery]
  );
  const filteredFaqs = useMemo(
    () =>
      content.faqs.filter((faq) => {
        const matchesQuery = filterQuery
          ? `${faq.question} ${faq.answer} ${faq.tags.join(" ")}`.toLowerCase().includes(filterQuery.toLowerCase())
          : true;
        const matchesApproval = approvalFilter === "all" ? true : faq.approvalStatus === approvalFilter;
        return matchesQuery && matchesApproval;
      }),
    [approvalFilter, content.faqs, filterQuery]
  );
  const filteredAnnouncements = useMemo(
    () =>
      content.announcements.filter((announcement) => {
        const matchesQuery = filterQuery
          ? `${announcement.title} ${announcement.body}`.toLowerCase().includes(filterQuery.toLowerCase())
          : true;
        const matchesApproval = approvalFilter === "all" ? true : announcement.approvalStatus === approvalFilter;
        return matchesQuery && matchesApproval;
      }),
    [approvalFilter, content.announcements, filterQuery]
  );
  const filteredQuickLinks = useMemo(
    () =>
      sortedQuickLinks.filter((quickLink) =>
        filterQuery
          ? `${quickLink.label} ${quickLink.description} ${quickLink.url}`.toLowerCase().includes(filterQuery.toLowerCase())
          : true
      ),
    [filterQuery, sortedQuickLinks]
  );
  const pendingApprovals = useMemo(
    () =>
      [
        ...content.articles.map((article) => ({ kind: "article" as const, id: article.id, title: article.title, approvalStatus: article.approvalStatus, updatedAt: article.updatedAt, reviewComment: article.reviewComment })),
        ...content.faqs.map((faq) => ({ kind: "faq" as const, id: faq.id, title: faq.question, approvalStatus: faq.approvalStatus, updatedAt: faq.updatedAt, reviewComment: faq.reviewComment })),
        ...content.announcements.map((announcement) => ({ kind: "announcement" as const, id: announcement.id, title: announcement.title, approvalStatus: announcement.approvalStatus, updatedAt: announcement.updatedAt, reviewComment: announcement.reviewComment }))
      ]
        .filter((item) => item.approvalStatus === "pending")
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [content.announcements, content.articles, content.faqs]
  );
  const reviewPriorityItems = useMemo(
    () =>
      listReviewPriorityItems({
        articles: content.articles,
        faqs: content.faqs,
        announcements: content.announcements
      }),
    [content.announcements, content.articles, content.faqs]
  );
  const failedSearchThemes = useMemo(() => listFailedSearchThemes(content.searchLogs), [content.searchLogs]);
  const selectedReviewItem = pendingApprovals.find((item) => `${item.kind}-${item.id}` === selectedReviewKey) ?? null;

  function renderApprovalBadge(status: ApprovalStatus) {
    const tone = {
      not_requested: "bg-slate-50 text-slate-700",
      pending: "bg-amber-50 text-amber-900",
      approved: "bg-emerald-50 text-emerald-800",
      changes_requested: "bg-rose-50 text-rose-800"
    } satisfies Record<ApprovalStatus, string>;

    return <Badge className={tone[status]}>{getApprovalLabel(status)}</Badge>;
  }

  function openReview(item: (typeof pendingApprovals)[number]) {
    setSelectedReviewKey(`${item.kind}-${item.id}`);
    setReviewCommentDraft(item.reviewComment ?? "");
    setReviewError(null);
  }

  function handleApprove() {
    if (!selectedReviewItem) {
      return;
    }

    const comment = reviewCommentDraft.trim() || "管理者が承認";

    if (selectedReviewItem.kind === "article") {
      content.approveArticle(selectedReviewItem.id, comment, role);
    } else if (selectedReviewItem.kind === "faq") {
      content.approveFaq(selectedReviewItem.id, comment, role);
    } else {
      content.approveAnnouncement(selectedReviewItem.id, comment, role);
    }

    setSelectedReviewKey(null);
    setReviewCommentDraft("");
    setReviewError(null);
  }

  function handleReject() {
    if (!selectedReviewItem) {
      return;
    }

    const comment = reviewCommentDraft.trim();

    if (!comment) {
      setReviewError("差し戻し理由を入力してください。");
      return;
    }

    if (selectedReviewItem.kind === "article") {
      content.rejectArticle(selectedReviewItem.id, comment, role);
    } else if (selectedReviewItem.kind === "faq") {
      content.rejectFaq(selectedReviewItem.id, comment, role);
    } else {
      content.rejectAnnouncement(selectedReviewItem.id, comment, role);
    }

    setSelectedReviewKey(null);
    setReviewCommentDraft("");
    setReviewError(null);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-6">
          <MetricCard label="記事" value={content.articles.length} />
          <MetricCard label="FAQ" value={content.faqs.length} />
          <MetricCard label="お知らせ" value={content.announcements.length} />
          <MetricCard label="クイックリンク" value={content.quickLinks.length} />
          <MetricCard label="承認待ち" value={pendingApprovals.length} />
          <MetricCard label="検索失敗" value={failedSearchThemes.length} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">検索不足テーマ</h2>
              <p className="text-sm text-slate-600">ゼロ件検索が多いテーマを記事化・FAQ化の候補として表示します。</p>
            </div>
            <Badge className="bg-slate-50">{failedSearchThemes.length}件</Badge>
          </div>
          {failedSearchThemes.length > 0 ? (
            <div className="space-y-3">
              {failedSearchThemes.slice(0, 6).map((item) => (
                <div key={`${item.query}-${item.surface}`} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-rose-50 text-rose-800">検索失敗 {item.count}回</Badge>
                      <Badge className="bg-slate-50">{item.surface === "home" ? "ホーム検索" : item.surface === "faq" ? "FAQ検索" : "AI案内"}</Badge>
                    </div>
                    <p className="font-medium text-ink">{item.query}</p>
                    <p className="text-xs text-slate-500">最終検索: {formatDate(item.lastSearchedAt)}</p>
                  </div>
                  <p className="text-sm text-slate-600">FAQ追加、既存記事のタグ補強、タスクハブ導線追加の候補です。</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-surface-muted p-4 text-sm text-slate-600">現在、目立った検索不足テーマはありません。</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">レビュー優先キュー</h2>
              <p className="text-sm text-slate-600">更新から30日以上経過したコンテンツを優先度順に表示します。</p>
            </div>
            <Badge className="bg-rose-50 text-rose-800">{reviewPriorityItems.length}件</Badge>
          </div>
          {reviewPriorityItems.length > 0 ? (
            <div className="space-y-3">
              {reviewPriorityItems.slice(0, 6).map((item) => (
                <div key={`${item.kind}-${item.id}`} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-50">{item.kind === "article" ? "記事" : item.kind === "faq" ? "FAQ" : "お知らせ"}</Badge>
                      <Badge className={getFreshnessTone(item.freshnessStatus)}>{item.freshnessLabel}</Badge>
                    </div>
                    <p className="font-medium text-ink">{item.title}</p>
                    <p className="text-xs text-slate-500">最終更新日: {formatDate(item.updatedAt)}</p>
                  </div>
                  <p className="text-sm text-slate-600">定期レビュー対象です。内容の有効性とリンク切れを確認してください。</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-surface-muted p-4 text-sm text-slate-600">更新期限が近いコンテンツはありません。</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">承認キュー</h2>
              <p className="text-sm text-slate-600">
                {canApprove ? "承認待ちコンテンツを確認し、承認または差し戻しを実行します。" : "下書きを保存した後、この一覧に載る状態まで承認申請してください。"}
              </p>
            </div>
            <Badge className="bg-amber-50 text-amber-900">{pendingApprovals.length}件</Badge>
          </div>
          {pendingApprovals.length > 0 ? (
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <div key={`${item.kind}-${item.id}`} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-50">{item.kind === "article" ? "記事" : item.kind === "faq" ? "FAQ" : "お知らせ"}</Badge>
                      {renderApprovalBadge(item.approvalStatus)}
                    </div>
                    <p className="font-medium text-ink">{item.title}</p>
                    <p className="text-xs text-slate-500">更新日: {formatDate(item.updatedAt)}</p>
                  </div>
                  {canApprove ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => openReview(item)}
                      >
                        レビュー
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">承認者のレビュー待ちです。</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-surface-muted p-4 text-sm text-slate-600">現在の承認待ちコンテンツはありません。</p>
          )}
          {canApprove && selectedReviewItem ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-white">
                    {selectedReviewItem.kind === "article" ? "記事" : selectedReviewItem.kind === "faq" ? "FAQ" : "お知らせ"}
                  </Badge>
                  {renderApprovalBadge(selectedReviewItem.approvalStatus)}
                </div>
                <h3 className="text-base font-semibold text-ink">{selectedReviewItem.title}</h3>
                <p className="text-sm text-slate-600">承認理由または差し戻し理由を入力してレビューを完了してください。</p>
              </div>
              <div className="mt-4 space-y-3">
                <Field label="レビューコメント" error={reviewError ?? undefined}>
                  <Textarea
                    value={reviewCommentDraft}
                    onChange={(event) => {
                      setReviewCommentDraft(event.target.value);
                      setReviewError(null);
                    }}
                    className="min-h-24"
                  />
                </Field>
                <div className="flex gap-2">
                  <Button type="button" onClick={handleApprove}>承認する</Button>
                  <Button type="button" variant="secondary" onClick={handleReject}>差し戻す</Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSelectedReviewKey(null);
                      setReviewCommentDraft("");
                      setReviewError(null);
                    }}
                  >
                    レビューを閉じる
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { key: "article", label: "記事" },
              { key: "faq", label: "FAQ" },
              { key: "announcement", label: "お知らせ" },
              { key: "quick-link", label: "クイックリンク" }
            ].map((tab) => (
              <Button
                key={tab.key}
                type="button"
                variant={resourceType === tab.key ? "default" : "secondary"}
                onClick={() => setResourceType(tab.key as ResourceType)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-[1.4fr_0.6fr]">
            <Field label="一覧検索">
              <Input
                value={filterQuery}
                onChange={(event) => setFilterQuery(event.target.value)}
                placeholder="タイトル、質問、説明、タグで絞り込み"
              />
            </Field>
            <Field label="承認状態">
              <Select value={approvalFilter} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setApprovalFilter(event.target.value as ApprovalStatus | "all")}>
                <option value="all">すべて</option>
                <option value="not_requested">未申請</option>
                <option value="pending">承認待ち</option>
                <option value="approved">承認済み</option>
                <option value="changes_requested">差し戻し</option>
              </Select>
            </Field>
          </div>

          {resourceType === "article" ? (
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-1 xl:grid-cols-[1.1fr_1.2fr]">
              <form
                className="space-y-2.5 sm:space-y-3"
                onSubmit={articleForm.handleSubmit((values) => {
                  const currentArticle = editingArticleId
                    ? content.articles.find((article: Article) => article.id === editingArticleId)
                    : null;
                  const payload = {
                    title: values.title,
                    slug: values.slug,
                    categoryId: values.categoryId,
                    summary: values.summary,
                    content: values.content,
                    tags: splitTags(values.tags),
                    status: values.status,
                    visibilityRole: values.visibilityRole,
                    relatedArticleIds: currentArticle?.relatedArticleIds ?? []
                  };

                  if (editingArticleId) {
                    content.updateArticle(editingArticleId, payload, role);
                  } else {
                    content.addArticle(payload, role);
                  }

                  setEditingArticleId(null);
                  articleForm.reset(getArticleDefaults(categories));
                })}
              >
                <FormHeader title={editingArticleId ? "記事を編集" : "記事を追加"} />
                <Field label="タイトル" error={articleForm.formState.errors.title?.message}>
                  <Input {...articleForm.register("title")} />
                </Field>
                <Field label="slug" error={articleForm.formState.errors.slug?.message}>
                  <Input {...articleForm.register("slug")} />
                </Field>
                <Field label="カテゴリ" error={articleForm.formState.errors.categoryId?.message}>
                  <Select {...articleForm.register("categoryId")}>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="要約" error={articleForm.formState.errors.summary?.message}>
                  <Textarea {...articleForm.register("summary")} className="min-h-24" />
                </Field>
                <Field label="本文" error={articleForm.formState.errors.content?.message}>
                  <Textarea {...articleForm.register("content")} />
                </Field>
                <Field label="タグ(カンマ区切り)" error={articleForm.formState.errors.tags?.message}>
                  <Input {...articleForm.register("tags")} />
                </Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="公開状態">
                    <Select {...articleForm.register("status")}>
                      <option value="draft">下書き</option>
                      {canApprove ? <option value="published">公開</option> : null}
                    </Select>
                  </Field>
                  <Field label="閲覧ロール">
                    <Select {...articleForm.register("visibilityRole")}>
                      <RoleOptions />
                    </Select>
                  </Field>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingArticleId ? "記事を更新" : "記事を追加"}</Button>
                  {editingArticleId ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingArticleId(null);
                        articleForm.reset(getArticleDefaults(categories));
                      }}
                    >
                      編集をキャンセル
                    </Button>
                  ) : null}
                </div>
              </form>

              <ResourceTable
                columns={["タイトル", "カテゴリ", "公開", "承認状態", "更新健全性", "閲覧ロール", "更新日", "操作"]}
                rows={filteredArticles.map((article: Article) => (
                  <tr key={article.id}>
                    <Td>{article.title}</Td>
                    <Td>{categoryNameMap.get(article.categoryId)}</Td>
                    <Td><Badge>{article.status === "published" ? "公開" : "下書き"}</Badge></Td>
                    <Td>{renderApprovalBadge(article.approvalStatus)}</Td>
                    <Td><Badge className={getFreshnessTone(getFreshnessStatus(article.updatedAt))}>{getFreshnessLabel(article.updatedAt)}</Badge></Td>
                    <Td>{article.visibilityRole}</Td>
                    <Td>{formatDate(article.updatedAt)}</Td>
                    <Td className="space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingArticleId(article.id);
                          articleForm.reset({
                            title: article.title,
                            slug: article.slug,
                            categoryId: article.categoryId,
                            summary: article.summary,
                            content: article.content,
                            tags: article.tags.join(", "),
                            status: article.status,
                            visibilityRole: article.visibilityRole
                          });
                        }}
                      >
                        編集
                      </Button>
                      {canApprove ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => content.toggleArticleStatus(article.id, role)}
                          >
                            公開切替
                          </Button>
                          {article.approvalStatus === "pending" ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => openReview({ kind: "article", id: article.id, title: article.title, approvalStatus: article.approvalStatus, updatedAt: article.updatedAt, reviewComment: article.reviewComment })}
                            >
                              レビュー
                            </Button>
                          ) : null}
                        </>
                      ) : article.approvalStatus !== "pending" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => content.requestArticleReview(article.id, role)}
                        >
                          承認申請
                        </Button>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-900">承認待ち</Badge>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => content.deleteArticle(article.id, role)}
                      >
                        削除
                      </Button>
                    </Td>
                  </tr>
                ))}
              />
            </div>
          ) : null}

          {resourceType === "faq" ? (
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-1 xl:grid-cols-[1.1fr_1.2fr]">
              <form
                className="space-y-3"
                onSubmit={faqForm.handleSubmit((values) => {
                  const payload = {
                    question: values.question,
                    answer: values.answer,
                    categoryId: values.categoryId,
                    tags: splitTags(values.tags),
                    status: values.status,
                    visibilityRole: values.visibilityRole
                  };

                  if (editingFaqId) {
                    content.updateFaq(editingFaqId, payload, role);
                  } else {
                    content.addFaq(payload, role);
                  }

                  setEditingFaqId(null);
                  faqForm.reset(getFaqDefaults(categories));
                })}
              >
                <FormHeader title={editingFaqId ? "FAQを編集" : "FAQを追加"} />
                <Field label="質問" error={faqForm.formState.errors.question?.message}>
                  <Input {...faqForm.register("question")} />
                </Field>
                <Field label="回答" error={faqForm.formState.errors.answer?.message}>
                  <Textarea {...faqForm.register("answer")} />
                </Field>
                <Field label="カテゴリ">
                  <Select {...faqForm.register("categoryId")}>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="タグ(カンマ区切り)">
                  <Input {...faqForm.register("tags")} />
                </Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="公開状態">
                    <Select {...faqForm.register("status")}>
                      <option value="draft">下書き</option>
                      {canApprove ? <option value="published">公開</option> : null}
                    </Select>
                  </Field>
                  <Field label="閲覧ロール">
                    <Select {...faqForm.register("visibilityRole")}>
                      <RoleOptions />
                    </Select>
                  </Field>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingFaqId ? "FAQを更新" : "FAQを追加"}</Button>
                  {editingFaqId ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingFaqId(null);
                        faqForm.reset(getFaqDefaults(categories));
                      }}
                    >
                      編集をキャンセル
                    </Button>
                  ) : null}
                </div>
              </form>

              <ResourceTable
                columns={["質問", "カテゴリ", "公開", "承認状態", "更新健全性", "閲覧ロール", "更新日", "操作"]}
                rows={filteredFaqs.map((faq: FAQ) => (
                  <tr key={faq.id}>
                    <Td>{faq.question}</Td>
                    <Td>{categoryNameMap.get(faq.categoryId)}</Td>
                    <Td><Badge>{faq.status === "published" ? "公開" : "下書き"}</Badge></Td>
                    <Td>{renderApprovalBadge(faq.approvalStatus)}</Td>
                    <Td><Badge className={getFreshnessTone(getFreshnessStatus(faq.updatedAt))}>{getFreshnessLabel(faq.updatedAt)}</Badge></Td>
                    <Td>{faq.visibilityRole}</Td>
                    <Td>{formatDate(faq.updatedAt)}</Td>
                    <Td className="space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingFaqId(faq.id);
                          faqForm.reset({
                            question: faq.question,
                            answer: faq.answer,
                            categoryId: faq.categoryId,
                            tags: faq.tags.join(", "),
                            status: faq.status,
                            visibilityRole: faq.visibilityRole
                          });
                        }}
                      >
                        編集
                      </Button>
                      {canApprove ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => content.toggleFaqStatus(faq.id, role)}
                          >
                            公開切替
                          </Button>
                          {faq.approvalStatus === "pending" ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => openReview({ kind: "faq", id: faq.id, title: faq.question, approvalStatus: faq.approvalStatus, updatedAt: faq.updatedAt, reviewComment: faq.reviewComment })}
                            >
                              レビュー
                            </Button>
                          ) : null}
                        </>
                      ) : faq.approvalStatus !== "pending" ? (
                        <Button type="button" size="sm" variant="secondary" onClick={() => content.requestFaqReview(faq.id, role)}>
                          承認申請
                        </Button>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-900">承認待ち</Badge>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => content.deleteFaq(faq.id, role)}
                      >
                        削除
                      </Button>
                    </Td>
                  </tr>
                ))}
              />
            </div>
          ) : null}

          {resourceType === "announcement" ? (
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-1 xl:grid-cols-[1.1fr_1.2fr]">
              <form
                className="space-y-3"
                onSubmit={announcementForm.handleSubmit((values) => {
                  const payload = {
                    title: values.title,
                    body: values.body,
                    status: values.status
                  };

                  if (editingAnnouncementId) {
                    content.updateAnnouncement(editingAnnouncementId, payload, role);
                  } else {
                    content.addAnnouncement(payload, role);
                  }

                  setEditingAnnouncementId(null);
                  announcementForm.reset({ title: "", body: "", status: "draft" });
                })}
              >
                <FormHeader title={editingAnnouncementId ? "お知らせを編集" : "お知らせを追加"} />
                <Field label="タイトル" error={announcementForm.formState.errors.title?.message}>
                  <Input {...announcementForm.register("title")} />
                </Field>
                <Field label="本文" error={announcementForm.formState.errors.body?.message}>
                  <Textarea {...announcementForm.register("body")} />
                </Field>
                <Field label="公開状態">
                  <Select {...announcementForm.register("status")}>
                    <option value="draft">下書き</option>
                    {canApprove ? <option value="published">公開</option> : null}
                  </Select>
                </Field>
                <div className="flex gap-2">
                  <Button type="submit">{editingAnnouncementId ? "お知らせを更新" : "お知らせを追加"}</Button>
                  {editingAnnouncementId ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingAnnouncementId(null);
                        announcementForm.reset({ title: "", body: "", status: "draft" });
                      }}
                    >
                      編集をキャンセル
                    </Button>
                  ) : null}
                </div>
              </form>

              <ResourceTable
                columns={["タイトル", "公開", "承認状態", "更新健全性", "公開日", "更新日", "操作"]}
                rows={filteredAnnouncements.map((announcement: Announcement) => (
                  <tr key={announcement.id}>
                    <Td>{announcement.title}</Td>
                    <Td><Badge>{announcement.status === "published" ? "公開" : "下書き"}</Badge></Td>
                    <Td>{renderApprovalBadge(announcement.approvalStatus)}</Td>
                    <Td><Badge className={getFreshnessTone(getFreshnessStatus(announcement.updatedAt))}>{getFreshnessLabel(announcement.updatedAt)}</Badge></Td>
                    <Td>{formatDate(announcement.publishedAt)}</Td>
                    <Td>{formatDate(announcement.updatedAt)}</Td>
                    <Td className="space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingAnnouncementId(announcement.id);
                          announcementForm.reset({
                            title: announcement.title,
                            body: announcement.body,
                            status: announcement.status
                          });
                        }}
                      >
                        編集
                      </Button>
                      {canApprove ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => content.toggleAnnouncementStatus(announcement.id, role)}
                          >
                            公開切替
                          </Button>
                          {announcement.approvalStatus === "pending" ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => openReview({ kind: "announcement", id: announcement.id, title: announcement.title, approvalStatus: announcement.approvalStatus, updatedAt: announcement.updatedAt, reviewComment: announcement.reviewComment })}
                            >
                              レビュー
                            </Button>
                          ) : null}
                        </>
                      ) : announcement.approvalStatus !== "pending" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => content.requestAnnouncementReview(announcement.id, role)}
                        >
                          承認申請
                        </Button>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-900">承認待ち</Badge>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => content.deleteAnnouncement(announcement.id, role)}
                      >
                        削除
                      </Button>
                    </Td>
                  </tr>
                ))}
              />
            </div>
          ) : null}

          {resourceType === "quick-link" ? (
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-1 xl:grid-cols-[1.1fr_1.2fr]">
              <form
                className="space-y-3"
                onSubmit={quickLinkForm.handleSubmit((values) => {
                  const payload = {
                    label: values.label,
                    url: values.url,
                    categoryId: values.categoryId,
                    description: values.description,
                    sortOrder: values.sortOrder
                  };

                  if (editingQuickLinkId) {
                    content.updateQuickLink(editingQuickLinkId, payload, role);
                  } else {
                    content.addQuickLink(payload, role);
                  }

                  setEditingQuickLinkId(null);
                  quickLinkForm.reset(getQuickLinkDefaults(categories));
                })}
              >
                <FormHeader title={editingQuickLinkId ? "クイックリンクを編集" : "クイックリンクを追加"} />
                <Field label="表示名" error={quickLinkForm.formState.errors.label?.message}>
                  <Input {...quickLinkForm.register("label")} />
                </Field>
                <Field label="URL" error={quickLinkForm.formState.errors.url?.message}>
                  <Input {...quickLinkForm.register("url")} />
                </Field>
                <Field label="カテゴリ" error={quickLinkForm.formState.errors.categoryId?.message}>
                  <Select {...quickLinkForm.register("categoryId")}>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="説明" error={quickLinkForm.formState.errors.description?.message}>
                  <Textarea {...quickLinkForm.register("description")} className="min-h-24" />
                </Field>
                <Field label="並び順" error={quickLinkForm.formState.errors.sortOrder?.message}>
                  <Input type="number" {...quickLinkForm.register("sortOrder")} />
                </Field>
                <div className="flex gap-2">
                  <Button type="submit">{editingQuickLinkId ? "クイックリンクを更新" : "クイックリンクを追加"}</Button>
                  {editingQuickLinkId ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingQuickLinkId(null);
                        quickLinkForm.reset(getQuickLinkDefaults(categories));
                      }}
                    >
                      編集をキャンセル
                    </Button>
                  ) : null}
                </div>
              </form>

              <ResourceTable
                columns={["表示名", "カテゴリ", "URL", "並び順", "操作"]}
                rows={filteredQuickLinks.map((quickLink: QuickLink) => (
                  <tr key={quickLink.id}>
                    <Td>{quickLink.label}</Td>
                    <Td>{categoryNameMap.get(quickLink.categoryId)}</Td>
                    <Td className="max-w-72 break-all">{quickLink.url}</Td>
                    <Td>{quickLink.sortOrder}</Td>
                    <Td className="space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingQuickLinkId(quickLink.id);
                          quickLinkForm.reset({
                            label: quickLink.label,
                            url: quickLink.url,
                            categoryId: quickLink.categoryId,
                            description: quickLink.description,
                            sortOrder: quickLink.sortOrder
                          });
                        }}
                      >
                        編集
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => content.deleteQuickLink(quickLink.id, role)}
                      >
                        削除
                      </Button>
                    </Td>
                  </tr>
                ))}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-ink sm:mt-2 sm:text-3xl">{value}</p>
    </div>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
    </label>
  );
}

function FormHeader({ title }: { title: string }) {
  return <h3 className="text-lg font-semibold text-ink">{title}</h3>;
}

function ResourceTable({ columns, rows }: { columns: string[]; rows: React.ReactNode[] }) {
  return (
    <div className="-mx-3 overflow-x-auto rounded-xl border border-slate-200 sm:mx-0">
      <Table>
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <Th key={column} className="whitespace-nowrap text-xs sm:text-sm">{column}</Th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>
  );
}

function RoleOptions() {
  const roles: Role[] = ["employee", "manager", "editor", "admin"];

  return (
    <>
      {roles.map((role) => (
        <option key={role} value={role}>
          {role === "employee" ? "一般社員" : role === "manager" ? "管理職" : role === "editor" ? "編集担当" : "管理者"}
        </option>
      ))}
    </>
  );
}

function getApprovalLabel(status: ApprovalStatus) {
  return (
    {
      not_requested: "未申請",
      pending: "承認待ち",
      approved: "承認済み",
      changes_requested: "差し戻し"
    } satisfies Record<ApprovalStatus, string>
  )[status];
}

function getArticleDefaults(categories: Category[]): ArticleFormValues {
  return {
    title: "",
    slug: "",
    categoryId: categories[0]?.id ?? "",
    summary: "",
    content: "",
    tags: "",
    status: "draft",
    visibilityRole: "employee"
  };
}

function getFaqDefaults(categories: Category[]): FAQFormValues {
  return {
    question: "",
    answer: "",
    categoryId: categories[0]?.id ?? "",
    tags: "",
    status: "draft",
    visibilityRole: "employee"
  };
}

function getQuickLinkDefaults(categories: Category[]): QuickLinkFormValues {
  return {
    label: "",
    url: "/tools/time-attendance",
    categoryId: categories[0]?.id ?? "",
    description: "",
    sortOrder: 1
  };
}
