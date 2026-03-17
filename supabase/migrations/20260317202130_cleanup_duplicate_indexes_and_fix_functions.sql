/*
  # Cleanup Duplicate Indexes, Fix Overlapping Policy, Fix Function Search Paths

  1. Duplicate Indexes Removed
    - accesos: drop idx_accesos_residente (duplicate of idx_accesos_residente_id)
    - amonestaciones: drop idx_amonestaciones_receptor, idx_amonestaciones_residencial (duplicates)
    - audit_log: drop idx_audit_log_created, idx_audit_log_user (duplicates)
    - estados_cuenta: drop idx_estados_cuenta_residencial, idx_estados_cuenta_residente (duplicates)
    - mudanzas: drop idx_mudanzas_residencial, idx_mudanzas_residente (duplicates)
    - pagos: drop idx_pagos_residencial, idx_pagos_residente (duplicates)
    - profiles: drop idx_profiles_residencial (dup of idx_profiles_residencial_id), drop idx_profiles_id (dup of profiles_pkey)
    - reservas: drop idx_reservas_espacio, idx_reservas_residente (duplicates)
    - residenciales: drop idx_residenciales_codigo (dup of residenciales_codigo_key)

  2. Overlapping Policy Fix
    - profiles: drop profiles_self_access (redundant with profiles_select which already includes id = auth.uid())

  3. Function Search Path Fix
    - handle_updated_at: set search_path to '' (immutable)
    - update_updated_at_column: set search_path to '' (immutable)

  4. Notes
    - Only dropping the duplicate index from each pair, keeping the original
    - No data is affected
*/

-- Drop duplicate indexes (keeping the *_id variants and unique constraints)
DROP INDEX IF EXISTS public.idx_accesos_residente;
DROP INDEX IF EXISTS public.idx_amonestaciones_receptor;
DROP INDEX IF EXISTS public.idx_amonestaciones_residencial;
DROP INDEX IF EXISTS public.idx_audit_log_created;
DROP INDEX IF EXISTS public.idx_audit_log_user;
DROP INDEX IF EXISTS public.idx_estados_cuenta_residencial;
DROP INDEX IF EXISTS public.idx_estados_cuenta_residente;
DROP INDEX IF EXISTS public.idx_mudanzas_residencial;
DROP INDEX IF EXISTS public.idx_mudanzas_residente;
DROP INDEX IF EXISTS public.idx_pagos_residencial;
DROP INDEX IF EXISTS public.idx_pagos_residente;
DROP INDEX IF EXISTS public.idx_profiles_residencial;
DROP INDEX IF EXISTS public.idx_profiles_id;
DROP INDEX IF EXISTS public.idx_reservas_espacio;
DROP INDEX IF EXISTS public.idx_reservas_residente;
DROP INDEX IF EXISTS public.idx_residenciales_codigo;

-- Remove overlapping permissive SELECT policy on profiles
-- profiles_select already covers id = auth.uid(), so profiles_self_access is redundant
DROP POLICY IF EXISTS "profiles_self_access" ON public.profiles;

-- Fix mutable search_path on trigger functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
