/*
  # Fix RLS Policies - auth.uid() Performance Optimization

  1. Problem
    - Multiple RLS policies call `auth.uid()` directly, which re-evaluates per row
    - Wrapping in `(select auth.uid())` evaluates once per query, significantly improving performance

  2. Affected Tables and Policies
    - profiles: profiles_self_access, profiles_select, profiles_insert, profiles_update
    - pagos: pagos_select
    - visitas: visitas_select
    - estados_cuenta: estados_cuenta_select
    - reservas: reservas_select, reservas_insert, reservas_update
    - amonestaciones: amonestaciones_select
    - accesos: accesos_select
    - solicitudes_acceso: solicitudes_acceso_select, solicitudes_acceso_insert
    - mudanzas: mudanzas_select, mudanzas_insert
    - audit_log: audit_log_insert
    - encuestas: encuestas_select
    - entregas: entregas_select
    - garantias: garantias_select, garantias_insert

  3. Security
    - No change in access control logic, only performance optimization
    - All policies retain same authorization rules
*/

-- profiles_self_access
DROP POLICY IF EXISTS "profiles_self_access" ON public.profiles;
CREATE POLICY "profiles_self_access"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

-- profiles_select
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    (get_user_role() = 'SUPERADMIN')
    OR (id = (select auth.uid()))
    OR ((get_user_role() = 'ADMIN_RESIDENCIAL') AND (residencial_id = get_user_residencial_id()))
  );

-- profiles_insert
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- profiles_update
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((get_user_role() = 'SUPERADMIN') OR (id = (select auth.uid())))
  WITH CHECK ((get_user_role() = 'SUPERADMIN') OR (id = (select auth.uid())));

-- pagos_select
DROP POLICY IF EXISTS "pagos_select" ON public.pagos;
CREATE POLICY "pagos_select"
  ON public.pagos FOR SELECT
  TO authenticated
  USING (
    (get_user_role() = 'SUPERADMIN')
    OR ((get_user_role() = 'ADMIN_RESIDENCIAL') AND (residencial_id = get_user_residencial_id()))
    OR ((get_user_role() = 'RESIDENTE') AND (residente_id = (select auth.uid())))
  );

-- visitas_select
DROP POLICY IF EXISTS "visitas_select" ON public.visitas;
CREATE POLICY "visitas_select"
  ON public.visitas FOR SELECT
  TO authenticated
  USING (
    (get_user_role() = ANY (ARRAY['SUPERADMIN', 'SEGURIDAD']))
    OR ((get_user_role() = 'ADMIN_RESIDENCIAL') AND (residencial_id = get_user_residencial_id()))
    OR (residente_id = (select auth.uid()))
  );

-- estados_cuenta_select
DROP POLICY IF EXISTS "estados_cuenta_select" ON public.estados_cuenta;
CREATE POLICY "estados_cuenta_select"
  ON public.estados_cuenta FOR SELECT
  TO authenticated
  USING (
    (get_user_role() = 'SUPERADMIN')
    OR ((get_user_role() = 'ADMIN_RESIDENCIAL') AND (residencial_id = get_user_residencial_id()))
    OR ((get_user_role() = 'RESIDENTE') AND (residente_id = (select auth.uid())))
  );

-- reservas_select
DROP POLICY IF EXISTS "reservas_select" ON public.reservas;
CREATE POLICY "reservas_select"
  ON public.reservas FOR SELECT
  TO authenticated
  USING (
    (get_user_role() = 'SUPERADMIN')
    OR (get_user_role() = 'ADMIN_RESIDENCIAL')
    OR (residente_id = (select auth.uid()))
  );

-- reservas_insert
DROP POLICY IF EXISTS "reservas_insert" ON public.reservas;
CREATE POLICY "reservas_insert"
  ON public.reservas FOR INSERT
  TO authenticated
  WITH CHECK (
    (get_user_role() = 'SUPERADMIN')
    OR (get_user_role() = 'ADMIN_RESIDENCIAL')
    OR (residente_id = (select auth.uid()))
  );

-- reservas_update
DROP POLICY IF EXISTS "reservas_update" ON public.reservas;
CREATE POLICY "reservas_update"
  ON public.reservas FOR UPDATE
  TO authenticated
  USING (
    (get_user_role() = 'SUPERADMIN')
    OR (get_user_role() = 'ADMIN_RESIDENCIAL')
    OR (residente_id = (select auth.uid()))
  )
  WITH CHECK (
    (get_user_role() = 'SUPERADMIN')
    OR (get_user_role() = 'ADMIN_RESIDENCIAL')
    OR (residente_id = (select auth.uid()))
  );

-- amonestaciones_select
DROP POLICY IF EXISTS "amonestaciones_select" ON public.amonestaciones;
CREATE POLICY "amonestaciones_select"
  ON public.amonestaciones FOR SELECT
  TO authenticated
  USING (
    (get_user_role() = 'SUPERADMIN')
    OR ((get_user_role() = 'ADMIN_RESIDENCIAL') AND (residencial_id = get_user_residencial_id()))
    OR (receptor_id = (select auth.uid()))
  );

-- accesos_select
DROP POLICY IF EXISTS "accesos_select" ON public.accesos;
CREATE POLICY "accesos_select"
  ON public.accesos FOR SELECT
  TO authenticated
  USING (
    (get_user_role() = ANY (ARRAY['SUPERADMIN', 'IT', 'SEGURIDAD', 'ADMIN_RESIDENCIAL']))
    OR (residente_id = (select auth.uid()))
  );

-- solicitudes_acceso_select
DROP POLICY IF EXISTS "solicitudes_acceso_select" ON public.solicitudes_acceso;
CREATE POLICY "solicitudes_acceso_select"
  ON public.solicitudes_acceso FOR SELECT
  TO authenticated
  USING (
    (get_user_role() = ANY (ARRAY['SUPERADMIN', 'IT', 'ADMIN_RESIDENCIAL']))
    OR (residente_id = (select auth.uid()))
  );

-- solicitudes_acceso_insert
DROP POLICY IF EXISTS "solicitudes_acceso_insert" ON public.solicitudes_acceso;
CREATE POLICY "solicitudes_acceso_insert"
  ON public.solicitudes_acceso FOR INSERT
  TO authenticated
  WITH CHECK (
    (get_user_role() = ANY (ARRAY['SUPERADMIN', 'IT', 'ADMIN_RESIDENCIAL']))
    OR (residente_id = (select auth.uid()))
  );

-- mudanzas_select
DROP POLICY IF EXISTS "mudanzas_select" ON public.mudanzas;
CREATE POLICY "mudanzas_select"
  ON public.mudanzas FOR SELECT
  TO authenticated
  USING (
    (get_user_role() = ANY (ARRAY['SUPERADMIN', 'SEGURIDAD']))
    OR ((get_user_role() = 'ADMIN_RESIDENCIAL') AND (residencial_id = get_user_residencial_id()))
    OR (residente_id = (select auth.uid()))
  );

-- mudanzas_insert
DROP POLICY IF EXISTS "mudanzas_insert" ON public.mudanzas;
CREATE POLICY "mudanzas_insert"
  ON public.mudanzas FOR INSERT
  TO authenticated
  WITH CHECK (
    (get_user_role() = 'SUPERADMIN')
    OR ((get_user_role() = 'ADMIN_RESIDENCIAL') AND (residencial_id = get_user_residencial_id()))
    OR (residente_id = (select auth.uid()))
  );

-- audit_log_insert
DROP POLICY IF EXISTS "audit_log_insert" ON public.audit_log;
CREATE POLICY "audit_log_insert"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- encuestas_select
DROP POLICY IF EXISTS "encuestas_select" ON public.encuestas;
CREATE POLICY "encuestas_select"
  ON public.encuestas FOR SELECT
  TO authenticated
  USING (
    (get_user_role() = ANY (ARRAY['SUPERADMIN', 'ADMIN_RESIDENCIAL']))
    OR (residente_id = (select auth.uid()))
  );

-- entregas_select
DROP POLICY IF EXISTS "entregas_select" ON public.entregas;
CREATE POLICY "entregas_select"
  ON public.entregas FOR SELECT
  TO authenticated
  USING (
    (get_user_role() = ANY (ARRAY['SUPERADMIN', 'ADMIN_RESIDENCIAL']))
    OR (residente_id = (select auth.uid()))
  );

-- garantias_select
DROP POLICY IF EXISTS "garantias_select" ON public.garantias;
CREATE POLICY "garantias_select"
  ON public.garantias FOR SELECT
  TO authenticated
  USING (
    (get_user_role() = ANY (ARRAY['SUPERADMIN', 'ADMIN_RESIDENCIAL']))
    OR (residente_id = (select auth.uid()))
  );

-- garantias_insert
DROP POLICY IF EXISTS "garantias_insert" ON public.garantias;
CREATE POLICY "garantias_insert"
  ON public.garantias FOR INSERT
  TO authenticated
  WITH CHECK (
    (get_user_role() = ANY (ARRAY['SUPERADMIN', 'ADMIN_RESIDENCIAL']))
    OR (residente_id = (select auth.uid()))
  );
