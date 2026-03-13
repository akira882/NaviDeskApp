import { z } from "zod";

import { contentStatuses, roles } from "@/types/domain";

export const roleSchema = z.enum(roles);
export const statusSchema = z.enum(contentStatuses);

export const articleFormSchema = z.object({
  title: z.string().min(2, "タイトルは2文字以上で入力してください"),
  slug: z.string().min(2, "slugを入力してください"),
  categoryId: z.string().min(1, "カテゴリを選択してください"),
  summary: z.string().min(10, "要約は10文字以上で入力してください"),
  content: z.string().min(20, "本文は20文字以上で入力してください"),
  tags: z.string().min(1, "タグを1つ以上入力してください"),
  status: statusSchema,
  visibilityRole: roleSchema
});

export const faqFormSchema = z.object({
  question: z.string().min(5, "質問を入力してください"),
  answer: z.string().min(10, "回答を入力してください"),
  categoryId: z.string().min(1, "カテゴリを選択してください"),
  tags: z.string().min(1, "タグを入力してください"),
  status: statusSchema,
  visibilityRole: roleSchema
});

export const announcementFormSchema = z.object({
  title: z.string().min(2, "タイトルを入力してください"),
  body: z.string().min(10, "本文を入力してください"),
  status: statusSchema
});

export const quickLinkFormSchema = z.object({
  label: z.string().min(2, "表示名を入力してください"),
  url: z.string().url("URL形式で入力してください"),
  categoryId: z.string().min(1, "カテゴリを選択してください"),
  description: z.string().min(5, "説明を入力してください"),
  sortOrder: z.coerce.number().int().min(1, "並び順は1以上です")
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;
export type FAQFormValues = z.infer<typeof faqFormSchema>;
export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
export type QuickLinkFormValues = z.infer<typeof quickLinkFormSchema>;
