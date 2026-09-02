"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CakeImage } from "@/components/CakeImage";
import { formatPrice } from "@/lib/utils";
import { Cake as CakeModel } from "@prisma/client";
import { Search, Ban, Check } from "lucide-react";

const CATEGORIES = ["All", "Birthday", "Anniversary", "Kids", "Classics"];

interface CatalogueClientProps {
  initialCakes: CakeModel[];
}

export function CatalogueClient({ initialCakes }: CatalogueClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "All";

  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES.includes(categoryParam) ? categoryParam : "All"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.replace(`/cakes${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  const filteredCakes = useMemo(() => {
    return initialCakes.filter((cake) => {
      const matchesCategory =
        selectedCategory === "All" ||
        cake.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cake.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [initialCakes, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Catalogue</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
            Celebration Cakes
          </h1>
          <p className="text-sm text-neutral-600">
            Every cake is baked to order from scratch with real butter, Belgian chocolate, and pure Madagascar vanilla.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cakes by name or flavour..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950"
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Cakes Responsive Grid: 3 Desktop / 2 Tablet / 1 Mobile */}
      {filteredCakes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCakes.map((cake) => {
            const isAvailable = cake.isAvailable;

            if (!isAvailable) {
              // Out of stock card: greyed out, disabled
              return (
                <div
                  key={cake.id}
                  className="relative rounded-xl border border-neutral-200 bg-neutral-100/70 overflow-hidden flex flex-col select-none opacity-75 cursor-not-allowed"
                >
                  <div className="aspect-[4/3] relative bg-neutral-200 grayscale">
                    <CakeImage src={cake.imageUrl} alt={cake.name} fill />
                    <div className="absolute inset-0 bg-neutral-900/30 flex items-center justify-center">
                      <span className="bg-neutral-950 text-white text-xs uppercase font-bold tracking-widest px-3 py-1.5 rounded-md shadow-md flex items-center gap-1.5">
                        <Ban className="w-3.5 h-3.5" />
                        Out of stock
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] uppercase font-semibold text-neutral-400">
                          {cake.category}
                        </span>
                        <span className="text-xs font-mono line-through text-neutral-400">
                          {formatPrice(cake.basePrice)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-neutral-500">
                        {cake.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {cake.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-200">
                      <span className="text-xs font-medium text-neutral-400">
                        Currently unavailable for ordering
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // Available Cake Card
            return (
              <Link
                key={cake.id}
                href={`/cakes/${cake.id}`}
                className="group rounded-xl border border-neutral-200 bg-white overflow-hidden flex flex-col hover:border-neutral-900 hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] relative bg-neutral-100 overflow-hidden">
                  <CakeImage
                    src={cake.imageUrl}
                    alt={cake.name}
                    fill
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-semibold text-neutral-800 border border-neutral-200/80 shadow-sm">
                    {cake.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 group-hover:text-neutral-950 transition-colors">
                      {cake.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {cake.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-neutral-400 uppercase font-medium block">Starting from</span>
                      <span className="text-base font-mono font-bold text-neutral-950">
                        {formatPrice(cake.basePrice)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-800 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                      Order Now
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50 p-8">
          <p className="text-base font-medium text-neutral-700">No cakes found</p>
          <p className="text-xs text-neutral-500 mt-1">
            Try adjusting your search query or selecting another category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
