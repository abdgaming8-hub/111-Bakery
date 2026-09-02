import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import {
  Cake,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  Flame,
  PlusCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalOrders, cakesCount, activeCakesCount, orders] = await Promise.all([
    prisma.order.count(),
    prisma.cake.count(),
    prisma.cake.count({ where: { isAvailable: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
  ]);

  const ordersToBake = await prisma.order.count({
    where: { status: { in: ["placed", "confirmed", "baking"] } },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.totalAmount : 0), 0);

  return (
    <div className="space-y-8">
      {/* Title & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            Admin Overview
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time status of bakery operations, live catalogue, and order pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/cakes"
            className="px-4 py-2 bg-neutral-950 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manage Cakes</span>
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 border border-neutral-300 bg-white text-neutral-800 rounded-lg text-xs font-semibold hover:bg-neutral-50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Order Pipeline</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">Kitchen Queue</span>
            <Flame className="w-4 h-4 text-neutral-800" />
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-950">{ordersToBake}</p>
          <p className="text-[11px] text-neutral-500">Placed, confirmed, or baking</p>
        </div>

        <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-neutral-800" />
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-950">{totalOrders}</p>
          <p className="text-[11px] text-neutral-500">Across all customers</p>
        </div>

        <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">Catalogue Status</span>
            <Cake className="w-4 h-4 text-neutral-800" />
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-950">
            {activeCakesCount} <span className="text-sm font-normal text-neutral-400">/ {cakesCount}</span>
          </p>
          <p className="text-[11px] text-neutral-500">Active / Total designs</p>
        </div>

        <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">Demo Revenue</span>
            <TrendingUp className="w-4 h-4 text-neutral-800" />
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-950">
            {formatPrice(totalRevenue)}
          </p>
          <p className="text-[11px] text-neutral-500">Excluding cancellations</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-950">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1"
          >
            <span>View all in pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Slot</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-neutral-950">
                    #{order.orderNumber}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-neutral-900">{order.customerName}</p>
                    <p className="text-[11px] text-neutral-500">{order.customerPhone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-700">
                    <p>{new Date(order.deliveryDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
                    <p className="text-[11px] text-neutral-500">{order.deliverySlot}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-neutral-950">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href="/admin/orders"
                      className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded font-semibold transition-colors inline-block"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
