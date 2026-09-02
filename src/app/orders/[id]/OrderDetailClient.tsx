"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OrderStatusTracker } from "@/components/OrderStatusTracker";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { formatPrice } from "@/lib/utils";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  CreditCard,
  AlertTriangle,
  ArrowLeft,
  Ban,
  Loader2,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface OrderDetailClientProps {
  order: any;
  currentUserId?: string;
  userRole?: string;
}

export function OrderDetailClient({
  order: initialOrder,
}: OrderDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewOrder = searchParams.get("success") === "true";

  const [order, setOrder] = useState(initialOrder);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const deliveryFormatted = new Date(order.deliveryDate).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const placedFormatted = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const canCancel = order.status === "placed";

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setCancelError(data.error || "Failed to cancel order.");
        setIsCancelling(false);
        return;
      }

      setOrder({ ...order, status: "cancelled" });
      setCancelModalOpen(false);
      setIsCancelling(false);
      router.refresh();
    } catch (e) {
      setCancelError("An error occurred while cancelling order.");
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>
      </div>

      {/* Success Banner if redirected from checkout */}
      {isNewOrder && (
        <div className="p-5 rounded-2xl bg-neutral-950 text-white border border-neutral-800 shadow-md flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold">Order Confirmed #{order.orderNumber}!</h2>
            <p className="text-xs text-neutral-300">
              Thank you for ordering with 111 Bakery. We have received your order details and scheduled your celebration cake for preparation.
            </p>
          </div>
        </div>
      )}

      {/* Header Info Card */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950 font-mono">
                Order #{order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-neutral-500">
              Placed on {placedFormatted}
            </p>
          </div>

          {/* Cancel Button: ONLY visible when status is 'placed' */}
          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="self-start sm:self-auto px-4 py-2 border border-neutral-300 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-400 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5 text-neutral-600" />
              <span>Cancel Order</span>
            </button>
          )}
        </div>

        {/* 5-Stage Visual Tracker */}
        <div className="border-b border-neutral-100 pb-6">
          <OrderStatusTracker status={order.status} />
        </div>

        {/* Delivery Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1.5">
            <p className="uppercase tracking-wider font-semibold text-neutral-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-700" />
              Delivery Schedule
            </p>
            <p className="font-bold text-neutral-900 text-sm">{deliveryFormatted}</p>
            <p className="text-neutral-600 font-medium">Slot: {order.deliverySlot}</p>
          </div>

          <div className="space-y-1.5">
            <p className="uppercase tracking-wider font-semibold text-neutral-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-700" />
              Delivery Address
            </p>
            <p className="font-bold text-neutral-900">{order.customerName}</p>
            <p className="text-neutral-600 leading-relaxed">{order.deliveryAddress}</p>
            <p className="text-neutral-500 font-mono">Ph: {order.customerPhone}</p>
          </div>

          <div className="space-y-1.5">
            <p className="uppercase tracking-wider font-semibold text-neutral-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-neutral-700" />
              Payment
            </p>
            <p className="font-bold text-neutral-900 uppercase">{order.paymentMethod}</p>
            <p className="text-neutral-600">Simulated / Demonstration</p>
            <p className="font-mono font-bold text-sm text-neutral-950 pt-1">
              Total: {formatPrice(order.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Ordered Items Table/Cards */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-base font-bold text-neutral-950 flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-700" />
            <span>Items in this Order</span>
          </h2>
        </div>

        <div className="divide-y divide-neutral-100">
          {order.items.map((item: any) => (
            <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-neutral-950">{item.cakeName}</h3>
                  <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 text-xs font-semibold">
                    {item.size}
                  </span>
                </div>

                {item.customMessage ? (
                  <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-800">
                    <span className="font-semibold text-neutral-500">Piped Message: </span>
                    <span className="font-serif italic font-medium">&ldquo;{item.customMessage}&rdquo;</span>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">No piped message</p>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 text-sm">
                <div className="text-right">
                  <span className="text-xs text-neutral-400 block">Unit Price</span>
                  <span className="font-mono text-neutral-700">{formatPrice(item.unitPrice)}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-400 block">Qty</span>
                  <span className="font-mono font-semibold text-neutral-900">{item.quantity}</span>
                </div>
                <div className="text-right min-w-20">
                  <span className="text-xs text-neutral-400 block">Total</span>
                  <span className="font-mono font-bold text-neutral-950">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="p-6 bg-neutral-50 border-t border-neutral-200 space-y-2">
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Items Subtotal</span>
            <span className="font-mono text-neutral-900">{formatPrice(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Delivery Fee</span>
            <span className="font-mono text-neutral-900">FREE</span>
          </div>
          <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline text-sm">
            <span className="font-bold text-neutral-950">Grand Total</span>
            <span className="text-xl font-mono font-extrabold text-neutral-950">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Order Cancellation */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-neutral-200 rounded-xl p-6 space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3 text-neutral-950">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-neutral-800" />
              </div>
              <h3 className="text-lg font-bold">Cancel Order #{order.orderNumber}?</h3>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to cancel this celebration cake order? Orders can only be cancelled while in the <strong>Placed</strong> stage before kitchen preparation begins.
            </p>

            {cancelError && (
              <p className="text-xs text-red-600 p-2.5 rounded bg-red-50 border border-red-200">
                {cancelError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-neutral-950 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 flex items-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
