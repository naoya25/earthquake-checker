import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export function Input({ className, error = false, ...props }: InputProps) {
  return (
    <input
      aria-invalid={error || undefined}
      className={cn(
        "w-full border-2 px-3 py-2 text-sm text-ink bg-surface placeholder:text-ink-muted transition-colors duration-100 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        error
          ? "border-red-600 focus-visible:ring-red-600"
          : "border-ink focus-visible:border-accent focus-visible:ring-accent",
        className,
      )}
      {...props}
    />
  );
}

export function InputHelperText({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <p className={cn("text-caption mt-1", error ? "text-red-600" : "text-ink-muted")}>
      {children}
    </p>
  );
}

export default Input;
