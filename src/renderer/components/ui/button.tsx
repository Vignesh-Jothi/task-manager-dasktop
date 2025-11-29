import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--btn-primary)] text-white hover:bg-[var(--btn-primary-hover)]",
        destructive: "bg-[var(--error)] text-white hover:opacity-90",
        outline:
          "border border-[color:var(--text-muted)] text-[color:var(--text-primary)] hover:bg-[color:var(--bg-sidebar)]",
        ghost:
          "text-[color:var(--text-primary)] hover:bg-[color:var(--bg-sidebar)]",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
