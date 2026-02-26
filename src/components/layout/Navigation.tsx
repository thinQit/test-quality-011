'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';
import clsx from 'clsx';

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/test-items', label: 'Test Items' },
  { href: '/test-items/new', label: 'Create' },
  { href: '/settings', label: 'Settings' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6" aria-label="Main navigation">
        <Link href="/" className="text-lg font-semibold" aria-label="Test Quality Home">
          Test Quality
        </Link>
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Toggle navigation"
          onClick={() => setOpen(prev => !prev)}
        >
          <span className="sr-only">Toggle menu</span>
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-primary">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Button variant="outline" size="sm" onClick={logout} aria-label="Log out">Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium hover:text-primary">Login</Link>
              <Link href="/signup" className="text-sm font-medium hover:text-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </nav>
      <div className={clsx('md:hidden border-t border-border', open ? 'block' : 'hidden')}>
        <div className="flex flex-col gap-2 px-4 py-3">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          {loading ? null : user ? (
            <Button variant="outline" size="sm" onClick={() => { logout(); setOpen(false); }} aria-label="Log out">Logout</Button>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/signup" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navigation;
