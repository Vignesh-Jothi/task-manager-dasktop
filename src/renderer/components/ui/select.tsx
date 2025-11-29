import * as React from "react";
import { cn } from "./utils";

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-md border bg-[var(--bg-card)] text-[color:var(--text-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
        className
      )}
      {...props}
    />
  );
}
