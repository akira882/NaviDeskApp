import { describe, expect, it } from "vitest";

import { categories } from "@/data/mock/seed";
import { createInitialPortalState, searchContent } from "@/lib/content-helpers";
import { articles, announcements, auditLogs, faqs, quickLinks } from "@/data/mock/seed";

const state = createInitialPortalState({
  articles,
  faqs,
  announcements,
  quickLinks,
  auditLogs
});

describe("content helpers", () => {
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
});
