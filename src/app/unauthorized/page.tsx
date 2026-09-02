import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
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
