/*
  # Universal RLS Policies for Development Mode

  ## Overview
  This migration creates simple universal RLS policies for all tables to enable
  unrestricted data access during development and testing.

  ## Problem
  Multiple tables have complex RLS policies that check user roles via subqueries
  to the profiles table. Even with profiles using (true), these complex policies
  can still cause issues and limit visibility during development.

  ## Solution
  Replace all complex role-based policies with simple universal policies that:
  - Allow all authenticated users to perform any operation
  - Use USING (true) and WITH CHECK (true) for maximum accessibility
  - Maintain RLS enabled for structure, but with no actual restrictions

  ## Tables Modified
  All application tables with RLS policies:
  - pagos
  - estados_cuenta
  - espacios
  - reservas
  - amonestaciones
  - accesos
  - mudanzas
  - residenciales
  - residencias
  - garita_registros
  - solicitudes_acceso
  - audit_log

  ## Security Warning
  ⚠️ THIS IS FOR DEVELOPMENT ONLY
  ⚠️ All data is accessible to all authenticated users
  ⚠️ Restore proper RLS before production deployment
*/

-- ============================================================
-- PAGOS TABLE
-- ============================================================
DROP POLICY IF EXISTS "Users can view their pagos" ON pagos;
DROP POLICY IF EXISTS "ADMIN_RESIDENCIAL can manage pagos in their residencial" ON pagos;
DROP POLICY IF EXISTS "SUPERADMIN full access to pagos" ON pagos;

CREATE POLICY "dev_mode_all_pagos"
  ON pagos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- ESTADOS_CUENTA TABLE
-- ============================================================
DROP POLICY IF EXISTS "Users can view their estados_cuenta" ON estados_cuenta;
DROP POLICY IF EXISTS "ADMIN_RESIDENCIAL can manage estados_cuenta in their residencia" ON estados_cuenta;
DROP POLICY IF EXISTS "SUPERADMIN full access to estados_cuenta" ON estados_cuenta;

CREATE POLICY "dev_mode_all_estados_cuenta"
  ON estados_cuenta FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- ESPACIOS TABLE
-- ============================================================
DROP POLICY IF EXISTS "Users can view espacios in their residencial" ON espacios;
DROP POLICY IF EXISTS "ADMIN_RESIDENCIAL can manage espacios in their residencial" ON espacios;
DROP POLICY IF EXISTS "SUPERADMIN full access to espacios" ON espacios;

CREATE POLICY "dev_mode_all_espacios"
  ON espacios FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- RESERVAS TABLE
-- ============================================================
DROP POLICY IF EXISTS "Users can view their reservas" ON reservas;
DROP POLICY IF EXISTS "Users can create reservas" ON reservas;
DROP POLICY IF EXISTS "ADMIN_RESIDENCIAL can manage reservas in their residencial" ON reservas;
DROP POLICY IF EXISTS "SUPERADMIN full access to reservas" ON reservas;

CREATE POLICY "dev_mode_all_reservas"
  ON reservas FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- AMONESTACIONES TABLE
-- ============================================================
DROP POLICY IF EXISTS "Users can view their amonestaciones" ON amonestaciones;
DROP POLICY IF EXISTS "ADMIN_RESIDENCIAL can manage amonestaciones in their residencia" ON amonestaciones;
DROP POLICY IF EXISTS "SUPERADMIN full access to amonestaciones" ON amonestaciones;

CREATE POLICY "dev_mode_all_amonestaciones"
  ON amonestaciones FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- ACCESOS TABLE
-- ============================================================
DROP POLICY IF EXISTS "Users can view their accesos" ON accesos;
DROP POLICY IF EXISTS "ADMIN_RESIDENCIAL can view accesos in their residencial" ON accesos;
DROP POLICY IF EXISTS "IT can manage accesos" ON accesos;
DROP POLICY IF EXISTS "SUPERADMIN full access to accesos" ON accesos;

CREATE POLICY "dev_mode_all_accesos"
  ON accesos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- MUDANZAS TABLE
-- ============================================================
DROP POLICY IF EXISTS "Users can view their mudanzas" ON mudanzas;
DROP POLICY IF EXISTS "Users can create mudanzas" ON mudanzas;
DROP POLICY IF EXISTS "ADMIN_RESIDENCIAL can view mudanzas in their residencial" ON mudanzas;
DROP POLICY IF EXISTS "SEGURIDAD can manage mudanzas" ON mudanzas;
DROP POLICY IF EXISTS "SUPERADMIN full access to mudanzas" ON mudanzas;

CREATE POLICY "dev_mode_all_mudanzas"
  ON mudanzas FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- RESIDENCIALES TABLE
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own residencial" ON residenciales;
DROP POLICY IF EXISTS "SUPERADMIN full access to residenciales" ON residenciales;

CREATE POLICY "dev_mode_all_residenciales"
  ON residenciales FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- RESIDENCIAS TABLE
-- ============================================================
DROP POLICY IF EXISTS "Users can view residencias in their residencial" ON residencias;
DROP POLICY IF EXISTS "ADMIN_RESIDENCIAL can manage residencias in their residencial" ON residencias;
DROP POLICY IF EXISTS "SUPERADMIN full access to residencias" ON residencias;

CREATE POLICY "dev_mode_all_residencias"
  ON residencias FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- GARITA_REGISTROS TABLE
-- ============================================================
DROP POLICY IF EXISTS "ADMIN_RESIDENCIAL can view garita_registros in their residencia" ON garita_registros;
DROP POLICY IF EXISTS "SEGURIDAD can view garita_registros" ON garita_registros;
DROP POLICY IF EXISTS "SEGURIDAD can create garita_registros" ON garita_registros;
DROP POLICY IF EXISTS "SUPERADMIN full access to garita_registros" ON garita_registros;

CREATE POLICY "dev_mode_all_garita_registros"
  ON garita_registros FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- SOLICITUDES_ACCESO TABLE
-- ============================================================
DROP POLICY IF EXISTS "Users can view their solicitudes_acceso" ON solicitudes_acceso;
DROP POLICY IF EXISTS "Users can create solicitudes_acceso" ON solicitudes_acceso;
DROP POLICY IF EXISTS "IT can manage solicitudes_acceso" ON solicitudes_acceso;
DROP POLICY IF EXISTS "SUPERADMIN full access to solicitudes_acceso" ON solicitudes_acceso;

CREATE POLICY "dev_mode_all_solicitudes_acceso"
  ON solicitudes_acceso FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- AUDIT_LOG TABLE - Keep existing policies but add universal one
-- ============================================================
CREATE POLICY "dev_mode_all_audit_log"
  ON audit_log FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- VERIFICATION
-- ============================================================

/*
  After this migration:
  ✓ All tables have universal access policies
  ✓ No more complex subqueries checking roles
  ✓ No more recursion issues
  ✓ All authenticated users can access all data
  ✓ All module queries will return 200 with data

  Test cases:
  - GET /pagos → Should return all pagos records
  - GET /reservas → Should return all reservas records
  - GET /residenciales → Should return all residenciales records
  - GET /profiles → Should return all profiles records

  PRODUCTION RESTORATION REQUIRED:
  Before production, you must restore proper RLS policies with:
  □ Role-based access control (SUPERADMIN, ADMIN_RESIDENCIAL, RESIDENTE, etc.)
  □ Residencial-based isolation
  □ User-level data ownership checks
  □ Proper audit trail policies
  □ Security testing and penetration testing
*/
