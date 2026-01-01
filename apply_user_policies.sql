-- ==========================================
-- Apply User-Defined RLS Policies
-- ==========================================

-- 1. Enable RLS on all tables (Safety first)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_partners ENABLE ROW LEVEL SECURITY;

-- 2. Organizations Policies
DROP POLICY IF EXISTS "org_select_own" ON organizations;
create policy "org_select_own"
on organizations
for select
to authenticated
using (user_id = auth.uid());

DROP POLICY IF EXISTS "org_insert_own" ON organizations;
create policy "org_insert_own"
on organizations
for insert
to authenticated
with check (user_id = auth.uid());

DROP POLICY IF EXISTS "org_update_own" ON organizations;
create policy "org_update_own"
on organizations
for update
to authenticated
using (user_id = auth.uid());

-- 3. Workers Policies
DROP POLICY IF EXISTS "worker_select_own" ON workers;
create policy "worker_select_own"
on workers
for select
to authenticated
using (user_id = auth.uid());

DROP POLICY IF EXISTS "worker_insert_own" ON workers;
create policy "worker_insert_own"
on workers
for insert
to authenticated
with check (user_id = auth.uid());

DROP POLICY IF EXISTS "worker_update_own" ON workers;
create policy "worker_update_own"
on workers
for update
to authenticated
using (user_id = auth.uid());

-- 4. Referral Partners Policies
DROP POLICY IF EXISTS "ref_select_own" ON referral_partners;
create policy "ref_select_own"
on referral_partners
for select
to authenticated
using (user_id = auth.uid());

DROP POLICY IF EXISTS "ref_insert_own" ON referral_partners;
create policy "ref_insert_own"
on referral_partners
for insert
to authenticated
with check (user_id = auth.uid());

-- Grant permissions to authenticated users to ensure policies can execute
GRANT ALL ON TABLE organizations TO authenticated;
GRANT ALL ON TABLE workers TO authenticated;
GRANT ALL ON TABLE referral_partners TO authenticated;
