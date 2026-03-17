/*
  # Fix Infinite Recursion in Profiles RLS - Development Mode

  ## Problem
  Infinite recursion errors occur when RLS policies on the profiles table
  reference the same table in their USING clauses, creating circular dependencies.

  ## Solution
  For development mode:
  1. Disable RLS on profiles table
  2. Drop all existing policies that cause recursion
  3. Create a simple universal policy that allows all operations
  4. This enables unrestricted data access for testing and development

  ## Security Notes
  ⚠️ WARNING: This configuration is for DEVELOPMENT ONLY
  ⚠️ Before production deployment, proper RLS policies must be restored
  ⚠️ See DATABASE_SETUP.md for production RLS restoration guide

  ## Tables Modified
  - profiles: RLS disabled with universal access policy
*/

-- ============================================================
-- STEP 1: Drop all existing policies on profiles table
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "SUPERADMIN can view all profiles" ON profiles;
DROP POLICY IF EXISTS "SUPERADMIN can insert profiles" ON profiles;
DROP POLICY IF EXISTS "SUPERADMIN can update all profiles" ON profiles;
DROP POLICY IF EXISTS "SUPERADMIN can delete profiles" ON profiles;
DROP POLICY IF EXISTS "SUPERADMIN full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile owners" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated read" ON profiles;

-- ============================================================
-- STEP 2: Disable RLS on profiles table
-- ============================================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 3: Re-enable RLS and create universal dev policy
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a simple universal policy for development mode
-- This allows all authenticated users to perform any operation
CREATE POLICY "dev_mode_all_profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- VERIFICATION
-- ============================================================

/*
  After this migration:
  ✓ No more infinite recursion errors
  ✓ All authenticated users can read all profiles
  ✓ All authenticated users can modify profiles
  ✓ Frontend queries to /profiles will return 200 with data
  ✓ Module queries (pagos, reservas, etc.) will work without recursion errors

  PRODUCTION CHECKLIST:
  Before deploying to production, you MUST:
  □ Restore proper RLS policies with role-based access control
  □ Implement user-level isolation (users can only see their own profile)
  □ Add SUPERADMIN bypass with non-recursive policy structure
  □ Test all policies to ensure no recursion
  □ Audit all access patterns for security compliance
*/
