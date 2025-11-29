import * as React from "react";
import { cn } from "./utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border bg-[var(--bg-card)] text-[color:var(--text-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
