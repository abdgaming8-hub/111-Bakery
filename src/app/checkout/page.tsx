"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { CakeImage } from "@/components/CakeImage";
import {
  Clock,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
} from "lucide-react";

const SLOTS = [
  { id: "10am-1pm", label: "Morning: 10:00 AM – 1:00 PM" },
  { id: "1pm-4pm", label: "Afternoon: 1:00 PM – 4:00 PM" },
  { id: "4pm-7pm", label: "Evening: 4:00 PM – 7:00 PM" },
  { id: "7pm-10pm", label: "Night: 7:00 PM – 10:00 PM" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalAmount, totalCount, clearCart, isLoaded } = useCart();

  // Calculate min & max date for restricted date picker (tomorrow up to 30 days out)
  const { minDate, maxDate, defaultDate } = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const max = new Date(today);
    max.setDate(max.getDate() + 30);

    const formatYMD = (d: Date) => d.toISOString().split("T")[0];

    return {
      minDate: formatYMD(tomorrow),
      maxDate: formatYMD(max),
      defaultDate: formatYMD(tomorrow),
    };
  }, []);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(defaultDate);
  const [deliverySlot, setDeliverySlot] = useState("10am-1pm");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");

  // Pre-fill user name if logged in
  useEffect(() => {
    if (session?.user?.name && !customerName) {
      setCustomerName(session.user.name);
    }
  }, [session, customerName]);

  // If cart is empty, redirect back to cart
  useEffect(() => {
    if (isLoaded && items.length === 0 && !isProcessing) {
      router.replace("/cart");
    }
  }, [isLoaded, items, router, isProcessing]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!customerName.trim()) {
      errors.customerName = "Please enter recipient name.";
    }

    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      errors.customerPhone = "Please enter a valid 10-digit mobile number.";
    }

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 8) {
      errors.deliveryAddress = "Please provide complete street address, flat/building, & pincode.";
    }

    if (!deliveryDate) {
      errors.deliveryDate = "Please pick a delivery date.";
    } else {
      if (deliveryDate < minDate || deliveryDate > maxDate) {
        errors.deliveryDate = "Delivery date must be between tomorrow and 30 days ahead.";
      }
    }

    if (!deliverySlot) {
      errors.deliverySlot = "Please choose a delivery time slot.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    setProcessingStage("Processing payment simulation...");

    try {
      // 2-second mock payment delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setProcessingStage("Securing order in bakery kitchen...");

      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.replace(/\D/g, ""),
        deliveryAddress: deliveryAddress.trim(),
        deliveryDate,
        deliverySlot,
        paymentMethod,
        items,
      };

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormErrors({ submit: data.error || "Failed to place order." });
        setIsProcessing(false);
        return;
      }

      // Success! Clear cart and navigate
      clearCart();
      router.push(`/orders/${data.orderId}?success=true`);
    } catch (err) {
      setFormErrors({ submit: "An unexpected error occurred. Please try again." });
      setIsProcessing(false);
    }
  };

  if (!isLoaded || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-600 mb-2" />
        <p className="text-sm text-neutral-500">Preparing checkout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Title */}
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
          Checkout & Scheduling
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Complete recipient details, select your dedicated delivery slot, and review order.
        </p>
      </div>

      {formErrors.submit && (
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-neutral-800 shrink-0 mt-0.5" />
          <p>{formErrors.submit}</p>
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Fields */}
          <div className="lg:col-span-7 space-y-8">
            {/* Section 1: Delivery Details */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-neutral-950 text-white flex items-center justify-center text-xs font-bold font-mono">
                  1
                </span>
                <h2 className="text-base font-bold text-neutral-950">
                  Recipient & Delivery Address
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 ${
                      formErrors.customerName ? "border-red-500 bg-red-50/20" : "border-neutral-300"
                    }`}
                  />
                  {formErrors.customerName && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Contact Phone (10 Digits)
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 9876543210"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900 ${
                      formErrors.customerPhone ? "border-red-500 bg-red-50/20" : "border-neutral-300"
                    }`}
                  />
                  {formErrors.customerPhone && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.customerPhone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Delivery Address (Building, Street, Landmark, Pincode)
                </label>
                <textarea
                  rows={3}
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Flat 402, Sunshine Heights, 100 Feet Road, Indiranagar, Bengaluru - 560038"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 ${
                    formErrors.deliveryAddress ? "border-red-500 bg-red-50/20" : "border-neutral-300"
                  }`}
                />
                {formErrors.deliveryAddress && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.deliveryAddress}</p>
                )}
              </div>
            </div>

            {/* Section 2: Delivery Schedule */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-neutral-950 text-white flex items-center justify-center text-xs font-bold font-mono">
                  2
                </span>
                <h2 className="text-base font-bold text-neutral-950">
                  Schedule Delivery
                </h2>
              </div>

              {/* Date selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Delivery Date (Tomorrow to 30 Days)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={minDate}
                    max={maxDate}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 ${
                      formErrors.deliveryDate ? "border-red-500" : "border-neutral-300"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Cakes require overnight preparation. Earliest delivery date is tomorrow.
                </p>
                {formErrors.deliveryDate && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.deliveryDate}</p>
                )}
              </div>

              {/* Slot selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Select Delivery Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SLOTS.map((slot) => {
                    const isSelected = deliverySlot === slot.id;
                    return (
                      <label
                        key={slot.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "border-neutral-950 bg-neutral-950 text-white font-medium shadow-sm"
                            : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliverySlot"
                          value={slot.id}
                          checked={isSelected}
                          onChange={() => setDeliverySlot(slot.id)}
                          className="sr-only"
                        />
                        <Clock className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-neutral-500"}`} />
                        <span className="text-xs">{slot.label}</span>
                      </label>
                    );
                  })}
                </div>
                {formErrors.deliverySlot && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.deliverySlot}</p>
                )}
              </div>
            </div>

            {/* Section 3: Payment Method */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-neutral-950 text-white flex items-center justify-center text-xs font-bold font-mono">
                  3
                </span>
                <h2 className="text-base font-bold text-neutral-950">
                  Payment Method (Mock Simulation)
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "UPI",
                    title: "Instant UPI (GPay, PhonePe, Paytm)",
                    desc: "Simulated instant QR / VPA approval",
                  },
                  {
                    id: "Card",
                    title: "Credit / Debit Card",
                    desc: "Simulated sandbox card transaction",
                  },
                  {
                    id: "COD",
                    title: "Cash on Delivery",
                    desc: "Pay in cash or UPI at the doorstep upon arrival",
                  },
                ].map((method) => {
                  const isChecked = paymentMethod === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "border-neutral-950 bg-neutral-50 shadow-sm"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={isChecked}
                        onChange={() => setPaymentMethod(method.id)}
                        className="mt-1 h-4 w-4 text-neutral-950 border-neutral-300 focus:ring-neutral-900"
                      />
                      <div className="space-y-0.5 flex-1">
                        <p className="text-sm font-bold text-neutral-950">{method.title}</p>
                        <p className="text-xs text-neutral-500">{method.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-500 pt-2">
                <Lock className="w-3.5 h-3.5 text-neutral-700" />
                <span>Zero gateway transaction fee charged in this demonstration mode.</span>
              </div>
            </div>
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:col-span-5 bg-neutral-50 border border-neutral-200 rounded-xl p-6 space-y-6 lg:sticky lg:top-24">
            <h2 className="text-base font-bold text-neutral-950 pb-3 border-b border-neutral-200">
              Review Items ({totalCount})
            </h2>

            {/* Items List preview */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <div className="w-12 h-12 rounded-lg bg-neutral-200 overflow-hidden relative shrink-0 border border-neutral-200">
                    <CakeImage src={item.cakeImage} alt={item.cakeName} fill />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between font-medium text-neutral-900">
                      <span className="truncate">{item.cakeName}</span>
                      <span className="font-mono">{formatPrice(item.unitPrice * item.quantity)}</span>
                    </div>
                    <p className="text-neutral-500">
                      {item.size} • Qty: {item.quantity}
                    </p>
                    {item.customMessage && (
                      <p className="text-neutral-700 italic truncate font-serif">
                        &ldquo;{item.customMessage}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-neutral-200 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal</span>
                <span className="font-mono text-neutral-900">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery</span>
                <span className="font-mono text-neutral-900">FREE</span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-neutral-950">Total Payable</span>
                <span className="text-xl font-mono font-extrabold text-neutral-950">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {/* Desktop Place Order Button */}
            <div className="hidden sm:block">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-4 bg-neutral-950 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{processingStage || "Processing payment..."}</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Action Bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-neutral-200 z-30 flex items-center justify-between gap-4 shadow-lg">
          <div>
            <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Total</span>
            <span className="text-base font-mono font-bold text-neutral-950">
              {formatPrice(totalAmount)}
            </span>
          </div>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 py-3 px-4 bg-neutral-950 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Processing...</span>
              </>
            ) : (
              <>
                <span>Place Order</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
