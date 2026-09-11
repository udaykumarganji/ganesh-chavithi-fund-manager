'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/empty-state';
import { formatCurrency, formatCurrencyPlain, formatDate, formatDateShort } from '@/lib/format';
import { EXPENSE_CATEGORIES } from '@/lib/types';
import { BarChart3, Calendar, PieChart } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CHART_COLORS = ['#16a34a', '#dc2626', '#f59e0b', '#0ea5e9', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

export default function ReportsPage() {
  const { collections, expenses, teamPayments, teamMembers, loading } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Date-wise report
  const dateWiseReport = useMemo(() => {
    const dateMap: Record<string, { received: number; expenses: number }> = {};

    collections.forEach((c) => {
      if (!dateMap[c.date]) dateMap[c.date] = { received: 0, expenses: 0 };
      dateMap[c.date].received += Number(c.amount);
    });

    teamPayments.forEach((p) => {
      if (!dateMap[p.date]) dateMap[p.date] = { received: 0, expenses: 0 };
      dateMap[p.date].received += Number(p.amount);
    });

    expenses.forEach((e) => {
      if (!dateMap[e.date]) dateMap[e.date] = { received: 0, expenses: 0 };
      dateMap[e.date].expenses += Number(e.amount);
    });

    return Object.entries(dateMap)
      .map(([date, vals]) => ({
        date,
        received: vals.received,
        expenses: vals.expenses,
        net: vals.received - vals.expenses,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [collections, teamPayments, expenses]);

  // Category-wise expense report
  const categoryReport = useMemo(() => {
    const catMap: Record<string, number> = {};
    expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
    });
    return EXPENSE_CATEGORIES.filter((cat) => catMap[cat] > 0).map((cat) => ({
      name: cat,
      value: catMap[cat] || 0,
    }));
  }, [expenses]);

  // Daily detail for selected date
  const dailyDetail = useMemo(() => {
    const dayCollections = collections.filter((c) => c.date === selectedDate);
    const dayTeamPayments = teamPayments.filter((p) => p.date === selectedDate);
    const dayExpenses = expenses.filter((e) => e.date === selectedDate);
    const dayReceived = dayCollections.reduce((s, c) => s + Number(c.amount), 0) +
      dayTeamPayments.reduce((s, p) => s + Number(p.amount), 0);
    const dayExpensesTotal = dayExpenses.reduce((s, e) => s + Number(e.amount), 0);

    return {
      collections: dayCollections,
      teamPayments: dayTeamPayments,
      expenses: dayExpenses,
      received: dayReceived,
      expensesTotal: dayExpensesTotal,
      net: dayReceived - dayExpensesTotal,
    };
  }, [collections, teamPayments, expenses, selectedDate]);

  const totalReceived = dateWiseReport.reduce((s, d) => s + d.received, 0);
  const totalExpensesSum = dateWiseReport.reduce((s, d) => s + d.expenses, 0);
  const totalNet = totalReceived - totalExpensesSum;

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Loading...</p>;
  }

  const hasData = dateWiseReport.length > 0 || categoryReport.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">📊 Reports</h1>
        <p className="text-sm text-muted-foreground">Daily and category-wise financial reports</p>
      </div>

      {!hasData ? (
        <EmptyState icon={BarChart3} message="No data available yet. Start adding transactions to see reports." />
      ) : (
        <>
          {/* Date-Wise Financial Report */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Date-Wise Financial Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dateWiseReport.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No data available yet.</p>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto sm:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2 font-medium">Date</th>
                          <th className="pb-2 text-right font-medium">Money Received</th>
                          <th className="pb-2 text-right font-medium">Expenses</th>
                          <th className="pb-2 text-right font-medium">Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dateWiseReport.map((row) => (
                          <tr key={row.date} className="border-b last:border-0">
                            <td className="py-2.5">{formatDate(row.date)}</td>
                            <td className="py-2.5 text-right font-medium text-success">{formatCurrencyPlain(row.received)}</td>
                            <td className="py-2.5 text-right font-medium text-destructive">{formatCurrencyPlain(row.expenses)}</td>
                            <td className={`py-2.5 text-right font-medium ${row.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {formatCurrencyPlain(row.net)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 font-bold">
                          <td className="pt-3">Total</td>
                          <td className="pt-3 text-right text-success">{formatCurrencyPlain(totalReceived)}</td>
                          <td className="pt-3 text-right text-destructive">{formatCurrencyPlain(totalExpensesSum)}</td>
                          <td className={`pt-3 text-right ${totalNet >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrencyPlain(totalNet)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="space-y-2 sm:hidden">
                    {dateWiseReport.map((row) => (
                      <div key={row.date} className="rounded-lg border p-3">
                        <p className="text-sm font-medium">{formatDate(row.date)}</p>
                        <div className="mt-2 flex justify-between text-sm">
                          <span className="text-muted-foreground">Received:</span>
                          <span className="font-medium text-success">{formatCurrencyPlain(row.received)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Expenses:</span>
                          <span className="font-medium text-destructive">{formatCurrencyPlain(row.expenses)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t mt-1 pt-1">
                          <span className="text-muted-foreground">Net:</span>
                          <span className={`font-medium ${row.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrencyPlain(row.net)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="rounded-lg border-2 p-3 font-bold">
                      <div className="flex justify-between">
                        <span>Total Received:</span>
                        <span className="text-success">{formatCurrencyPlain(totalReceived)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Expenses:</span>
                        <span className="text-destructive">{formatCurrencyPlain(totalExpensesSum)}</span>
                      </div>
                      <div className="flex justify-between border-t mt-1 pt-1">
                        <span>Net:</span>
                        <span className={totalNet >= 0 ? 'text-success' : 'text-destructive'}>{formatCurrencyPlain(totalNet)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Daily Expense View */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Daily Expense View
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Select Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="max-w-xs"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Money Received</p>
                  <p className="text-lg font-bold text-success">{formatCurrency(dailyDetail.received)}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Expenses</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(dailyDetail.expensesTotal)}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Today&apos;s Net</p>
                  <p className={`text-lg font-bold ${dailyDetail.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(dailyDetail.net)}
                  </p>
                </div>
              </div>

              {dailyDetail.expenses.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No expenses recorded for {formatDate(selectedDate)}.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 font-medium">Time</th>
                        <th className="pb-2 font-medium">Expense</th>
                        <th className="pb-2 font-medium">Category</th>
                        <th className="pb-2 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyDetail.expenses.map((e) => (
                        <tr key={e.id} className="border-b last:border-0">
                          <td className="py-2 text-muted-foreground">{e.time}</td>
                          <td className="py-2">{e.expense_name}</td>
                          <td className="py-2 text-muted-foreground">{e.category}</td>
                          <td className="py-2 text-right font-medium text-destructive">{formatCurrencyPlain(Number(e.amount))}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 font-bold">
                        <td colSpan={3} className="pt-2">Total Spent Today:</td>
                        <td className="pt-2 text-right text-destructive">{formatCurrencyPlain(dailyDetail.expensesTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category-wise expense report */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5" /> Expenses by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryReport.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No expense data available yet.</p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie data={categoryReport} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(e: { name: string; percent?: number }) => `${e.name} ${((e.percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                        {categoryReport.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                      <Legend />
                    </RechartsPie>
                  </ResponsiveContainer>

                  <div className="space-y-2">
                    {categoryReport.map((cat, idx) => (
                      <div key={cat.name} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                        <span className="text-sm font-bold text-destructive">{formatCurrency(cat.value)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-lg border-2 p-3 font-bold">
                      <span>Total</span>
                      <span className="text-destructive">{formatCurrency(categoryReport.reduce((s, c) => s + c.value, 0))}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily bar chart */}
          {dateWiseReport.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Received vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dateWiseReport.slice(0, 14).reverse().map(d => ({ ...d, date: formatDateShort(d.date) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Bar dataKey="received" name="Received" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
