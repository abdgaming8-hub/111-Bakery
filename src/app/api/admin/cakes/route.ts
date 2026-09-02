import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all cakes for admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const cakes = await prisma.cake.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ cakes });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cakes" }, { status: 500 });
  }
}

// POST create cake
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, description, category, basePrice, imageUrl, isAvailable } = await req.json();

    // Server-side validation
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

    const cake = await prisma.cake.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        category,
        basePrice: price,
        imageUrl: imageUrl.trim(),
        isAvailable: isAvailable !== false,
      },
    });

    return NextResponse.json({ success: true, cake }, { status: 201 });
  } catch (error) {
    console.error("Create cake error:", error);
    return NextResponse.json({ error: "Failed to create cake." }, { status: 500 });
  }
}
