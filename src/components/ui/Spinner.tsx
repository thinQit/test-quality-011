import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

type SpinnerProps = HTMLAttributes<HTMLDivElement>;

export default function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      className={clsx('inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
}
