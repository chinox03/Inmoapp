/*
  # Add apellido, unidad, and estado columns to profiles table

  1. Modified Tables
    - `profiles`
      - `apellido` (text, default '') - Last name for residents
      - `unidad` (text, nullable) - Unit number for residents  
      - `estado` (text, default 'activo') - Account status (activo/inactivo)

  2. Notes
    - These columns are needed for proper user management and resident search
    - The estado column allows disabling users without deleting them
    - Non-destructive migration: adds columns only if they don't exist
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'apellido'
  ) THEN
    ALTER TABLE profiles ADD COLUMN apellido text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'unidad'
  ) THEN
    ALTER TABLE profiles ADD COLUMN unidad text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'estado'
  ) THEN
    ALTER TABLE profiles ADD COLUMN estado text DEFAULT 'activo';
  END IF;
END $$;
