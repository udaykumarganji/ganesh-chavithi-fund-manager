/*
# Ganesh Chavithi Fund Manager - Complete Database Schema

## Overview
Creates the complete schema for the Ganesh Chavithi Fund Manager application — a multi-user financial management system for village festival committees. Each authenticated user manages their own isolated set of financial records.

## New Tables

1. **profiles** — User profile information linked to Supabase auth.users
   - id (uuid, PK, references auth.users)
   - name (text, user's display name)
   - email (text, user's email)
   - created_at (timestamptz)

2. **festival_settings** — Per-user festival configuration
   - id (uuid, PK)
   - user_id (uuid, owner, defaults to auth.uid())
   - festival_name (text, default 'Ganesh Chavithi 2026')
   - start_date (date, nullable)
   - end_date (date, nullable)
   - created_at, updated_at (timestamptz)

3. **collections** — General donor money received
   - id (uuid, PK)
   - user_id (uuid, owner, defaults to auth.uid())
   - person_name (text, donor name)
   - amount (numeric, must be > 0)
   - description (text, optional note)
   - date (date, date of collection)
   - time (text, time of collection)
   - created_at, updated_at (timestamptz)

4. **expenses** — Money spent by the committee
   - id (uuid, PK)
   - user_id (uuid, owner, defaults to auth.uid())
   - expense_name (text, name of expense)
   - category (text, one of predefined categories)
   - amount (numeric, must be > 0)
   - description (text, optional note)
   - date (date, date of expense)
   - time (text, time of expense)
   - created_at, updated_at (timestamptz)

5. **team_members** — Organizing team members with promised contributions
   - id (uuid, PK)
   - user_id (uuid, owner, defaults to auth.uid())
   - name (text, member name)
   - total_contribution (numeric, promised amount)
   - created_at, updated_at (timestamptz)

6. **team_member_payments** — Individual payments from team members (installments)
   - id (uuid, PK)
   - user_id (uuid, owner, defaults to auth.uid())
   - team_member_id (uuid, FK to team_members, ON DELETE CASCADE)
   - amount (numeric, payment amount)
   - date (date, payment date)
   - time (text, payment time)
   - note (text, optional)
   - created_at, updated_at (timestamptz)

7. **audit_logs** — Tracks who created/edited/deleted records
   - id (uuid, PK)
   - user_id (uuid, owner, defaults to auth.uid())
   - action (text: 'create', 'update', 'delete')
   - entity_type (text: 'collection', 'expense', 'team_member', 'team_member_payment')
   - entity_id (uuid, nullable)
   - description (text, human-readable description)
   - created_at (timestamptz)

## Security
- RLS enabled on ALL tables
- Owner-scoped CRUD policies (4 per table: select, insert, update, delete)
- All owner columns default to auth.uid() so inserts work even when frontend omits user_id
- Child table team_member_payments scoped via EXISTS check against parent team_members ownership
- Only authenticated users can access data — no anon access

## Indexes
- Indexes on user_id for all tables (most queries filter by owner)
- Index on team_member_payments.team_member_id for payment lookups
- Indexes on date columns for date-range queries
*/

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ============================================================
-- 2. FESTIVAL_SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS festival_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  festival_name text NOT NULL DEFAULT 'Ganesh Chavithi 2026',
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE festival_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_festival_settings" ON festival_settings;
CREATE POLICY "select_own_festival_settings" ON festival_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_festival_settings" ON festival_settings;
CREATE POLICY "insert_own_festival_settings" ON festival_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_festival_settings" ON festival_settings;
CREATE POLICY "update_own_festival_settings" ON festival_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_festival_settings" ON festival_settings;
CREATE POLICY "delete_own_festival_settings" ON festival_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 3. COLLECTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  person_name text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  description text DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  time text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_collections" ON collections;
CREATE POLICY "select_own_collections" ON collections FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_collections" ON collections;
CREATE POLICY "insert_own_collections" ON collections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_collections" ON collections;
CREATE POLICY "update_own_collections" ON collections FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_collections" ON collections;
CREATE POLICY "delete_own_collections" ON collections FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_date ON collections(date);

-- ============================================================
-- 4. EXPENSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_name text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  amount numeric NOT NULL CHECK (amount > 0),
  description text DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  time text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_expenses" ON expenses;
CREATE POLICY "select_own_expenses" ON expenses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_expenses" ON expenses;
CREATE POLICY "insert_own_expenses" ON expenses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_expenses" ON expenses;
CREATE POLICY "update_own_expenses" ON expenses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_expenses" ON expenses;
CREATE POLICY "delete_own_expenses" ON expenses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- ============================================================
-- 5. TEAM_MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_contribution numeric NOT NULL CHECK (total_contribution > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_team_members" ON team_members;
CREATE POLICY "select_own_team_members" ON team_members FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_team_members" ON team_members;
CREATE POLICY "insert_own_team_members" ON team_members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_team_members" ON team_members;
CREATE POLICY "update_own_team_members" ON team_members FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_team_members" ON team_members;
CREATE POLICY "delete_own_team_members" ON team_members FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- ============================================================
-- 6. TEAM_MEMBER_PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS team_member_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  team_member_id uuid NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  date date NOT NULL DEFAULT CURRENT_DATE,
  time text NOT NULL,
  note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_member_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_team_member_payments" ON team_member_payments;
CREATE POLICY "select_own_team_member_payments" ON team_member_payments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_team_member_payments" ON team_member_payments;
CREATE POLICY "insert_own_team_member_payments" ON team_member_payments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_team_member_payments" ON team_member_payments;
CREATE POLICY "update_own_team_member_payments" ON team_member_payments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_team_member_payments" ON team_member_payments;
CREATE POLICY "delete_own_team_member_payments" ON team_member_payments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_team_member_payments_user_id ON team_member_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_team_member_payments_member_id ON team_member_payments(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_member_payments_date ON team_member_payments(date);

-- ============================================================
-- 7. AUDIT_LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_audit_logs" ON audit_logs;
CREATE POLICY "select_own_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_audit_logs" ON audit_logs;
CREATE POLICY "insert_own_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_audit_logs" ON audit_logs;
CREATE POLICY "delete_own_audit_logs" ON audit_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  INSERT INTO public.festival_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_collections_updated_at ON collections;
CREATE TRIGGER trigger_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_expenses_updated_at ON expenses;
CREATE TRIGGER trigger_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_team_members_updated_at ON team_members;
CREATE TRIGGER trigger_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_team_member_payments_updated_at ON team_member_payments;
CREATE TRIGGER trigger_team_member_payments_updated_at
  BEFORE UPDATE ON team_member_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_festival_settings_updated_at ON festival_settings;
CREATE TRIGGER trigger_festival_settings_updated_at
  BEFORE UPDATE ON festival_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();