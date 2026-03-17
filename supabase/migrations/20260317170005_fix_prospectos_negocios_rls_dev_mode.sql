/*
  # Fix RLS policies for prospectos and negocios tables (dev mode)

  1. Changes
    - Drop existing restrictive RLS policies on prospectos and negocios
    - Create dev-mode universal policies matching all other tables in the project
    - Allow both authenticated and anon roles full access for development

  2. Security
    - Dev mode only - must be replaced with proper policies before production
*/

DROP POLICY IF EXISTS "Authenticated users can view prospectos" ON prospectos;
DROP POLICY IF EXISTS "Authenticated users can insert prospectos" ON prospectos;
DROP POLICY IF EXISTS "Authenticated users can update prospectos" ON prospectos;
DROP POLICY IF EXISTS "Authenticated users can delete prospectos" ON prospectos;

CREATE POLICY "dev_mode_all_prospectos"
  ON prospectos FOR ALL
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view negocios" ON negocios;
DROP POLICY IF EXISTS "Authenticated users can insert negocios" ON negocios;
DROP POLICY IF EXISTS "Authenticated users can update negocios" ON negocios;
DROP POLICY IF EXISTS "Authenticated users can delete negocios" ON negocios;

CREATE POLICY "dev_mode_all_negocios"
  ON negocios FOR ALL
  USING (true) WITH CHECK (true);
