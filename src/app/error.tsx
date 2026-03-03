'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-secondary">Please try again or return later.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
