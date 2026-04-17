import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-28 w-full rounded-lg border border-line-subtle bg-surface-2 px-3 py-2.5",
        "text-sm text-text-primary outline-none transition-all resize-y",
        "placeholder:text-text-muted",
        "focus:border-accent-teal/50 focus:ring-2 focus:ring-accent-teal/15",
        "shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)]",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
