import { describe, expect, it } from "vitest";

import {
  announcements,
  articles,
  auditLogs,
  categories,
  faqs,
  quickLinks,
  searchLogs
} from "@/data/mock/seed";
import { mockGuideProvider } from "@/lib/ai/providers/mock-guide-provider";
import { createInitialPortalState } from "@/lib/content-helpers";

const state = createInitialPortalState({
  articles,
  faqs,
  announcements,
  quickLinks,
  auditLogs,
  searchLogs
});

describe("mockGuideProvider", () => {
  it("returns grounded answer when strong matches exist", () => {
    const result = mockGuideProvider({
      question: "VPN ガイド",
      role: "employee",
      state,
      categories
    });

    expect(result.mode).toBe("answer");
  });

  it("returns fallback when no grounded content exists", () => {
    const result = mockGuideProvider({
      question: "宇宙旅行の精算ルール",
      role: "employee",
      state,
      categories
    });

    expect(result.mode).toBe("fallback");
    if (result.mode === "fallback") {
      expect(result.message).toContain("根拠");
    }
  });
});
