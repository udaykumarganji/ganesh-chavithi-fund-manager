'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { TeamMemberWithPayments } from '@/lib/types';
import { getCurrentDate } from '@/lib/format';

interface TeamMemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; total_contribution: number }) => Promise<{ error: string | null }>;
  editingItem?: TeamMemberWithPayments | null;
}

export function TeamMemberFormDialog({ open, onOpenChange, onSubmit, editingItem }: TeamMemberFormDialogProps) {
  const [name, setName] = useState('');
  const [contribution, setContribution] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setName(editingItem.name);
        setContribution(String(editingItem.total_contribution));
      } else {
        setName('');
        setContribution('');
      }
      setError('');
    }
  }, [open, editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter the member name.');
      return;
    }
    const contributionNum = parseFloat(contribution);
    if (isNaN(contributionNum) || contributionNum <= 0) {
      setError('Total contribution must be greater than ₹0.');
      return;
    }

    setLoading(true);
    const result = await onSubmit({ name: name.trim(), total_contribution: contributionNum });
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
          <DialogTitle>{editingItem ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="member_name">Member Name</Label>
            <Input
              id="member_name"
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution">Total Contribution (₹)</Label>
            <Input
              id="contribution"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 10000"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">The total amount the member has promised to contribute.</p>
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

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { team_member_id: string; amount: number; note?: string; date?: string }) => Promise<{ error: string | null }>;
  members: TeamMemberWithPayments[];
  preselectedMemberId?: string | null;
}

export function PaymentFormDialog({ open, onOpenChange, onSubmit, members, preselectedMemberId }: PaymentFormDialogProps) {
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getCurrentDate());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMemberId(preselectedMemberId || '');
      setAmount('');
      setNote('');
      setDate(getCurrentDate());
      setError('');
    }
  }, [open, preselectedMemberId]);

  const selectedMember = members.find((m) => m.id === memberId);
  const remaining = selectedMember ? selectedMember.remaining : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!memberId) {
      setError('Please select a team member.');
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (selectedMember && amountNum > remaining) {
      const excess = amountNum - remaining;
      if (remaining > 0) {
        setError(`This payment exceeds the remaining contribution by ₹${excess.toLocaleString('en-IN')}. Remaining: ₹${remaining.toLocaleString('en-IN')}.`);
      } else {
        setError('This member has already completed their contribution.');
      }
      return;
    }

    setLoading(true);
    const result = await onSubmit({
      team_member_id: memberId,
      amount: amountNum,
      note: note.trim() || undefined,
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
          <DialogTitle>Add Member Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="member">Team Member</Label>
            <Select value={memberId} onValueChange={setMemberId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} (Remaining: ₹{m.remaining.toLocaleString('en-IN')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMember && (
            <div className="rounded-lg bg-muted px-3 py-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Contribution:</span>
                <span className="font-medium">₹{Number(selectedMember.total_contribution).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already Paid:</span>
                <span className="font-medium text-success">₹{selectedMember.total_paid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="font-medium text-warning">₹{remaining.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="payment_amount">Payment Amount (₹)</Label>
            <Input
              id="payment_amount"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 3000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Input
              id="note"
              placeholder="e.g. First installment"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_date">Date</Label>
            <Input
              id="payment_date"
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
