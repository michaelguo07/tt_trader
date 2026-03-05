'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-primary-600 text-xl">
          TT Trader
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/listings" className="text-stone-600 hover:text-stone-900">
            Listings
          </Link>
          <Link href="/trades" className="text-stone-600 hover:text-stone-900">
            Trades
          </Link>
          {status === 'loading' ? (
            <span className="text-stone-400">...</span>
          ) : session ? (
            <>
              <Link href="/listings/new" className="text-primary-600 hover:text-primary-700 font-medium">
                Sell
              </Link>
              <Link href="/trades/new" className="text-primary-600 hover:text-primary-700 font-medium">
                Post trade
              </Link>
              <Link href="/profile" className="text-stone-600 hover:text-stone-900">
                Profile
              </Link>
              <Link href="/dashboard" className="text-stone-600 hover:text-stone-900">
                Dashboard
              </Link>
              <Link href="/messages" className="text-stone-600 hover:text-stone-900">
                Messages
              </Link>
              <button
                type="button"
                onClick={() => signOut()}
                className="text-stone-500 hover:text-stone-700 text-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-stone-600 hover:text-stone-900">
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-primary-500 text-white px-3 py-1.5 rounded-md hover:bg-primary-600 font-medium"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
