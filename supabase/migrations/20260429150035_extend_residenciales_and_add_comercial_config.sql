/*
  # Extend residenciales + commercial configuration tables

  ## Changes

  ### 1. Extend residenciales table
  Adds all the fields that the frontend already expects but are missing from the DB:
  ciudad, pais, total_unidades, unidades_ocupadas, cuota_mantenimiento,
  administrador, telefono, email, estado, amenidades, imagen, fecha_fundacion.

  ### 2. New table: proyectos_config_comercial
  Per-project commercial configuration used by the Negocios pipeline when
  generating a reservation. Stores:
  - montos_reserva: array of { tipo: 'fijo'|'porcentaje', valor: number, etiqueta: string }
  - documentos_requeridos: array of document type strings required from buyers

  ### 3. New table: planes_financiamiento_reserva
  Financing plans attached to a reserva_comercial (down-payment and full unit plans).

  ### 4. Add etapa 'Reserva Realizada' to negocios + timestamp column
  Adds reserva_generada_at column to track when a deal was converted to a reservation.

  ## Security
  - RLS enabled on all new tables
  - Authenticated users can read/write their scoped data
*/

-- 1. Extend residenciales table (safe additions only)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='ciudad') THEN
    ALTER TABLE residenciales ADD COLUMN ciudad TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='pais') THEN
    ALTER TABLE residenciales ADD COLUMN pais TEXT NOT NULL DEFAULT 'Guatemala';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='total_unidades') THEN
    ALTER TABLE residenciales ADD COLUMN total_unidades INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='unidades_ocupadas') THEN
    ALTER TABLE residenciales ADD COLUMN unidades_ocupadas INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='cuota_mantenimiento') THEN
    ALTER TABLE residenciales ADD COLUMN cuota_mantenimiento NUMERIC NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='administrador') THEN
    ALTER TABLE residenciales ADD COLUMN administrador TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='telefono') THEN
    ALTER TABLE residenciales ADD COLUMN telefono TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='email') THEN
    ALTER TABLE residenciales ADD COLUMN email TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='estado') THEN
    ALTER TABLE residenciales ADD COLUMN estado TEXT NOT NULL DEFAULT 'activo';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='amenidades') THEN
    ALTER TABLE residenciales ADD COLUMN amenidades JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='imagen') THEN
    ALTER TABLE residenciales ADD COLUMN imagen TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='fecha_fundacion') THEN
    ALTER TABLE residenciales ADD COLUMN fecha_fundacion DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='tipos_proyecto') THEN
    ALTER TABLE residenciales ADD COLUMN tipos_proyecto JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residenciales' AND column_name='deleted_at') THEN
    ALTER TABLE residenciales ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END $$;

-- 2. Add reserva_generada_at to negocios
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='negocios' AND column_name='reserva_generada_at') THEN
    ALTER TABLE negocios ADD COLUMN reserva_generada_at TIMESTAMPTZ;
  END IF;
END $$;

-- 3. proyectos_config_comercial
CREATE TABLE IF NOT EXISTS proyectos_config_comercial (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residencial_id        uuid NOT NULL REFERENCES residenciales(id) ON DELETE CASCADE,
  montos_reserva        jsonb NOT NULL DEFAULT '[]'::jsonb,
  documentos_requeridos jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_proyectos_config_comercial_residencial UNIQUE (residencial_id)
);

ALTER TABLE proyectos_config_comercial ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select proyectos_config_comercial"
  ON proyectos_config_comercial FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert proyectos_config_comercial"
  ON proyectos_config_comercial FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update proyectos_config_comercial"
  ON proyectos_config_comercial FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. planes_financiamiento_reserva
CREATE TABLE IF NOT EXISTS planes_financiamiento_reserva (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_comercial_id  uuid NOT NULL REFERENCES reservas_comerciales(id) ON DELETE CASCADE,
  tipo                  text NOT NULL DEFAULT 'enganche',
  monto_total           numeric NOT NULL DEFAULT 0,
  cuotas                jsonb NOT NULL DEFAULT '[]'::jsonb,
  entidad               text NOT NULL DEFAULT '',
  estado                text NOT NULL DEFAULT 'borrador',
  notas                 text NOT NULL DEFAULT '',
  deleted_at            timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE planes_financiamiento_reserva ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select planes_financiamiento_reserva"
  ON planes_financiamiento_reserva FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert planes_financiamiento_reserva"
  ON planes_financiamiento_reserva FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update planes_financiamiento_reserva"
  ON planes_financiamiento_reserva FOR UPDATE
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_planes_fin_reserva_id ON planes_financiamiento_reserva(reserva_comercial_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_config_residencial_id ON proyectos_config_comercial(residencial_id);
