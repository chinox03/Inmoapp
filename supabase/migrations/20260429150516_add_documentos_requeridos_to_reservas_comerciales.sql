/*
  # Add documentos_requeridos to reservas_comerciales

  Stores a snapshot of the project's required document types at the time the
  reservation was created, so that the Reservas Comerciales module can show
  a dynamic checklist without re-querying project config.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservas_comerciales' AND column_name = 'documentos_requeridos'
  ) THEN
    ALTER TABLE reservas_comerciales ADD COLUMN documentos_requeridos jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;
