import { prisma } from "@/lib/prisma";
import { AdminCakesClient } from "./AdminCakesClient";

export const dynamic = "force-dynamic";

export default async function AdminCakesPage() {
  const cakes = await prisma.cake.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <AdminCakesClient initialCakes={cakes} />;
}
