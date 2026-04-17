import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line-subtle bg-surface-1 shadow-panel transition-all duration-200",
        "hover:border-line-mid hover:shadow-panel-hover",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-5 sm:p-6", className)}>{children}</div>;
}
