// src/components/admin/ReportsClient.tsx
"use client";

import { useMemo } from "react";

interface ReportData {
  revenueChart: { date: string; revenue: number }[];
  categoryChart: { category: string; revenue: number }[];
  summary: { totalRevenue: number; totalOrders: number; newUsers: number; avgOrder: number };
  topProducts: { name: string; revenue: number; quantity: number }[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const fmtCompact = (n: number) => {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}Jt`;
  if (n >= 1_000)     return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return fmt(n);
};

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart({ data }: { data: { date: string; revenue: number }[] }) {
  const W = 600, H = 160, PAD = { top: 10, right: 10, bottom: 30, left: 60 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.revenue), 1);

  const points = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * innerW,
    y: PAD.top + innerH - (d.revenue / maxVal) * innerH,
    date: d.date,
    revenue: d.revenue,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1]!.x} ${PAD.top + innerH} L ${PAD.left} ${PAD.top + innerH} Z`;

  // Y axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: PAD.top + innerH - t * innerH,
    label: fmtCompact(t * maxVal),
  }));

  // X axis labels — show every 7 days
  const xLabels = points.filter((_, i) => i % 7 === 0 || i === points.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C4A24A" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#C4A24A" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t) => (
        <line
          key={t.label}
          x1={PAD.left}
          y1={t.y}
          x2={W - PAD.right}
          y2={t.y}
          stroke="rgba(196,162,74,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* Y labels */}
      {yTicks.map((t) => (
        <text
          key={t.label}
          x={PAD.left - 6}
          y={t.y + 4}
          textAnchor="end"
          fill="var(--muted)"
          fontSize="9"
          fontFamily="var(--font-body)"
        >
          {t.label}
        </text>
      ))}

      {/* X labels */}
      {xLabels.map((p) => (
        <text
          key={p.date}
          x={p.x}
          y={H - 4}
          textAnchor="middle"
          fill="var(--muted)"
          fontSize="9"
          fontFamily="var(--font-body)"
        >
          {new Date(p.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
        </text>
      ))}

      {/* Area */}
      <path d={areaD} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#C4A24A" strokeWidth="1.5" />

      {/* Data points */}
      {points.map((p) => (
        <circle
          key={p.date}
          cx={p.x}
          cy={p.y}
          r={p.revenue > 0 ? 2.5 : 0}
          fill="#C4A24A"
          opacity="0.7"
        />
      ))}
    </svg>
  );
}

// ─── Horizontal Bar Chart ─────────────────────────────────────────────────────
function HBarChart({ data }: { data: { category: string; revenue: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.revenue), 1);

  const COLORS = ["#C4A24A", "#A88835", "#8B6F27", "#6B5520", "#4E3E18", "#3A2E12"];

  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={d.category} className="flex items-center gap-3">
          <span
            className="label w-20 text-right flex-shrink-0"
            style={{ color: "var(--muted-light)", fontSize: "0.62rem" }}
          >
            {d.category.charAt(0).toUpperCase() + d.category.slice(1)}
          </span>
          <div
            className="flex-1 h-5 relative overflow-hidden"
            style={{ background: "var(--obsidian-800)" }}
          >
            <div
              style={{
                width: `${(d.revenue / maxVal) * 100}%`,
                height: "100%",
                background: COLORS[i % COLORS.length],
                transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          </div>
          <span
            className="label flex-shrink-0"
            style={{ color: "var(--gold-400)", fontSize: "0.62rem", minWidth: "80px" }}
          >
            {fmtCompact(d.revenue)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ReportsClient({ data }: { data: ReportData }) {
  const { summary, revenueChart, categoryChart, topProducts } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Pendapatan",    value: fmtCompact(summary.totalRevenue), accent: true },
          { label: "Total Pesanan",       value: summary.totalOrders.toLocaleString("id-ID"), accent: false },
          { label: "Rata-rata Pesanan",   value: fmtCompact(summary.avgOrder),     accent: false },
          { label: "Pengguna Baru",       value: summary.newUsers.toLocaleString("id-ID"), accent: false },
        ].map((s) => (
          <div
            key={s.label}
            className="p-5"
            style={{
              background: "var(--obsidian-900)",
              border: s.accent ? "1px solid rgba(196,162,74,0.2)" : "1px solid rgba(196,162,74,0.08)",
            }}
          >
            <p className="label mb-2" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>{s.label}</p>
            <p className="font-display text-2xl" style={{ color: s.accent ? "var(--gold-400)" : "var(--ivory-100)" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div
        className="p-6"
        style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}
      >
        <p className="label mb-6" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
          Pendapatan Harian (30 Hari Terakhir)
        </p>
        <LineChart data={revenueChart} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category chart */}
        <div
          className="p-6"
          style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}
        >
          <p className="label mb-6" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
            Pendapatan per Kategori
          </p>
          {categoryChart.length > 0 ? (
            <HBarChart data={categoryChart} />
          ) : (
            <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>Belum ada data</p>
          )}
        </div>

        {/* Top products */}
        <div
          style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}
        >
          <div className="p-5 border-b" style={{ borderColor: "rgba(196,162,74,0.06)" }}>
            <p className="label" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
              Produk Terlaris (30 Hari)
            </p>
          </div>
          <div>
            {topProducts.length === 0 ? (
              <p className="p-5" style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                Belum ada data
              </p>
            ) : (
              topProducts.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center gap-4 px-5 py-3"
                  style={{ borderBottom: i < topProducts.length - 1 ? "1px solid rgba(196,162,74,0.05)" : "none" }}
                >
                  <span
                    className="font-display text-xl flex-shrink-0 w-6 text-center"
                    style={{ color: i < 3 ? "var(--gold-500)" : "var(--muted)" }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ color: "var(--ivory-300)", fontSize: "0.78rem" }}>
                      {p.name}
                    </p>
                    <p style={{ color: "var(--muted)", fontSize: "0.68rem", marginTop: "2px" }}>
                      {p.quantity} terjual
                    </p>
                  </div>
                  <span style={{ color: "var(--gold-400)", fontSize: "0.78rem", flexShrink: 0 }}>
                    {fmtCompact(p.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
