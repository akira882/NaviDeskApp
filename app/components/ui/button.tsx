import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg border text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal/50 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: [
          "border-accent-teal-dim/50 bg-accent-teal text-ink font-semibold",
          "hover:bg-accent-teal/90 shadow-glow-sm"
        ].join(" "),
        secondary: [
          "border-line-mid bg-surface-2 text-text-secondary",
          "hover:bg-surface-3 hover:text-text-primary"
        ].join(" "),
        outline: [
          "border-line-mid bg-transparent text-text-secondary",
          "hover:bg-surface-1 hover:text-text-primary"
        ].join(" "),
        ghost: [
          "border-transparent bg-transparent text-text-muted",
          "hover:bg-surface-1 hover:text-text-secondary"
        ].join(" "),
        danger: [
          "border-accent-crimson/40 bg-accent-crimson/10 text-accent-crimson",
          "hover:bg-accent-crimson/20 hover:border-accent-crimson/60"
        ].join(" ")
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 px-3 text-xs",
        lg: "h-11 px-6"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
