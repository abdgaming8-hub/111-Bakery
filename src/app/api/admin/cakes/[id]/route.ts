import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT: Update cake
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, description, category, basePrice, imageUrl, isAvailable } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Cake name is required." }, { status: 400 });
    }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json({ error: "Description is required." }, { status: 400 });
    }

    const validCategories = ["Birthday", "Anniversary", "Kids", "Classics"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Category must be Birthday, Anniversary, Kids, or Classics." },
        { status: 400 }
      );
    }

    const price = parseFloat(basePrice);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: "Base price must be a positive number." },
        { status: 400 }
      );
    }

    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim().length === 0) {
      return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
    }

    const updated = await prisma.cake.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description.trim(),
        category,
        basePrice: price,
        imageUrl: imageUrl.trim(),
        isAvailable: Boolean(isAvailable),
      },
    });

    return NextResponse.json({ success: true, cake: updated });
  } catch (error) {
    console.error("Update cake error:", error);
    return NextResponse.json({ error: "Failed to update cake." }, { status: 500 });
  }
}

// PATCH: Toggle availability
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const cake = await prisma.cake.findUnique({
      where: { id: params.id },
    });

    if (!cake) {
      return NextResponse.json({ error: "Cake not found." }, { status: 404 });
    }

    const updated = await prisma.cake.update({
      where: { id: params.id },
      data: { isAvailable: !cake.isAvailable },
    });

    return NextResponse.json({ success: true, cake: updated });
  } catch (error) {
    console.error("Toggle availability error:", error);
    return NextResponse.json({ error: "Failed to toggle availability." }, { status: 500 });
  }
}

// DELETE: Remove cake
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Prisma schema has onDelete: SetNull on OrderItem relation, so historical orders are preserved!
    await prisma.cake.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Cake deleted successfully." });
  } catch (error) {
    console.error("Delete cake error:", error);
    return NextResponse.json({ error: "Failed to delete cake." }, { status: 500 });
  }
}
