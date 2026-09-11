'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useData } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { SummaryCard } from '@/components/summary-card';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, formatTime, formatCurrencyPlain } from '@/lib/format';
import {
  Wallet,
  Receipt,
  TrendingUp,
  List,
  Users,
  Plus,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { EXPENSE_CATEGORIES } from '@/lib/types';

const CHART_COLORS = ['#16a34a', '#dc2626', '#f59e0b', '#0ea5e9', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

export default function DashboardPage() {
  const { profile } = useAuth();
  const { summary, todaySummary, collections, expenses, teamMembers, allTransactions, loading } = useData();

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return EXPENSE_CATEGORIES.filter((cat) => map[cat] > 0).map((cat) => ({
      name: cat,
      value: map[cat] || 0,
    }));
  }, [expenses]);

  const overviewData = [
    { name: 'Received', value: summary.totalMoneyReceived, color: '#16a34a' },
    { name: 'Expenses', value: summary.totalExpenses, color: '#dc2626' },
    { name: 'Balance', value: summary.remainingBalance, color: '#f59e0b' },
  ];

  const teamData = [
    { name: 'Promised', value: summary.teamTotalPromised, color: '#f59e0b' },
    { name: 'Paid', value: summary.teamTotalPaid, color: '#16a34a' },
    { name: 'Pending', value: summary.teamTotalPending, color: '#dc2626' },
  ];

  const recentTransactions = allTransactions.slice(0, 6);
  const hasData = allTransactions.length > 0;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">🙏 Ganesh Chavithi Fund Manager</h1>
            <p className="mt-1 text-sm text-white/80">
              Welcome back, {profile?.name || 'Admin'} — here is your festival financial overview
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-lg bg-white/10 px-4 py-3 backdrop-blur">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/70">Festival Balance</p>
              <p className="text-2xl font-bold tabular-nums">{formatCurrency(summary.remainingBalance)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Wallet}
          label="Total Money Received"
          value={formatCurrency(summary.totalMoneyReceived)}
          variant="success"
          subtitle="Collections + Team Payments"
        />
        <SummaryCard
          icon={Receipt}
          label="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          variant="destructive"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Remaining Balance"
          value={formatCurrency(summary.remainingBalance)}
          variant={summary.remainingBalance >= 0 ? 'success' : 'destructive'}
        />
        <SummaryCard
          icon={List}
          label="Total Transactions"
          value={summary.totalTransactions.toString()}
          variant="info"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Link href="/collections">
          <div className="group flex items-center gap-3 rounded-xl border border-success/20 bg-success/5 px-4 py-3.5 transition-all hover:border-success/40 hover:shadow-sm cursor-pointer">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <Plus className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Add Collection</p>
              <p className="text-xs text-muted-foreground truncate">Record donor money</p>
            </div>
          </div>
        </Link>
        <Link href="/expenses">
          <div className="group flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3.5 transition-all hover:border-destructive/40 hover:shadow-sm cursor-pointer">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Plus className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Add Expense</p>
              <p className="text-xs text-muted-foreground truncate">Record spending</p>
            </div>
          </div>
        </Link>
        <Link href="/team-members">
          <div className="group flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5 transition-all hover:border-primary/40 hover:shadow-sm cursor-pointer">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Add Team Member</p>
              <p className="text-xs text-muted-foreground truncate">Track contributions</p>
            </div>
          </div>
        </Link>
        <Link href="/team-members">
          <div className="group flex items-center gap-3 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3.5 transition-all hover:border-warning/40 hover:shadow-sm cursor-pointer">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Add Payment</p>
              <p className="text-xs text-muted-foreground truncate">Member installment</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Team + Today Summary row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Team Contributions */}
        <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-black/5">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Team Contributions
            </CardTitle>
            <Link href="/team-members">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-amber-50 p-3 border border-amber-100">
                <p className="text-xs text-amber-700">Total Promised</p>
                <p className="mt-1 text-lg font-bold text-amber-900 tabular-nums">{formatCurrency(summary.teamTotalPromised)}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 border border-green-100">
                <p className="text-xs text-green-700">Total Paid</p>
                <p className="mt-1 text-lg font-bold text-green-900 tabular-nums">{formatCurrency(summary.teamTotalPaid)}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                <p className="text-xs text-red-700">Total Pending</p>
                <p className="mt-1 text-lg font-bold text-red-900 tabular-nums">{formatCurrency(summary.teamTotalPending)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <p className="text-xs text-muted-foreground">
                  Completed: <span className="font-semibold text-foreground">{summary.teamCompletedCount} / {summary.teamTotalCount}</span> members
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                <p className="text-xs text-muted-foreground">
                  Pending: <span className="font-semibold text-warning">{summary.teamTotalCount - summary.teamCompletedCount}</span> members
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card className="border-0 shadow-sm ring-1 ring-black/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Today&apos;s Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 border border-green-100">
              <span className="text-xs text-green-700">Received</span>
              <span className="text-sm font-bold text-green-900 tabular-nums">{formatCurrency(todaySummary.todayReceived)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 border border-red-100">
              <span className="text-xs text-red-700">Expenses</span>
              <span className="text-sm font-bold text-red-900 tabular-nums">{formatCurrency(todaySummary.todayExpenses)}</span>
            </div>
            <div className={`flex items-center justify-between rounded-lg p-3 border ${todaySummary.todayNet >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <span className={`text-xs ${todaySummary.todayNet >= 0 ? 'text-green-700' : 'text-red-700'}`}>Net</span>
              <span className={`text-sm font-bold tabular-nums ${todaySummary.todayNet >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {formatCurrency(todaySummary.todayNet)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      {hasData ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Collection vs Expenses */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Collection vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.totalMoneyReceived === 0 && summary.totalExpenses === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No data available yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {overviewData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Team Contributions Chart */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Team Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.teamTotalPromised === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No team data available yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={teamData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {teamData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Expenses by Category */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseByCategory.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No expense data available yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={(e: { name: string; percent?: number }) => `${e.name} ${((e.percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                      {expenseByCategory.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
              <Link href="/transactions">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentTransactions.map((tx) => (
                    <div
                      key={`${tx.type}-${tx.id}`}
                      className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${tx.type === 'expense' ? 'bg-destructive' : 'bg-success'}`} />
                          <span className="truncate text-sm font-medium text-foreground">{tx.name}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {tx.category} · {formatDate(tx.date)} · {formatTime(tx.time)}
                        </p>
                      </div>
                      <span className={`shrink-0 text-sm font-bold tabular-nums ${tx.type === 'expense' ? 'text-destructive' : 'text-success'}`}>
                        {tx.type === 'expense' ? '-' : '+'}{formatCurrencyPlain(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon={List}
          message="No transactions yet. Start by adding a collection, expense, or team member payment."
        />
      )}
    </div>
  );
}
