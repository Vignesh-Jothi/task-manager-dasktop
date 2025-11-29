import React from "react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled,
}) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:ring-[var(--btn-primary)]
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${checked ? "bg-[var(--btn-primary)]" : "bg-gray-300 dark:bg-gray-600"}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
};
