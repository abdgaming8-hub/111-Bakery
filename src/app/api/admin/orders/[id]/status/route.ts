import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STAGES = ["placed", "confirmed", "baking", "out_for_delivery", "delivered"];

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Admin authorization required." }, { status: 403 });
    }

    const { action, nextStatus } = await req.json();
    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      return NextResponse.json(
        { error: `Cannot change status of a ${order.status} order.` },
        { status: 400 }
      );
    }

    // Cancel action
    if (action === "cancel" || nextStatus === "cancelled") {
      if (!["placed", "confirmed", "baking"].includes(order.status)) {
        return NextResponse.json(
          { error: "Can only cancel orders currently in placed, confirmed, or baking stage." },
          { status: 400 }
        );
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status: "cancelled" },
      });
      return NextResponse.json({ success: true, order: updated });
    }

    // Advance strictly one step forward
    const currentIndex = STAGES.indexOf(order.status);
    if (currentIndex === -1 || currentIndex >= STAGES.length - 1) {
      return NextResponse.json(
        { error: "Order is already at terminal stage." },
        { status: 400 }
      );
    }

    const targetStatus = STAGES[currentIndex + 1];

    // If client supplied nextStatus, verify it matches targetStatus
    if (nextStatus && nextStatus !== targetStatus) {
      return NextResponse.json(
        { error: `Invalid transition. Status must strictly advance from ${order.status} to ${targetStatus}.` },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: targetStatus },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Admin order status update error:", error);
    return NextResponse.json(
      { error: "Failed to update order status." },
      { status: 500 }
    );
  }
}
