import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  blur?: boolean; // enable backdrop blur (may trigger GPU overlay warnings)
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  blur = false,
}: DialogProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className={cn(
          "absolute inset-0 bg-black/50",
          blur ? "backdrop-blur-sm" : ""
        )}
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative z-10 w-[92%] max-w-lg rounded-xl shadow-xl border border-[color:var(--text-muted)]/20",
          "bg-[var(--bg-card)] text-[color:var(--text-primary)] animate-scale-in"
        )}
      >
        <div className="p-5 border-b border-[color:var(--text-muted)]/20">
          {title && (
            <h3 className="text-xl font-semibold tracking-tight text-[color:var(--text-primary)]">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
