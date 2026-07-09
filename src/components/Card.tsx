import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("bg-white rounded-xl shadow-md", className)}>
      {children}
    </div>
  );
}

export default Card;
