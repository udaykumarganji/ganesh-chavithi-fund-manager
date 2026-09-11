'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/hooks/use-data';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatCurrencyPlain, formatDate, formatTime } from '@/lib/format';
import { UnifiedTransaction, EXPENSE_CATEGORIES } from '@/lib/types';
import { List, Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type TypeFilter = 'all' | 'collection' | 'team_payment' | 'expense';
type DateFilter = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';
type CategoryFilter = 'all' | (typeof EXPENSE_CATEGORIES)[number];

function isWithinRange(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(dateStr + 'T00:00:00');
  return d >= start && d <= end;
}

export default function TransactionsPage() {
  const { allTransactions, loading } = useData();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filtered = useMemo(() => {
    let result = [...allTransactions];

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      if (dateFilter === 'today') {
        const todayStr = today.toISOString().split('T')[0];
        result = result.filter((t) => t.date === todayStr);
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        result = result.filter((t) => t.date === yesterdayStr);
      } else if (dateFilter === 'this_week') {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        result = result.filter((t) => isWithinRange(t.date, weekStart, weekEnd));
      } else if (dateFilter === 'this_month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        result = result.filter((t) => isWithinRange(t.date, monthStart, monthEnd));
      } else if (dateFilter === 'custom') {
        if (customStart && customEnd) {
          const start = new Date(customStart + 'T00:00:00');
          const end = new Date(customEnd + 'T23:59:59');
          result = result.filter((t) => isWithinRange(t.date, start, end));
        } else if (customStart) {
          result = result.filter((t) => t.date >= customStart);
        } else if (customEnd) {
          result = result.filter((t) => t.date <= customEnd);
        }
      }
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allTransactions, typeFilter, dateFilter, categoryFilter, search, customStart, customEnd]);

  const totalReceived = filtered.filter((t) => t.type !== 'expense').reduce((s, t) => s + t.amount, 0);
  const totalSpent = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = totalReceived - totalSpent;

  const hasActiveFilters = typeFilter !== 'all' || dateFilter !== 'all' || categoryFilter !== 'all' || search.trim() !== '';

  const clearFilters = () => {
    setTypeFilter('all');
    setDateFilter('all');
    setCategoryFilter('all');
    setSearch('');
    setCustomStart('');
    setCustomEnd('');
  };

  const typeBadge = (type: UnifiedTransaction['type']) => {
    const config = {
      collection: { label: 'Collection', className: 'bg-success/10 text-success border-success/20' },
      team_payment: { label: 'Team Payment', className: 'bg-success/10 text-success border-success/20' },
      expense: { label: 'Expense', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    };
    return config[type];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">📋 Transactions</h1>
        <p className="text-sm text-muted-foreground">All financial transactions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" /> Filters
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Name, category, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Transaction Type</Label>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="collection">General Collection</SelectItem>
                  <SelectItem value="team_payment">Team Member Payment</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Expense Category</Label>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateFilter === 'custom' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date</Label>
                <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date</Label>
                <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="text-sm" />
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs">
              <X className="h-3 w-3" /> Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Summary of filtered results */}
      {filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Money Received</p>
              <p className="text-lg font-bold text-success">{formatCurrency(totalReceived)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="text-lg font-bold text-destructive">{formatCurrency(totalSpent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Net</p>
              <p className={cn('text-lg font-bold', net >= 0 ? 'text-success' : 'text-destructive')}>{formatCurrency(net)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions List */}
      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : allTransactions.length === 0 ? (
        <EmptyState
          icon={List}
          message="No transactions yet. Start by adding a collection, expense, or team member payment."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          message="No transactions match your filters. Try adjusting your search."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => {
            const badge = typeBadge(tx.type);
            return (
              <Card key={`${tx.type}-${tx.id}`} className="overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={cn('text-xs', badge.className)}>
                          {badge.label}
                        </Badge>
                        <span className="truncate font-medium text-foreground">{tx.name}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(tx.date)} · {formatTime(tx.time)} · {tx.category}
                      </p>
                      {tx.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">{tx.description}</p>
                      )}
                    </div>
                    <span className={cn(
                      'shrink-0 text-base font-bold tabular-nums sm:text-lg',
                      tx.type === 'expense' ? 'text-destructive' : 'text-success'
                    )}>
                      {tx.type === 'expense' ? '-' : '+'}{formatCurrencyPlain(tx.amount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
