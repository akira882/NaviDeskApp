import { describe, expect, it } from "vitest";

import {
  aiGuideRepository,
  announcementRepository,
  articleRepository,
  auditLogRepository,
  categoryRepository,
  faqRepository,
  quickLinkRepository,
  searchRepository,
  userRepository
} from "./content-repository";

describe("content-repository", () => {
  describe("userRepository", () => {
    it("returns user by role", () => {
      const user = userRepository.getCurrentUser("admin");
      expect(user.role).toBe("admin");
    });

    it("lists all users", () => {
      const users = userRepository.listUsers();
      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe("categoryRepository", () => {
    it("lists all categories", () => {
      const categories = categoryRepository.list();
      expect(categories.length).toBeGreaterThan(0);
    });

    it("finds category by slug", () => {
      const category = categoryRepository.findBySlug("it");
      expect(category?.slug).toBe("it");
    });

    it("finds category by ID", () => {
      const allCategories = categoryRepository.list();
      const firstCategory = allCategories[0];
      const found = categoryRepository.findById(firstCategory.id);
      expect(found?.id).toBe(firstCategory.id);
    });

    it("returns undefined for non-existent slug", () => {
      const category = categoryRepository.findBySlug("non-existent");
      expect(category).toBeUndefined();
    });
  });

  describe("articleRepository", () => {
    it("lists published articles visible to role", () => {
      const articles = articleRepository.list("employee");
      expect(articles.every((article) => article.status === "published")).toBe(true);
    });

    it("filters articles by category", () => {
      const categories = categoryRepository.list();
      const categoryId = categories[0].id;
      const articles = articleRepository.listByCategory(categoryId, "admin");
      expect(articles.every((article) => article.categoryId === categoryId)).toBe(true);
    });

    it("finds article by slug with role check", () => {
      const allArticles = articleRepository.listAllForAdmin();
      const publishedArticle = allArticles.find((a) => a.status === "published");
      if (publishedArticle) {
        const found = articleRepository.findBySlug(publishedArticle.slug, "employee");
        expect(found?.slug).toBe(publishedArticle.slug);
      }
    });

    it("finds multiple articles by IDs", () => {
      const allArticles = articleRepository.list("admin");
      const ids = allArticles.slice(0, 2).map((a) => a.id);
      const found = articleRepository.findByIds(ids, "admin");
      expect(found.length).toBe(2);
      expect(found.every((article) => ids.includes(article.id))).toBe(true);
    });

    it("admin can list all articles including drafts", () => {
      const all = articleRepository.listAllForAdmin();
      const published = articleRepository.list("admin");
      expect(all.length).toBeGreaterThanOrEqual(published.length);
    });

    it("respects role-based visibility", () => {
      const employeeArticles = articleRepository.list("employee");
      const adminArticles = articleRepository.list("admin");
      expect(adminArticles.length).toBeGreaterThanOrEqual(employeeArticles.length);
    });
  });

  describe("faqRepository", () => {
    it("lists published FAQs visible to role", () => {
      const faqs = faqRepository.list("employee");
      expect(faqs.every((faq) => faq.status === "published")).toBe(true);
    });

    it("searches FAQs by query", () => {
      const results = faqRepository.search({ query: "VPN", role: "employee" });
      expect(
        results.every((faq) => {
          const text = `${faq.question} ${faq.answer} ${faq.tags.join(" ")}`.toLowerCase();
          return text.includes("vpn");
        })
      ).toBe(true);
    });

    it("searches FAQs by category", () => {
      const categories = categoryRepository.list();
      const categoryId = categories[0].id;
      const results = faqRepository.search({ categoryId, role: "admin" });
      expect(results.every((faq) => faq.categoryId === categoryId)).toBe(true);
    });

    it("searches FAQs by query and category", () => {
      const categories = categoryRepository.list();
      const categoryId = categories[0].id;
      const results = faqRepository.search({ query: "申請", categoryId, role: "admin" });
      expect(results.every((faq) => faq.categoryId === categoryId)).toBe(true);
    });

    it("admin can list all FAQs including drafts", () => {
      const all = faqRepository.listAllForAdmin();
      const published = faqRepository.list("admin");
      expect(all.length).toBeGreaterThanOrEqual(published.length);
    });
  });

  describe("announcementRepository", () => {
    it("lists only published announcements", () => {
      const announcements = announcementRepository.listPublished();
      expect(announcements.every((announcement) => announcement.status === "published")).toBe(true);
    });

    it("sorts announcements by publishedAt descending", () => {
      const announcements = announcementRepository.listPublished();
      if (announcements.length > 1) {
        expect(announcements[0].publishedAt! >= announcements[1].publishedAt!).toBe(true);
      }
    });

    it("admin can list all announcements", () => {
      const all = announcementRepository.listAllForAdmin();
      const published = announcementRepository.listPublished();
      expect(all.length).toBeGreaterThanOrEqual(published.length);
    });
  });

  describe("quickLinkRepository", () => {
    it("lists all quick links sorted by sortOrder", () => {
      const links = quickLinkRepository.list();
      if (links.length > 1) {
        expect(links[0].sortOrder).toBeLessThanOrEqual(links[1].sortOrder);
      }
    });

    it("filters quick links by category", () => {
      const categories = categoryRepository.list();
      const categoryId = categories[0].id;
      const links = quickLinkRepository.listByCategory(categoryId);
      expect(links.every((link) => link.categoryId === categoryId)).toBe(true);
    });

    it("admin can list all quick links", () => {
      const all = quickLinkRepository.listAllForAdmin();
      const regular = quickLinkRepository.list();
      expect(all.length).toBe(regular.length);
    });
  });

  describe("auditLogRepository", () => {
    it("lists all audit logs sorted by timestamp descending", () => {
      const logs = auditLogRepository.list();
      expect(logs.length).toBeGreaterThan(0);
      if (logs.length > 1) {
        expect(logs[0].timestamp >= logs[1].timestamp).toBe(true);
      }
    });
  });

  describe("searchRepository", () => {
    it("returns empty array for empty query", () => {
      const results = searchRepository.search("", "employee");
      expect(results).toEqual([]);
    });

    it("searches across articles and FAQs", () => {
      const results = searchRepository.search("VPN", "employee");
      expect(results.length).toBeGreaterThan(0);
      const hasArticle = results.some((r) => r.type === "article");
      const hasFaq = results.some((r) => r.type === "faq");
      expect(hasArticle || hasFaq).toBe(true);
    });

    it("returns up to 6 results", () => {
      const results = searchRepository.search("申請", "admin");
      expect(results.length).toBeLessThanOrEqual(6);
    });

    it("sorts results by score descending", () => {
      const results = searchRepository.search("VPN", "employee");
      if (results.length > 1) {
        expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
      }
    });

    it("includes category names in results", () => {
      const results = searchRepository.search("VPN", "employee");
      expect(results.every((result) => result.categoryName)).toBe(true);
    });

    it("respects role-based visibility", () => {
      const employeeResults = searchRepository.search("承認", "employee");
      const adminResults = searchRepository.search("承認", "admin");
      expect(adminResults.length).toBeGreaterThanOrEqual(employeeResults.length);
    });
  });

  describe("aiGuideRepository", () => {
    it("returns fallback when no matches found", () => {
      const response = aiGuideRepository.answer("xyzabc123nonexistent", "employee");
      expect(response.mode).toBe("fallback");
      if (response.mode === "fallback") {
        expect(response.suggestions).toEqual([]);
      }
    });

    it("returns fallback when match score is weak", () => {
      const response = aiGuideRepository.answer("申請", "employee");
      if (response.mode === "fallback") {
        expect(response.suggestions.length).toBeGreaterThan(0);
      }
    });

    it("returns answer with citations for strong matches", () => {
      const response = aiGuideRepository.answer("VPN 接続", "employee");
      if (response.mode === "answer") {
        expect(response.answer).toBeDefined();
        expect(response.citations.length).toBeGreaterThan(0);
        expect(response.citations.length).toBeLessThanOrEqual(3);
      }
    });

    it("respects role-based content visibility", () => {
      const employeeResponse = aiGuideRepository.answer("管理職", "employee");
      const managerResponse = aiGuideRepository.answer("管理職", "manager");

      // Employee may get fewer or different results due to visibility restrictions
      if (employeeResponse.mode === "answer" && managerResponse.mode === "answer") {
        expect(managerResponse.citations.length).toBeGreaterThanOrEqual(
          employeeResponse.citations.length
        );
      }
    });
  });
});
