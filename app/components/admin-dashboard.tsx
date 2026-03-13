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
import { formatDate, splitTags } from "@/lib/utils";
import type { Article, Announcement, Category, FAQ, QuickLink, Role } from "@/types/domain";

type ResourceType = "article" | "faq" | "announcement" | "quick-link";

export function AdminDashboard({ categories }: { categories: Category[] }) {
  const { role } = useRole();
  const content = useContent();
  const [resourceType, setResourceType] = useState<ResourceType>("article");
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

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <MetricCard label="記事" value={content.articles.length} />
          <MetricCard label="FAQ" value={content.faqs.length} />
          <MetricCard label="お知らせ" value={content.announcements.length} />
          <MetricCard label="クイックリンク" value={content.quickLinks.length} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
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

          {resourceType === "article" ? (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_1.2fr]">
              <form
                className="space-y-3"
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
                      <option value="draft">draft</option>
                      <option value="published">published</option>
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
                columns={["タイトル", "カテゴリ", "公開", "閲覧ロール", "更新日", "操作"]}
                rows={content.articles.map((article: Article) => (
                  <tr key={article.id}>
                    <Td>{article.title}</Td>
                    <Td>{categoryNameMap.get(article.categoryId)}</Td>
                    <Td><Badge>{article.status}</Badge></Td>
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
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => content.toggleArticleStatus(article.id, role)}
                      >
                        公開切替
                      </Button>
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
            <div className="grid gap-6 xl:grid-cols-[1.1fr_1.2fr]">
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
                      <option value="draft">draft</option>
                      <option value="published">published</option>
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
                columns={["質問", "カテゴリ", "公開", "閲覧ロール", "更新日", "操作"]}
                rows={content.faqs.map((faq: FAQ) => (
                  <tr key={faq.id}>
                    <Td>{faq.question}</Td>
                    <Td>{categoryNameMap.get(faq.categoryId)}</Td>
                    <Td><Badge>{faq.status}</Badge></Td>
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
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => content.toggleFaqStatus(faq.id, role)}
                      >
                        公開切替
                      </Button>
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
            <div className="grid gap-6 xl:grid-cols-[1.1fr_1.2fr]">
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
                    <option value="draft">draft</option>
                    <option value="published">published</option>
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
                columns={["タイトル", "公開", "公開日", "更新日", "操作"]}
                rows={content.announcements.map((announcement: Announcement) => (
                  <tr key={announcement.id}>
                    <Td>{announcement.title}</Td>
                    <Td><Badge>{announcement.status}</Badge></Td>
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
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => content.toggleAnnouncementStatus(announcement.id, role)}
                      >
                        公開切替
                      </Button>
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
            <div className="grid gap-6 xl:grid-cols-[1.1fr_1.2fr]">
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
                rows={sortedQuickLinks.map((quickLink: QuickLink) => (
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
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
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <Table>
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <Th key={column}>{column}</Th>
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
          {role}
        </option>
      ))}
    </>
  );
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
    url: "https://example.internal/",
    categoryId: categories[0]?.id ?? "",
    description: "",
    sortOrder: 1
  };
}
