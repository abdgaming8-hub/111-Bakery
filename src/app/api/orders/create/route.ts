import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Authentication required to place an order." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryDate,
      deliverySlot,
      paymentMethod,
      items,
    } = body;

    // Validation
    if (!customerName || customerName.trim().length === 0) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }

    const cleanPhone = (customerPhone || "").replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!deliveryAddress || deliveryAddress.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a complete delivery address." },
        { status: 400 }
      );
    }

    if (!deliveryDate) {
      return NextResponse.json({ error: "Delivery date is required." }, { status: 400 });
    }

    const targetDate = new Date(deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 1); // tomorrow

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 31); // 30 days

    if (targetDate < minDate || targetDate > maxDate) {
      return NextResponse.json(
        { error: "Delivery date must be between tomorrow and 30 days from now." },
        { status: 400 }
      );
    }

    const allowedSlots = ["10am-1pm", "1pm-4pm", "4pm-7pm", "7pm-10pm"];
    if (!allowedSlots.includes(deliverySlot)) {
      return NextResponse.json({ error: "Please choose a valid delivery slot." }, { status: 400 });
    }

    const allowedPayment = ["UPI", "Card", "COD"];
    if (!allowedPayment.includes(paymentMethod)) {
      return NextResponse.json({ error: "Please choose a valid payment method." }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    // Generate unique human-readable order number: e.g. "111-4821"
    let orderNumber = `111-${Math.floor(1000 + Math.random() * 9000)}`;
    while (await prisma.order.findUnique({ where: { orderNumber } })) {
      orderNumber = `111-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.unitPrice * item.quantity,
      0
    );

    // Save order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          deliveryAddress: deliveryAddress.trim(),
          deliveryDate: targetDate,
          deliverySlot,
          paymentMethod,
          totalAmount,
          status: "placed",
        },
      });

      for (const item of items) {
        let safeCakeId: string | null = null;
        if (item.cakeId) {
          const cakeExists = await tx.cake.findUnique({ where: { id: item.cakeId } });
          if (cakeExists) safeCakeId = cakeExists.id;
        }

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            cakeId: safeCakeId,
            cakeName: item.cakeName,
            size: item.size,
            customMessage: item.customMessage ? item.customMessage.trim() : null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
