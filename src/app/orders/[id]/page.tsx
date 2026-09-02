import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { OrderDetailClient } from "./OrderDetailClient";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect(`/login?callbackUrl=/orders/${params.id}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const isAdmin = session.user.role === "admin";
  const isOwner = order.userId === session.user.id;

  // Security check: only order owner or admin can view this order
  if (!isOwner && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center text-neutral-900">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Not Authorised
            </h1>
            <p className="text-sm text-neutral-600">
              You are not authorized to view this order. Customers can only view orders placed from their own account.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/orders"
              className="w-full py-2.5 px-4 bg-neutral-950 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OrderDetailClient
      order={order}
      currentUserId={session.user.id}
      userRole={session.user.role}
    />
  );
}
