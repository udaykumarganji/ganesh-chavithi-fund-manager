'use client';

import { useState } from 'react';
import { useData } from '@/hooks/use-data';
import { TeamMemberFormDialog, PaymentFormDialog } from '@/components/team-member-form-dialogs';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatCurrencyPlain, formatDate, formatTime } from '@/lib/format';
import { TeamMemberWithPayments } from '@/lib/types';
import {
  Plus,
  Users,
  Pencil,
  Trash2,
  ChevronRight,
  Wallet,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react';

export default function TeamMembersPage() {
  const {
    teamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addTeamPayment,
    deleteTeamPayment,
    loading,
  } = useData();
  const { toast } = useToast();

  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberWithPayments | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithPayments | null>(null);
  const [deleteMember, setDeleteMember] = useState<TeamMemberWithPayments | null>(null);
  const [preselectedMember, setPreselectedMember] = useState<string | null>(null);

  const handleAddMember = () => { setEditingMember(null); setMemberDialogOpen(true); };
  const handleEditMember = (m: TeamMemberWithPayments) => { setEditingMember(m); setMemberDialogOpen(true); };
  const handleAddPayment = (memberId?: string) => { setPreselectedMember(memberId || null); setPaymentDialogOpen(true); };

  const handleSubmitMember = async (data: { name: string; total_contribution: number }) => {
    if (editingMember) {
      const result = await updateTeamMember(editingMember.id, data);
      if (result.error) return { error: result.error };
      toast({ title: 'Team member updated successfully.' });
    } else {
      const result = await addTeamMember(data);
      if (result.error) return { error: result.error };
      toast({ title: 'Team member added successfully.' });
    }
    return { error: null };
  };

  const handleSubmitPayment = async (data: { team_member_id: string; amount: number; note?: string; date?: string }) => {
    const result = await addTeamPayment(data);
    if (result.error) return { error: result.error };
    toast({ title: 'Payment added successfully.' });
    return { error: null };
  };

  const handleDeleteMember = async () => {
    if (!deleteMember) return;
    const result = await deleteTeamMember(deleteMember.id);
    if (result.error) {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Team member deleted successfully.' });
    }
    setDeleteMember(null);
  };

  const handleDeletePayment = async (paymentId: string) => {
    const result = await deleteTeamPayment(paymentId);
    if (result.error) {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Payment deleted successfully.' });
      if (selectedMember) {
        const updated = teamMembers.find((m) => m.id === selectedMember.id);
        if (updated) setSelectedMember(updated);
      }
    }
  };

  const totalPromised = teamMembers.reduce((s, m) => s + Number(m.total_contribution), 0);
  const totalPaid = teamMembers.reduce((s, m) => s + m.total_paid, 0);
  const totalPending = totalPromised - totalPaid;
  const completedCount = teamMembers.filter((m) => m.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">👥 Team Members</h1>
          <p className="text-sm text-muted-foreground">Members, contributions, and payments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleAddPayment()} variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" /> Add Payment
          </Button>
          <Button onClick={handleAddMember} className="gap-2">
            <Plus className="h-4 w-4" /> Add Team Member
          </Button>
        </div>
      </div>

      {/* Summary cards — explicitly colored, never dark */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <Users className="h-4 w-4 text-amber-700" />
            </div>
            <p className="text-xs font-medium text-amber-700">Total Promised</p>
          </div>
          <p className="text-2xl font-bold text-amber-900 tabular-nums">{formatCurrency(totalPromised)}</p>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle2 className="h-4 w-4 text-green-700" />
            </div>
            <p className="text-xs font-medium text-green-700">Total Paid</p>
          </div>
          <p className="text-2xl font-bold text-green-900 tabular-nums">{formatCurrency(totalPaid)}</p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
              <Clock className="h-4 w-4 text-red-700" />
            </div>
            <p className="text-xs font-medium text-red-700">Total Pending</p>
          </div>
          <p className="text-2xl font-bold text-red-900 tabular-nums">{formatCurrency(totalPending)}</p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <TrendingUp className="h-4 w-4 text-blue-700" />
            </div>
            <p className="text-xs font-medium text-blue-700">Completed</p>
          </div>
          <p className="text-2xl font-bold text-blue-900 tabular-nums">{completedCount} / {teamMembers.length}</p>
        </div>
      </div>

      {/* Team Members List */}
      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : teamMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          message="No team members added yet."
          action={
            <Button onClick={handleAddMember} className="gap-2">
              <Plus className="h-4 w-4" /> Add Team Member
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {teamMembers.map((m) => (
            <Card key={m.id} className="overflow-hidden border-0 shadow-sm ring-1 ring-black/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setSelectedMember(m)}
                    className="flex min-w-0 flex-1 flex-col text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                        {m.name}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                        <p className="text-[10px] font-medium text-amber-700">Contribution</p>
                        <p className="text-sm font-bold text-amber-900 tabular-nums">{formatCurrencyPlain(Number(m.total_contribution))}</p>
                      </div>
                      <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2">
                        <p className="text-[10px] font-medium text-green-700">Paid</p>
                        <p className="text-sm font-bold text-green-900 tabular-nums">{formatCurrencyPlain(m.total_paid)}</p>
                      </div>
                      <div className={`rounded-lg px-3 py-2 border ${m.remaining > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                        <p className={`text-[10px] font-medium ${m.remaining > 0 ? 'text-red-700' : 'text-green-700'}`}>Remaining</p>
                        <p className={`text-sm font-bold tabular-nums ${m.remaining > 0 ? 'text-red-900' : 'text-green-900'}`}>
                          {formatCurrencyPlain(m.remaining)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <StatusBadge status={m.status} />
                    </div>
                  </button>

                  <div className="flex shrink-0 flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddPayment(m.id)}
                      className="gap-1 text-xs border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <Plus className="h-3 w-3" /> Payment
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMember(m)}
                      className="gap-1 text-xs"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteMember(m)}
                      className="gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedMember.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-medium text-amber-700">Total Contribution</p>
                    <p className="mt-1 text-lg font-bold text-amber-900 tabular-nums">
                      {formatCurrency(Number(selectedMember.total_contribution))}
                    </p>
                  </div>
                  <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                    <p className="text-xs font-medium text-green-700">Total Paid</p>
                    <p className="mt-1 text-lg font-bold text-green-900 tabular-nums">
                      {formatCurrency(selectedMember.total_paid)}
                    </p>
                  </div>
                  <div className={`rounded-xl border p-3 ${selectedMember.remaining > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                    <p className={`text-xs font-medium ${selectedMember.remaining > 0 ? 'text-red-700' : 'text-green-700'}`}>
                      Remaining
                    </p>
                    <p className={`mt-1 text-lg font-bold tabular-nums ${selectedMember.remaining > 0 ? 'text-red-900' : 'text-green-900'}`}>
                      {formatCurrency(selectedMember.remaining)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-600">Status</p>
                    <div className="mt-2">
                      <StatusBadge status={selectedMember.status} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">Payment History</h3>
                  {selectedMember.payments.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                      No payments recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedMember.payments.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50 px-3 py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-green-900 tabular-nums">
                              +{formatCurrencyPlain(Number(p.amount))}
                            </p>
                            <p className="text-xs text-green-700">
                              {formatDate(p.date)} · {formatTime(p.time)}
                              {p.note && ` · ${p.note}`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePayment(p.id)}
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => { handleAddPayment(selectedMember.id); setSelectedMember(null); }}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Payment
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <TeamMemberFormDialog
        open={memberDialogOpen}
        onOpenChange={setMemberDialogOpen}
        onSubmit={handleSubmitMember}
        editingItem={editingMember}
      />

      <PaymentFormDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSubmit={handleSubmitPayment}
        members={teamMembers}
        preselectedMemberId={preselectedMember}
      />

      <AlertDialog open={!!deleteMember} onOpenChange={(open) => !open && setDeleteMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this team member?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteMember && deleteMember.payments.length > 0
                ? `This member has ${deleteMember.payments.length} payment record(s). Deleting will also remove their payment history. This cannot be undone.`
                : 'This will permanently delete this team member. This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
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
