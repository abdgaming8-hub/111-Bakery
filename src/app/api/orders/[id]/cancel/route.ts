import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const isAdmin = session.user.role === "admin";
    const isOwner = order.userId === session.user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to cancel this order." },
        { status: 403 }
      );
    }

    // Customer can only cancel if status is "placed"
    if (!isAdmin && order.status !== "placed") {
      return NextResponse.json(
        { error: "Order cannot be cancelled once confirmed or baking." },
        { status: 400 }
      );
    }

    // Admin can cancel if placed, confirmed, or baking
    if (isAdmin && !["placed", "confirmed", "baking"].includes(order.status)) {
      return NextResponse.json(
        { error: "Admin can only cancel orders in placed, confirmed, or baking status." },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { error: "Failed to cancel order." },
      { status: 500 }
    );
  }
}
