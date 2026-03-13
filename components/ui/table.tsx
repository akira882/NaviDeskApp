import { cn } from "@/lib/utils";

export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return <table className={cn("w-full border-collapse text-sm", className)}>{children}</table>;
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th className="border-b border-line-subtle px-4 py-3 text-left font-semibold text-ink">{children}</th>;
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("border-b border-line-subtle px-4 py-3 align-top text-slate-700", className)}>{children}</td>;
}
