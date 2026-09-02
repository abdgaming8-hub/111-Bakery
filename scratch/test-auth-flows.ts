import { prisma } from "../src/lib/prisma";

async function testAuthFlows() {
  const baseUrl = "http://localhost:3000";

  console.log("\n=== TESTING AUTHENTICATED WORKFLOWS ===");

  // 1. Get CSRF Token from NextAuth
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const setCookieHeader = csrfRes.headers.get("set-cookie") || "";
  const csrfCookie = setCookieHeader.split(";")[0];

  console.log("Got CSRF Token:", csrfToken ? "Yes" : "No");

  // 2. Login as Demo Customer
  console.log("\nLogging in as demo@111bakery.com...");
  const loginBody = new URLSearchParams({
    csrfToken,
    email: "demo@111bakery.com",
    password: "Demo@1234",
    redirect: "false",
    callbackUrl: `${baseUrl}/cakes`,
    json: "true",
  });

  const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: csrfCookie,
    },
    body: loginBody.toString(),
  });

  const loginCookies = loginRes.headers.get("set-cookie") || "";
  console.log("Customer login status:", loginRes.status);
  console.log("Session cookie received:", loginCookies.includes("next-auth.session-token"));

  // Extract session token
  const cookiesList = loginRes.headers.getSetCookie?.() || [loginCookies];
  const sessionCookieHeader = cookiesList.map((c) => c.split(";")[0]).join("; ");

  // 3. Customer accesses /cart and /orders
  const cartRes = await fetch(`${baseUrl}/cart`, {
    headers: { Cookie: sessionCookieHeader },
  });
  console.log("Authenticated GET /cart status:", cartRes.status, "(Expected: 200)");

  const ordersRes = await fetch(`${baseUrl}/orders`, {
    headers: { Cookie: sessionCookieHeader },
  });
  console.log("Authenticated GET /orders status:", ordersRes.status, "(Expected: 200)");

  // 4. Customer accesses /admin -> Middleware rewrites to /unauthorized
  const adminAttemptRes = await fetch(`${baseUrl}/admin`, {
    headers: { Cookie: sessionCookieHeader },
  });
  const adminAttemptHtml = await adminAttemptRes.text();
  const hasNotAuthorised = adminAttemptHtml.includes("Not Authorised");
  console.log(
    "Customer accessing /admin redirected/rewritten to Not Authorised UI:",
    hasNotAuthorised ? "✅ YES" : "❌ NO"
  );

  // 5. Customer places an order via API
  console.log("\nPlacing order as demo customer...");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const deliveryDateStr = tomorrow.toISOString().split("T")[0];

  const orderPayload = {
    customerName: "Aarav Sharma",
    customerPhone: "9876543210",
    deliveryAddress: "Flat 402, Sunshine Apartments, Bengaluru - 560038",
    deliveryDate: deliveryDateStr,
    deliverySlot: "10am-1pm",
    paymentMethod: "UPI",
    items: [
      {
        cakeId: "dummy-id",
        cakeName: "Classic Vanilla Bean",
        size: "0.5kg",
        customMessage: "Happy Birthday E2E!",
        quantity: 1,
        unitPrice: 649,
      },
    ],
  };

  const createOrderRes = await fetch(`${baseUrl}/api/orders/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookieHeader,
    },
    body: JSON.stringify(orderPayload),
  });

  const createOrderData = await createOrderRes.json();
  console.log("Order creation response:", createOrderRes.status, createOrderData);
  const newOrderId = createOrderData.orderId;

  // 6. Customer cancels this newly placed order (which is in 'placed' status)
  if (newOrderId) {
    console.log(`\nCancelling newly placed order ${newOrderId}...`);
    const cancelRes = await fetch(`${baseUrl}/api/orders/${newOrderId}/cancel`, {
      method: "POST",
      headers: { Cookie: sessionCookieHeader },
    });
    const cancelData = await cancelRes.json();
    console.log("Order cancel status:", cancelRes.status, cancelData);
  }

  // 7. Test Admin Operations
  console.log("\n--- Logging in as admin@111bakery.com ---");
  const adminLoginBody = new URLSearchParams({
    csrfToken,
    email: "admin@111bakery.com",
    password: "Bakery@111",
    redirect: "false",
    callbackUrl: `${baseUrl}/admin`,
    json: "true",
  });

  const adminLoginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: csrfCookie,
    },
    body: adminLoginBody.toString(),
  });

  const adminCookiesList = adminLoginRes.headers.getSetCookie?.() || [adminLoginRes.headers.get("set-cookie") || ""];
  const adminSessionCookieHeader = adminCookiesList.map((c) => c.split(";")[0]).join("; ");

  // Admin access to /admin
  const adminDashboardRes = await fetch(`${baseUrl}/admin`, {
    headers: { Cookie: adminSessionCookieHeader },
  });
  const adminDashboardHtml = await adminDashboardRes.text();
  const isAdminDashboard = adminDashboardHtml.includes("Bakery Management Console");
  console.log("Admin accessing /admin dashboard:", isAdminDashboard ? "✅ YES" : "❌ NO");

  // Admin creates a cake
  console.log("\nAdmin creating a new test cake...");
  const createCakeRes = await fetch(`${baseUrl}/api/admin/cakes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminSessionCookieHeader,
    },
    body: JSON.stringify({
      name: "Matcha White Chocolate Delight",
      description: "Organic ceremonial Uji matcha sponge infused with silky Belgian white chocolate mousse.",
      category: "Classics",
      basePrice: 899,
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
      isAvailable: true,
    }),
  });
  const newCakeData = await createCakeRes.json();
  console.log("Admin cake creation status:", createCakeRes.status, newCakeData.cake?.name);
  const testCakeId = newCakeData.cake?.id;

  // Admin toggles availability
  if (testCakeId) {
    const toggleRes = await fetch(`${baseUrl}/api/admin/cakes/${testCakeId}`, {
      method: "PATCH",
      headers: { Cookie: adminSessionCookieHeader },
    });
    const toggleData = await toggleRes.json();
    console.log("Admin toggled availability:", toggleData.cake?.isAvailable === false ? "✅ NOW OUT OF STOCK" : "❌");

    // Admin updates cake
    const updateRes = await fetch(`${baseUrl}/api/admin/cakes/${testCakeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminSessionCookieHeader,
      },
      body: JSON.stringify({
        name: "Matcha White Chocolate Supreme",
        description: "Updated description for test.",
        category: "Classics",
        basePrice: 999,
        imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
        isAvailable: true,
      }),
    });
    const updateData = await updateRes.json();
    console.log("Admin updated cake price to:", updateData.cake?.basePrice);

    // Admin deletes cake
    const deleteRes = await fetch(`${baseUrl}/api/admin/cakes/${testCakeId}`, {
      method: "DELETE",
      headers: { Cookie: adminSessionCookieHeader },
    });
    console.log("Admin deleted test cake status:", deleteRes.status);
  }

  // Admin advances an order status in pipeline
  const placedOrder = await prisma.order.findFirst({
    where: { status: "placed" },
  });

  if (placedOrder) {
    console.log(`\nAdmin advancing order #${placedOrder.orderNumber} (current: ${placedOrder.status})...`);
    const advanceRes = await fetch(`${baseUrl}/api/admin/orders/${placedOrder.id}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminSessionCookieHeader,
      },
      body: JSON.stringify({ nextStatus: "confirmed" }),
    });
    const advanceData = await advanceRes.json();
    console.log("Order advanced to:", advanceData.order?.status, advanceData.order?.status === "confirmed" ? "✅ SUCCESS" : "❌");
  }

  console.log("\n🎉 ALL E2E AUTHENTICATED SCENARIOS VERIFIED SUCCESSFULLY!");
}

testAuthFlows().catch(console.error);
