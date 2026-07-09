import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Adds an elevate-on-hover shadow transition. Use for clickable/interactive cards. */
  interactive?: boolean;
};

export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-lg shadow-sm",
        interactive &&
          "transition-[box-shadow] duration-150 ease-standard hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Card;
