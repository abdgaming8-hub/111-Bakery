import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing records
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cake.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const adminPassword = await bcrypt.hash("Bakery@111", 10);
  const demoPassword = await bcrypt.hash("Demo@1234", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Bakery Admin",
      email: "admin@111bakery.com",
      password: adminPassword,
      role: "admin",
    },
  });

  const demoCustomer = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "demo@111bakery.com",
      password: demoPassword,
      role: "customer",
    },
  });

  const secondCustomer = await prisma.user.create({
    data: {
      name: "Rohan Verma",
      email: "second@111bakery.com",
      password: demoPassword,
      role: "customer",
    },
  });

  console.log("Created users:", admin.email, demoCustomer.email, secondCustomer.email);

  // Create Cakes
  const cakesData = [
    {
      name: "Classic Vanilla Bean",
      category: "Classics",
      basePrice: 649,
      isAvailable: true,
      description: "Delicate sponge infused with Madagascar bourbon vanilla bean caviar, topped with silky Swiss meringue buttercream.",
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Belgian Dark Chocolate",
      category: "Classics",
      basePrice: 749,
      isAvailable: true,
      description: "Rich layers of 70% Callebaut dark chocolate ganache and moist cocoa sponge for true chocolate connoisseurs.",
      imageUrl: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Red Velvet Cream Cheese",
      category: "Classics",
      basePrice: 799,
      isAvailable: true,
      description: "Vibrant crimson velvet sponge with gentle hints of cocoa, smothered in tangy Philadelphia cream cheese frosting.",
      imageUrl: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Rainbow Sprinkle",
      category: "Birthday",
      basePrice: 849,
      isAvailable: true,
      description: "Joyful funfetti sponge studded with colourful sugar sprinkles and frosted with sweet vanilla cloud buttercream.",
      imageUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Chocolate Truffle",
      category: "Birthday",
      basePrice: 899,
      isAvailable: true,
      description: "Decadent Dutch chocolate sponge layered with handcrafted silky truffle mousse and glossy mirror glaze.",
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Butterscotch Crunch",
      category: "Birthday",
      basePrice: 749,
      isAvailable: true,
      description: "Golden vanilla sponge layered with caramelized butterscotch praline crisp and rich brown butter cream.",
      imageUrl: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Rose & Pistachio",
      category: "Anniversary",
      basePrice: 949,
      isAvailable: true,
      description: "Subtle Persian rose water sponge layered with roasted Iranian pistachio mousseline and edible dried rose petals.",
      imageUrl: "https://images.unsplash.com/photo-1519869325930-281384150729?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Heart-Shaped Strawberry",
      category: "Anniversary",
      basePrice: 999,
      isAvailable: true,
      description: "Heart-shaped pink strawberry chiffon sponge with fresh Mahabaleshwar strawberry compote and chantilly cream.",
      imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Jungle Safari",
      category: "Kids",
      basePrice: 899,
      isAvailable: true,
      description: "Playful themed chocolate-banana sponge layered with caramel crunch, adored by kids and grown-ups alike.",
      imageUrl: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Unicorn Dream",
      category: "Kids",
      basePrice: 949,
      isAvailable: false, // Out of stock sample as specified
      description: "Whimsical pastel-swirled sponge with strawberry cream filling and sculpted golden unicorn horn topper.",
      imageUrl: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const createdCakes: Record<string, any> = {};
  for (const c of cakesData) {
    const cake = await prisma.cake.create({ data: c });
    createdCakes[c.name] = cake;
  }
  console.log(`Created ${cakesData.length} cakes.`);

  // Create demo orders for demo@111bakery.com
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Order 1: placed (cancellable by customer)
  await prisma.order.create({
    data: {
      orderNumber: "111-0001",
      userId: demoCustomer.id,
      customerName: "Aarav Sharma",
      customerPhone: "9876543210",
      deliveryAddress: "Flat 402, Sunshine Apartments, 12th Main, Indiranagar, Bengaluru - 560038",
      deliveryDate: tomorrow,
      deliverySlot: "10am-1pm",
      paymentMethod: "UPI",
      totalAmount: 849,
      status: "placed",
      items: {
        create: [
          {
            cakeId: createdCakes["Rainbow Sprinkle"]?.id,
            cakeName: "Rainbow Sprinkle",
            size: "0.5kg",
            customMessage: "Happy 7th Birthday Leo!",
            quantity: 1,
            unitPrice: 849,
          },
        ],
      },
    },
  });

  // Order 2: baking
  await prisma.order.create({
    data: {
      orderNumber: "111-0002",
      userId: demoCustomer.id,
      customerName: "Aarav Sharma",
      customerPhone: "9876543210",
      deliveryAddress: "Flat 402, Sunshine Apartments, 12th Main, Indiranagar, Bengaluru - 560038",
      deliveryDate: inTwoDays,
      deliverySlot: "1pm-4pm",
      paymentMethod: "Card",
      totalAmount: 1800,
      status: "baking",
      items: {
        create: [
          {
            cakeId: createdCakes["Heart-Shaped Strawberry"]?.id,
            cakeName: "Heart-Shaped Strawberry",
            size: "1kg",
            customMessage: "Forever & Always ❤️",
            quantity: 1,
            unitPrice: 1800,
          },
        ],
      },
    },
  });

  // Order 3: out_for_delivery
  await prisma.order.create({
    data: {
      orderNumber: "111-0003",
      userId: demoCustomer.id,
      customerName: "Aarav Sharma",
      customerPhone: "9876543210",
      deliveryAddress: "Flat 402, Sunshine Apartments, 12th Main, Indiranagar, Bengaluru - 560038",
      deliveryDate: inThreeDays,
      deliverySlot: "4pm-7pm",
      paymentMethod: "UPI",
      totalAmount: 1350,
      status: "out_for_delivery",
      items: {
        create: [
          {
            cakeId: createdCakes["Belgian Dark Chocolate"]?.id,
            cakeName: "Belgian Dark Chocolate",
            size: "1kg",
            customMessage: "Happy Anniversary Mom & Dad",
            quantity: 1,
            unitPrice: 1350,
          },
        ],
      },
    },
  });

  // Order 4: delivered
  await prisma.order.create({
    data: {
      orderNumber: "111-0004",
      userId: demoCustomer.id,
      customerName: "Aarav Sharma",
      customerPhone: "9876543210",
      deliveryAddress: "Flat 402, Sunshine Apartments, 12th Main, Indiranagar, Bengaluru - 560038",
      deliveryDate: yesterday,
      deliverySlot: "7pm-10pm",
      paymentMethod: "COD",
      totalAmount: 649,
      status: "delivered",
      items: {
        create: [
          {
            cakeId: createdCakes["Classic Vanilla Bean"]?.id,
            cakeName: "Classic Vanilla Bean",
            size: "0.5kg",
            customMessage: "Welcome Home!",
            quantity: 1,
            unitPrice: 649,
          },
        ],
      },
    },
  });

  // Order 5 on secondCustomer (for testing isolation)
  await prisma.order.create({
    data: {
      orderNumber: "111-0005",
      userId: secondCustomer.id,
      customerName: "Rohan Verma",
      customerPhone: "9123456780",
      deliveryAddress: "Villa 14, Palm Meadows, Whitefield, Bengaluru - 560066",
      deliveryDate: tomorrow,
      deliverySlot: "4pm-7pm",
      paymentMethod: "UPI",
      totalAmount: 1710,
      status: "placed",
      items: {
        create: [
          {
            cakeId: createdCakes["Rose & Pistachio"]?.id,
            cakeName: "Rose & Pistachio",
            size: "1kg",
            customMessage: "Cheers to 10 Years!",
            quantity: 1,
            unitPrice: 1710,
          },
        ],
      },
    },
  });

  console.log("Seeding complete! 5 sample orders created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
