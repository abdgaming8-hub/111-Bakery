"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu, X, User as UserIcon, Shield, Package, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { totalCount, isLoaded } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = session?.user?.role === "admin";

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-neutral-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Wordmark Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-neutral-950 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="bg-neutral-950 text-white w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-bold">
              111
            </span>
            <span className="tracking-wide uppercase text-sm font-semibold">Bakery</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/cakes"
              className={`text-sm font-medium transition-colors hover:text-neutral-950 ${
                pathname.startsWith("/cakes") ? "text-neutral-950 font-semibold" : "text-neutral-600"
              }`}
            >
              Cakes
            </Link>
            {session && (
              <Link
                href="/orders"
                className={`text-sm font-medium transition-colors hover:text-neutral-950 ${
                  pathname.startsWith("/orders") ? "text-neutral-950 font-semibold" : "text-neutral-600"
                }`}
              >
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-neutral-950 ${
                  pathname.startsWith("/admin") ? "text-neutral-950 font-semibold" : "text-neutral-600"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right side: Cart & Auth */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cart Icon - ALWAYS visible on mobile and desktop */}
          <Link
            href="/cart"
            className="relative p-2 rounded-lg text-neutral-800 hover:bg-neutral-100 transition-colors"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {isLoaded && totalCount > 0 && (
              <span className="absolute top-1 right-1 bg-neutral-950 text-white text-[11px] font-semibold h-4 min-w-4 px-1 rounded-full flex items-center justify-center leading-none">
                {totalCount}
              </span>
            )}
          </Link>

          {/* Desktop User Menu */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
            ) : session ? (
              <div>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-neutral-600" />
                  <span className="max-w-[120px] truncate">{session.user.name || "Account"}</span>
                  {isAdmin && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">
                      Admin
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg py-1.5 z-50 text-sm animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="font-semibold text-neutral-900 truncate">{session.user.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{session.user.email}</p>
                    </div>

                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left border-t border-neutral-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-neutral-950 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-800 hover:bg-neutral-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            <Link
              href="/cakes"
              className="block px-3 py-2 rounded-lg text-base font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Browse Cakes
            </Link>
            {session && (
              <Link
                href="/orders"
                className="block px-3 py-2 rounded-lg text-base font-medium text-neutral-900 hover:bg-neutral-50"
              >
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="block px-3 py-2 rounded-lg text-base font-medium text-neutral-900 hover:bg-neutral-50 flex items-center justify-between"
              >
                <span>Admin Dashboard</span>
                <span className="text-xs uppercase bg-neutral-900 text-white px-2 py-0.5 rounded font-mono">Admin</span>
              </Link>
            )}
          </div>

          <div className="border-t border-neutral-200 pt-3">
            {session ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-sm font-semibold text-neutral-950">{session.user.name}</p>
                  <p className="text-xs text-neutral-500">{session.user.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  className="w-full text-center px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="w-full text-center px-4 py-2 bg-neutral-950 text-white rounded-lg text-sm font-medium hover:bg-neutral-800"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
