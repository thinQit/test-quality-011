import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={cn('h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary', className)}
    />
  );
}

export default Spinner;
