import { prisma } from "@/lib/prisma";
import { CatalogueClient } from "./CatalogueClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function CakesPage() {
  const cakes = await prisma.cake.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-8">Loading catalogue...</div>}>
      <CatalogueClient initialCakes={cakes} />
    </Suspense>
  );
}
