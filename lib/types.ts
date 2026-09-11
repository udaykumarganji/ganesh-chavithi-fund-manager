export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface FestivalSettings {
  id: string;
  user_id: string;
  festival_name: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  person_name: string;
  amount: number;
  description: string;
  date: string;
  time: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  expense_name: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  time: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  total_contribution: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberPayment {
  id: string;
  user_id: string;
  team_member_id: string;
  amount: number;
  date: string;
  time: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberWithPayments extends TeamMember {
  payments: TeamMemberPayment[];
  total_paid: number;
  remaining: number;
  status: 'NOT_PAID' | 'PARTIALLY_PAID' | 'COMPLETED';
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  created_at: string;
}

export type TransactionType = 'collection' | 'team_payment' | 'expense';

export interface UnifiedTransaction {
  id: string;
  type: TransactionType;
  name: string;
  amount: number;
  category: string;
  date: string;
  time: string;
  description: string;
  created_by: string;
}

export const EXPENSE_CATEGORIES = [
  'Decoration',
  'Food',
  'Pooja',
  'Sound System',
  'Electricity',
  'Transportation',
  'Idol',
  'Cleaning',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
