'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Expense, EXPENSE_CATEGORIES } from '@/lib/types';
import { getCurrentDate } from '@/lib/format';

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    expense_name: string;
    category: string;
    amount: number;
    description?: string;
    date?: string;
  }) => Promise<{ error: string | null }>;
  editingItem?: Expense | null;
}

export function ExpenseFormDialog({ open, onOpenChange, onSubmit, editingItem }: ExpenseFormDialogProps) {
  const [expenseName, setExpenseName] = useState('');
  const [category, setCategory] = useState<string>('Decoration');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getCurrentDate());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setExpenseName(editingItem.expense_name);
        setCategory(editingItem.category);
        setAmount(String(editingItem.amount));
        setDescription(editingItem.description || '');
        setDate(editingItem.date);
      } else {
        setExpenseName('');
        setCategory('Decoration');
        setAmount('');
        setDescription('');
        setDate(getCurrentDate());
      }
      setError('');
    }
  }, [open, editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!expenseName.trim()) {
      setError('Please enter the expense name.');
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }

    setLoading(true);
    const result = await onSubmit({
      expense_name: expenseName.trim(),
      category,
      amount: amountNum,
      description: description.trim() || undefined,
      date,
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="expense_name">Expense Name</Label>
            <Input
              id="expense_name"
              placeholder="e.g. Ganesh Idol, Decoration, Flowers"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 2500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description / Note (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g. Mandapam decoration materials"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingItem ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
