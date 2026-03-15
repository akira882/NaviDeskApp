import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ContentProvider, useContent } from "@/app/components/content-provider";
import { announcements, articles, auditLogs, faqs, quickLinks, searchLogs } from "@/data/mock/seed";
import { createInitialPortalState } from "@/lib/content-helpers";

const initialState = createInitialPortalState({
  articles,
  faqs,
  announcements,
  quickLinks,
  auditLogs,
  searchLogs
});

const actorIdByRole = {
  employee: "u-emp",
  manager: "u-mgr",
  editor: "u-edt",
  admin: "u-adm"
} as const;

function Harness() {
  const content = useContent();

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          content.addArticle(
            {
              title: "新しい申請記事",
              slug: "new-application-guide",
              categoryId: "cat-app",
              summary: "概要テスト",
              content: "本文を十分な長さで用意したテストデータです。",
              tags: ["申請"],
              status: "draft",
              visibilityRole: "employee",
              relatedArticleIds: []
            },
            "editor"
          )
        }
      >
        add article
      </button>
      <button type="button" onClick={() => content.toggleArticleStatus("art-paid-leave", "admin")}>
        toggle article
      </button>
      <button type="button" onClick={() => content.deleteQuickLink("ql-4", "editor")}>
        delete quicklink
      </button>
      <button type="button" onClick={() => content.requestArticleReview("art-attendance-fix", "editor")}>
        request article review
      </button>
      <button type="button" onClick={() => content.approveArticle("art-attendance-fix", "承認", "admin")}>
        approve article
      </button>
      <button
        type="button"
        onClick={() =>
          content.addAnnouncement(
            {
              title: "新しい運用連絡",
              body: "本文",
              status: "published"
            },
            "admin"
          )
        }
      >
        add announcement
      </button>
      <p data-testid="article-count">{content.articles.length}</p>
      <p data-testid="paid-leave-status">
        {content.articles.find((article) => article.id === "art-paid-leave")?.status}
      </p>
      <p data-testid="attendance-approval">
        {content.articles.find((article) => article.id === "art-attendance-fix")?.approvalStatus}
      </p>
      <p data-testid="quicklink-exists">
        {String(content.quickLinks.some((quickLink) => quickLink.id === "ql-4"))}
      </p>
      <p data-testid="latest-announcement-published-at">
        {content.announcements[0]?.publishedAt ? "set" : "missing"}
      </p>
      <p data-testid="audit-count">{content.auditLogs.length}</p>
    </div>
  );
}

describe("ContentProvider", () => {
  it("updates shared content and audit logs for management actions", async () => {
    const user = userEvent.setup();

    render(
      <ContentProvider initialState={initialState} actorIdByRole={actorIdByRole}>
        <Harness />
      </ContentProvider>
    );

    const initialArticleCount = Number(screen.getByTestId("article-count").textContent);
    const initialAuditCount = Number(screen.getByTestId("audit-count").textContent);

    await user.click(screen.getByRole("button", { name: "add article" }));
    expect(Number(screen.getByTestId("article-count").textContent)).toBe(initialArticleCount + 1);

    await user.click(screen.getByRole("button", { name: "toggle article" }));
    expect(screen.getByTestId("paid-leave-status")).toHaveTextContent("draft");

    await user.click(screen.getByRole("button", { name: "request article review" }));
    expect(screen.getByTestId("attendance-approval")).toHaveTextContent("pending");

    await user.click(screen.getByRole("button", { name: "approve article" }));
    expect(screen.getByTestId("attendance-approval")).toHaveTextContent("approved");

    await user.click(screen.getByRole("button", { name: "delete quicklink" }));
    expect(screen.getByTestId("quicklink-exists")).toHaveTextContent("false");

    await user.click(screen.getByRole("button", { name: "add announcement" }));
    expect(screen.getByTestId("latest-announcement-published-at")).toHaveTextContent("set");
    expect(Number(screen.getByTestId("audit-count").textContent)).toBe(initialAuditCount + 6);
  });
});
