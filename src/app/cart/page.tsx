"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CakeImage } from "@/components/CakeImage";
import { formatPrice } from "@/lib/utils";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, totalAmount, totalCount, isLoaded } = useCart();

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-neutral-100 mx-auto rounded"></div>
          <div className="h-32 bg-neutral-50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Your cart is empty
          </h1>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">
            Looks like you haven&apos;t added any celebration cakes yet. Browse our freshly baked catalogue to begin.
          </p>
        </div>
        <div>
          <Link
            href="/cakes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-950 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-all shadow-sm"
          >
            <span>Explore Cakes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Page Header */}
      <div className="border-b border-neutral-200 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            Your Cart
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {totalCount} {totalCount === 1 ? "item" : "items"} selected
          </p>
        </div>
        <Link
          href="/cakes"
          className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item Lines */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const lineTotal = item.unitPrice * item.quantity;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 bg-white border border-neutral-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shadow-sm"
              >
                {/* Cake Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0 relative">
                  <CakeImage src={item.cakeImage} alt={item.cakeName} fill />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold text-neutral-950 truncate">
                      {item.cakeName}
                    </h2>
                    <span className="sm:hidden text-sm font-mono font-bold text-neutral-950">
                      {formatPrice(lineTotal)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                    <span className="font-semibold bg-neutral-100 px-2 py-0.5 rounded text-neutral-800">
                      {item.size}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-neutral-700">
                      {formatPrice(item.unitPrice)} each
                    </span>
                  </div>

                  {item.customMessage ? (
                    <div className="pt-1.5 text-xs text-neutral-800">
                      <span className="font-medium text-neutral-500">Piped Message: </span>
                      <span className="italic font-serif">&ldquo;{item.customMessage}&rdquo;</span>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">No custom message</p>
                  )}
                </div>

                {/* Stepper, Remove & Line Total */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-3 sm:gap-2">
                  <div className="hidden sm:block text-right">
                    <span className="text-sm font-mono font-bold text-neutral-950">
                      {formatPrice(lineTotal)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold font-mono text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= 10}
                        className="p-1.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors rounded"
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-neutral-50 border border-neutral-200 rounded-xl p-6 space-y-6 sticky top-24">
          <h2 className="text-base font-bold tracking-tight text-neutral-950">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Items Total ({totalCount})</span>
              <span className="font-mono text-neutral-900">{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Delivery Fee</span>
              <span className="font-mono text-neutral-900">FREE</span>
            </div>
            <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
              <span className="font-bold text-neutral-950">Total Amount</span>
              <span className="text-xl font-mono font-extrabold text-neutral-950">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="w-full py-3 px-4 bg-neutral-950 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
            Free scheduled doorstep delivery in our signature temperature-controlled boxes.
          </p>
        </div>
      </div>
    </div>
  );
}
