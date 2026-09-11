'use client';

import { useState } from 'react';
import { useData } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/empty-state';
import { generatePDF } from '@/lib/pdf-export';
import { FileText, Download, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

type DatePreset = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

export default function ExportPDFPage() {
  const { collections, expenses, teamMembers, allTransactions, summary, festivalSettings, loading } = useData();
  const { profile } = useAuth();
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleExport = () => {
    setGenerating(true);
    let start: string | null = null;
    let end: string | null = null;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    switch (datePreset) {
      case 'today':
        start = todayStr;
        end = todayStr;
        break;
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];
        start = yStr;
        end = yStr;
        break;
      }
      case 'this_week': {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        start = weekStart.toISOString().split('T')[0];
        end = weekEnd.toISOString().split('T')[0];
        break;
      }
      case 'this_month': {
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      }
      case 'custom':
        start = customStart || null;
        end = customEnd || null;
        break;
      case 'all':
      default:
        start = null;
        end = null;
        break;
    }

    try {
      generatePDF({
        festivalSettings,
        collections,
        expenses,
        teamMembers,
        allTransactions,
        summary,
        dateRange: { start, end },
        profileName: profile?.name || 'Admin',
      });
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const hasData = allTransactions.length > 0 || teamMembers.length > 0;

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">📄 Export PDF</h1>
        <p className="text-sm text-muted-foreground">Generate a professional financial report</p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={FileText}
          message="No data available to export. Start adding transactions first."
        />
      ) : (
        <>
          {/* Summary Preview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Money Received</p>
                <p className="text-lg font-bold text-success">{formatCurrency(summary.totalMoneyReceived)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-lg font-bold text-destructive">{formatCurrency(summary.totalExpenses)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Remaining Balance</p>
                <p className="text-lg font-bold text-success">{formatCurrency(summary.remainingBalance)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Transactions</p>
                <p className="text-lg font-bold">{summary.totalTransactions}</p>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Festival Data</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="custom">Custom Date Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {datePreset === 'custom' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pdf_start">Start Date</Label>
                    <Input
                      id="pdf_start"
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pdf_end">End Date</Label>
                    <Input
                      id="pdf_end"
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {datePreset === 'custom' && customStart && customEnd && (
                <p className="text-sm text-muted-foreground">
                  Report period: {customStart} to {customEnd}
                </p>
              )}

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium mb-2">The PDF report will include:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Festival information and report date/time</li>
                  <li>• Financial summary (received, expenses, balance)</li>
                  <li>• Money received details (collections + team payments) in <span className="text-success font-medium">green</span></li>
                  <li>• Expense details in <span className="text-destructive font-medium">red</span></li>
                  <li>• Team member contributions with status colors</li>
                  <li>• Payment history for each team member</li>
                  <li>• Daily financial summary</li>
                  <li>• Remaining balance highlighted in <span className="text-success font-medium">green</span></li>
                  <li>• Page numbers on all pages</li>
                </ul>
              </div>

              <Button
                onClick={handleExport}
                disabled={generating || (datePreset === 'custom' && !customStart && !customEnd)}
                className="w-full gap-2"
                size="lg"
              >
                {generating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                {generating ? 'Generating PDF...' : 'Generate & Download PDF'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
