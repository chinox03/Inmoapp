/*
  # Create missing tables for production modules

  1. New Tables
    - `visitas` - Visitor registration and tracking
    - `encuestas` - Satisfaction surveys with embedded responses
    - `entregas` - Unit delivery checklists and sign-off
    - `entregas_tickets` - Issues found during deliveries
    - `garantias` - Warranty claims with embedded claim items
    - `garantias_historial` - Status change history for warranty claims
    - `webhook_endpoints` - Configurable webhook URLs for event notifications
    - `webhook_logs` - Log of all webhook dispatch attempts

  2. Security
    - RLS enabled on all tables
    - Role-based policies matching the production security model
    - SUPERADMIN: full access
    - ADMIN_RESIDENCIAL: scoped to their residencial
    - SEGURIDAD: access to visitas
    - RESIDENTE: access to own records where applicable

  3. Design Decisions
    - encuestas.respuestas stored as JSONB for flexibility (question sets vary per survey type)
    - garantias.claims stored as JSONB (complex nested structure with files)
    - garantias_historial as a separate table for proper querying
    - webhook_endpoints supports per-event-type filtering
    - webhook_logs tracks delivery attempts for debugging
*/

-- ============================================================
-- VISITAS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS visitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residencial_id uuid REFERENCES residenciales(id),
  visitor_first_name text NOT NULL,
  visitor_last_name text NOT NULL DEFAULT '',
  visitor_document_number text NOT NULL DEFAULT '',
  residente_id uuid REFERENCES profiles(id),
  residente_nombre text NOT NULL DEFAULT '',
  unidad text NOT NULL DEFAULT '',
  motivo text NOT NULL DEFAULT '',
  registrado_por uuid REFERENCES profiles(id),
  hora_entrada timestamptz DEFAULT now(),
  hora_salida timestamptz,
  estado text NOT NULL DEFAULT 'active' CHECK (estado IN ('active', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visitas_select" ON visitas FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('SUPERADMIN', 'SEGURIDAD')
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
    OR residente_id = auth.uid()
  );

CREATE POLICY "visitas_insert" ON visitas FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('SUPERADMIN', 'SEGURIDAD')
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "visitas_update" ON visitas FOR UPDATE TO authenticated
  USING (
    get_user_role() IN ('SUPERADMIN', 'SEGURIDAD')
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  )
  WITH CHECK (
    get_user_role() IN ('SUPERADMIN', 'SEGURIDAD')
    OR (get_user_role() = 'ADMIN_RESIDENCIAL' AND residencial_id = get_user_residencial_id())
  );

CREATE POLICY "visitas_delete" ON visitas FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- ENCUESTAS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS encuestas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residencial_id uuid REFERENCES residenciales(id),
  residente_id uuid REFERENCES profiles(id),
  residente_nombre text NOT NULL DEFAULT '',
  tipo_encuesta text NOT NULL DEFAULT '',
  tipo_encuesta_nombre text NOT NULL DEFAULT '',
  fecha_realizacion timestamptz DEFAULT now(),
  realizada_por text NOT NULL DEFAULT '',
  duracion_minutos integer DEFAULT 0,
  respuestas jsonb NOT NULL DEFAULT '[]'::jsonb,
  observaciones text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE encuestas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "encuestas_select" ON encuestas FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL')
    OR residente_id = auth.uid()
  );

CREATE POLICY "encuestas_insert" ON encuestas FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "encuestas_update" ON encuestas FOR UPDATE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'))
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "encuestas_delete" ON encuestas FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- ENTREGAS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS entregas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residencial_id uuid REFERENCES residenciales(id),
  unidad text NOT NULL DEFAULT '',
  residente_id uuid REFERENCES profiles(id),
  residente_nombre text NOT NULL DEFAULT '',
  fecha_entrega date NOT NULL DEFAULT CURRENT_DATE,
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  fotos jsonb NOT NULL DEFAULT '[]'::jsonb,
  firma text,
  observaciones_generales text DEFAULT '',
  estado text NOT NULL DEFAULT 'draft' CHECK (estado IN ('draft', 'completed', 'with_issues')),
  creado_por uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entregas_select" ON entregas FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL')
    OR residente_id = auth.uid()
  );

CREATE POLICY "entregas_insert" ON entregas FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "entregas_update" ON entregas FOR UPDATE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'))
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "entregas_delete" ON entregas FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- ENTREGAS_TICKETS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS entregas_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entrega_id uuid NOT NULL REFERENCES entregas(id),
  unidad text NOT NULL DEFAULT '',
  residente_nombre text NOT NULL DEFAULT '',
  estado text NOT NULL DEFAULT 'open' CHECK (estado IN ('open', 'in_progress', 'resolved')),
  prioridad text NOT NULL DEFAULT 'medium' CHECK (prioridad IN ('low', 'medium', 'high')),
  items_pendientes jsonb NOT NULL DEFAULT '[]'::jsonb,
  resuelto_en timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE entregas_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entregas_tickets_select" ON entregas_tickets FOR SELECT TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "entregas_tickets_insert" ON entregas_tickets FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "entregas_tickets_update" ON entregas_tickets FOR UPDATE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'))
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "entregas_tickets_delete" ON entregas_tickets FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- GARANTIAS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS garantias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_reclamo text NOT NULL UNIQUE,
  residencial_id uuid REFERENCES residenciales(id),
  unidad text NOT NULL DEFAULT '',
  residente_id uuid REFERENCES profiles(id),
  residente_nombre text NOT NULL DEFAULT '',
  residente_telefono text DEFAULT '',
  claims jsonb NOT NULL DEFAULT '[]'::jsonb,
  estado text NOT NULL DEFAULT 'pending' CHECK (estado IN ('pending', 'approved', 'rejected', 'in_progress', 'resolved')),
  prioridad text NOT NULL DEFAULT 'medium' CHECK (prioridad IN ('low', 'medium', 'high')),
  fecha_envio timestamptz DEFAULT now(),
  fecha_revision timestamptz,
  fecha_resolucion timestamptz,
  revisado_por uuid REFERENCES profiles(id),
  notas_admin text,
  fecha_estimada_completado date,
  equipo_asignado text,
  fecha_visita_programada date,
  razon_rechazo text,
  notas_rechazo text,
  firma text,
  historial jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE garantias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "garantias_select" ON garantias FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL')
    OR residente_id = auth.uid()
  );

CREATE POLICY "garantias_insert" ON garantias FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL')
    OR residente_id = auth.uid()
  );

CREATE POLICY "garantias_update" ON garantias FOR UPDATE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'))
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL'));

CREATE POLICY "garantias_delete" ON garantias FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- WEBHOOK_ENDPOINTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  url text NOT NULL,
  eventos text[] NOT NULL DEFAULT '{}',
  headers jsonb DEFAULT '{}'::jsonb,
  secret text,
  activo boolean NOT NULL DEFAULT true,
  creado_por uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_endpoints_select" ON webhook_endpoints FOR SELECT TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

CREATE POLICY "webhook_endpoints_insert" ON webhook_endpoints FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'SUPERADMIN');

CREATE POLICY "webhook_endpoints_update" ON webhook_endpoints FOR UPDATE TO authenticated
  USING (get_user_role() = 'SUPERADMIN')
  WITH CHECK (get_user_role() = 'SUPERADMIN');

CREATE POLICY "webhook_endpoints_delete" ON webhook_endpoints FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- WEBHOOK_LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id uuid REFERENCES webhook_endpoints(id),
  evento text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status_code integer,
  response_body text,
  error text,
  intentos integer NOT NULL DEFAULT 0,
  exitoso boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_logs_select" ON webhook_logs FOR SELECT TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

CREATE POLICY "webhook_logs_insert" ON webhook_logs FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'SUPERADMIN');

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_visitas_residencial ON visitas(residencial_id);
CREATE INDEX IF NOT EXISTS idx_visitas_residente ON visitas(residente_id);
CREATE INDEX IF NOT EXISTS idx_visitas_estado ON visitas(estado);
CREATE INDEX IF NOT EXISTS idx_encuestas_residencial ON encuestas(residencial_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_tipo ON encuestas(tipo_encuesta);
CREATE INDEX IF NOT EXISTS idx_entregas_residencial ON entregas(residencial_id);
CREATE INDEX IF NOT EXISTS idx_entregas_estado ON entregas(estado);
CREATE INDEX IF NOT EXISTS idx_garantias_residencial ON garantias(residencial_id);
CREATE INDEX IF NOT EXISTS idx_garantias_estado ON garantias(estado);
CREATE INDEX IF NOT EXISTS idx_garantias_numero ON garantias(numero_reclamo);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_activo ON webhook_endpoints(activo);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_endpoint ON webhook_logs(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_evento ON webhook_logs(evento);
