"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Loader2, AlertCircle, KeyRound, UserCheck, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/cakes";
  const wasRegistered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (res?.error) {
        setError(res.error || "Invalid email or password.");
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred during sign in.");
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white p-8 border border-neutral-200 rounded-xl shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-950 text-white font-mono font-bold text-sm mb-1">
              111
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Welcome to 111 Bakery
            </h1>
            <p className="text-sm text-neutral-500">
              Sign in to manage your orders or catalogue.
            </p>
          </div>

          {wasRegistered && (
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm">
              Account created successfully. Please sign in below.
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-neutral-800 shrink-0 mt-0.5" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-neutral-950 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-100 text-center">
            <p className="text-sm text-neutral-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-neutral-900 hover:underline underline-offset-4"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Demo Credentials Panel */}
        <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Quick Login Presets (Click to autofill)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillCredentials("admin@111bakery.com", "Bakery@111")}
              className="p-2.5 bg-white border border-neutral-200 rounded-lg hover:border-neutral-400 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900 mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                <span>Admin Account</span>
              </div>
              <p className="text-neutral-500 font-mono text-[11px]">admin@111bakery.com</p>
              <p className="text-neutral-400 font-mono text-[10px]">Pass: Bakery@111</p>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials("demo@111bakery.com", "Demo@1234")}
              className="p-2.5 bg-white border border-neutral-200 rounded-lg hover:border-neutral-400 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900 mb-0.5">
                <UserCheck className="w-3.5 h-3.5 text-neutral-700" />
                <span>Demo Customer</span>
              </div>
              <p className="text-neutral-500 font-mono text-[11px]">demo@111bakery.com</p>
              <p className="text-neutral-400 font-mono text-[10px]">Pass: Demo@1234</p>
            </button>
          </div>

          <button
            type="button"
            onClick={() => fillCredentials("second@111bakery.com", "Demo@1234")}
            className="w-full p-2 bg-white border border-neutral-200 rounded-lg hover:border-neutral-400 text-left transition-all text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-800">Second Customer (Isolation test):</span>
              <span className="font-mono text-neutral-500 text-[11px]">second@111bakery.com</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
