import Link from 'next/link';
import Button from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold">404 - Page Not Found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link href="/" aria-label="Go to dashboard">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}

export default NotFound;
