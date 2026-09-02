import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Cake, ShoppingBag, LayoutDashboard } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center text-neutral-900">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Not Authorised
            </h1>
            <p className="text-sm text-neutral-600">
              You do not have administrative privileges to access this section of 111 Bakery.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/cakes"
              className="w-full py-2.5 px-4 bg-neutral-950 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              Browse Catalogue
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 px-4 border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-50/50 min-h-[calc(100vh-4rem)]">
      {/* Admin Subheader Bar */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-neutral-950 text-white font-mono text-xs uppercase font-bold">
              Admin
            </span>
            <h2 className="text-base font-bold text-neutral-950">
              Bakery Management Console
            </h2>
          </div>

          <nav className="flex items-center gap-1 text-xs font-semibold overflow-x-auto pb-1 sm:pb-0">
            <Link
              href="/admin"
              className="px-3.5 py-1.5 rounded-lg text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </Link>
            <Link
              href="/admin/cakes"
              className="px-3.5 py-1.5 rounded-lg text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
            >
              <Cake className="w-3.5 h-3.5" />
              <span>Manage Cakes</span>
            </Link>
            <Link
              href="/admin/orders"
              className="px-3.5 py-1.5 rounded-lg text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Manage Orders</span>
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
