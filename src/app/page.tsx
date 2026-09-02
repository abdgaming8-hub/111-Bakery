import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CakeImage } from "@/components/CakeImage";
import { formatPrice } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredCakes = await prisma.cake.findMany({
    where: { isAvailable: true },
    take: 3,
    orderBy: { createdAt: "asc" },
  });

  const categories = [
    {
      name: "Birthday",
      description: "Festive celebration cakes decorated to delight every birthday.",
      image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Anniversary",
      description: "Romantic, elegant floral and heart designs crafted with love.",
      image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Kids",
      description: "Whimsical safari adventures and dreamy unicorn fairy tales.",
      image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Classics",
      description: "Timeless Madagascar vanilla, Belgian chocolate & red velvet.",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-12 md:pt-20 border-b border-neutral-200 bg-neutral-50/50 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white text-xs font-medium text-neutral-800 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-neutral-900 animate-pulse" />
                Freshly Baked to Order • Guaranteed Delivery Slots
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 leading-[1.1]">
                One cake, one pastry, one bread — <span className="underline decoration-neutral-300 underline-offset-8">for everyone.</span>
              </h1>

              <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl font-normal leading-relaxed">
                Celebration cakes crafted with premium artisanal ingredients, personalised with your own handwritten message, and delivered in your selected 3-hour window.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/cakes"
                  className="px-6 py-3.5 bg-neutral-950 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Browse Cakes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cakes?category=Birthday"
                  className="px-6 py-3.5 bg-white border border-neutral-300 text-neutral-800 rounded-lg text-sm font-semibold hover:bg-neutral-50 transition-all shadow-sm"
                >
                  Explore Birthday
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden border border-neutral-200 shadow-lg bg-neutral-100">
                <CakeImage
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&auto=format&fit=crop&q=80"
                  alt="111 Bakery Signature Cake"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-neutral-200/80 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Signature</p>
                      <p className="text-sm font-bold text-neutral-950">Madagascar Vanilla Bean</p>
                    </div>
                    <span className="text-sm font-mono font-semibold text-neutral-900">from ₹649</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-4 mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Occasions</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/cakes?category=${cat.name}`}
              className="group border border-neutral-200 rounded-xl overflow-hidden bg-white hover:border-neutral-900 transition-all shadow-sm flex flex-col"
            >
              <div className="aspect-[4/3] relative bg-neutral-100 overflow-hidden">
                <CakeImage
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 group-hover:text-neutral-950 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center text-xs font-semibold text-neutral-900 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View {cat.name} Cakes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Cakes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Chef&apos;s Selection</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
              Featured Cakes
            </h2>
          </div>
          <Link
            href="/cakes"
            className="text-sm font-semibold text-neutral-900 hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span>See all cakes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCakes.map((cake) => (
            <Link
              key={cake.id}
              href={`/cakes/${cake.id}`}
              className="group border border-neutral-200 rounded-xl overflow-hidden bg-white hover:border-neutral-900 transition-all shadow-sm flex flex-col"
            >
              <div className="aspect-[4/3] relative bg-neutral-100 overflow-hidden">
                <CakeImage
                  src={cake.imageUrl}
                  alt={cake.name}
                  fill
                  className="group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-semibold text-neutral-800 border border-neutral-200/80">
                  {cake.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-neutral-950">
                    {cake.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {cake.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-sm font-mono font-semibold text-neutral-950">
                    from {formatPrice(cake.basePrice)}
                  </span>
                  <span className="text-xs font-medium text-neutral-700 group-hover:underline">
                    Customise & Order →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
              How 111 Bakery Works
            </h2>
            <p className="text-sm text-neutral-500">
              A straightforward process designed specifically for celebration cakes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-base text-neutral-950">Pick your cake & size</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Choose from Birthday, Anniversary, Kids, or Classics. Select 0.5kg for intimate gatherings or 1kg for parties.
              </p>
            </div>

            <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-base text-neutral-950">Add your custom message</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Add up to 25 characters to be neatly piped on the cake top. What you type is recorded exactly on your order.
              </p>
            </div>

            <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-base text-neutral-950">Choose date & delivery slot</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Select between tomorrow and 30 days ahead, and pick a dedicated 3-hour window so your cake arrives right on time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
