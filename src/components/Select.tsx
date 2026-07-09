import type { SelectHTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full border border-neutral-300 bg-white rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors appearance-none cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export default Select;
