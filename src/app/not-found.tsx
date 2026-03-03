import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-secondary">The page you are looking for doesn’t exist.</p>
      <Link href="/" className="text-primary hover:underline">Go back home</Link>
    </div>
  );
}
