/*
  # Fix profiles_superadmin_access policy

  1. Problem
    - The `profiles_superadmin_access` policy queries `auth.users` directly
    - The `authenticated` role does not have SELECT on `auth.users`
    - This causes a 403 "permission denied for table users" error on every profiles query

  2. Fix
    - Drop the broken `profiles_superadmin_access` policy
    - The existing `profiles_select` policy already covers SUPERADMIN access via `get_user_role()`
    - The existing `profiles_self_access` policy already covers self-access via `auth.uid() = id`
    - No replacement policy is needed since coverage already exists
*/

DROP POLICY IF EXISTS "profiles_superadmin_access" ON profiles;
