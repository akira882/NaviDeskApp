import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-lg border border-line-subtle bg-surface-2 px-3 py-2",
        "text-sm text-text-primary outline-none ring-0 transition-all",
        "placeholder:text-text-muted",
        "focus:border-accent-teal/50 focus:ring-2 focus:ring-accent-teal/15",
        "shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)]",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
