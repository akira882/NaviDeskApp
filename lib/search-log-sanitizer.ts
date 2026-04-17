/**
 * 検索クエリからPII（個人識別情報）を除去するサニタイザー。
 *
 * 対象パターン:
 *   1. メールアドレス
 *   2. 社員番号（英字プレフィックス + 数字、または単独の長い数字列）
 *   3. 氏名 + 敬称・役職（例: 田中部長、山本さん）
 *
 * 本番環境では形態素解析ベースのNLPに置き換えることを推奨。
 */

export type SanitizeResult = {
  sanitized: string;
  wasSanitized: boolean;
};

export const LOG_RETENTION_DAYS = 90;

// メールアドレス: user@domain.tld
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

// 社員番号: 英字1-3文字 + 数字4-8桁 (例: E12345, EMP001234)
const EMPLOYEE_ID_PREFIXED = /\b[A-Za-z]{1,3}\d{4,8}\b/g;

// 数字のみの番号: 5-8桁の独立した数字列
const EMPLOYEE_ID_NUMERIC = /\b\d{5,8}\b/g;

// 氏名 + 敬称 / 役職: 漢字2-4文字 + 敬称・役職
const NAME_WITH_HONORIFIC =
  /[\u4e00-\u9fff]{2,4}(?:さん|くん|ちゃん|様|さま|氏|君|先生|部長|課長|係長|主任|社長|専務|常務|取締役|代表|本部長|事業部長|マネージャー)/g;

export function sanitizeSearchQuery(raw: string): SanitizeResult {
  let result = raw;

  result = result.replace(EMAIL, "[メールアドレス]");
  result = result.replace(EMPLOYEE_ID_PREFIXED, "[社員番号]");
  result = result.replace(EMPLOYEE_ID_NUMERIC, "[番号]");
  result = result.replace(NAME_WITH_HONORIFIC, "[氏名]");

  const sanitized = result.trim();
  return { sanitized, wasSanitized: sanitized !== raw.trim() };
}

export function isWithinRetentionPeriod(timestamp: string, now = new Date()): boolean {
  const ageMs = now.getTime() - new Date(timestamp).getTime();
  return ageMs <= LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

export function filterSearchLogsByRetention<T extends { timestamp: string }>(
  logs: T[],
  now = new Date()
): T[] {
  return logs.filter((log) => isWithinRetentionPeriod(log.timestamp, now));
}
