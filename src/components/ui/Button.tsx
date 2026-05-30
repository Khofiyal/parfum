// src/components/ui/Button.tsx
"use client";

import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const base: React.CSSProperties = {
      fontFamily: "var(--font-body)",
      fontWeight: 400,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontSize: size === "sm" ? "0.62rem" : size === "lg" ? "0.72rem" : "0.65rem",
      cursor: disabled || isLoading ? "not-allowed" : "pointer",
      opacity: disabled || isLoading ? 0.5 : 1,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      padding:
        size === "sm"
          ? "8px 20px"
          : size === "lg"
          ? "16px 40px"
          : "11px 28px",
      border: "none",
      outline: "none",
      whiteSpace: "nowrap",
    };

    const variants: Record<string, React.CSSProperties> = {
      primary: {
        background: "var(--gold-600)",
        color: "var(--obsidian-950)",
      },
      secondary: {
        background: "transparent",
        color: "var(--gold-400)",
        border: "1px solid rgba(196, 162, 74, 0.3)",
      },
      ghost: {
        background: "transparent",
        color: "var(--muted-light)",
      },
      danger: {
        background: "rgba(139, 45, 63, 0.2)",
        color: "#D4526B",
        border: "1px solid rgba(139, 45, 63, 0.3)",
      },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{ ...base, ...variants[variant], ...style }}
        className={className}
        {...props}
      >
        {isLoading && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ animation: "spin 0.8s linear infinite" }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
