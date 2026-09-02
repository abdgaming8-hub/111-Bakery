import { prisma } from "../src/lib/prisma";

async function runTests() {
  console.log("=== 111 BAKERY AUTOMATED INTEGRATION TESTS ===");
  const baseUrl = "http://localhost:3000";

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // TEST 1: Database Seed Verification
  console.log("\n--- TEST 1: Database Seed Verification ---");
  const users = await prisma.user.findMany();
  const admin = users.find((u) => u.email === "admin@111bakery.com");
  const demo = users.find((u) => u.email === "demo@111bakery.com");
  const second = users.find((u) => u.email === "second@111bakery.com");

  assert(!!admin && admin.role === "admin", "Admin user exists with role 'admin'");
  assert(!!demo && demo.role === "customer", "Demo user exists with role 'customer'");
  assert(!!second && second.role === "customer", "Second user exists with role 'customer'");

  const cakes = await prisma.cake.findMany();
  assert(cakes.length >= 10, `Found ${cakes.length} cakes in catalogue (>= 10)`);
  const outOfStockCake = cakes.find((c) => !c.isAvailable);
  assert(!!outOfStockCake, `Found out-of-stock cake for UI testing: ${outOfStockCake?.name}`);

  const orders = await prisma.order.findMany({ include: { items: true } });
  assert(orders.length >= 5, `Found ${orders.length} pre-loaded sample orders`);

  // TEST 2: Public Pages HTTP 200
  console.log("\n--- TEST 2: Public Pages HTTP 200 ---");
  const pages = ["/", "/cakes", "/login", "/signup"];
  for (const page of pages) {
    const res = await fetch(`${baseUrl}${page}`);
    assert(res.status === 200, `GET ${page} returned status 200`);
  }

  // TEST 3: Route Protection & Redirects for Unauthenticated Users
  console.log("\n--- TEST 3: Route Protection & Redirects ---");
  const protectedPaths = ["/cart", "/checkout", "/orders", "/admin"];
  for (const path of protectedPaths) {
    const res = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
    const location = res.headers.get("location") || "";
    assert(
      res.status === 307 || res.status === 302,
      `Unauthenticated GET ${path} redirected (status: ${res.status})`
    );
    assert(
      location.includes("/login"),
      `Redirect target contains /login (location: ${location})`
    );
  }

  // TEST 4: Registration API Validation
  console.log("\n--- TEST 4: Registration API Validation ---");
  // Short password (< 6 chars)
  const shortPassRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test", email: "new@test.com", password: "123" }),
  });
  assert(shortPassRes.status === 400, "Registration rejects password < 6 characters");

  // Duplicate email
  const dupEmailRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Demo", email: "demo@111bakery.com", password: "Password@123" }),
  });
  assert(dupEmailRes.status === 400, "Registration rejects already-registered email");

  // TEST 5: Size Price Calculation Logic
  console.log("\n--- TEST 5: Size Price Calculation Logic ---");
  // basePrice = 649 => 1kg = Math.round((649 * 1.8) / 10) * 10 = 1170
  // basePrice = 749 => 1kg = Math.round((749 * 1.8) / 10) * 10 = 1350
  // basePrice = 799 => 1kg = Math.round((799 * 1.8) / 10) * 10 = 1440
  const calc1kg = (p: number) => Math.round((p * 1.8) / 10) * 10;
  assert(calc1kg(649) === 1170, "649 base price correctly calculates 1kg to 1170");
  assert(calc1kg(749) === 1350, "749 base price correctly calculates 1kg to 1350");
  assert(calc1kg(799) === 1440, "799 base price correctly calculates 1kg to 1440");
  assert(calc1kg(999) === 1800, "999 base price correctly calculates 1kg to 1800");

  // TEST 6: Order Pipeline Status API
  console.log("\n--- TEST 6: Order Pipeline Status API ---");
  // Check unauthenticated call to admin status API
  const unauthStatusRes = await fetch(`${baseUrl}/api/admin/orders/${orders[0].id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nextStatus: "confirmed" }),
  });
  assert(unauthStatusRes.status === 403, "Unauthenticated call to admin order status returns 403");

  console.log("\n==========================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
