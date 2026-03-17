/*
  # Add updated_at triggers and performance indexes

  1. Changes
    - Create a reusable trigger function for auto-updating `updated_at`
    - Add updated_at triggers to prospectos, negocios, visitas, encuestas, entregas, entregas_tickets, garantias, webhook_endpoints
    - Add performance indexes on frequently queried columns across all tables

  2. Performance
    - Indexes on estado/status columns for filtering
    - Indexes on foreign key columns for joins
    - Indexes on date columns for sorting
*/

-- ============================================================
-- REUSABLE TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'prospectos', 'negocios', 'visitas', 'encuestas',
    'entregas', 'entregas_tickets', 'garantias', 'webhook_endpoints',
    'profiles', 'residenciales', 'residencias', 'pagos',
    'estados_cuenta', 'espacios', 'reservas', 'amonestaciones',
    'accesos', 'solicitudes_acceso', 'mudanzas'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION handle_updated_at();',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================
-- PERFORMANCE INDEXES (existing tables)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_prospectos_estado ON prospectos(estado);
CREATE INDEX IF NOT EXISTS idx_prospectos_created ON prospectos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospectos_origen ON prospectos(origen);

CREATE INDEX IF NOT EXISTS idx_negocios_etapa ON negocios(etapa);
CREATE INDEX IF NOT EXISTS idx_negocios_prospecto ON negocios(prospecto_id);
CREATE INDEX IF NOT EXISTS idx_negocios_created ON negocios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_negocios_proyecto ON negocios(proyecto);

CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_residente ON pagos(residente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_residencial ON pagos(residencial_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);

CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON reservas(fecha_reserva);
CREATE INDEX IF NOT EXISTS idx_reservas_residente ON reservas(residente_id);
CREATE INDEX IF NOT EXISTS idx_reservas_espacio ON reservas(espacio_id);

CREATE INDEX IF NOT EXISTS idx_amonestaciones_estado ON amonestaciones(estado);
CREATE INDEX IF NOT EXISTS idx_amonestaciones_residencial ON amonestaciones(residencial_id);
CREATE INDEX IF NOT EXISTS idx_amonestaciones_receptor ON amonestaciones(receptor_id);

CREATE INDEX IF NOT EXISTS idx_accesos_residente ON accesos(residente_id);
CREATE INDEX IF NOT EXISTS idx_accesos_estado ON accesos(estado);

CREATE INDEX IF NOT EXISTS idx_mudanzas_estado ON mudanzas(estado);
CREATE INDEX IF NOT EXISTS idx_mudanzas_residencial ON mudanzas(residencial_id);
CREATE INDEX IF NOT EXISTS idx_mudanzas_residente ON mudanzas(residente_id);

CREATE INDEX IF NOT EXISTS idx_estados_cuenta_residente ON estados_cuenta(residente_id);
CREATE INDEX IF NOT EXISTS idx_estados_cuenta_residencial ON estados_cuenta(residencial_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_entidad ON audit_log(entidad);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_rol ON profiles(rol);
CREATE INDEX IF NOT EXISTS idx_profiles_residencial ON profiles(residencial_id);
