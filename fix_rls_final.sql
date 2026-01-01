-- 1. Reset RLS on organizations table
ALTER TABLE "public"."organizations" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;

-- 2. Grant access to authenticated users (essential if permissions are missing)
GRANT ALL ON TABLE "public"."organizations" TO authenticated;
GRANT ALL ON TABLE "public"."organizations" TO service_role;

-- 3. DROP ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON "public"."organizations";
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON "public"."organizations";
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON "public"."organizations";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."organizations";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."organizations";

-- 4. CREATE NEW, ROBUST POLICIES

-- INSERT: Allow any authenticated user to insert a row where the user_id matches their own ID
CREATE POLICY "Enable insert for users based on user_id" 
ON "public"."organizations"
FOR INSERT 
TO public 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  auth.uid() = user_id
);

-- SELECT: Allow users to see their own organization (and maybe others? For now just own)
CREATE POLICY "Enable select for users based on user_id" 
ON "public"."organizations"
FOR SELECT 
TO public 
USING (
  auth.uid() = user_id
);

-- UPDATE: Allow users to update their own organization
CREATE POLICY "Enable update for users based on user_id" 
ON "public"."organizations"
FOR UPDATE 
TO public 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
