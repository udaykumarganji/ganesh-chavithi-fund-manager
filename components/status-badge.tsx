'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'NOT_PAID' | 'PARTIALLY_PAID' | 'COMPLETED';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    NOT_PAID: {
      label: 'NOT PAID',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      dot: 'bg-destructive',
    },
    PARTIALLY_PAID: {
      label: 'PARTIALLY PAID',
      className: 'bg-warning/10 text-warning border-warning/20',
      dot: 'bg-warning',
    },
    COMPLETED: {
      label: 'COMPLETED',
      className: 'bg-success/10 text-success border-success/20',
      dot: 'bg-success',
    },
  };

  const { label, className, dot } = config[status];

  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', className)}>
      <span className={cn('h-2 w-2 rounded-full', dot)} />
      {label}
    </Badge>
  );
}
