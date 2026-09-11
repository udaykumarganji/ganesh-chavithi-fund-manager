'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import {
  Collection,
  Expense,
  TeamMember,
  TeamMemberPayment,
  TeamMemberWithPayments,
  UnifiedTransaction,
  AuditLog,
  FestivalSettings,
} from '@/lib/types';
import { getMemberStatus } from '@/lib/format';

export interface FinancialSummary {
  totalCollections: number;
  totalTeamPayments: number;
  totalMoneyReceived: number;
  totalExpenses: number;
  remainingBalance: number;
  totalTransactions: number;
  teamTotalPromised: number;
  teamTotalPaid: number;
  teamTotalPending: number;
  teamCompletedCount: number;
  teamTotalCount: number;
}

export interface TodaySummary {
  todayReceived: number;
  todayExpenses: number;
  todayNet: number;
}

export function useData() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamPayments, setTeamPayments] = useState<TeamMemberPayment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [festivalSettings, setFestivalSettings] = useState<FestivalSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [colRes, expRes, tmRes, tpRes, fsRes] = await Promise.all([
      supabase.from('collections').select('*').order('date', { ascending: false }).order('time', { ascending: false }),
      supabase.from('expenses').select('*').order('date', { ascending: false }).order('time', { ascending: false }),
      supabase.from('team_members').select('*').order('created_at', { ascending: true }),
      supabase.from('team_member_payments').select('*').order('date', { ascending: false }).order('time', { ascending: false }),
      supabase.from('festival_settings').select('*').maybeSingle(),
    ]);

    setCollections((colRes.data as Collection[]) || []);
    setExpenses((expRes.data as Expense[]) || []);
    setTeamMembers((tmRes.data as TeamMember[]) || []);
    setTeamPayments((tpRes.data as TeamMemberPayment[]) || []);
    setFestivalSettings((fsRes.data as FestivalSettings) || null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const loadAuditLogs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setAuditLogs((data as AuditLog[]) || []);
  }, [user]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const logAudit = useCallback(
    async (action: string, entity_type: string, description: string, entity_id?: string) => {
      if (!user) return;
      await supabase.from('audit_logs').insert({
        action,
        entity_type,
        entity_id: entity_id || null,
        description,
      });
      loadAuditLogs();
    },
    [user, loadAuditLogs]
  );

  // --- Derived data ---

  const teamMembersWithPayments: TeamMemberWithPayments[] = teamMembers.map((m) => {
    const payments = teamPayments.filter((p) => p.team_member_id === m.id);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remaining = Number(m.total_contribution) - totalPaid;
    const status = getMemberStatus(totalPaid, Number(m.total_contribution));
    return { ...m, payments, total_paid: totalPaid, remaining, status };
  });

  const summary: FinancialSummary = (() => {
    const totalCollections = collections.reduce((s, c) => s + Number(c.amount), 0);
    const totalTeamPayments = teamPayments.reduce((s, p) => s + Number(p.amount), 0);
    const totalMoneyReceived = totalCollections + totalTeamPayments;
    const totalExpensesVal = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const remainingBalance = totalMoneyReceived - totalExpensesVal;
    const totalTransactions = collections.length + teamPayments.length + expenses.length;
    const teamTotalPromised = teamMembers.reduce((s, m) => s + Number(m.total_contribution), 0);
    const teamTotalPaid = totalTeamPayments;
    const teamTotalPending = teamTotalPromised - teamTotalPaid;
    const teamCompletedCount = teamMembersWithPayments.filter((m) => m.status === 'COMPLETED').length;
    return {
      totalCollections,
      totalTeamPayments,
      totalMoneyReceived,
      totalExpenses: totalExpensesVal,
      remainingBalance,
      totalTransactions,
      teamTotalPromised,
      teamTotalPaid,
      teamTotalPending,
      teamCompletedCount,
      teamTotalCount: teamMembers.length,
    };
  })();

  const todaySummary: TodaySummary = (() => {
    const today = new Date().toISOString().split('T')[0];
    const todayReceived =
      collections.filter((c) => c.date === today).reduce((s, c) => s + Number(c.amount), 0) +
      teamPayments.filter((p) => p.date === today).reduce((s, p) => s + Number(p.amount), 0);
    const todayExpenses = expenses
      .filter((e) => e.date === today)
      .reduce((s, e) => s + Number(e.amount), 0);
    return { todayReceived, todayExpenses, todayNet: todayReceived - todayExpenses };
  })();

  const allTransactions: UnifiedTransaction[] = [
    ...collections.map<UnifiedTransaction>((c) => ({
      id: c.id,
      type: 'collection',
      name: c.person_name,
      amount: Number(c.amount),
      category: 'General Collection',
      date: c.date,
      time: c.time,
      description: c.description,
      created_by: c.user_id,
    })),
    ...teamPayments.map<UnifiedTransaction>((p) => {
      const member = teamMembers.find((m) => m.id === p.team_member_id);
      return {
        id: p.id,
        type: 'team_payment',
        name: member?.name || 'Unknown',
        amount: Number(p.amount),
        category: 'Team Member Payment',
        date: p.date,
        time: p.time,
        description: p.note,
        created_by: p.user_id,
      };
    }),
    ...expenses.map<UnifiedTransaction>((e) => ({
      id: e.id,
      type: 'expense',
      name: e.expense_name,
      amount: Number(e.amount),
      category: e.category,
      date: e.date,
      time: e.time,
      description: e.description,
      created_by: e.user_id,
    })),
  ].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.time.localeCompare(a.time);
  });

  // --- CRUD Operations ---

  const addCollection = useCallback(
    async (data: { person_name: string; amount: number; description?: string; date?: string }) => {
      const { getCurrentTime, getCurrentDate } = await import('@/lib/format');
      const { error } = await supabase.from('collections').insert({
        person_name: data.person_name,
        amount: data.amount,
        description: data.description || '',
        date: data.date || getCurrentDate(),
        time: getCurrentTime(),
      });
      if (error) return { error: error.message };
      logAudit('create', 'collection', `Collection of ₹${data.amount} from ${data.person_name}`);
      loadAll();
      return { error: null };
    },
    [logAudit, loadAll]
  );

  const updateCollection = useCallback(
    async (id: string, data: Partial<Collection>) => {
      const { error } = await supabase
        .from('collections')
        .update({
          person_name: data.person_name,
          amount: data.amount,
          description: data.description,
          date: data.date,
        })
        .eq('id', id);
      if (error) return { error: error.message };
      logAudit('update', 'collection', `Updated collection ${id}`, id);
      loadAll();
      return { error: null };
    },
    [logAudit, loadAll]
  );

  const deleteCollection = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('collections').delete().eq('id', id);
      if (error) return { error: error.message };
      logAudit('delete', 'collection', `Deleted collection ${id}`, id);
      loadAll();
      return { error: null };
    },
    [logAudit, loadAll]
  );

  const addExpense = useCallback(
    async (data: {
      expense_name: string;
      category: string;
      amount: number;
      description?: string;
      date?: string;
    }) => {
      const { getCurrentTime, getCurrentDate } = await import('@/lib/format');
      const { error } = await supabase.from('expenses').insert({
        expense_name: data.expense_name,
        category: data.category,
        amount: data.amount,
        description: data.description || '',
        date: data.date || getCurrentDate(),
        time: getCurrentTime(),
      });
      if (error) return { error: error.message };
      logAudit('create', 'expense', `Expense of ₹${data.amount} for ${data.expense_name}`);
      loadAll();
      return { error: null };
    },
    [logAudit, loadAll]
  );

  const updateExpense = useCallback(
    async (id: string, data: Partial<Expense>) => {
      const { error } = await supabase
        .from('expenses')
        .update({
          expense_name: data.expense_name,
          category: data.category,
          amount: data.amount,
          description: data.description,
          date: data.date,
        })
        .eq('id', id);
      if (error) return { error: error.message };
      logAudit('update', 'expense', `Updated expense ${id}`, id);
      loadAll();
      return { error: null };
    },
    [logAudit, loadAll]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) return { error: error.message };
      logAudit('delete', 'expense', `Deleted expense ${id}`, id);
      loadAll();
      return { error: null };
    },
    [logAudit, loadAll]
  );

  const addTeamMember = useCallback(
    async (data: { name: string; total_contribution: number }) => {
      const { error } = await supabase.from('team_members').insert({
        name: data.name,
        total_contribution: data.total_contribution,
      });
      if (error) return { error: error.message };
      logAudit('create', 'team_member', `Added team member ${data.name} with contribution ₹${data.total_contribution}`);
      loadAll();
      return { error: null };
    },
    [logAudit, loadAll]
  );

  const updateTeamMember = useCallback(
    async (id: string, data: { name: string; total_contribution: number }) => {
      const { error } = await supabase
        .from('team_members')
        .update({ name: data.name, total_contribution: data.total_contribution })
        .eq('id', id);
      if (error) return { error: error.message };
      logAudit('update', 'team_member', `Updated team member ${id}`, id);
      loadAll();
      return { error: null };
    },
    [logAudit, loadAll]
  );

  const deleteTeamMember = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) return { error: error.message };
      logAudit('delete', 'team_member', `Deleted team member ${id} and their payments`, id);
      loadAll();
      return { error: null };
    },
    [logAudit, loadAll]
  );

  const addTeamPayment = useCallback(
    async (data: {
      team_member_id: string;
      amount: number;
      note?: string;
      date?: string;
    }) => {
      const { getCurrentTime, getCurrentDate } = await import('@/lib/format');
      const { error } = await supabase.from('team_member_payments').insert({
        team_member_id: data.team_member_id,
        amount: data.amount,
        note: data.note || '',
        date: data.date || getCurrentDate(),
        time: getCurrentTime(),
      });
      if (error) return { error: error.message };
      logAudit('create', 'team_member_payment', `Payment of ₹${data.amount} for team member ${data.team_member_id}`, data.team_member_id);
      loadAll();
      return { error: null };
    },
    [logAudit, loadAll]
  );

  const deleteTeamPayment = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('team_member_payments').delete().eq('id', id);
      if (error) return { error: error.message };
      logAudit('delete', 'team_member_payment', `Deleted payment ${id}`, id);
      loadAll();
      return { error: null };
    },
    [logAudit, loadAll]
  );

  const updateFestivalSettings = useCallback(
    async (data: { festival_name: string; start_date: string | null; end_date: string | null }) => {
      if (!festivalSettings) return { error: 'No settings found' };
      const { error } = await supabase
        .from('festival_settings')
        .update({
          festival_name: data.festival_name,
          start_date: data.start_date,
          end_date: data.end_date,
        })
        .eq('id', festivalSettings.id);
      if (error) return { error: error.message };
      loadAll();
      return { error: null };
    },
    [festivalSettings, loadAll]
  );

  return {
    collections,
    expenses,
    teamMembers: teamMembersWithPayments,
    teamPayments,
    auditLogs,
    festivalSettings,
    summary,
    todaySummary,
    allTransactions,
    loading,
    refresh: loadAll,
    addCollection,
    updateCollection,
    deleteCollection,
    addExpense,
    updateExpense,
    deleteExpense,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addTeamPayment,
    deleteTeamPayment,
    updateFestivalSettings,
  };
}
