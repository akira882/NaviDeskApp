import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ContentProvider, useContent } from "@/components/content-provider";

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
      <button
        type="button"
        onClick={() => content.toggleArticleStatus("art-paid-leave", "admin")}
      >
        toggle article
      </button>
      <button
        type="button"
        onClick={() => content.deleteQuickLink("ql-4", "editor")}
      >
        delete quicklink
      </button>
      <p data-testid="article-count">{content.articles.length}</p>
      <p data-testid="paid-leave-status">
        {content.articles.find((article) => article.id === "art-paid-leave")?.status}
      </p>
      <p data-testid="quicklink-exists">
        {String(content.quickLinks.some((quickLink) => quickLink.id === "ql-4"))}
      </p>
      <p data-testid="audit-count">{content.auditLogs.length}</p>
    </div>
  );
}

describe("ContentProvider", () => {
  it("updates shared content and audit logs for management actions", async () => {
    window.localStorage.clear();
    const user = userEvent.setup();

    render(
      <ContentProvider>
        <Harness />
      </ContentProvider>
    );

    const initialArticleCount = Number(screen.getByTestId("article-count").textContent);
    const initialAuditCount = Number(screen.getByTestId("audit-count").textContent);

    await user.click(screen.getByRole("button", { name: "add article" }));
    expect(Number(screen.getByTestId("article-count").textContent)).toBe(initialArticleCount + 1);

    await user.click(screen.getByRole("button", { name: "toggle article" }));
    expect(screen.getByTestId("paid-leave-status")).toHaveTextContent("draft");

    await user.click(screen.getByRole("button", { name: "delete quicklink" }));
    expect(screen.getByTestId("quicklink-exists")).toHaveTextContent("false");
    expect(Number(screen.getByTestId("audit-count").textContent)).toBe(initialAuditCount + 3);
  });
});
