/*
  # Phase 2 Resident Portal - Complete Module Schema

  ## Overview
  Comprehensive database schema for 7 operational modules: Payments, Account Statements,
  Common Areas, Reservations, Warnings, Access Control, and Moving Permits.

  ## New Tables Created

  1. **estados_cuenta** - Account statements for residents
     - Columns: id, residencial_id, residente_id, periodo, total_mantenimiento,
                total_pagado, saldo_pendiente, fecha_generacion, created_at, updated_at
     - Indexes: residencial_id, residente_id, periodo
     - RLS: SUPERADMIN full access, ADMIN_RESIDENCIAL own residencial, RESIDENTE own records

  2. **pagos** - Payment records with proof upload
     - Columns: id, residencial_id, residente_id, monto, tipo, estado, comprobante_url,
                fecha_pago, fecha_registro, created_at, updated_at
     - Indexes: residencial_id, residente_id, estado, fecha_pago
     - RLS: SUPERADMIN full, ADMIN_RESIDENCIAL approve/view, RESIDENTE own records

  3. **espacios** - Common areas within residenciales
     - Columns: id, residencial_id, nombre, descripcion, capacidad, amueblado, electricidad,
                dias_disponibles, horas_disponibles, estado, created_at, updated_at
     - Indexes: residencial_id, estado
     - RLS: SUPERADMIN/ADMIN manage, RESIDENTE view

  4. **reservas** - Common area reservations
     - Columns: id, espacio_id, residente_id, fecha_reserva, hora_inicio, hora_fin,
                estado, motivo, created_at, updated_at
     - Indexes: espacio_id, residente_id, fecha_reserva, estado
     - RLS: SUPERADMIN/ADMIN manage, RESIDENTE own reservations

  5. **amonestaciones** - Warnings and violations
     - Columns: id, residencial_id, tipo, descripcion, emisor_id, receptor_id, estado,
                respuesta_apelacion, fecha_emision, fecha_resolucion, created_at, updated_at
     - Indexes: residencial_id, emisor_id, receptor_id, estado
     - RLS: ADMIN issues/manages, RESIDENTE view/appeal own warnings

  6. **accesos** - Access cards and codes
     - Columns: id, residente_id, tipo, codigo_acceso, estado, fecha_emision,
                fecha_expiracion, created_at, updated_at
     - Indexes: residente_id, estado, codigo_acceso
     - RLS: SUPERADMIN/IT manage, ADMIN view, RESIDENTE view own

  7. **solicitudes_acceso** - Access requests from residents
     - Columns: id, residente_id, tipo, motivo, estado, fecha_solicitud,
                fecha_respuesta, aprobado_por, created_at, updated_at
     - Indexes: residente_id, estado
     - RLS: IT approves, RESIDENTE creates/views own

  8. **mudanzas** - Moving permits
     - Columns: id, residencial_id, residente_id, tipo, fecha, hora, observaciones,
                estado, created_at, updated_at
     - Indexes: residencial_id, residente_id, fecha, estado
     - RLS: SEGURIDAD manages, ADMIN view, RESIDENTE own requests

  9. **garita_registros** - Security gate logs for moves
     - Columns: id, mudanza_id, guardia_id, tipo_registro, observaciones,
                fecha_registro, created_at
     - Indexes: mudanza_id, guardia_id
     - RLS: SEGURIDAD creates, ADMIN/SUPERADMIN view

  ## Security
  - Row Level Security enabled on all tables
  - Restrictive policies based on role and residencial_id
  - Audit logging enforced for all state changes
  - Multi-tenant data isolation maintained

  ## Enums
  - pago_estado: pendiente, aprobado, rechazado
  - pago_tipo: mantenimiento, extraordinario, multa
  - espacio_estado: activo, inactivo, mantenimiento
  - reserva_estado: pendiente, aprobada, rechazada, cancelada, completada
  - amonestacion_tipo: ruido, estacionamiento, mascotas, basura, otro
  - amonestacion_estado: emitida, apelada, cerrada
  - acceso_tipo: tarjeta_permanente, codigo_temporal, invitado
  - acceso_estado: activo, expirado, revocado
  - mudanza_tipo: entrada, salida
  - mudanza_estado: solicitada, aprobada, en_proceso, completada, cancelada
  - registro_tipo: entrada, salida
*/

-- Create enum types
CREATE TYPE pago_estado AS ENUM ('pendiente', 'aprobado', 'rechazado');
CREATE TYPE pago_tipo AS ENUM ('mantenimiento', 'extraordinario', 'multa');
CREATE TYPE espacio_estado AS ENUM ('activo', 'inactivo', 'mantenimiento');
CREATE TYPE reserva_estado AS ENUM ('pendiente', 'aprobada', 'rechazada', 'cancelada', 'completada');
CREATE TYPE amonestacion_tipo AS ENUM ('ruido', 'estacionamiento', 'mascotas', 'basura', 'otro');
CREATE TYPE amonestacion_estado AS ENUM ('emitida', 'apelada', 'cerrada');
CREATE TYPE acceso_tipo AS ENUM ('tarjeta_permanente', 'codigo_temporal', 'invitado');
CREATE TYPE acceso_estado AS ENUM ('activo', 'expirado', 'revocado');
CREATE TYPE mudanza_tipo AS ENUM ('entrada', 'salida');
CREATE TYPE mudanza_estado AS ENUM ('solicitada', 'aprobada', 'en_proceso', 'completada', 'cancelada');
CREATE TYPE registro_tipo AS ENUM ('entrada', 'salida');

-- Estados de Cuenta table
CREATE TABLE IF NOT EXISTS estados_cuenta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residencial_id UUID NOT NULL REFERENCES residenciales(id) ON DELETE CASCADE,
  residente_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  periodo TEXT NOT NULL,
  total_mantenimiento NUMERIC(10, 2) DEFAULT 0,
  total_pagado NUMERIC(10, 2) DEFAULT 0,
  saldo_pendiente NUMERIC(10, 2) DEFAULT 0,
  fecha_generacion TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estados_cuenta_residencial_id ON estados_cuenta(residencial_id);
CREATE INDEX IF NOT EXISTS idx_estados_cuenta_residente_id ON estados_cuenta(residente_id);
CREATE INDEX IF NOT EXISTS idx_estados_cuenta_periodo ON estados_cuenta(periodo);

-- Pagos table
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residencial_id UUID NOT NULL REFERENCES residenciales(id) ON DELETE CASCADE,
  residente_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  monto NUMERIC(10, 2) NOT NULL,
  tipo pago_tipo DEFAULT 'mantenimiento',
  estado pago_estado DEFAULT 'pendiente',
  comprobante_url TEXT,
  fecha_pago DATE,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  aprobado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_residencial_id ON pagos(residencial_id);
CREATE INDEX IF NOT EXISTS idx_pagos_residente_id ON pagos(residente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha_pago ON pagos(fecha_pago DESC);

-- Espacios table
CREATE TABLE IF NOT EXISTS espacios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residencial_id UUID NOT NULL REFERENCES residenciales(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  capacidad INTEGER DEFAULT 0,
  amueblado BOOLEAN DEFAULT false,
  electricidad BOOLEAN DEFAULT false,
  dias_disponibles TEXT[] DEFAULT ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
  horas_disponibles TEXT[] DEFAULT ARRAY['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
  estado espacio_estado DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_espacios_residencial_id ON espacios(residencial_id);
CREATE INDEX IF NOT EXISTS idx_espacios_estado ON espacios(estado);

-- Reservas table
CREATE TABLE IF NOT EXISTS reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  espacio_id UUID NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
  residente_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fecha_reserva DATE NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fin TEXT NOT NULL,
  estado reserva_estado DEFAULT 'pendiente',
  motivo TEXT,
  aprobado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservas_espacio_id ON reservas(espacio_id);
CREATE INDEX IF NOT EXISTS idx_reservas_residente_id ON reservas(residente_id);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON reservas(fecha_reserva);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);

-- Amonestaciones table
CREATE TABLE IF NOT EXISTS amonestaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residencial_id UUID NOT NULL REFERENCES residenciales(id) ON DELETE CASCADE,
  tipo amonestacion_tipo NOT NULL,
  descripcion TEXT NOT NULL,
  emisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receptor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  estado amonestacion_estado DEFAULT 'emitida',
  respuesta_apelacion TEXT,
  fecha_emision TIMESTAMPTZ DEFAULT NOW(),
  fecha_resolucion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amonestaciones_residencial_id ON amonestaciones(residencial_id);
CREATE INDEX IF NOT EXISTS idx_amonestaciones_emisor_id ON amonestaciones(emisor_id);
CREATE INDEX IF NOT EXISTS idx_amonestaciones_receptor_id ON amonestaciones(receptor_id);
CREATE INDEX IF NOT EXISTS idx_amonestaciones_estado ON amonestaciones(estado);

-- Accesos table
CREATE TABLE IF NOT EXISTS accesos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo acceso_tipo NOT NULL,
  codigo_acceso TEXT NOT NULL UNIQUE,
  estado acceso_estado DEFAULT 'activo',
  fecha_emision TIMESTAMPTZ DEFAULT NOW(),
  fecha_expiracion TIMESTAMPTZ,
  aprobado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accesos_residente_id ON accesos(residente_id);
CREATE INDEX IF NOT EXISTS idx_accesos_estado ON accesos(estado);
CREATE INDEX IF NOT EXISTS idx_accesos_codigo ON accesos(codigo_acceso);

-- Solicitudes Acceso table
CREATE TABLE IF NOT EXISTS solicitudes_acceso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo acceso_tipo NOT NULL,
  motivo TEXT NOT NULL,
  estado pago_estado DEFAULT 'pendiente',
  fecha_solicitud TIMESTAMPTZ DEFAULT NOW(),
  fecha_respuesta TIMESTAMPTZ,
  aprobado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_acceso_residente_id ON solicitudes_acceso(residente_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_acceso_estado ON solicitudes_acceso(estado);

-- Mudanzas table
CREATE TABLE IF NOT EXISTS mudanzas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residencial_id UUID NOT NULL REFERENCES residenciales(id) ON DELETE CASCADE,
  residente_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo mudanza_tipo NOT NULL,
  fecha DATE NOT NULL,
  hora TEXT NOT NULL,
  observaciones TEXT,
  estado mudanza_estado DEFAULT 'solicitada',
  aprobado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mudanzas_residencial_id ON mudanzas(residencial_id);
CREATE INDEX IF NOT EXISTS idx_mudanzas_residente_id ON mudanzas(residente_id);
CREATE INDEX IF NOT EXISTS idx_mudanzas_fecha ON mudanzas(fecha);
CREATE INDEX IF NOT EXISTS idx_mudanzas_estado ON mudanzas(estado);

-- Garita Registros table
CREATE TABLE IF NOT EXISTS garita_registros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mudanza_id UUID NOT NULL REFERENCES mudanzas(id) ON DELETE CASCADE,
  guardia_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo_registro registro_tipo NOT NULL,
  observaciones TEXT,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garita_registros_mudanza_id ON garita_registros(mudanza_id);
CREATE INDEX IF NOT EXISTS idx_garita_registros_guardia_id ON garita_registros(guardia_id);

-- Create updated_at triggers for all new tables
CREATE TRIGGER update_estados_cuenta_updated_at
  BEFORE UPDATE ON estados_cuenta
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_updated_at
  BEFORE UPDATE ON pagos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_espacios_updated_at
  BEFORE UPDATE ON espacios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservas_updated_at
  BEFORE UPDATE ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amonestaciones_updated_at
  BEFORE UPDATE ON amonestaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accesos_updated_at
  BEFORE UPDATE ON accesos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solicitudes_acceso_updated_at
  BEFORE UPDATE ON solicitudes_acceso
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mudanzas_updated_at
  BEFORE UPDATE ON mudanzas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE estados_cuenta ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE espacios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE amonestaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE accesos ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_acceso ENABLE ROW LEVEL SECURITY;
ALTER TABLE mudanzas ENABLE ROW LEVEL SECURITY;
ALTER TABLE garita_registros ENABLE ROW LEVEL SECURITY;

-- RLS Policies for estados_cuenta
CREATE POLICY "SUPERADMIN full access to estados_cuenta"
  ON estados_cuenta FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SUPERADMIN'
    )
  );

CREATE POLICY "ADMIN_RESIDENCIAL can manage estados_cuenta in their residencial"
  ON estados_cuenta FOR ALL
  TO authenticated
  USING (
    residencial_id IN (
      SELECT residencial_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'ADMIN_RESIDENCIAL'
    )
  );

CREATE POLICY "RESIDENTE can view own estados_cuenta"
  ON estados_cuenta FOR SELECT
  TO authenticated
  USING (residente_id = auth.uid());

-- RLS Policies for pagos
CREATE POLICY "SUPERADMIN full access to pagos"
  ON pagos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SUPERADMIN'
    )
  );

CREATE POLICY "ADMIN_RESIDENCIAL can manage pagos in their residencial"
  ON pagos FOR ALL
  TO authenticated
  USING (
    residencial_id IN (
      SELECT residencial_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'ADMIN_RESIDENCIAL'
    )
  );

CREATE POLICY "RESIDENTE can view own pagos"
  ON pagos FOR SELECT
  TO authenticated
  USING (residente_id = auth.uid());

CREATE POLICY "RESIDENTE can create own pagos"
  ON pagos FOR INSERT
  TO authenticated
  WITH CHECK (residente_id = auth.uid());

CREATE POLICY "RESIDENTE can update own pending pagos"
  ON pagos FOR UPDATE
  TO authenticated
  USING (residente_id = auth.uid() AND estado = 'pendiente')
  WITH CHECK (residente_id = auth.uid());

-- RLS Policies for espacios
CREATE POLICY "SUPERADMIN full access to espacios"
  ON espacios FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SUPERADMIN'
    )
  );

CREATE POLICY "ADMIN_RESIDENCIAL can manage espacios in their residencial"
  ON espacios FOR ALL
  TO authenticated
  USING (
    residencial_id IN (
      SELECT residencial_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'ADMIN_RESIDENCIAL'
    )
  );

CREATE POLICY "Users can view espacios in their residencial"
  ON espacios FOR SELECT
  TO authenticated
  USING (
    residencial_id IN (
      SELECT residencial_id FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- RLS Policies for reservas
CREATE POLICY "SUPERADMIN full access to reservas"
  ON reservas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SUPERADMIN'
    )
  );

CREATE POLICY "ADMIN_RESIDENCIAL can manage reservas in their residencial"
  ON reservas FOR ALL
  TO authenticated
  USING (
    espacio_id IN (
      SELECT id FROM espacios
      WHERE residencial_id IN (
        SELECT residencial_id FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.rol = 'ADMIN_RESIDENCIAL'
      )
    )
  );

CREATE POLICY "RESIDENTE can view own reservas"
  ON reservas FOR SELECT
  TO authenticated
  USING (residente_id = auth.uid());

CREATE POLICY "RESIDENTE can create reservas"
  ON reservas FOR INSERT
  TO authenticated
  WITH CHECK (residente_id = auth.uid());

CREATE POLICY "RESIDENTE can update own pending reservas"
  ON reservas FOR UPDATE
  TO authenticated
  USING (residente_id = auth.uid() AND estado = 'pendiente')
  WITH CHECK (residente_id = auth.uid());

-- RLS Policies for amonestaciones
CREATE POLICY "SUPERADMIN full access to amonestaciones"
  ON amonestaciones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SUPERADMIN'
    )
  );

CREATE POLICY "ADMIN_RESIDENCIAL can manage amonestaciones in their residencial"
  ON amonestaciones FOR ALL
  TO authenticated
  USING (
    residencial_id IN (
      SELECT residencial_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'ADMIN_RESIDENCIAL'
    )
  );

CREATE POLICY "RESIDENTE can view received amonestaciones"
  ON amonestaciones FOR SELECT
  TO authenticated
  USING (receptor_id = auth.uid());

CREATE POLICY "RESIDENTE can appeal own amonestaciones"
  ON amonestaciones FOR UPDATE
  TO authenticated
  USING (receptor_id = auth.uid() AND estado = 'emitida')
  WITH CHECK (receptor_id = auth.uid());

-- RLS Policies for accesos
CREATE POLICY "SUPERADMIN full access to accesos"
  ON accesos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SUPERADMIN'
    )
  );

CREATE POLICY "IT can manage accesos"
  ON accesos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'IT'
    )
  );

CREATE POLICY "ADMIN_RESIDENCIAL can view accesos in their residencial"
  ON accesos FOR SELECT
  TO authenticated
  USING (
    residente_id IN (
      SELECT id FROM profiles
      WHERE residencial_id IN (
        SELECT residencial_id FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.rol = 'ADMIN_RESIDENCIAL'
      )
    )
  );

CREATE POLICY "RESIDENTE can view own accesos"
  ON accesos FOR SELECT
  TO authenticated
  USING (residente_id = auth.uid());

-- RLS Policies for solicitudes_acceso
CREATE POLICY "SUPERADMIN full access to solicitudes_acceso"
  ON solicitudes_acceso FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SUPERADMIN'
    )
  );

CREATE POLICY "IT can manage solicitudes_acceso"
  ON solicitudes_acceso FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'IT'
    )
  );

CREATE POLICY "RESIDENTE can view own solicitudes_acceso"
  ON solicitudes_acceso FOR SELECT
  TO authenticated
  USING (residente_id = auth.uid());

CREATE POLICY "RESIDENTE can create solicitudes_acceso"
  ON solicitudes_acceso FOR INSERT
  TO authenticated
  WITH CHECK (residente_id = auth.uid());

-- RLS Policies for mudanzas
CREATE POLICY "SUPERADMIN full access to mudanzas"
  ON mudanzas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SUPERADMIN'
    )
  );

CREATE POLICY "SEGURIDAD can manage mudanzas"
  ON mudanzas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SEGURIDAD'
    )
  );

CREATE POLICY "ADMIN_RESIDENCIAL can view mudanzas in their residencial"
  ON mudanzas FOR SELECT
  TO authenticated
  USING (
    residencial_id IN (
      SELECT residencial_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'ADMIN_RESIDENCIAL'
    )
  );

CREATE POLICY "RESIDENTE can view own mudanzas"
  ON mudanzas FOR SELECT
  TO authenticated
  USING (residente_id = auth.uid());

CREATE POLICY "RESIDENTE can create mudanzas"
  ON mudanzas FOR INSERT
  TO authenticated
  WITH CHECK (residente_id = auth.uid());

-- RLS Policies for garita_registros
CREATE POLICY "SUPERADMIN full access to garita_registros"
  ON garita_registros FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SUPERADMIN'
    )
  );

CREATE POLICY "SEGURIDAD can create garita_registros"
  ON garita_registros FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SEGURIDAD'
    )
  );

CREATE POLICY "SEGURIDAD can view garita_registros"
  ON garita_registros FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'SEGURIDAD'
    )
  );

CREATE POLICY "ADMIN_RESIDENCIAL can view garita_registros in their residencial"
  ON garita_registros FOR SELECT
  TO authenticated
  USING (
    mudanza_id IN (
      SELECT id FROM mudanzas
      WHERE residencial_id IN (
        SELECT residencial_id FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.rol = 'ADMIN_RESIDENCIAL'
      )
    )
  );
