import { type ReactNode } from "react";

interface CardProps {
  variant: "elevated" | "outlined";
  padding?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

const variantMap = {
  elevated: "bg-white rounded-xl shadow-sm",
  outlined: "bg-white rounded-xl border border-gray-200",
} as const;

export function Card({
  variant,
  padding = "md",
  className = "",
  children,
}: CardProps) {
  const classes = [variantMap[variant], paddingMap[padding], className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}

export type { CardProps };
