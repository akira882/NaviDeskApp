import { describe, expect, it } from "vitest";

import { articles, announcements, auditLogs, categories, faqs, quickLinks, searchLogs, users } from "@/data/mock/seed";
import {
  buildAuditLog,
  createInitialPortalState,
  listFailedSearchThemes,
  listPublishedAnnouncements,
  listRecentVisibleArticles,
  listSortedQuickLinks,
  listVisibleArticles,
  listVisibleFaqs,
  resolveActorId,
  searchContent,
  searchFaqs
} from "@/lib/content-helpers";

const state = createInitialPortalState({
  articles,
  faqs,
  announcements,
  quickLinks,
  auditLogs,
  searchLogs
});

describe("content helpers", () => {
  describe("searchContent", () => {
    it("returns employee-visible search results for known keywords", () => {
      const results = searchContent(state, categories, "VPN 接続", "employee");

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((result) => result.title.includes("VPN"))).toBe(true);
    });

    it("hides manager-only content from employee search", () => {
      const results = searchContent(state, categories, "承認", "employee");

      expect(results.some((result) => result.title.includes("管理職"))).toBe(false);
    });

    it("shows manager content to manager role", () => {
      const results = searchContent(state, categories, "承認", "manager");

      expect(results.some((result) => result.title.includes("管理職"))).toBe(true);
    });

    it("returns empty array for empty query", () => {
      const results = searchContent(state, categories, "", "employee");
      expect(results).toEqual([]);
    });

    it("returns up to 6 results maximum", () => {
      const results = searchContent(state, categories, "申請", "admin");
      expect(results.length).toBeLessThanOrEqual(6);
    });

    it("sorts results by score descending", () => {
      const results = searchContent(state, categories, "VPN", "employee");
      if (results.length > 1) {
        expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
      }
    });
  });

  describe("listVisibleArticles", () => {
    it("filters by published status", () => {
      const visible = listVisibleArticles(state, "admin");
      expect(visible.every((article) => article.status === "published")).toBe(true);
    });

    it("filters by role visibility", () => {
      const employeeVisible = listVisibleArticles(state, "employee");
      const adminVisible = listVisibleArticles(state, "admin");
      expect(adminVisible.length).toBeGreaterThanOrEqual(employeeVisible.length);
    });
  });

  describe("listVisibleFaqs", () => {
    it("filters by published status", () => {
      const visible = listVisibleFaqs(state, "admin");
      expect(visible.every((faq) => faq.status === "published")).toBe(true);
    });

    it("filters by role visibility", () => {
      const employeeVisible = listVisibleFaqs(state, "employee");
      const adminVisible = listVisibleFaqs(state, "admin");
      expect(adminVisible.length).toBeGreaterThanOrEqual(employeeVisible.length);
    });
  });

  describe("searchFaqs", () => {
    it("filters by query string", () => {
      const results = searchFaqs(state, { query: "VPN", role: "employee" });
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((faq) => {
          const text = `${faq.question} ${faq.answer} ${faq.tags.join(" ")}`.toLowerCase();
          return text.includes("vpn");
        })
      ).toBe(true);
    });

    it("filters by category", () => {
      const categoryId = categories[0].id;
      const results = searchFaqs(state, { categoryId, role: "admin" });
      expect(results.every((faq) => faq.categoryId === categoryId)).toBe(true);
    });

    it("applies both query and category filters", () => {
      const categoryId = categories[0].id;
      const results = searchFaqs(state, { query: "申請", categoryId, role: "admin" });
      expect(results.every((faq) => faq.categoryId === categoryId)).toBe(true);
    });
  });

  describe("listRecentVisibleArticles", () => {
    it("sorts recent visible articles by updated timestamp", () => {
      const results = listRecentVisibleArticles(state, "employee", 3);

      expect(results).toHaveLength(3);
      expect(results[0].updatedAt >= results[1].updatedAt).toBe(true);
      expect(results[1].updatedAt >= results[2].updatedAt).toBe(true);
    });

    it("respects role visibility", () => {
      const employeeResults = listRecentVisibleArticles(state, "employee", 10);
      const adminResults = listRecentVisibleArticles(state, "admin", 10);
      expect(adminResults.length).toBeGreaterThanOrEqual(employeeResults.length);
    });
  });

  describe("listPublishedAnnouncements", () => {
    it("filters by published status", () => {
      const published = listPublishedAnnouncements(state);
      expect(published.every((announcement) => announcement.status === "published")).toBe(true);
    });

    it("sorts by publishedAt descending", () => {
      const published = listPublishedAnnouncements(state);
      if (published.length > 1) {
        expect(published[0].publishedAt! >= published[1].publishedAt!).toBe(true);
      }
    });
  });

  describe("listSortedQuickLinks", () => {
    it("sorts by sortOrder ascending", () => {
      const sorted = listSortedQuickLinks(state);
      if (sorted.length > 1) {
        expect(sorted[0].sortOrder).toBeLessThanOrEqual(sorted[1].sortOrder);
      }
    });
  });

  describe("listFailedSearchThemes", () => {
    it("aggregates failed search themes", () => {
      const themes = listFailedSearchThemes(searchLogs);

      expect(themes[0]?.query).toBeTruthy();
      expect(themes.every((theme) => theme.count >= 1)).toBe(true);
    });

    it("sorts by count descending", () => {
      const themes = listFailedSearchThemes(searchLogs);
      if (themes.length > 1) {
        expect(themes[0].count).toBeGreaterThanOrEqual(themes[1].count);
      }
    });
  });

  describe("buildAuditLog", () => {
    it("creates audit log with required fields", () => {
      const log = buildAuditLog({
        actorId: "u-1",
        action: "create",
        targetType: "article",
        targetId: "art-1",
        detail: "Test detail"
      });

      expect(log.id).toBeDefined();
      expect(log.actorId).toBe("u-1");
      expect(log.action).toBe("create");
      expect(log.targetType).toBe("article");
      expect(log.targetId).toBe("art-1");
      expect(log.detail).toBe("Test detail");
      expect(log.timestamp).toBeDefined();
    });

    it("generates unique IDs", () => {
      const log1 = buildAuditLog({
        actorId: "u-1",
        action: "create",
        targetType: "article",
        targetId: "art-1",
        detail: "Test 1"
      });
      const log2 = buildAuditLog({
        actorId: "u-1",
        action: "create",
        targetType: "article",
        targetId: "art-1",
        detail: "Test 2"
      });

      expect(log1.id).not.toBe(log2.id);
    });
  });

  describe("resolveActorId", () => {
    it("returns user ID for matching role", () => {
      const actorId = resolveActorId(users, "admin");
      expect(actorId).toBe(users.find((u) => u.role === "admin")?.id);
    });

    it("returns first user ID when role not found", () => {
      const limitedUsers = users.filter((user) => user.role !== "admin");
      const actorId = resolveActorId(limitedUsers, "admin");
      expect(actorId).toBe(limitedUsers[0].id);
    });

    it("returns system ID when no users exist", () => {
      const actorId = resolveActorId([], "admin");
      expect(actorId).toBe("u-system");
    });
  });
});
