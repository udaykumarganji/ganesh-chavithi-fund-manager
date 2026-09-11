'use client';

import { useState } from 'react';
import { useData } from '@/hooks/use-data';
import { CollectionFormDialog } from '@/components/collection-form-dialog';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatCurrencyPlain, formatDate, formatTime } from '@/lib/format';
import { Collection } from '@/lib/types';
import { Plus, Wallet, Pencil, Trash2 } from 'lucide-react';

export default function CollectionsPage() {
  const { collections, addCollection, updateCollection, deleteCollection, loading } = useData();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Collection | null>(null);
  const [deleteItem, setDeleteItem] = useState<Collection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: Collection) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: { person_name: string; amount: number; description?: string; date?: string }) => {
    if (editingItem) {
      const result = await updateCollection(editingItem.id, data);
      if (result.error) {
        return { error: result.error };
      }
      toast({ title: 'Collection updated successfully.' });
    } else {
      const result = await addCollection(data);
      if (result.error) {
        return { error: result.error };
      }
      toast({ title: 'Collection added successfully.' });
    }
    return { error: null };
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    const result = await deleteCollection(deleteItem.id);
    setDeleting(false);
    if (result.error) {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Transaction deleted successfully.' });
    }
    setDeleteItem(null);
  };

  const total = collections.reduce((s, c) => s + Number(c.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">💰 Collections</h1>
          <p className="text-sm text-muted-foreground">General donor money received</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Collection
        </Button>
      </div>

      <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-green-700">Total Collections</p>
            <p className="mt-1 text-2xl font-bold text-green-900 tabular-nums">{formatCurrency(total)}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <Wallet className="h-5 w-5 text-green-700" />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : collections.length === 0 ? (
        <EmptyState
          icon={Wallet}
          message="No collections recorded yet."
          action={
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Add Collection
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {collections.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    <span className="truncate font-medium text-foreground">{c.person_name}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(c.date)} · {formatTime(c.time)}
                  </p>
                  {c.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{c.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-success tabular-nums">
                    +{formatCurrencyPlain(Number(c.amount))}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteItem(c)} className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CollectionFormDialog
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
              This will permanently delete the collection of {formatCurrency(Number(deleteItem?.amount || 0))} from {deleteItem?.person_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
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
