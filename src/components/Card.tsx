import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Adds a hover state. Use for clickable/interactive cards. */
  interactive?: boolean;
};

export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface border-2 border-ink",
        interactive &&
          "transition-colors duration-100 ease-standard hover:bg-accent/5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Card;
