'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/tests/new', label: 'New Test' },
  { href: '/tests/import', label: 'Import' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4" aria-label="Main navigation">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold">Test Quality</Link>
          <div className="hidden gap-4 md:flex">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-sm text-secondary hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-secondary">{user?.name}</span>
              <Button variant="ghost" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-secondary hover:text-foreground">Login</Link>
              <Link href="/signup" className="text-sm text-secondary hover:text-foreground">Sign up</Link>
            </>
          )}
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-border p-2 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(prev => !prev)}
        >
          <span className="sr-only">Toggle menu</span>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>
      {open && (
        <div className="border-t border-border px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-2 pt-3">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-sm text-secondary hover:text-foreground">
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-border pt-3">
              {isAuthenticated ? (
                <Button variant="ghost" onClick={logout} fullWidth>Logout</Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" className="text-sm text-secondary hover:text-foreground">Login</Link>
                  <Link href="/signup" className="text-sm text-secondary hover:text-foreground">Sign up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navigation;
