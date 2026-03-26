import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";

import { articles, faqs, announcements } from "@/data/mock/seed";

/**
 * Security Test Suite
 *
 * このテストスイートは、OWASPトップ10に基づくセキュリティ脆弱性を検出します：
 * 1. XSS (Cross-Site Scripting) 対策
 * 2. CSRF (Cross-Site Request Forgery) 対策
 * 3. SQL Injection 対策 (将来のDB実装用)
 * 4. 機密情報漏洩の防止
 */

describe("XSS対策", () => {
  it("記事タイトルにHTMLタグが含まれていない", () => {
    const dangerousPatterns = /<script|<iframe|javascript:|onerror=|onclick=/i;

    articles.forEach((article) => {
      expect(article.title).not.toMatch(dangerousPatterns);
      expect(article.summary).not.toMatch(dangerousPatterns);
      expect(article.content).not.toMatch(dangerousPatterns);
    });
  });

  it("FAQにHTMLタグが含まれていない", () => {
    const dangerousPatterns = /<script|<iframe|javascript:|onerror=|onclick=/i;

    faqs.forEach((faq) => {
      expect(faq.question).not.toMatch(dangerousPatterns);
      expect(faq.answer).not.toMatch(dangerousPatterns);
    });
  });

  it("お知らせにHTMLタグが含まれていない", () => {
    const dangerousPatterns = /<script|<iframe|javascript:|onerror=|onclick=/i;

    announcements.forEach((announcement) => {
      expect(announcement.title).not.toMatch(dangerousPatterns);
      expect(announcement.body).not.toMatch(dangerousPatterns);
    });
  });
});

describe("CSRF対策", () => {
  it("サーバーコンポーネントが server-only をimportしている", async () => {
    const serverFiles = await glob("lib/server/**/*.ts", {
      cwd: process.cwd(),
      absolute: true
    });

    for (const file of serverFiles) {
      const content = fs.readFileSync(file, "utf-8");
      expect(content, `${path.basename(file)} should import "server-only"`).toContain('"server-only"');
    }
  });

  it("リポジトリが server-only をimportしている", () => {
    const repositoryFile = path.join(process.cwd(), "data/repositories/content-repository.ts");
    const content = fs.readFileSync(repositoryFile, "utf-8");
    expect(content).toContain('"server-only"');
  });
});

describe("機密情報漏洩の防止", () => {
  it("クライアントコンポーネントがリポジトリを直接importしていない", async () => {
    const clientFiles = await glob("app/components/**/*.tsx", {
      cwd: process.cwd(),
      absolute: true
    });

    for (const file of clientFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const basename = path.basename(file);

      // "use client" を含むファイルのみチェック
      if (content.includes('"use client"') || content.includes("'use client'")) {
        expect(
          content,
          `${basename} should not import from data/repositories (client component)`
        ).not.toMatch(/from\s+["']@\/data\/repositories/);
      }
    }
  });

  it("環境変数がクライアント側に露出していない", async () => {
    const clientFiles = await glob("app/**/*.tsx", {
      cwd: process.cwd(),
      absolute: true
    });

    for (const file of clientFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const basename = path.basename(file);

      // "use client" を含むファイルのみチェック
      if (content.includes('"use client"') || content.includes("'use client'")) {
        // NEXT_PUBLIC_ 以外の環境変数参照を検出
        // NODE_ENVは開発/本番判定のため例外として許可
        const envPattern = /process\.env\.(?!NEXT_PUBLIC_|NODE_ENV)/g;
        const matches = content.match(envPattern);

        expect(
          matches,
          `${basename} should not reference non-NEXT_PUBLIC_ env vars (client component)`
        ).toBeNull();
      }
    }
  });
});

describe("SQL Injection対策 (将来のDB実装用)", () => {
  it("直接的なSQL文字列連結が存在しない", async () => {
    const serverFiles = await glob("lib/**/*.ts", {
      cwd: process.cwd(),
      absolute: true,
      ignore: ["**/*.test.ts", "**/*.spec.ts"]
    });

    for (const file of serverFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const basename = path.basename(file);

      // 危険なSQL文字列連結パターンを検出
      const dangerousPatterns = [
        /`SELECT.*\$\{.*\}`/,  // Template literals with variables in SELECT
        /`INSERT.*\$\{.*\}`/,  // Template literals with variables in INSERT
        /`UPDATE.*\$\{.*\}`/,  // Template literals with variables in UPDATE
        /`DELETE.*\$\{.*\}`/   // Template literals with variables in DELETE
      ];

      for (const pattern of dangerousPatterns) {
        expect(
          content,
          `${basename} should not contain direct SQL string concatenation`
        ).not.toMatch(pattern);
      }
    }
  });
});

describe("セキュリティヘッダー", () => {
  it("next.config.ts にCSPヘッダーが設定されている", () => {
    const configFile = path.join(process.cwd(), "next.config.ts");
    const content = fs.readFileSync(configFile, "utf-8");

    expect(content).toContain("Content-Security-Policy");
    expect(content).toContain("Strict-Transport-Security");
    expect(content).toContain("X-Frame-Options");
    expect(content).toContain("X-Content-Type-Options");
  });
});

describe("Rate Limiting", () => {
  it("middleware.ts が存在する", () => {
    const middlewareFile = path.join(process.cwd(), "middleware.ts");
    expect(fs.existsSync(middlewareFile)).toBe(true);
  });

  it("middleware.ts にRate Limitingロジックが実装されている", () => {
    const middlewareFile = path.join(process.cwd(), "middleware.ts");
    const content = fs.readFileSync(middlewareFile, "utf-8");

    expect(content).toContain("rateLimit");
    expect(content).toContain("Too Many Requests");
    expect(content).toContain("429");
  });
});
