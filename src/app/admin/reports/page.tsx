// src/app/admin/reports/page.tsx
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { ReportsClient } from "@/components/admin/ReportsClient";

export const metadata: Metadata = { title: "Laporan Penjualan — Admin" };

async function getReportData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Daily revenue for last 30 days
  const dailyOrders = await prisma.order.findMany({
    where: {
      paymentStatus: "PAID",
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { totalAmount: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Aggregate by day
  const dailyMap = new Map<string, number>();
  for (let d = 0; d < 30; d++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(thirtyDaysAgo.getDate() + d);
    const key = date.toISOString().split("T")[0]!;
    dailyMap.set(key, 0);
  }
  dailyOrders.forEach((o) => {
    const key = o.createdAt.toISOString().split("T")[0]!;
    const amount = typeof o.totalAmount === "object" && "toNumber" in o.totalAmount
      ? o.totalAmount.toNumber() : Number(o.totalAmount);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + amount);
  });

  const revenueChart = Array.from(dailyMap.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  // Category breakdown
  const categoryData = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } } },
    _sum: { priceAtPurchase: true, quantity: true },
  });

  const productIds = categoryData.map((c) => c.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, category: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p.category]));

  const categoryMap = new Map<string, number>();
  categoryData.forEach((c) => {
    const cat = productMap.get(c.productId) ?? "other";
    const revenue = c._sum.priceAtPurchase?.toNumber() ?? 0;
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + revenue);
  });

  const categoryChart = Array.from(categoryMap.entries())
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  // Summary stats
  const [totalRevenue, totalOrders, newUsers] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, role: "USER" } }),
  ]);

  // Top products
  const topProducts = await prisma.orderItem.groupBy({
    by: ["productId", "productName"],
    where: { order: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } } },
    _sum: { priceAtPurchase: true, quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 8,
  });

  return {
    revenueChart,
    categoryChart,
    summary: {
      totalRevenue: totalRevenue._sum.totalAmount?.toNumber() ?? 0,
      totalOrders,
      newUsers,
      avgOrder: totalOrders > 0
        ? (totalRevenue._sum.totalAmount?.toNumber() ?? 0) / totalOrders
        : 0,
    },
    topProducts: topProducts.map((p) => ({
      name: p.productName,
      revenue: p._sum.priceAtPurchase?.toNumber() ?? 0,
      quantity: p._sum.quantity ?? 0,
    })),
  };
}

export default async function AdminReportsPage() {
  const data = await getReportData();

  return (
    <div style={{ padding: "40px 32px" }}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="divider-gold w-6" />
          <span className="label" style={{ color: "var(--gold-500)" }}>30 Hari Terakhir</span>
        </div>
        <h1 className="font-display font-light" style={{ color: "var(--ivory-100)", fontSize: "2.2rem" }}>
          Laporan Penjualan
        </h1>
      </div>

      <ReportsClient data={data} />
    </div>
  );
}
