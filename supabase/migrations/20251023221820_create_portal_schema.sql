/*
  # Resident Portal Database Schema - Phase 1

  ## Overview
  Complete database setup for multi-tenant resident portal with role-based access control.

  ## Tables Created

  1. **residenciales**
     - Master table for residential complexes
     - Columns: id, nombre, codigo (unique), direccion, timestamps
     - Indexes: unique on codigo

  2. **profiles**
     - Extended user information linked to auth.users
     - Columns: id (links to auth.users), nombre, telefono, rol, residencial_id, timestamps
     - Indexes: unique on id, index on residencial_id

  3. **residencias**
     - Individual housing units within residenciales
     - Columns: id, residencial_id, codigo, manzana, numero, estado, timestamps
     - Indexes: index on residencial_id

  4. **audit_log**
     - System activity tracking for compliance
     - Columns: id, residencial_id, user_id, entidad, entidad_id, accion, diff, ip, user_agent, created_at
     - Indexes: index on residencial_id, user_id, created_at

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies restrict access based on user role and residencial_id
  - SUPERADMIN has full access across all residenciales
  - Other roles filtered by their assigned residencial_id

  ## Enums
  - user_role: SUPERADMIN, ADMIN_RESIDENCIAL, IT, SEGURIDAD, RESIDENTE
  - audit_action: CREATE, UPDATE, DELETE, STATUS_CHANGE, LOGIN
  - residencia_estado: activa, inactiva
*/

CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'ADMIN_RESIDENCIAL', 'IT', 'SEGURIDAD', 'RESIDENTE');

CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'LOGIN');

CREATE TYPE residencia_estado AS ENUM ('activa', 'inactiva');

CREATE TABLE IF NOT EXISTS residenciales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  direccion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_residenciales_codigo ON residenciales(codigo);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  rol user_role NOT NULL DEFAULT 'RESIDENTE',
  residencial_id UUID REFERENCES residenciales(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_residencial_id ON profiles(residencial_id);

CREATE TABLE IF NOT EXISTS residencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residencial_id UUID NOT NULL REFERENCES residenciales(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  manzana TEXT,
  numero TEXT,
  estado residencia_estado DEFAULT 'activa',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_residencias_residencial_id ON residencias(residencial_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residencial_id UUID REFERENCES residenciales(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entidad TEXT NOT NULL,
  entidad_id TEXT NOT NULL,
  accion audit_action NOT NULL,
  diff JSONB,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_residencial_id ON audit_log(residencial_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_residenciales_updated_at
  BEFORE UPDATE ON residenciales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_residencias_updated_at
  BEFORE UPDATE ON residencias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE residenciales ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE residencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SUPERADMIN full access to residenciales"
  ON residenciales FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SUPERADMIN'
    )
  );

CREATE POLICY "Users can view their own residencial"
  ON residenciales FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT residencial_id FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "SUPERADMIN full access to profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.rol = 'SUPERADMIN'
    )
  );

CREATE POLICY "SUPERADMIN full access to residencias"
  ON residencias FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SUPERADMIN'
    )
  );

CREATE POLICY "Users can view residencias in their residencial"
  ON residencias FOR SELECT
  TO authenticated
  USING (
    residencial_id IN (
      SELECT residencial_id FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "ADMIN_RESIDENCIAL can manage residencias in their residencial"
  ON residencias FOR ALL
  TO authenticated
  USING (
    residencial_id IN (
      SELECT residencial_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol IN ('ADMIN_RESIDENCIAL')
    )
  );

CREATE POLICY "SUPERADMIN full access to audit_log"
  ON audit_log FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SUPERADMIN'
    )
  );

CREATE POLICY "Users can view audit logs for their residencial"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    residencial_id IN (
      SELECT residencial_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol IN ('ADMIN_RESIDENCIAL')
    )
  );

CREATE POLICY "Anyone authenticated can insert audit logs"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);
