import type { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark disabled:bg-primary-light disabled:hover:bg-primary-light shadow-sm hover:shadow-md focus-visible:ring-primary",
  secondary:
    "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:text-neutral-400 disabled:hover:bg-neutral-100 focus-visible:ring-neutral-300",
  ghost:
    "bg-transparent text-primary hover:bg-primary/10 disabled:text-neutral-300 disabled:hover:bg-transparent focus-visible:ring-primary",
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
        "font-semibold rounded-md transition-[background-color_100ms_var(--ease-standard),box-shadow_150ms_var(--ease-standard),transform_50ms_var(--ease-out-quart)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
}

export default Button;
