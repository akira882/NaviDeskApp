import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null) {
  if (!date) {
    return "未公開";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(date));
}

export function splitTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * Scores text relevance based on query tokens
 * Returns the number of matching tokens found in the text
 */
export function scoreText(query: string, text: string): number {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return tokens.reduce((score, token) => score + (text.toLowerCase().includes(token) ? 1 : 0), 0);
}
