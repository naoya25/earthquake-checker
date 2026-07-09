import type { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-ink text-paper border-ink hover:bg-accent hover:border-accent disabled:bg-ink-muted disabled:border-ink-muted disabled:hover:bg-ink-muted focus-visible:ring-ink",
  secondary:
    "bg-paper text-ink border-ink hover:bg-ink hover:text-paper disabled:text-ink-muted disabled:border-ink-muted disabled:hover:bg-paper disabled:hover:text-ink-muted focus-visible:ring-ink",
  ghost:
    "bg-transparent text-ink border-transparent hover:border-ink disabled:text-ink-muted disabled:hover:border-transparent focus-visible:ring-ink",
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "font-bold border-2 transition-[background-color,border-color,color,transform] duration-100 ease-standard active:scale-[0.98] active:translate-x-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:active:scale-100 disabled:active:translate-x-0 disabled:active:translate-y-0",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
}

export default Button;
