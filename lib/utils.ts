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

export function formatDateTime(date: string | null) {
  if (!date) {
    return "未設定";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export function splitTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * Scores text relevance based on query tokens with Japanese text support
 * Uses multiple matching strategies:
 * - Exact substring match (high score)
 * - Word/token-level match
 * - Character n-gram match (2-char and 3-char)
 */
export function scoreText(query: string, text: string): number {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedText = text.toLowerCase();

  if (!normalizedQuery) {
    return 0;
  }

  let score = 0;

  // Strategy 1: Exact substring match (highest weight)
  if (normalizedText.includes(normalizedQuery)) {
    score += 10;
  }

  // Strategy 2: Token-based matching (space-separated words)
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (normalizedText.includes(token)) {
      score += 3;
    }
  }

  // Strategy 3: Character bigram matching (for Japanese text)
  const bigramsQuery = extractNgrams(normalizedQuery, 2);
  const bigramsText = extractNgrams(normalizedText, 2);
  const bigramMatches = countCommonElements(bigramsQuery, bigramsText);
  score += Math.min(bigramMatches, 5); // Cap at 5 to avoid overwhelming other signals

  // Strategy 4: Character trigram matching (for Japanese text)
  const trigramsQuery = extractNgrams(normalizedQuery, 3);
  const trigramsText = extractNgrams(normalizedText, 3);
  const trigramMatches = countCommonElements(trigramsQuery, trigramsText);
  score += Math.min(trigramMatches * 2, 10); // Higher weight for trigrams, cap at 10

  return score;
}

/**
 * Extract n-grams from text
 */
function extractNgrams(text: string, n: number): string[] {
  const grams: string[] = [];
  for (let i = 0; i <= text.length - n; i++) {
    grams.push(text.slice(i, i + n));
  }
  return grams;
}

/**
 * Count common elements between two arrays
 */
function countCommonElements(arr1: string[], arr2: string[]): number {
  const set2 = new Set(arr2);
  let count = 0;
  for (const item of arr1) {
    if (set2.has(item)) {
      count++;
    }
  }
  return count;
}
