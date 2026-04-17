import { describe, expect, it } from "vitest";

import {
  filterSearchLogsByRetention,
  LOG_RETENTION_DAYS,
  sanitizeSearchQuery
} from "@/lib/search-log-sanitizer";

describe("sanitizeSearchQuery", () => {
  describe("メールアドレス", () => {
    it("メールアドレスをマスクする", () => {
      const { sanitized, wasSanitized } = sanitizeSearchQuery("yamamoto@example.com のパスワード変更");
      expect(sanitized).not.toContain("@example.com");
      expect(sanitized).toContain("[メールアドレス]");
      expect(wasSanitized).toBe(true);
    });

    it("複数のメールアドレスをすべてマスクする", () => {
      const { sanitized } = sanitizeSearchQuery("a@b.com と c@d.jp の両方");
      expect(sanitized).not.toContain("@");
    });
  });

  describe("社員番号", () => {
    it("英字プレフィックス付き社員番号をマスクする", () => {
      const { sanitized, wasSanitized } = sanitizeSearchQuery("E12345 の申請状況");
      expect(sanitized).not.toContain("E12345");
      expect(sanitized).toContain("[社員番号]");
      expect(wasSanitized).toBe(true);
    });

    it("EMP形式の社員番号をマスクする", () => {
      const { sanitized } = sanitizeSearchQuery("EMP001234 経費精算");
      expect(sanitized).not.toContain("EMP001234");
    });

    it("5桁以上の独立した数字列をマスクする", () => {
      const { sanitized } = sanitizeSearchQuery("12345678 の勤怠確認");
      expect(sanitized).not.toContain("12345678");
      expect(sanitized).toContain("[番号]");
    });

    it("4桁以下の数字はマスクしない（年度・番号として使用）", () => {
      const { sanitized, wasSanitized } = sanitizeSearchQuery("2026年 4月 有給");
      expect(sanitized).toContain("2026");
      expect(wasSanitized).toBe(false);
    });
  });

  describe("氏名 + 敬称・役職", () => {
    it("部長の敬称をマスクする", () => {
      const { sanitized, wasSanitized } = sanitizeSearchQuery("田中部長の承認フロー");
      expect(sanitized).not.toContain("田中部長");
      expect(sanitized).toContain("[氏名]");
      expect(wasSanitized).toBe(true);
    });

    it("さん敬称をマスクする", () => {
      const { sanitized } = sanitizeSearchQuery("山本さんの休暇申請");
      expect(sanitized).not.toContain("山本さん");
      expect(sanitized).toContain("[氏名]");
    });

    it("課長をマスクする", () => {
      const { sanitized } = sanitizeSearchQuery("鈴木課長から承認もらえない");
      expect(sanitized).not.toContain("鈴木課長");
    });

    it("複数の氏名をすべてマスクする", () => {
      const { sanitized } = sanitizeSearchQuery("田中部長と山本さんの件");
      expect(sanitized).not.toContain("田中部長");
      expect(sanitized).not.toContain("山本さん");
    });
  });

  describe("通常クエリ（マスク不要）", () => {
    it("業務キーワードのみのクエリはそのまま保持する", () => {
      const { sanitized, wasSanitized } = sanitizeSearchQuery("VPN 接続できない");
      expect(sanitized).toBe("VPN 接続できない");
      expect(wasSanitized).toBe(false);
    });

    it("有給申請クエリはマスクしない", () => {
      const { sanitized, wasSanitized } = sanitizeSearchQuery("有給申請 手順");
      expect(sanitized).toBe("有給申請 手順");
      expect(wasSanitized).toBe(false);
    });

    it("空白のみのクエリは空文字を返す", () => {
      const { sanitized } = sanitizeSearchQuery("   ");
      expect(sanitized).toBe("");
    });
  });

  describe("複合パターン", () => {
    it("複数のPIIが混在する場合にすべてマスクする", () => {
      const { sanitized } = sanitizeSearchQuery("田中さん E12345 user@test.com の勤怠");
      expect(sanitized).not.toContain("田中さん");
      expect(sanitized).not.toContain("E12345");
      expect(sanitized).not.toContain("@");
      expect(sanitized).toContain("の勤怠");
    });
  });
});

describe("filterSearchLogsByRetention", () => {
  function makeLog(daysAgo: number, id: string) {
    const ts = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    return { id, timestamp: ts };
  }

  it(`${LOG_RETENTION_DAYS}日以内のログを保持する`, () => {
    const logs = [makeLog(1, "a"), makeLog(30, "b"), makeLog(89, "c")];
    const result = filterSearchLogsByRetention(logs);
    expect(result).toHaveLength(3);
  });

  it(`${LOG_RETENTION_DAYS}日超のログを除外する`, () => {
    const logs = [makeLog(1, "keep"), makeLog(91, "drop")];
    const result = filterSearchLogsByRetention(logs);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("keep");
  });

  it("ちょうど保持期間境界のログを保持する", () => {
    const logs = [makeLog(LOG_RETENTION_DAYS, "boundary")];
    const result = filterSearchLogsByRetention(logs);
    expect(result).toHaveLength(1);
  });

  it("空配列はそのまま返す", () => {
    expect(filterSearchLogsByRetention([])).toHaveLength(0);
  });
});
