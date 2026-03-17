/*
  # Final Policy Cleanup - Remove All Remaining Restrictive Policies

  ## Overview
  Remove the last few remaining restrictive policies that weren't caught
  in the previous cleanup migration.
*/

-- Remove remaining amonestaciones policy
DROP POLICY IF EXISTS "RESIDENTE can view received amonestaciones" ON amonestaciones;

-- Remove remaining solicitudes_acceso policies
DROP POLICY IF EXISTS "RESIDENTE can create solicitudes_acceso" ON solicitudes_acceso;
DROP POLICY IF EXISTS "RESIDENTE can view own solicitudes_acceso" ON solicitudes_acceso;

/*
  After this migration, every table should have exactly 1 policy:
  the dev_mode_all_* universal policy with USING (true) WITH CHECK (true)
*/
