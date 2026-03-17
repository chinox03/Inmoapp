/*
  # Add soft delete support to all tables

  1. Changes
    - Add `deleted_at` (timestamptz, nullable) column to all major tables
    - When `deleted_at` is NOT NULL, the record is considered "soft deleted"
    - Records can be recovered by setting `deleted_at` back to NULL

  2. Tables modified
    - prospectos
    - negocios
    - reservas
    - accesos
    - mudanzas
    - amonestaciones
    - pagos
    - visitas
    - encuestas
    - entregas
    - entregas_tickets
    - garantias
    - espacios
    - residenciales
    - estados_cuenta

  3. Notes
    - No data is destroyed; this only adds a new nullable column
    - Existing queries should filter by `deleted_at IS NULL` to exclude soft-deleted records
    - Indexes added on `deleted_at` for performance on filtered queries
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prospectos' AND column_name = 'deleted_at') THEN
    ALTER TABLE prospectos ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'negocios' AND column_name = 'deleted_at') THEN
    ALTER TABLE negocios ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservas' AND column_name = 'deleted_at') THEN
    ALTER TABLE reservas ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accesos' AND column_name = 'deleted_at') THEN
    ALTER TABLE accesos ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mudanzas' AND column_name = 'deleted_at') THEN
    ALTER TABLE mudanzas ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'amonestaciones' AND column_name = 'deleted_at') THEN
    ALTER TABLE amonestaciones ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagos' AND column_name = 'deleted_at') THEN
    ALTER TABLE pagos ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visitas' AND column_name = 'deleted_at') THEN
    ALTER TABLE visitas ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'encuestas' AND column_name = 'deleted_at') THEN
    ALTER TABLE encuestas ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entregas' AND column_name = 'deleted_at') THEN
    ALTER TABLE entregas ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entregas_tickets' AND column_name = 'deleted_at') THEN
    ALTER TABLE entregas_tickets ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garantias' AND column_name = 'deleted_at') THEN
    ALTER TABLE garantias ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'espacios' AND column_name = 'deleted_at') THEN
    ALTER TABLE espacios ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residenciales' AND column_name = 'deleted_at') THEN
    ALTER TABLE residenciales ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estados_cuenta' AND column_name = 'deleted_at') THEN
    ALTER TABLE estados_cuenta ADD COLUMN deleted_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_prospectos_deleted_at ON prospectos(deleted_at);
CREATE INDEX IF NOT EXISTS idx_negocios_deleted_at ON negocios(deleted_at);
CREATE INDEX IF NOT EXISTS idx_reservas_deleted_at ON reservas(deleted_at);
CREATE INDEX IF NOT EXISTS idx_accesos_deleted_at ON accesos(deleted_at);
CREATE INDEX IF NOT EXISTS idx_mudanzas_deleted_at ON mudanzas(deleted_at);
CREATE INDEX IF NOT EXISTS idx_amonestaciones_deleted_at ON amonestaciones(deleted_at);
CREATE INDEX IF NOT EXISTS idx_pagos_deleted_at ON pagos(deleted_at);
CREATE INDEX IF NOT EXISTS idx_visitas_deleted_at ON visitas(deleted_at);
CREATE INDEX IF NOT EXISTS idx_encuestas_deleted_at ON encuestas(deleted_at);
CREATE INDEX IF NOT EXISTS idx_entregas_deleted_at ON entregas(deleted_at);
CREATE INDEX IF NOT EXISTS idx_entregas_tickets_deleted_at ON entregas_tickets(deleted_at);
CREATE INDEX IF NOT EXISTS idx_garantias_deleted_at ON garantias(deleted_at);
CREATE INDEX IF NOT EXISTS idx_espacios_deleted_at ON espacios(deleted_at);
CREATE INDEX IF NOT EXISTS idx_residenciales_deleted_at ON residenciales(deleted_at);
CREATE INDEX IF NOT EXISTS idx_estados_cuenta_deleted_at ON estados_cuenta(deleted_at);
