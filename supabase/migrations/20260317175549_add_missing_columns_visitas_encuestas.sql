/*
  # Add missing display columns to visitas and encuestas

  1. Modified Tables
    - `visitas`
      - Add `residencial_nombre` (text, default '') for display purposes
    - `encuestas`
      - Add `residencial_nombre` (text, default '') for display purposes
      - Add `residente_telefono` (text, default '') for display purposes

  2. Notes
    - These denormalized columns store display names to avoid extra joins
    - They match what the frontend UI expects to render in data tables
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'visitas' AND column_name = 'residencial_nombre'
  ) THEN
    ALTER TABLE visitas ADD COLUMN residencial_nombre text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'encuestas' AND column_name = 'residencial_nombre'
  ) THEN
    ALTER TABLE encuestas ADD COLUMN residencial_nombre text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'encuestas' AND column_name = 'residente_telefono'
  ) THEN
    ALTER TABLE encuestas ADD COLUMN residente_telefono text NOT NULL DEFAULT '';
  END IF;
END $$;
