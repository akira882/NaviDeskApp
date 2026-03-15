"use client";

import { useEffect, useRef } from "react";

import { useContent } from "@/components/content-provider";
import type { SearchSurface } from "@/types/domain";

export function useSearchTelemetry(params: {
  query: string;
  surface: SearchSurface;
  resultCount: number;
}) {
  const { recordSearch } = useContent();
  const lastLoggedSignature = useRef<string | null>(null);

  useEffect(() => {
    const normalizedQuery = params.query.trim();

    if (normalizedQuery.length < 2) {
      return;
    }

    const signature = `${params.surface}:${normalizedQuery.toLowerCase()}:${params.resultCount}`;

    if (lastLoggedSignature.current === signature) {
      return;
    }

    const timer = window.setTimeout(() => {
      recordSearch({
        query: normalizedQuery,
        surface: params.surface,
        resultCount: params.resultCount
      });
      lastLoggedSignature.current = signature;
    }, 500);

    return () => window.clearTimeout(timer);
  }, [params.query, params.resultCount, params.surface, recordSearch]);
}
