/*
  # Cleanup Old Restrictive Policies

  ## Overview
  Remove all old restrictive RLS policies that still exist alongside the
  universal dev_mode policies. This ensures completely unrestricted access
  during development with no conflicting policy evaluations.

  ## Problem
  Some tables still have old role-based restrictive policies that exist
  alongside the new universal policies, which could cause confusion or
  unexpected behavior.

  ## Solution
  Drop all remaining old policies and keep only the dev_mode universal policies.
*/

-- ============================================================
-- PAGOS - Remove old restrictive policies
-- ============================================================
DROP POLICY IF EXISTS "RESIDENTE can create own pagos" ON pagos;
DROP POLICY IF EXISTS "RESIDENTE can update own pending pagos" ON pagos;
DROP POLICY IF EXISTS "RESIDENTE can view own pagos" ON pagos;

-- ============================================================
-- RESERVAS - Remove old restrictive policies
-- ============================================================
DROP POLICY IF EXISTS "RESIDENTE can create reservas" ON reservas;
DROP POLICY IF EXISTS "RESIDENTE can update own pending reservas" ON reservas;
DROP POLICY IF EXISTS "RESIDENTE can view own reservas" ON reservas;

-- ============================================================
-- AMONESTACIONES - Remove old restrictive policies
-- ============================================================
DROP POLICY IF EXISTS "RESIDENTE can view own amonestaciones" ON amonestaciones;
DROP POLICY IF EXISTS "RESIDENTE can appeal own amonestaciones" ON amonestaciones;

-- ============================================================
-- ACCESOS - Remove old restrictive policies
-- ============================================================
DROP POLICY IF EXISTS "RESIDENTE can view own accesos" ON accesos;

-- ============================================================
-- MUDANZAS - Remove old restrictive policies
-- ============================================================
DROP POLICY IF EXISTS "RESIDENTE can create mudanzas" ON mudanzas;
DROP POLICY IF EXISTS "RESIDENTE can view own mudanzas" ON mudanzas;

-- ============================================================
-- ESTADOS_CUENTA - Remove old restrictive policies
-- ============================================================
DROP POLICY IF EXISTS "RESIDENTE can view own estados_cuenta" ON estados_cuenta;

-- ============================================================
-- ESPACIOS - Remove any remaining restrictive policies
-- ============================================================
DROP POLICY IF EXISTS "RESIDENTE can view espacios" ON espacios;

-- ============================================================
-- AUDIT_LOG - Clean up but keep insert policy
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_log;
DROP POLICY IF EXISTS "SUPERADMIN can view all audit logs" ON audit_log;
DROP POLICY IF EXISTS "SUPERADMIN can update audit logs" ON audit_log;
DROP POLICY IF EXISTS "SUPERADMIN can delete audit logs" ON audit_log;
DROP POLICY IF EXISTS "ADMIN_RESIDENCIAL can view own residencial audit logs" ON audit_log;

-- ============================================================
-- VERIFICATION
-- ============================================================

/*
  After this migration:
  ✓ All tables have ONLY the dev_mode_all_* universal policy
  ✓ No conflicting restrictive policies remain
  ✓ All authenticated users have full access to all data
  ✓ Policy evaluation is simplified and predictable

  Query to verify (should show 1 policy per table):
  SELECT tablename, COUNT(*) as policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  GROUP BY tablename
  ORDER BY tablename;
*/
