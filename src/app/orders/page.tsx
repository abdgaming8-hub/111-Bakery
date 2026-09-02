import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Package, Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login?callbackUrl=/orders");
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      <div className="border-b border-neutral-200 pb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            My Orders
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track preparation progress, view custom messages, and download details.
          </p>
        </div>
        <Link
          href="/cakes"
          className="text-xs font-semibold text-neutral-800 hover:text-neutral-950 flex items-center gap-1"
        >
          <span>Browse Catalogue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 border border-neutral-200 rounded-2xl p-8 space-y-5">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto text-neutral-400">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-neutral-900">No orders placed yet</h2>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Your cake celebration orders will appear here with live preparation and dispatch tracking.
            </p>
          </div>
          <div>
            <Link
              href="/cakes"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-950 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-all shadow-sm"
            >
              <span>Explore Cakes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const deliveryFormatted = new Date(order.deliveryDate).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const placedFormatted = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={order.id}
                className="p-5 sm:p-6 bg-white border border-neutral-200 rounded-xl hover:border-neutral-400 transition-all shadow-sm flex flex-col gap-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-neutral-950">
                      #{order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span>Placed on {placedFormatted}</span>
                    <span className="text-neutral-300">•</span>
                    <span className="font-mono font-bold text-neutral-950 text-sm">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Items & details preview */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 space-y-2">
                    <div className="flex flex-wrap gap-2 text-xs text-neutral-800">
                      {order.items.map((item, idx) => (
                        <span
                          key={item.id || idx}
                          className="px-2.5 py-1 rounded bg-neutral-100 font-medium"
                        >
                          {item.quantity}x {item.cakeName} ({item.size})
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-neutral-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Delivery: {deliveryFormatted}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Slot: {order.deliverySlot}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex md:justify-end">
                    <Link
                      href={`/orders/${order.id}`}
                      className="w-full md:w-auto px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Track & Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
