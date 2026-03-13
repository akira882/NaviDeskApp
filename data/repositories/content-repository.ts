import type { Route } from "next";
import {
  announcements,
  articles,
  auditLogs,
  categories,
  faqs,
  quickLinks,
  users
} from "@/data/mock/seed";
import { canAccess } from "@/lib/roles";
import type {
  AiResponse,
  Announcement,
  AuditLog,
  QuickLink,
  Role,
  SearchResult,
  User
} from "@/types/domain";

function scoreText(query: string, text: string) {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return tokens.reduce((score, token) => score + (text.toLowerCase().includes(token) ? 1 : 0), 0);
}

export const userRepository = {
  getCurrentUser(role: Role): User {
    return users.find((user) => user.role === role) ?? users[0];
  },
  listUsers() {
    return users;
  }
};

export const categoryRepository = {
  list() {
    return categories;
  },
  findBySlug(slug: string) {
    return categories.find((category) => category.slug === slug);
  },
  findById(id: string) {
    return categories.find((category) => category.id === id);
  }
};

export const articleRepository = {
  list(role: Role) {
    return articles.filter(
      (article) => article.status === "published" && canAccess(role, article.visibilityRole)
    );
  },
  listByCategory(categoryId: string, role: Role) {
    return this.list(role).filter((article) => article.categoryId === categoryId);
  },
  findBySlug(slug: string, role: Role) {
    return this.list(role).find((article) => article.slug === slug);
  },
  findByIds(ids: string[], role: Role) {
    return this.list(role).filter((article) => ids.includes(article.id));
  },
  listAllForAdmin() {
    return articles;
  }
};

export const faqRepository = {
  list(role: Role) {
    return faqs.filter((faq) => faq.status === "published" && canAccess(role, faq.visibilityRole));
  },
  search(params: { query?: string; categoryId?: string; role: Role }) {
    const query = params.query?.trim().toLowerCase() ?? "";

    return this.list(params.role).filter((faq) => {
      const matchesCategory = params.categoryId ? faq.categoryId === params.categoryId : true;
      const haystack = [faq.question, faq.answer, faq.tags.join(" ")].join(" ").toLowerCase();
      const matchesQuery = query ? haystack.includes(query) : true;
      return matchesCategory && matchesQuery;
    });
  },
  listAllForAdmin() {
    return faqs;
  }
};

export const announcementRepository = {
  listPublished(): Announcement[] {
    return announcements
      .filter((announcement) => announcement.status === "published")
      .sort((a, b) => (a.publishedAt && b.publishedAt ? b.publishedAt.localeCompare(a.publishedAt) : 0));
  },
  listAllForAdmin() {
    return announcements;
  }
};

export const quickLinkRepository = {
  list() {
    return [...quickLinks].sort((a, b) => a.sortOrder - b.sortOrder);
  },
  listByCategory(categoryId: string): QuickLink[] {
    return this.list().filter((link) => link.categoryId === categoryId);
  },
  listAllForAdmin() {
    return quickLinks;
  }
};

export const auditLogRepository = {
  list(): AuditLog[] {
    return [...auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
};

export const searchRepository = {
  search(query: string, role: Role): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    const articleResults = articleRepository.list(role).map((article) => {
      const categoryName = categoryRepository.findById(article.categoryId)?.name ?? "未分類";
      return {
        id: article.id,
        type: "article" as const,
        title: article.title,
        summary: article.summary,
        href: `/articles/${article.slug}` as Route<`/articles/${string}`>,
        categoryName,
        score: scoreText(query, `${article.title} ${article.summary} ${article.tags.join(" ")} ${article.content}`)
      };
    });

    const faqResults = faqRepository.list(role).map((faq) => {
      const categoryName = categoryRepository.findById(faq.categoryId)?.name ?? "未分類";
      return {
        id: faq.id,
        type: "faq" as const,
        title: faq.question,
        summary: faq.answer,
        href: `/faq?highlight=${faq.id}` as Route<`/faq?highlight=${string}`>,
        categoryName,
        score: scoreText(query, `${faq.question} ${faq.answer} ${faq.tags.join(" ")}`)
      };
    });

    return [...articleResults, ...faqResults]
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }
};

export const aiGuideRepository = {
  answer(question: string, role: Role): AiResponse {
    const suggestions = searchRepository.search(question, role);

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
        message:
          "根拠が弱いため、断定回答は避けます。関連度の高い記事とFAQを確認してください。",
        suggestions: top
      };
    }

    const answer = `質問に近い社内情報を確認したところ、「${top[0].title}」を起点に確認するのが最短です。${top
      .map((item) => `${item.categoryName}の${item.type === "article" ? "記事" : "FAQ"}「${item.title}」`)
      .join("、")}が関連します。制度や手順の最終判断は各記事本文の記載を優先してください。`;

    return {
      mode: "answer",
      answer,
      citations: top
    };
  }
};
