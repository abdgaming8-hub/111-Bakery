# 111 Bakery 🎂

> **One cake, one pastry, one bread — for everyone.**

A fully-functional, end-to-end cake delivery web application built as a product management assignment. Customers can browse, customise, and order celebration cakes; an admin can manage the catalogue and track every order through the pipeline.

---

## Author

**Abhyuday Dakhole**
📧 abdgaming8@gmail.com
🔗 https://github.com/mayanknagpal3107/111-bakery

---

## Tech Stack

| Layer       | Technology                         |
|-------------|-------------------------------------|
| Framework   | Next.js 14 (App Router, TypeScript) |
| Styling     | Tailwind CSS (monochrome design)    |
| Database    | SQLite via Prisma ORM               |
| Auth        | NextAuth.js v4 (Credentials + JWT)  |
| Icons       | Lucide React                        |

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up the database
```bash
npx prisma db push
npx prisma db seed
```

### 3. Configure environment

Copy `.env.example` to `.env` and set a `NEXTAUTH_SECRET`:
```bash
cp .env.example .env
```

### 4. Run the development server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Demo Credentials

| Role     | Email                 | Password   |
|----------|-----------------------|------------|
| Admin    | admin@111bakery.com   | Bakery@111 |
| Customer | demo@111bakery.com    | Demo@1234  |
| Customer | second@111bakery.com  | Demo@1234  |

> **Tip:** The `/login` page has 1-click autofill buttons for all three accounts.

---

## Features

### Customer Journey
- 🏠 **Home** — Hero, category cards, featured cakes, 3-step workflow
- 🎂 **Catalogue** — Category filter chips, instant search, responsive grid; greyed-out out-of-stock items
- 📦 **Product Detail** — Size toggle (0.5 kg / 1 kg), live custom message counter, quantity stepper, dynamic subtotal
- 🛒 **Cart** — Persisted in `localStorage`; edit quantities, remove lines, empty-cart state
- ✅ **Checkout** — Phone + address validation, delivery date picker, time slot selector, mock payment, order creation
- 📋 **Order Tracking** — Full order history, 5-stage visual tracker, customer cancellation (when `placed`)

### Admin Panel (`/admin`)
- 📊 **Dashboard** — Kitchen queue, total orders, active catalogue count, revenue
- 🎂 **Cake CRUD** — Add / Edit / Delete cakes; instant stock toggle
- 🚚 **Order Pipeline** — Status filter, detail modal, single-step status progression, cancellation controls

---

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard, cakes, orders
│   ├── api/            # REST API routes (auth, orders, cakes)
│   ├── cakes/          # Catalogue + product detail pages
│   ├── cart/           # Cart page
│   ├── checkout/       # Checkout flow
│   ├── orders/         # Order history + detail
│   ├── login/          # Login with autofill buttons
│   ├── signup/         # Customer registration
│   └── unauthorized/   # Admin-barrier page
├── components/         # Header, Footer, badges, image fallback
├── context/            # CartContext (localStorage persistence)
└── lib/                # auth.ts, prisma.ts, utils.ts
prisma/
├── schema.prisma       # User, Cake, Order, OrderItem models
└── seed.ts             # Demo data (admin + 2 customers, 10 cakes, 5 orders)
```

---

## Seed Data

The seed script creates:
- **3 users** (Admin, Demo Customer, Second Customer)
- **10 cakes** across Birthday / Anniversary / Kids / Classics categories (9 available, 1 out-of-stock)
- **5 orders** spread across all pipeline states (`placed`, `baking`, `out_for_delivery`, `delivered`)

---

## License

MIT © 2026 Abhyuday Dakhole
