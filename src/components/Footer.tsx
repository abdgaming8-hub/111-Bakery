import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-neutral-200 py-12 mt-auto text-neutral-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-neutral-950 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold">
                111
              </span>
              <span className="text-base font-bold tracking-tight text-neutral-950 uppercase">
                Bakery
              </span>
            </div>
            <p className="text-sm text-neutral-600 font-normal">
              One cake, one pastry, one bread — for everyone.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-neutral-500">
            <Link href="/cakes" className="hover:text-neutral-900 transition-colors">
              Catalogue
            </Link>
            <Link href="/login" className="hover:text-neutral-900 transition-colors">
              Sign In
            </Link>
            <span className="text-neutral-300">|</span>
            <p>© {new Date().getFullYear()} 111 Bakery. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
