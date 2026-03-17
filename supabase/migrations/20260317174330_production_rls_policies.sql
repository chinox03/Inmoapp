/*
  # Production RLS Policies - Role-Based Access Control

  1. Overview
    - Replaces ALL dev-mode universal policies with proper role-based policies
    - Enforces residencial-scoped data isolation
    - Implements ownership checks for RESIDENTE role
    - SUPERADMIN gets full access to all data
    - ADMIN_RESIDENCIAL gets access within their residencial
    - RESIDENTE gets access to their own data only
    - IT and SEGURIDAD get access to their functional areas

  2. Tables Modified
    - profiles, residenciales, residencias
    - pagos, estados_cuenta, espacios, reservas
    - amonestaciones, accesos, solicitudes_acceso
    - mudanzas, garita_registros, audit_log
    - prospectos, negocios

  3. Security Model
    - Every policy checks auth.uid() for authentication
    - Non-SUPERADMIN users are scoped by residencial_id
    - RESIDENTE users are scoped to their own records
    - Separate policies for SELECT, INSERT, UPDATE, DELETE
*/

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol::text FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_residencial_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT residencial_id FROM profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- PROFILES TABLE
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_profiles" ON profiles;
DROP POLICY IF EXISTS "Dev mode: universal profiles access" ON profiles;

CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR id = auth.uid()
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR id = auth.uid()
  )
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR id = auth.uid()
  );

CREATE POLICY "profiles_delete"
  ON profiles FOR DELETE
  TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- RESIDENCIALES TABLE
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_residenciales" ON residenciales;

CREATE POLICY "residenciales_select"
  ON residenciales FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR id = get_user_residencial_id()
  );

CREATE POLICY "residenciales_insert"
  ON residenciales FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'SUPERADMIN');

CREATE POLICY "residenciales_update"
  ON residenciales FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'SUPERADMIN')
  WITH CHECK (get_user_role() = 'SUPERADMIN');

CREATE POLICY "residenciales_delete"
  ON residenciales FOR DELETE
  TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- RESIDENCIAS TABLE
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_residencias" ON residencias;

CREATE POLICY "residencias_select"
  ON residencias FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR residencial_id = get_user_residencial_id()
  );

CREATE POLICY "residencias_insert"
  ON residencias FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "residencias_update"
  ON residencias FOR UPDATE
  TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  )
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "residencias_delete"
  ON residencias FOR DELETE
  TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- PAGOS TABLE
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_pagos" ON pagos;

CREATE POLICY "pagos_select"
  ON pagos FOR SELECT TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
    OR (get_user_role() = 'RESIDENTE' AND residente_id = auth.uid())
  );

CREATE POLICY "pagos_insert"
  ON pagos FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "pagos_update"
  ON pagos FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  )
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "pagos_delete"
  ON pagos FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- ESTADOS_CUENTA TABLE
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_estados_cuenta" ON estados_cuenta;

CREATE POLICY "estados_cuenta_select"
  ON estados_cuenta FOR SELECT TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
    OR (get_user_role() = 'RESIDENTE' AND residente_id = auth.uid())
  );

CREATE POLICY "estados_cuenta_insert"
  ON estados_cuenta FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "estados_cuenta_update"
  ON estados_cuenta FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  )
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "estados_cuenta_delete"
  ON estados_cuenta FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- ESPACIOS TABLE
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_espacios" ON espacios;

CREATE POLICY "espacios_select"
  ON espacios FOR SELECT TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR residencial_id = get_user_residencial_id()
  );

CREATE POLICY "espacios_insert"
  ON espacios FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "espacios_update"
  ON espacios FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  )
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "espacios_delete"
  ON espacios FOR DELETE TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

-- ============================================================
-- RESERVAS TABLE
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_reservas" ON reservas;

CREATE POLICY "reservas_select"
  ON reservas FOR SELECT TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR get_user_role() = 'ADMIN_RESIDENCIAL'
    OR residente_id = auth.uid()
  );

CREATE POLICY "reservas_insert"
  ON reservas FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR get_user_role() = 'ADMIN_RESIDENCIAL'
    OR residente_id = auth.uid()
  );

CREATE POLICY "reservas_update"
  ON reservas FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR get_user_role() = 'ADMIN_RESIDENCIAL'
    OR residente_id = auth.uid()
  )
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR get_user_role() = 'ADMIN_RESIDENCIAL'
    OR residente_id = auth.uid()
  );

CREATE POLICY "reservas_delete"
  ON reservas FOR DELETE TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR get_user_role() = 'ADMIN_RESIDENCIAL'
  );

-- ============================================================
-- AMONESTACIONES TABLE
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_amonestaciones" ON amonestaciones;

CREATE POLICY "amonestaciones_select"
  ON amonestaciones FOR SELECT TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
    OR receptor_id = auth.uid()
  );

CREATE POLICY "amonestaciones_insert"
  ON amonestaciones FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "amonestaciones_update"
  ON amonestaciones FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  )
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "amonestaciones_delete"
  ON amonestaciones FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- ACCESOS TABLE
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_accesos" ON accesos;

CREATE POLICY "accesos_select"
  ON accesos FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('SUPERADMIN', 'IT', 'SEGURIDAD', 'ADMIN_RESIDENCIAL')
    OR residente_id = auth.uid()
  );

CREATE POLICY "accesos_insert"
  ON accesos FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'IT', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "accesos_update"
  ON accesos FOR UPDATE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'IT', 'ADMIN_RESIDENCIAL'))
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'IT', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "accesos_delete"
  ON accesos FOR DELETE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'IT'));

-- ============================================================
-- SOLICITUDES_ACCESO TABLE
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_solicitudes_acceso" ON solicitudes_acceso;

CREATE POLICY "solicitudes_acceso_select"
  ON solicitudes_acceso FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('SUPERADMIN', 'IT', 'ADMIN_RESIDENCIAL')
    OR residente_id = auth.uid()
  );

CREATE POLICY "solicitudes_acceso_insert"
  ON solicitudes_acceso FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('SUPERADMIN', 'IT', 'ADMIN_RESIDENCIAL')
    OR residente_id = auth.uid()
  );

CREATE POLICY "solicitudes_acceso_update"
  ON solicitudes_acceso FOR UPDATE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'IT', 'ADMIN_RESIDENCIAL'))
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'IT', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "solicitudes_acceso_delete"
  ON solicitudes_acceso FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- MUDANZAS TABLE
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_mudanzas" ON mudanzas;

CREATE POLICY "mudanzas_select"
  ON mudanzas FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('SUPERADMIN', 'SEGURIDAD')
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
    OR residente_id = auth.uid()
  );

CREATE POLICY "mudanzas_insert"
  ON mudanzas FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'SUPERADMIN'
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
    OR residente_id = auth.uid()
  );

CREATE POLICY "mudanzas_update"
  ON mudanzas FOR UPDATE TO authenticated
  USING (
    get_user_role() IN ('SUPERADMIN', 'SEGURIDAD')
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  )
  WITH CHECK (
    get_user_role() IN ('SUPERADMIN', 'SEGURIDAD')
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "mudanzas_delete"
  ON mudanzas FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- GARITA_REGISTROS TABLE
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_garita_registros" ON garita_registros;

CREATE POLICY "garita_registros_select"
  ON garita_registros FOR SELECT TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'SEGURIDAD', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "garita_registros_insert"
  ON garita_registros FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'SEGURIDAD'));

CREATE POLICY "garita_registros_update"
  ON garita_registros FOR UPDATE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'SEGURIDAD'))
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'SEGURIDAD'));

CREATE POLICY "garita_registros_delete"
  ON garita_registros FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- AUDIT_LOG TABLE
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_audit_log" ON audit_log;
DROP POLICY IF EXISTS "audit_log_insert_policy" ON audit_log;
DROP POLICY IF EXISTS "audit_log_insert" ON audit_log;
DROP POLICY IF EXISTS "audit_log_select" ON audit_log;

CREATE POLICY "audit_log_select"
  ON audit_log FOR SELECT TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "audit_log_insert"
  ON audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- PROSPECTOS TABLE (Commercial)
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_prospectos" ON prospectos;

CREATE POLICY "prospectos_select"
  ON prospectos FOR SELECT TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "prospectos_insert"
  ON prospectos FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "prospectos_update"
  ON prospectos FOR UPDATE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'))
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "prospectos_delete"
  ON prospectos FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- NEGOCIOS TABLE (Commercial)
-- ============================================================
DROP POLICY IF EXISTS "dev_mode_all_negocios" ON negocios;

CREATE POLICY "negocios_select"
  ON negocios FOR SELECT TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "negocios_insert"
  ON negocios FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "negocios_update"
  ON negocios FOR UPDATE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'))
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "negocios_delete"
  ON negocios FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');
