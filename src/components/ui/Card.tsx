import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx('rounded-md border border-border bg-card p-4', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={clsx('mb-4 space-y-1', className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={clsx('space-y-2', className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return <div className={clsx('mt-4 flex items-center', className)} {...props} />;
}
