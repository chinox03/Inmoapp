# Database Setup Guide - Phase 1

## Overview
This guide will help you set up the Supabase database for the Resident Portal.

## Step 1: Run Database Schema

1. Open your Supabase Dashboard: https://0ec90b57d6e95fcbda19832f.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `src/scripts/schema.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the schema

**What this creates:**
- Custom enum types for roles, actions, and states
- Tables: `residenciales`, `profiles`, `residencias`, `audit_log`
- Indexes for optimal performance
- Row Level Security policies for data isolation
- Triggers for automatic timestamp updates

## Step 2: Verify Indexes

After running the schema, verify indexes were created:

1. Go to **Database** > **Tables** in Supabase Dashboard
2. Check each table for these indexes:
   - **profiles**: unique index on `id`
   - **residenciales**: unique index on `codigo`
   - **residencias**: index on `residencial_id`
   - **audit_log**: indexes on `residencial_id`, `user_id`, `created_at`

## Step 3: Seed Initial Data

1. In SQL Editor, create a new query
2. Copy contents of `src/scripts/seed.sql`
3. Paste and run

**What this creates:**
- 1 Residencial: "Arcos Santa Maria I" (ASM1)
- 5 Residencias (housing units) in ASM1

## Step 4: Create Test Users

Users must be created through Supabase Auth. Follow these steps for each user:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Authentication** > **Users** in Supabase Dashboard
2. Click **Add User** > **Create new user**
3. Fill in email and password
4. Click **Create user**
5. Copy the generated User ID
6. Go to **SQL Editor** and run this query for each user:

#### SUPERADMIN User
```sql
-- Create user admin@conversion.tech in Supabase Dashboard first
-- Then run this with the actual user ID:
INSERT INTO profiles (id, nombre, telefono, rol, residencial_id)
VALUES
  ('YOUR_USER_ID_HERE', 'Super Administrador', NULL, 'SUPERADMIN', NULL);
```

#### ADMIN_RESIDENCIAL User
```sql
-- Create user admin.asm1@example.com in Supabase Dashboard first
-- Then run this with the actual user ID:
INSERT INTO profiles (id, nombre, telefono, rol, residencial_id)
VALUES
  ('YOUR_USER_ID_HERE', 'Administrador ASM1', '+52 555 123 4567', 'ADMIN_RESIDENCIAL',
   (SELECT id FROM residenciales WHERE codigo = 'ASM1'));
```

#### RESIDENTE 1 User
```sql
-- Create user residente1@example.com in Supabase Dashboard first
-- Then run this with the actual user ID:
INSERT INTO profiles (id, nombre, telefono, rol, residencial_id)
VALUES
  ('YOUR_USER_ID_HERE', 'Juan Perez', '+52 123 456 7890', 'RESIDENTE',
   (SELECT id FROM residenciales WHERE codigo = 'ASM1'));
```

#### RESIDENTE 2 User
```sql
-- Create user residente2@example.com in Supabase Dashboard first
-- Then run this with the actual user ID:
INSERT INTO profiles (id, nombre, telefono, rol, residencial_id)
VALUES
  ('YOUR_USER_ID_HERE', 'Maria Garcia', '+52 098 765 4321', 'RESIDENTE',
   (SELECT id FROM residenciales WHERE codigo = 'ASM1'));
```

### Option B: Using Supabase Auth API (Advanced)

If you prefer to script the user creation, you can use the Supabase Admin API, but you'll need the service role key (keep it secret!).

## Step 5: Verify Setup

1. Go to **Authentication** > **Users** - You should see 4 users
2. Go to **Database** > **Table Editor**:
   - Select `profiles` table - Should show 4 profiles
   - Select `residenciales` table - Should show 1 residencial (ASM1)
   - Select `residencias` table - Should show 5 residencias
3. Verify RLS is enabled (shield icon) on all tables

## Test Credentials

After setup, you can login with these credentials:

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| SUPERADMIN | admin@conversion.tech | Admin123! | Full system access |
| ADMIN_RESIDENCIAL | admin.asm1@example.com | Admin123! | ASM1 management |
| RESIDENTE | residente1@example.com | Residente123! | Personal data only |
| RESIDENTE | residente2@example.com | Residente123! | Personal data only |

**Important:** Make sure to set these passwords when creating users in the Supabase Dashboard!

## Troubleshooting

### Issue: "relation does not exist"
- Make sure you ran the schema.sql file completely
- Check for any errors in the SQL execution

### Issue: "Users can't login"
- Verify users were created in Supabase Auth (Authentication > Users)
- Check that corresponding profiles exist in profiles table
- Ensure the profile.id matches the auth.users.id

### Issue: "RLS blocking access"
- Verify RLS policies were created (check in Database > Policies)
- Ensure user roles are set correctly in profiles table
- Check that residencial_id is set for non-SUPERADMIN users

## Next Steps

After completing the database setup:

1. Test login with admin@conversion.tech
2. Verify dashboard loads correctly
3. Test role-based menu visibility
4. Test residencial selector (SUPERADMIN only)
5. Proceed to Phase 2 development

## Development Mode RLS Configuration

**⚠️ CURRENT STATE: DEVELOPMENT MODE ENABLED**

The database is currently configured with universal RLS policies that allow unrestricted access for development and testing purposes.

### Current Configuration
All tables have simple `dev_mode_all_*` policies that:
- Allow all authenticated users to perform any operation (SELECT, INSERT, UPDATE, DELETE)
- Use `USING (true)` and `WITH CHECK (true)` for maximum accessibility
- Eliminate infinite recursion issues from complex role-based policies

### Tables with Universal Access
- profiles
- pagos
- estados_cuenta
- espacios
- reservas
- amonestaciones
- accesos
- mudanzas
- residenciales
- residencias
- garita_registros
- solicitudes_acceso
- audit_log

### Production RLS Restoration

**⚠️ CRITICAL: Before deploying to production, you MUST restore proper RLS policies**

Production policies must include:
1. **Role-based access control**
   - SUPERADMIN: Full unrestricted access to all data
   - ADMIN_RESIDENCIAL: Access limited to their assigned residencial
   - RESIDENTE: Access limited to their own data only
   - IT/SEGURIDAD: Specialized access for their modules

2. **User-level data isolation**
   - Users can only SELECT their own profile
   - Users can only UPDATE their own profile
   - Prevent cross-user data access

3. **Residencial-based isolation**
   - Filter all queries by residencial_id
   - Ensure ADMIN_RESIDENCIAL cannot access other residenciales
   - Maintain data segregation between communities

4. **Audit trail policies**
   - All users can INSERT audit logs
   - Only SUPERADMIN and ADMIN_RESIDENCIAL can view audit logs
   - Prevent tampering with audit records

5. **Non-recursive policy structure**
   - Use table aliases (profiles AS p) in subqueries
   - Direct auth.uid() comparisons where possible
   - Avoid circular references between tables

### Example Production Policy Pattern

```sql
-- Example: Proper production policy for pagos table
DROP POLICY IF EXISTS "dev_mode_all_pagos" ON pagos;

-- Allow users to view their own pagos
CREATE POLICY "Users can view their own pagos"
  ON pagos FOR SELECT TO authenticated
  USING (residente_id = auth.uid());

-- Allow ADMIN_RESIDENCIAL to manage pagos in their residencial
CREATE POLICY "ADMIN can manage residencial pagos"
  ON pagos FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.rol = 'ADMIN_RESIDENCIAL'
      AND p.residencial_id = pagos.residencial_id
    )
  );

-- Allow SUPERADMIN full access
CREATE POLICY "SUPERADMIN full access to pagos"
  ON pagos FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.rol = 'SUPERADMIN'
    )
  );
```

### Security Testing Checklist

Before production deployment:
- [ ] Test that regular users cannot access other users' data
- [ ] Verify ADMIN_RESIDENCIAL cannot access other residenciales
- [ ] Confirm SUPERADMIN has full unrestricted access
- [ ] Check that unauthenticated requests are blocked
- [ ] Validate all foreign key relationships respect RLS
- [ ] Run penetration testing for privilege escalation
- [ ] Verify audit logs capture all sensitive operations
- [ ] Test edge cases (null values, missing residencial_id, etc.)

## Database Maintenance

To reset the database and start fresh:

1. Delete all data from tables (in reverse order of dependencies):
   ```sql
   DELETE FROM audit_log;
   DELETE FROM residencias;
   DELETE FROM profiles;
   DELETE FROM residenciales;
   ```

2. Delete auth users from Authentication > Users

3. Re-run seed scripts

**Warning:** This will delete all data. Only do this in development!
