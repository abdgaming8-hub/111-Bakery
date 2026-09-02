"use client";

import { useState } from "react";
import { CakeImage } from "@/components/CakeImage";
import { useCart } from "@/context/CartContext";
import { formatPrice, calculate1kgPrice } from "@/lib/utils";
import { Cake as CakeModel } from "@prisma/client";
import { Plus, Minus, Check, ShoppingBag, ArrowLeft, Heart, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface CakeConfiguratorProps {
  cake: CakeModel;
}

export function CakeConfigurator({ cake }: CakeConfiguratorProps) {
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState<"0.5kg" | "1kg">("0.5kg");
  const [customMessage, setCustomMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const price05kg = cake.basePrice;
  const price1kg = calculate1kgPrice(cake.basePrice);
  const currentUnitPrice = selectedSize === "0.5kg" ? price05kg : price1kg;
  const totalPrice = currentUnitPrice * quantity;

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= 25) {
      setCustomMessage(val);
    }
  };

  const handleAddToCart = () => {
    addItem({
      cakeId: cake.id,
      cakeName: cake.name,
      cakeImage: cake.imageUrl,
      category: cake.category,
      size: selectedSize,
      customMessage: customMessage.trim(),
      unitPrice: currentUnitPrice,
      quantity: quantity,
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 w-full">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/cakes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
            <CakeImage
              src={cake.imageUrl}
              alt={cake.name}
              fill
              priority
              className="object-cover"
            />
            <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-900 border border-neutral-200/80 shadow-sm">
              {cake.category}
            </span>
          </div>

          {/* Value props under image */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-neutral-100 text-neutral-600 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0" />
              <span>Baked fresh on delivery day</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-neutral-900 shrink-0" />
              <span>100% Eggless & Artisanal</span>
            </div>
          </div>
        </div>

        {/* Right Column: Configurator Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
              {cake.name}
            </h1>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {cake.description}
            </p>
          </div>

          <div className="py-3 border-y border-neutral-200 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Unit Price</span>
            <div className="text-2xl font-mono font-bold text-neutral-950">
              {formatPrice(currentUnitPrice)}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
              Select Size
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedSize("0.5kg")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedSize === "0.5kg"
                    ? "border-neutral-950 bg-neutral-950 text-white shadow-sm"
                    : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm">0.5 kg</span>
                  {selectedSize === "0.5kg" && <Check className="w-4 h-4" />}
                </div>
                <p className={`text-xs ${selectedSize === "0.5kg" ? "text-neutral-300" : "text-neutral-500"}`}>
                  Serves 4 - 6 people
                </p>
                <p className="font-mono text-xs font-semibold mt-2">
                  {formatPrice(price05kg)}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSize("1kg")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedSize === "1kg"
                    ? "border-neutral-950 bg-neutral-950 text-white shadow-sm"
                    : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm">1.0 kg</span>
                  {selectedSize === "1kg" && <Check className="w-4 h-4" />}
                </div>
                <p className={`text-xs ${selectedSize === "1kg" ? "text-neutral-300" : "text-neutral-500"}`}>
                  Serves 8 - 12 people
                </p>
                <p className="font-mono text-xs font-semibold mt-2">
                  {formatPrice(price1kg)}
                </p>
              </button>
            </div>
          </div>

          {/* Custom Message Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="custom-msg" className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                Message on the Cake (Optional)
              </label>
              <span className="text-[11px] font-mono text-neutral-500">
                {customMessage.length}/25
              </span>
            </div>
            <input
              id="custom-msg"
              type="text"
              maxLength={25}
              value={customMessage}
              onChange={handleMessageChange}
              placeholder="e.g. Happy Birthday Maya!"
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 text-sm transition-all"
            />
            <p className="text-[11px] text-neutral-500">
              Piped cleanly by hand in chocolate/vanilla glaze. Max 25 characters.
            </p>
          </div>

          {/* Quantity Stepper (1 to 5) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-2.5 text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold font-mono text-neutral-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(5, quantity + 1))}
                  disabled={quantity >= 5}
                  className="p-2.5 text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-neutral-500">Maximum 5 per order line</span>
            </div>
          </div>

          {/* Total Price Live Box */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">Subtotal for this cake:</span>
            <span className="text-xl font-mono font-extrabold text-neutral-950">
              {formatPrice(totalPrice)}
            </span>
          </div>

          {/* Desktop Add to Cart Button */}
          <div className="hidden sm:block">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-3 px-6 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm ${
                added
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-950 text-white hover:bg-neutral-800"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart • {formatPrice(totalPrice)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar on Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-neutral-200 z-30 flex items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Total</span>
          <span className="text-lg font-mono font-bold text-neutral-950">
            {formatPrice(totalPrice)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            added
              ? "bg-neutral-900 text-white"
              : "bg-neutral-950 text-white hover:bg-neutral-800"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4 text-white stroke-[3]" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
