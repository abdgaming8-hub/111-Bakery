"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { OrderStatusTracker } from "@/components/OrderStatusTracker";
import { formatPrice } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Eye,
  Loader2,
  Flame,
  Truck,
  PackageCheck,
  X,
  FileText,
} from "lucide-react";

const STAGE_LABELS: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  baking: "Baking",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const NEXT_STAGE_MAP: Record<string, { next: string; label: string; icon: any }> = {
  placed: { next: "confirmed", label: "Confirm Order", icon: Check },
  confirmed: { next: "baking", label: "Start Baking", icon: Flame },
  baking: { next: "out_for_delivery", label: "Dispatch for Delivery", icon: Truck },
  out_for_delivery: { next: "delivered", label: "Mark Delivered", icon: PackageCheck },
};

interface AdminOrdersClientProps {
  initialOrders: any[];
}

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeOrderModal, setActiveOrderModal] = useState<any | null>(null);

  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filterStatuses = ["all", "placed", "confirmed", "baking", "out_for_delivery", "delivered", "cancelled"];

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus === "all") return true;
    return o.status === selectedStatus;
  });

  const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
    const nextInfo = NEXT_STAGE_MAP[currentStatus];
    if (!nextInfo) return;

    setAdvancingId(orderId);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextStatus: nextInfo.next }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to advance order status.");
        setAdvancingId(null);
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextInfo.next } : o))
      );

      if (activeOrderModal && activeOrderModal.id === orderId) {
        setActiveOrderModal({ ...activeOrderModal, status: nextInfo.next });
      }

      setAdvancingId(null);
      router.refresh();
    } catch (e) {
      setErrorMsg("Error communicating with server.");
      setAdvancingId(null);
    }
  };

  const handleAdminCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order as Admin?")) return;

    setCancellingId(orderId);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to cancel order.");
        setCancellingId(null);
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
      );

      if (activeOrderModal && activeOrderModal.id === orderId) {
        setActiveOrderModal({ ...activeOrderModal, status: "cancelled" });
      }

      setCancellingId(null);
      router.refresh();
    } catch (e) {
      setErrorMsg("Error communicating with server.");
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            Order Fulfillment Pipeline
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Advance orders strictly one step at a time, inspect piped messages, and coordinate delivery.
          </p>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {filterStatuses.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {st === "all" ? "All Orders" : STAGE_LABELS[st] || st}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-900 font-bold">×</button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order & Date</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Delivery Slot</th>
                <th className="px-5 py-3.5">Items & Messages</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Pipeline Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-neutral-400">
                    No orders found in this category.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isAdvancing = advancingId === order.id;
                  const isCancelling = cancellingId === order.id;
                  const nextAction = NEXT_STAGE_MAP[order.status];
                  const canAdminCancel = ["placed", "confirmed", "baking"].includes(order.status);
                  const deliveryFormatted = new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Order Number & Placed Date */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setActiveOrderModal(order)}
                          className="font-mono font-bold text-sm text-neutral-950 hover:underline flex items-center gap-1.5"
                        >
                          #{order.orderNumber}
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                        </button>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>

                      {/* Customer info */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-neutral-950">{order.customerName}</p>
                        <p className="font-mono text-[11px] text-neutral-500">{order.customerPhone}</p>
                        <p className="text-[11px] text-neutral-400 truncate max-w-[160px]">
                          {order.deliveryAddress}
                        </p>
                      </td>

                      {/* Delivery Date & Slot */}
                      <td className="px-5 py-4 text-neutral-800">
                        <p className="font-semibold">{deliveryFormatted}</p>
                        <p className="text-[11px] text-neutral-500">{order.deliverySlot}</p>
                      </td>

                      {/* Items & Custom Messages snippet */}
                      <td className="px-5 py-4">
                        <div className="space-y-1 max-w-xs">
                          {order.items.map((item: any) => (
                            <div key={item.id} className="text-[11px]">
                              <span className="font-semibold text-neutral-900">
                                {item.quantity}x {item.cakeName} ({item.size})
                              </span>
                              {item.customMessage && (
                                <p className="text-neutral-600 font-serif italic truncate">
                                  &ldquo;{item.customMessage}&rdquo;
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-5 py-4 font-mono font-bold text-neutral-950 text-sm">
                        {formatPrice(order.totalAmount)}
                        <span className="block text-[10px] text-neutral-400 uppercase font-sans">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Current Status */}
                      <td className="px-5 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>

                      {/* Pipeline Action buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveOrderModal(order)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-950 rounded hover:bg-neutral-100"
                            title="Inspect full details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {nextAction && (
                            <button
                              type="button"
                              disabled={isAdvancing || isCancelling}
                              onClick={() => handleAdvanceStatus(order.id, order.status)}
                              className="px-3 py-1.5 bg-neutral-950 text-white rounded-lg font-semibold text-xs hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center gap-1 shadow-sm"
                            >
                              {isAdvancing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <span>{nextAction.label}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}

                          {canAdminCancel && (
                            <button
                              type="button"
                              disabled={isAdvancing || isCancelling}
                              onClick={() => handleAdminCancel(order.id)}
                              className="px-2.5 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-lg font-semibold text-xs transition-colors"
                              title="Cancel order"
                            >
                              Cancel
                            </button>
                          )}

                          {order.status === "delivered" && (
                            <span className="text-[11px] text-neutral-400 font-medium px-2 py-1 bg-neutral-100 rounded">
                              Completed
                            </span>
                          )}

                          {order.status === "cancelled" && (
                            <span className="text-[11px] text-neutral-400 font-medium px-2 py-1 bg-neutral-100 rounded line-through">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Full Detail Modal */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold font-mono text-neutral-950">
                    Order #{activeOrderModal.orderNumber}
                  </h3>
                  <OrderStatusBadge status={activeOrderModal.status} />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Placed on {new Date(activeOrderModal.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveOrderModal(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tracker */}
            <div>
              <OrderStatusTracker status={activeOrderModal.status} />
            </div>

            {/* Customer & Delivery Schedule Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div className="space-y-1">
                <p className="font-bold text-neutral-950 uppercase tracking-wider text-[10px]">
                  Recipient & Contact
                </p>
                <p className="font-bold text-neutral-900 text-sm">{activeOrderModal.customerName}</p>
                <p className="font-mono text-neutral-600">{activeOrderModal.customerPhone}</p>
                <p className="text-neutral-600 pt-1 leading-relaxed">{activeOrderModal.deliveryAddress}</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-neutral-950 uppercase tracking-wider text-[10px]">
                  Schedule & Payment
                </p>
                <p className="font-bold text-neutral-900 text-sm">
                  {new Date(activeOrderModal.deliveryDate).toLocaleDateString("en-IN", {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-neutral-600">Slot: {activeOrderModal.deliverySlot}</p>
                <p className="text-neutral-600 pt-1">
                  Payment: <span className="font-bold text-neutral-900">{activeOrderModal.paymentMethod}</span> (Mock)
                </p>
                <p className="font-mono font-bold text-neutral-950 text-base pt-1">
                  Total: {formatPrice(activeOrderModal.totalAmount)}
                </p>
              </div>
            </div>

            {/* Items with Custom Messages */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-neutral-700" />
                <span>Cake Items & Piped Inscriptions</span>
              </h4>

              <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 overflow-hidden">
                {activeOrderModal.items.map((item: any) => (
                  <div key={item.id} className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-neutral-950 text-sm">
                          {item.quantity}x {item.cakeName}
                        </span>
                        <span className="ml-2 px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-semibold text-[11px]">
                          {item.size}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-neutral-950">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>

                    {item.customMessage ? (
                      <div className="p-3 bg-neutral-100/80 rounded-lg border border-neutral-200">
                        <span className="font-semibold text-neutral-600 block text-[11px] mb-0.5">
                          Cake Inscription Message:
                        </span>
                        <span className="font-serif italic text-sm font-semibold text-neutral-950">
                          &ldquo;{item.customMessage}&rdquo;
                        </span>
                      </div>
                    ) : (
                      <p className="text-neutral-400 italic text-[11px]">No message requested</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions inside modal */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
              {["placed", "confirmed", "baking"].includes(activeOrderModal.status) ? (
                <button
                  type="button"
                  onClick={() => handleAdminCancel(activeOrderModal.id)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-red-50 hover:text-red-700 rounded-lg text-xs font-semibold"
                >
                  Cancel This Order
                </button>
              ) : (
                <div />
              )}

              {NEXT_STAGE_MAP[activeOrderModal.status] && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStatus(activeOrderModal.id, activeOrderModal.status)}
                  className="px-5 py-2.5 bg-neutral-950 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 flex items-center gap-2 shadow-sm"
                >
                  <span>{NEXT_STAGE_MAP[activeOrderModal.status].label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
