import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CakeConfigurator } from "./CakeConfigurator";

export const dynamic = "force-dynamic";

interface CakeDetailPageProps {
  params: {
    id: string;
  };
}

export default async function CakeDetailPage({ params }: CakeDetailPageProps) {
  const cake = await prisma.cake.findUnique({
    where: { id: params.id },
  });

  if (!cake) {
    notFound();
  }

  // If marked unavailable, still render or show unavailable message
  if (!cake.isAvailable) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900">{cake.name}</h1>
        <p className="text-sm text-neutral-600">
          This cake is currently out of stock and unavailable for new orders.
        </p>
        <a
          href="/cakes"
          className="inline-block px-5 py-2.5 bg-neutral-950 text-white rounded-lg text-sm font-semibold"
        >
          Browse other cakes
        </a>
      </div>
    );
  }

  return <CakeConfigurator cake={cake} />;
}
