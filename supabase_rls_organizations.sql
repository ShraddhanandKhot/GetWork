-- Enable Row Level Security on the organizations table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 1. INSERT Policy: Allow users to create their own organization profile
-- This specifically fixes the "new row violates row-level security policy" error.
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON "public"."organizations";
CREATE POLICY "Enable insert for users based on user_id" ON "public"."organizations"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

-- 2. SELECT Policy: Allow users to view their own organization profile
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON "public"."organizations";
CREATE POLICY "Enable select for users based on user_id" ON "public"."organizations"
AS PERMISSIVE FOR SELECT
TO public
USING (auth.uid() = user_id);

-- 3. UPDATE Policy: Allow users to update their own organization profile
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON "public"."organizations";
CREATE POLICY "Enable update for users based on user_id" ON "public"."organizations"
AS PERMISSIVE FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
