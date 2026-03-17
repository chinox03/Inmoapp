/*
  # Create Prospectos and Negocios tables

  1. New Tables
    - `prospectos`
      - `id` (uuid, primary key)
      - `nombre` (text) - first name
      - `apellido` (text) - last name
      - `email` (text)
      - `telefono` (text)
      - `origen` (text) - lead source: Web, Referido, Redes Sociales, Llamada Directa
      - `interes` (text) - property type interest
      - `proyecto` (text) - project name
      - `estado` (text) - Nuevo, Contactado, Calificado, No Interesado
      - `ultimo_contacto` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `negocios`
      - `id` (uuid, primary key)
      - `prospecto_id` (uuid, FK to prospectos)
      - `prospecto_nombre` (text) - denormalized name for display
      - `email` (text)
      - `telefono` (text)
      - `unidad` (text) - unit identifier
      - `proyecto` (text) - project name
      - `tipo_interes` (text) - property type
      - `etapa` (text) - pipeline stage: interesado, contactado, visita_agendada, visita_realizada, cotizacion_enviada
      - `valor` (numeric) - deal value
      - `actividades` (jsonb) - array of activity objects
      - `notas` (jsonb) - array of note objects
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS prospectos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  apellido text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  telefono text NOT NULL DEFAULT '',
  origen text NOT NULL DEFAULT 'Web',
  interes text NOT NULL DEFAULT '',
  proyecto text NOT NULL DEFAULT '',
  estado text NOT NULL DEFAULT 'Nuevo',
  ultimo_contacto timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS negocios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospecto_id uuid REFERENCES prospectos(id),
  prospecto_nombre text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  telefono text NOT NULL DEFAULT '',
  unidad text NOT NULL DEFAULT '',
  proyecto text NOT NULL DEFAULT '',
  tipo_interes text NOT NULL DEFAULT '',
  etapa text NOT NULL DEFAULT 'Interesado',
  valor numeric NOT NULL DEFAULT 0,
  actividades jsonb NOT NULL DEFAULT '[]'::jsonb,
  notas jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prospectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE negocios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view prospectos"
  ON prospectos FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert prospectos"
  ON prospectos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update prospectos"
  ON prospectos FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete prospectos"
  ON prospectos FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view negocios"
  ON negocios FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert negocios"
  ON negocios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update negocios"
  ON negocios FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete negocios"
  ON negocios FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
