// src/components/ui/Badge.tsx

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "success" | "warning" | "error";
  className?: string;
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    background: "rgba(74, 72, 64, 0.4)",
    color: "var(--muted-light)",
    border: "1px solid rgba(74, 72, 64, 0.6)",
  },
  gold: {
    background: "rgba(196, 162, 74, 0.1)",
    color: "var(--gold-400)",
    border: "1px solid rgba(196, 162, 74, 0.2)",
  },
  success: {
    background: "rgba(34, 197, 94, 0.1)",
    color: "#4ade80",
    border: "1px solid rgba(34, 197, 94, 0.2)",
  },
  warning: {
    background: "rgba(234, 179, 8, 0.1)",
    color: "#facc15",
    border: "1px solid rgba(234, 179, 8, 0.2)",
  },
  error: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.2)",
  },
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center label ${className}`}
      style={{
        ...variantStyles[variant],
        padding: "3px 10px",
        fontSize: "0.58rem",
        letterSpacing: "0.15em",
        borderRadius: "2px",
      }}
    >
      {children}
    </span>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
export function StarRating({ rating, max = 5, size = 14 }: { rating: number; max?: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < Math.floor(rating) ? "var(--gold-500)" : "none"}
          stroke="var(--gold-700)"
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ borderRadius: "2px", ...style }}
    />
  );
}
