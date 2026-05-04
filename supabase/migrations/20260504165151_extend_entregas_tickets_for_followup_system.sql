/*
  # Extend entregas_tickets + comentarios + configuracion

  ## Summary
  Transforms the orphan `entregas_tickets` table into a full follow-up system:
  - Adds assignment (responsable + equipo), commitment date, resolution date,
    description, history, human-readable ticket number.
  - Creates a new `entregas_ticket_comentarios` table for the activity timeline.
  - Creates a singleton `configuracion_entregas` table where admins can manage
    the list of assignable teams and SLA (days) per priority.

  ## Changes

  ### 1. entregas_tickets — new columns
  - numero_ticket (text, unique): human-readable identifier like TKT-2026-0001
  - responsable_id (uuid, nullable): FK to profiles for system users
  - responsable_nombre (text): human name (works for both system users and free text)
  - equipo_asignado (text): team handling the ticket
  - fecha_compromiso (date): committed resolution date
  - fecha_resolucion (timestamptz): actual resolution date
  - descripcion (text): internal description
  - historial (jsonb): array of {tipo, timestamp, user, from, to, notas}

  ### 2. entregas_ticket_comentarios (new table)
  - ticket_id, autor_id, autor_nombre, contenido, tipo, created_at

  ### 3. configuracion_entregas (singleton, one row)
  - equipos (jsonb array of strings)
  - sla_por_prioridad (jsonb: { high, medium, low } in days)

  ## Security
  RLS enabled on all new tables. Authenticated users can read/write.
*/

-- 1. Extend entregas_tickets
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entregas_tickets' AND column_name='numero_ticket') THEN
    ALTER TABLE entregas_tickets ADD COLUMN numero_ticket text UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entregas_tickets' AND column_name='responsable_id') THEN
    ALTER TABLE entregas_tickets ADD COLUMN responsable_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entregas_tickets' AND column_name='responsable_nombre') THEN
    ALTER TABLE entregas_tickets ADD COLUMN responsable_nombre text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entregas_tickets' AND column_name='equipo_asignado') THEN
    ALTER TABLE entregas_tickets ADD COLUMN equipo_asignado text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entregas_tickets' AND column_name='fecha_compromiso') THEN
    ALTER TABLE entregas_tickets ADD COLUMN fecha_compromiso date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entregas_tickets' AND column_name='fecha_resolucion') THEN
    ALTER TABLE entregas_tickets ADD COLUMN fecha_resolucion timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entregas_tickets' AND column_name='descripcion') THEN
    ALTER TABLE entregas_tickets ADD COLUMN descripcion text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entregas_tickets' AND column_name='historial') THEN
    ALTER TABLE entregas_tickets ADD COLUMN historial jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_entregas_tickets_responsable ON entregas_tickets(responsable_id);
CREATE INDEX IF NOT EXISTS idx_entregas_tickets_fecha_compromiso ON entregas_tickets(fecha_compromiso);

-- 2. entregas_ticket_comentarios
CREATE TABLE IF NOT EXISTS entregas_ticket_comentarios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     uuid NOT NULL REFERENCES entregas_tickets(id) ON DELETE CASCADE,
  autor_id      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  autor_nombre  text NOT NULL DEFAULT '',
  contenido     text NOT NULL,
  tipo          text NOT NULL DEFAULT 'comentario',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entregas_ticket_comentarios_ticket ON entregas_ticket_comentarios(ticket_id);

ALTER TABLE entregas_ticket_comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select entregas_ticket_comentarios"
  ON entregas_ticket_comentarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert entregas_ticket_comentarios"
  ON entregas_ticket_comentarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update entregas_ticket_comentarios"
  ON entregas_ticket_comentarios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. configuracion_entregas (singleton)
CREATE TABLE IF NOT EXISTS configuracion_entregas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipos             jsonb NOT NULL DEFAULT '["Mantenimiento","Construccion","Acabados","Electrico","Plomeria","Jardineria"]'::jsonb,
  sla_por_prioridad   jsonb NOT NULL DEFAULT '{"high":3,"medium":7,"low":14}'::jsonb,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE configuracion_entregas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select configuracion_entregas"
  ON configuracion_entregas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert configuracion_entregas"
  ON configuracion_entregas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update configuracion_entregas"
  ON configuracion_entregas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed the singleton row (only if table is empty)
INSERT INTO configuracion_entregas (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM configuracion_entregas);
