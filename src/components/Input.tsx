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
        "w-full border rounded-sm px-3 py-2 text-sm text-ink placeholder:text-neutral-400 transition-[border-color,box-shadow] duration-100 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        error
          ? "border-error focus-visible:ring-error"
          : "border-line focus-visible:ring-primary",
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
    <p className={cn("text-caption mt-1", error ? "text-error" : "text-neutral-400")}>
      {children}
    </p>
  );
}

export default Input;
