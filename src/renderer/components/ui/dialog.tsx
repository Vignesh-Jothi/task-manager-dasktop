import * as React from "react";
import { cn } from "./utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative z-10 w-[90%] max-w-md rounded-lg bg-white shadow-lg"
        )}
      >
        <div className="p-4 border-b">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
