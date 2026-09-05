-- iDEA Creation Hub: Escrow Payment Management System Schema

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email' = 'simonemmanuel8344@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Escrow Projects Table
CREATE TABLE IF NOT EXISTS public.escrow_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id UUID,
    client_id UUID NOT NULL,
    client_name TEXT,
    professional_id UUID NOT NULL,
    professional_name TEXT,
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    commission_rate NUMERIC(5, 2) DEFAULT 0.10,
    status TEXT NOT NULL DEFAULT 'pending_payment',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    user_type TEXT NOT NULL,
    pending_escrow NUMERIC(10, 2) DEFAULT 0,
    available_balance NUMERIC(10, 2) DEFAULT 0,
    withdrawn NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Escrow Transactions (Audit & Flow)
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.escrow_projects(id) ON DELETE SET NULL,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    reference_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Disputes Table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.escrow_projects(id) ON DELETE CASCADE,
    opened_by UUID NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.escrow_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Escrow Projects RLS
CREATE POLICY "Clients can view their own escrow projects" ON public.escrow_projects FOR SELECT USING (auth.uid() = client_id OR auth.uid()::text = client_id::text);
CREATE POLICY "Professionals can view their own escrow projects" ON public.escrow_projects FOR SELECT USING (auth.uid() = professional_id OR auth.uid()::text = professional_id::text);
CREATE POLICY "Admins can view all escrow projects" ON public.escrow_projects FOR ALL USING (is_admin());
-- Allow inserts temporarily if we rely on frontend inserting, but best is a secure RPC or RLS insert
CREATE POLICY "Clients can insert projects" ON public.escrow_projects FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid()::text = client_id::text);
CREATE POLICY "Clients can update project status" ON public.escrow_projects FOR UPDATE USING (auth.uid() = client_id OR auth.uid()::text = client_id::text);
CREATE POLICY "Professionals can update project status" ON public.escrow_projects FOR UPDATE USING (auth.uid() = professional_id OR auth.uid()::text = professional_id::text);


-- Wallets RLS
CREATE POLICY "Users can view their own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id OR auth.uid()::text = user_id::text);
CREATE POLICY "Admins can view all wallets" ON public.wallets FOR ALL USING (is_admin());

-- Escrow Transactions RLS
CREATE POLICY "Users can view transactions for their wallet" ON public.escrow_transactions FOR SELECT USING (
    wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid() OR user_id::text = auth.uid()::text)
);
CREATE POLICY "Admins can view all transactions" ON public.escrow_transactions FOR ALL USING (is_admin());


-- Backend Logic (RPCs)
CREATE OR REPLACE FUNCTION fund_escrow(p_project_id UUID, p_amount NUMERIC, p_ref_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_project escrow_projects%ROWTYPE;
BEGIN
  SELECT * INTO v_project FROM escrow_projects WHERE id = p_project_id;
  IF v_project IS NULL THEN RAISE EXCEPTION 'Project not found'; END IF;
  IF v_project.status != 'pending_payment' THEN RAISE EXCEPTION 'Project is not in pending_payment status'; END IF;
  
  -- Update project status
  UPDATE escrow_projects SET status = 'funded', amount = p_amount, updated_at = NOW() WHERE id = p_project_id;
  
  -- Ensure professional has a wallet
  INSERT INTO wallets (user_id, user_type) VALUES (v_project.professional_id, 'professional') ON CONFLICT (user_id) DO NOTHING;
  
  -- Update professional pending escrow
  UPDATE wallets SET pending_escrow = pending_escrow + p_amount, updated_at = NOW() WHERE user_id = v_project.professional_id;
  
  -- Record transaction
  INSERT INTO escrow_transactions (project_id, amount, type, status, reference_id) VALUES (p_project_id, p_amount, 'fund', 'completed', p_ref_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION release_escrow(p_project_id UUID)
RETURNS VOID AS $$
DECLARE
  v_project escrow_projects%ROWTYPE;
  v_commission NUMERIC;
  v_payout NUMERIC;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Unauthorized: Only admins can release escrow'; END IF;
  SELECT * INTO v_project FROM escrow_projects WHERE id = p_project_id;
  IF v_project.status != 'awaiting_admin_release' THEN RAISE EXCEPTION 'Project must be approved by client before release (status must be awaiting_admin_release)'; END IF;
  
  v_commission := v_project.amount * v_project.commission_rate;
  v_payout := v_project.amount - v_commission;
  
  UPDATE escrow_projects SET status = 'released', updated_at = NOW() WHERE id = p_project_id;
  UPDATE wallets SET pending_escrow = pending_escrow - v_project.amount, available_balance = available_balance + v_payout, updated_at = NOW() WHERE user_id = v_project.professional_id;
  INSERT INTO escrow_transactions (project_id, amount, type, status) VALUES (p_project_id, v_payout, 'release', 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION client_approve_escrow(p_project_id UUID)
RETURNS VOID AS $$
DECLARE
  v_project escrow_projects%ROWTYPE;
BEGIN
  SELECT * INTO v_project FROM escrow_projects WHERE id = p_project_id;
  IF v_project IS NULL THEN RAISE EXCEPTION 'Project not found'; END IF;
  IF (v_project.client_id != auth.uid() AND v_project.client_id::text != auth.uid()::text) AND NOT is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF v_project.status != 'work_submitted' AND v_project.status != 'client_review' THEN RAISE EXCEPTION 'Work not submitted yet'; END IF;
  
  UPDATE escrow_projects SET status = 'awaiting_admin_release', updated_at = NOW() WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

