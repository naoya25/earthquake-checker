import type { SelectHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
};

export function Select({
  className,
  children,
  error = false,
  ...props
}: SelectProps) {
  return (
    <div className="relative">
      <select
        aria-invalid={error || undefined}
        className={cn(
          "w-full appearance-none cursor-pointer border-2 bg-surface px-3 py-2 pr-9 text-sm text-ink transition-colors duration-100 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          error
            ? "border-red-600 focus-visible:ring-red-600"
            : "border-ink focus-visible:border-accent focus-visible:ring-accent",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 8l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default Select;
