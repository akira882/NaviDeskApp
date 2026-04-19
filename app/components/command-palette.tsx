"use client";

import type { Route } from "next";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { useContent } from "@/components/content-provider";
import { useRole } from "@/components/role-provider";
import { useSearchTelemetry } from "@/components/use-search-telemetry";
import { Badge } from "@/components/ui/badge";
import { searchContent } from "@/lib/content-helpers";
import type { Category, SearchResult } from "@/types/domain";

const PALETTE_LIMIT = 10;

type CommandPaletteContextValue = {
  open: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return ctx;
}

/**
 * Cmd+K / Ctrl+K で起動するグローバル検索モーダル。
 *
 * 設計方針:
 * - ホームのヒーロー検索および /search ページと同じ searchContent を共有し、挙動を統一する (SSOT)。
 * - MVP は横断検索のみ。将来の「ナビゲーション」「アクション」コマンドは Dialog 側で拡張可能な構造にする。
 * - Context では `open()` のみ公開し、isOpen / query / selectedIndex の state は Provider 内部にカプセル化する。
 * - 機密クエリの履歴汚染を避けるため、パレット内の入力は URL に反映しない（結果選択時のみ遷移）。
 */
export function CommandPaletteProvider({
  categories,
  children
}: {
  categories: Category[];
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const contextValue = useMemo(() => ({ open }), [open]);

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      {isOpen ? <CommandPaletteDialog categories={categories} onClose={close} /> : null}
    </CommandPaletteContext.Provider>
  );
}

function CommandPaletteDialog({
  categories,
  onClose
}: {
  categories: Category[];
  onClose: () => void;
}) {
  const { role } = useRole();
  const content = useContent();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => searchContent(content, categories, query, role, { limit: PALETTE_LIMIT }),
    [categories, content, query, role]
  );
  useSearchTelemetry({ query, surface: "search-page", resultCount: results.length });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const goToResult = useCallback(
    (href: SearchResult["href"]) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  const goToSearchPage = useCallback(
    (rawQuery: string) => {
      onClose();
      router.push(`/search?q=${encodeURIComponent(rawQuery)}` as Route);
    },
    [onClose, router]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (results.length === 0 ? 0 : (i + 1) % results.length));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) =>
        results.length === 0 ? 0 : (i - 1 + results.length) % results.length
      );
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = query.trim();
      if (results.length > 0) {
        const target = results[selectedIndex] ?? results[0];
        goToResult(target.href);
      } else if (trimmed) {
        goToSearchPage(trimmed);
      }
    }
  }

  const trimmedQuery = query.trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="コマンドパレット"
      className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/70 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-line-subtle bg-surface-1 shadow-panel">
        <div className="flex items-center gap-2 border-b border-line-subtle px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例: 有給取得、経費精算、VPN接続"
            aria-label="検索ワード"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <kbd className="shrink-0 rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-text-muted">
            ESC
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {!trimmedQuery ? (
            <p className="p-5 text-sm text-text-muted">
              記事、FAQ、お知らせを横断検索します。↑↓で移動、Enterで開く、ESCで閉じます。
            </p>
          ) : results.length === 0 ? (
            <div className="space-y-2 p-5 text-sm text-text-secondary">
              <p>一致する結果が見つかりませんでした。</p>
              <button
                type="button"
                onClick={() => goToSearchPage(trimmedQuery)}
                className="text-accent-teal hover:underline underline-offset-4"
              >
                「{trimmedQuery}」で検索ページを開く →
              </button>
            </div>
          ) : (
            <ul className="py-2">
              {results.map((result, idx) => {
                const active = idx === selectedIndex;
                return (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => goToResult(result.href)}
                      className={[
                        "flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors",
                        active ? "bg-accent-teal/10" : "hover:bg-surface-2"
                      ].join(" ")}
                    >
                      <Badge className="mt-0.5 shrink-0">
                        {result.type === "article" ? "記事" : "FAQ"}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {result.title}
                        </p>
                        <p className="truncate text-xs text-text-muted">{result.categoryName}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line-subtle px-4 py-2 text-[11px] text-text-muted">
          <span>横断検索（記事 + FAQ）</span>
          <span className="flex gap-1.5">
            <kbd className="rounded bg-surface-2 px-1.5 py-0.5 font-mono">↑↓</kbd>
            <kbd className="rounded bg-surface-2 px-1.5 py-0.5 font-mono">⏎</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
