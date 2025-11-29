import * as React from "react";
import { cn } from "./utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const base =
    "badge inline-flex items-center rounded px-2 py-0.5 text-xs font-medium";
  const variants = {
    default: "bg-[color:var(--bg-sidebar)] text-[color:var(--text-secondary)]",
    success: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
    warning: "bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
    danger: "bg-[color:var(--error)]/10 text-[color:var(--error)]",
  };
  return <span className={cn(base, variants[variant], className)} {...props} />;
}
