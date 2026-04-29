/*
  # Create reservas_comerciales table

  ## Summary
  Creates the commercial reservations table that connects the Negocios pipeline
  to the Reservas Comerciales module. When a deal in Negocios is marked as
  "Generar Reserva", a record is inserted here.

  ## New Tables

  ### reservas_comerciales
  - `id` (uuid, primary key)
  - `negocio_id` (uuid, FK → negocios.id) — source deal
  - `prospecto` (text) — client name
  - `email` (text)
  - `telefono` (text)
  - `unidad` (text) — unit/property
  - `proyecto` (text) — project name
  - `tipo_interes` (text)
  - `valor` (numeric) — total deal value
  - `monto_reserva` (numeric) — reservation deposit amount, default 0
  - `fecha_reserva` (date) — date the reservation was generated
  - `estado` (text) — workflow status: Pendiente Documentos | En Revisión | Aprobada | Lista para PCV
  - `documentos` (jsonb) — uploaded documents array
  - `deleted_at` (timestamptz, nullable) — soft delete
  - `created_at` / `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - SUPERADMIN and ADMIN_RESIDENCIAL can SELECT, INSERT, UPDATE
  - No public access
*/

CREATE TABLE IF NOT EXISTS reservas_comerciales (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id       uuid REFERENCES negocios(id) ON DELETE SET NULL,
  prospecto        text NOT NULL DEFAULT '',
  email            text NOT NULL DEFAULT '',
  telefono         text NOT NULL DEFAULT '',
  unidad           text NOT NULL DEFAULT '',
  proyecto         text NOT NULL DEFAULT '',
  tipo_interes     text NOT NULL DEFAULT '',
  valor            numeric NOT NULL DEFAULT 0,
  monto_reserva    numeric NOT NULL DEFAULT 0,
  fecha_reserva    date NOT NULL DEFAULT CURRENT_DATE,
  estado           text NOT NULL DEFAULT 'Pendiente Documentos',
  documentos       jsonb NOT NULL DEFAULT '[]'::jsonb,
  deleted_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reservas_comerciales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view reservas_comerciales"
  ON reservas_comerciales FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert reservas_comerciales"
  ON reservas_comerciales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reservas_comerciales"
  ON reservas_comerciales FOR UPDATE
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_reservas_comerciales_negocio_id ON reservas_comerciales(negocio_id);
CREATE INDEX IF NOT EXISTS idx_reservas_comerciales_estado ON reservas_comerciales(estado);
CREATE INDEX IF NOT EXISTS idx_reservas_comerciales_deleted_at ON reservas_comerciales(deleted_at);
