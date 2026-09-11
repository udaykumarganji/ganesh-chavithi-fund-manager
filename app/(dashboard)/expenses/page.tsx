'use client';

import { useState } from 'react';
import { useData } from '@/hooks/use-data';
import { ExpenseFormDialog } from '@/components/expense-form-dialog';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatCurrencyPlain, formatDate, formatTime } from '@/lib/format';
import { Expense } from '@/lib/types';
import { Plus, Receipt, Pencil, Trash2 } from 'lucide-react';

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense, loading } = useData();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Expense | null>(null);
  const [deleteItem, setDeleteItem] = useState<Expense | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: Expense) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: { expense_name: string; category: string; amount: number; description?: string; date?: string }) => {
    if (editingItem) {
      const result = await updateExpense(editingItem.id, data);
      if (result.error) return { error: result.error };
      toast({ title: 'Expense updated successfully.' });
    } else {
      const result = await addExpense(data);
      if (result.error) return { error: result.error };
      toast({ title: 'Expense added successfully.' });
    }
    return { error: null };
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const result = await deleteExpense(deleteItem.id);
    if (result.error) {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Transaction deleted successfully.' });
    }
    setDeleteItem(null);
  };

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">🔴 Expenses</h1>
          <p className="text-sm text-muted-foreground">All festival expenses</p>
        </div>
        <Button onClick={handleAdd} variant="destructive" className="gap-2">
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">Total Expenses: <span className="text-lg font-bold text-destructive">{formatCurrency(total)}</span></p>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          message="No expenses recorded yet."
          action={
            <Button onClick={handleAdd} variant="destructive" className="gap-2">
              <Plus className="h-4 w-4" /> Add Expense
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {expenses.map((e) => (
            <Card key={e.id} className="overflow-hidden">
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="truncate font-medium text-foreground">{e.expense_name}</span>
                    <Badge variant="secondary" className="shrink-0 text-xs">{e.category}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(e.date)} · {formatTime(e.time)}
                  </p>
                  {e.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{e.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-destructive tabular-nums">
                    -{formatCurrencyPlain(Number(e.amount))}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(e)} className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteItem(e)} className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        editingItem={editingItem}
      />

      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the expense of {formatCurrency(Number(deleteItem?.amount || 0))} for {deleteItem?.expense_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
