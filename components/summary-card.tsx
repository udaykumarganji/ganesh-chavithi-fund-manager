'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info';
  subtitle?: string;
}

const variantStyles = {
  default: { text: 'text-foreground', accent: 'bg-primary', iconBg: 'bg-primary/10 text-primary', iconText: 'text-primary' },
  success: { text: 'text-success', accent: 'bg-success', iconBg: 'bg-success/10', iconText: 'text-success' },
  destructive: { text: 'text-destructive', accent: 'bg-destructive', iconBg: 'bg-destructive/10', iconText: 'text-destructive' },
  warning: { text: 'text-warning', accent: 'bg-warning', iconBg: 'bg-warning/10', iconText: 'text-warning' },
  info: { text: 'text-blue-600', accent: 'bg-blue-600', iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
};

export function SummaryCard({ icon: Icon, label, value, variant = 'default', subtitle }: SummaryCardProps) {
  const v = variantStyles[variant];
  return (
    <Card className={cn('relative overflow-hidden border-0 shadow-sm ring-1 ring-black/5')}>
      <div className={cn('absolute left-0 top-0 h-full w-1.5', v.accent)} />
      <CardContent className="p-5 pl-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', v.iconBg)}>
            <Icon className={cn('h-4.5 w-4.5', v.iconText)} />
          </div>
          <p className="text-sm font-medium text-muted-foreground leading-tight">{label}</p>
        </div>
        <p className={cn('text-2xl font-bold tabular-nums leading-tight', v.text)}>
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
