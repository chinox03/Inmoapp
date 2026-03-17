# Quick Data Population Guide

## Overview
This guide helps you quickly populate the Phase 2 tables with sample data for testing.

## Prerequisites
- Database migration already applied ✅
- All 13 tables created ✅
- Existing data: 1 residencial, 4 profiles, 5 residencias ✅

## Get Your IDs First

Run these queries to get the IDs you'll need:

```sql
-- Get residencial ID
SELECT id, nombre, codigo FROM residenciales;

-- Get user IDs by role
SELECT id, nombre, rol FROM profiles ORDER BY rol;

-- Get RESIDENTE IDs specifically
SELECT id, nombre, email FROM profiles WHERE rol = 'RESIDENTE';
```

## Quick Population Scripts

### 1. Create Account Statements (Estados de Cuenta)

```sql
-- Create account statement for first resident
INSERT INTO estados_cuenta (
  residencial_id,
  residente_id,
  periodo,
  total_mantenimiento,
  total_pagado,
  saldo_pendiente
)
SELECT
  r.id as residencial_id,
  p.id as residente_id,
  'Octubre 2025' as periodo,
  2500.00 as total_mantenimiento,
  1500.00 as total_pagado,
  1000.00 as saldo_pendiente
FROM residenciales r
CROSS JOIN (SELECT id FROM profiles WHERE rol = 'RESIDENTE' LIMIT 1) p
LIMIT 1;
```

### 2. Create Payments (Pagos)

```sql
-- Create pending payment
INSERT INTO pagos (
  residencial_id,
  residente_id,
  monto,
  tipo,
  estado,
  fecha_pago
)
SELECT
  r.id as residencial_id,
  p.id as residente_id,
  2500.00 as monto,
  'mantenimiento' as tipo,
  'pendiente' as estado,
  CURRENT_DATE as fecha_pago
FROM residenciales r
CROSS JOIN (SELECT id FROM profiles WHERE rol = 'RESIDENTE' LIMIT 1) p
LIMIT 1;
```

### 3. Create Common Areas (Espacios)

```sql
-- Create multiple common areas
INSERT INTO espacios (residencial_id, nombre, descripcion, capacidad, amueblado, electricidad)
SELECT
  id as residencial_id,
  unnest(ARRAY['Salón de Eventos', 'Alberca', 'Gimnasio', 'Cancha de Tenis']) as nombre,
  unnest(ARRAY['Espacio para reuniones', 'Área de recreación', 'Equipado', 'Deportiva']) as descripcion,
  unnest(ARRAY[50, 30, 20, 10]) as capacidad,
  unnest(ARRAY[true, false, true, false]) as amueblado,
  unnest(ARRAY[true, false, true, true]) as electricidad
FROM residenciales
LIMIT 1;
```

### 4. Create Reservations (Reservas)

```sql
-- Create sample reservation
INSERT INTO reservas (
  espacio_id,
  residente_id,
  fecha_reserva,
  hora_inicio,
  hora_fin,
  estado,
  motivo
)
SELECT
  e.id as espacio_id,
  p.id as residente_id,
  CURRENT_DATE + INTERVAL '3 days' as fecha_reserva,
  '10:00' as hora_inicio,
  '12:00' as hora_fin,
  'pendiente' as estado,
  'Reunión familiar' as motivo
FROM espacios e
CROSS JOIN (SELECT id FROM profiles WHERE rol = 'RESIDENTE' LIMIT 1) p
LIMIT 1;
```

### 5. Create Warnings (Amonestaciones)

```sql
-- Create warning
INSERT INTO amonestaciones (
  residencial_id,
  tipo,
  descripcion,
  emisor_id,
  receptor_id
)
SELECT
  r.id as residencial_id,
  'ruido' as tipo,
  'Música alta después de las 10 PM' as descripcion,
  admin.id as emisor_id,
  residente.id as receptor_id
FROM residenciales r
CROSS JOIN (SELECT id FROM profiles WHERE rol = 'ADMIN_RESIDENCIAL' LIMIT 1) admin
CROSS JOIN (SELECT id FROM profiles WHERE rol = 'RESIDENTE' LIMIT 1) residente
LIMIT 1;
```

### 6. Create Access Cards (Accesos)

```sql
-- Create access card
INSERT INTO accesos (
  residente_id,
  tipo,
  codigo_acceso,
  estado,
  aprobado_por
)
SELECT
  residente.id as residente_id,
  'tarjeta_permanente' as tipo,
  'AC-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') as codigo_acceso,
  'activo' as estado,
  it.id as aprobado_por
FROM (SELECT id FROM profiles WHERE rol = 'RESIDENTE' LIMIT 1) residente
CROSS JOIN (SELECT id FROM profiles WHERE rol = 'IT' LIMIT 1) it
LIMIT 1;
```

### 7. Create Access Requests (Solicitudes Acceso)

```sql
-- Create access request
INSERT INTO solicitudes_acceso (
  residente_id,
  tipo,
  motivo,
  estado
)
SELECT
  id as residente_id,
  'codigo_temporal' as tipo,
  'Visita familiar el fin de semana' as motivo,
  'pendiente' as estado
FROM profiles
WHERE rol = 'RESIDENTE'
LIMIT 1;
```

### 8. Create Moving Permits (Mudanzas)

```sql
-- Create moving permit
INSERT INTO mudanzas (
  residencial_id,
  residente_id,
  tipo,
  fecha,
  hora,
  observaciones
)
SELECT
  r.id as residencial_id,
  p.id as residente_id,
  'entrada' as tipo,
  CURRENT_DATE + INTERVAL '7 days' as fecha,
  '09:00' as hora,
  'Mudanza de muebles de sala' as observaciones
FROM residenciales r
CROSS JOIN (SELECT id FROM profiles WHERE rol = 'RESIDENTE' LIMIT 1) p
LIMIT 1;
```

### 9. Create Security Gate Logs (Garita Registros)

```sql
-- Create gate log (requires existing mudanza)
INSERT INTO garita_registros (
  mudanza_id,
  guardia_id,
  tipo_registro,
  observaciones
)
SELECT
  m.id as mudanza_id,
  g.id as guardia_id,
  'entrada' as tipo_registro,
  'Camión de mudanza registrado' as observaciones
FROM mudanzas m
CROSS JOIN (SELECT id FROM profiles WHERE rol = 'SEGURIDAD' LIMIT 1) g
LIMIT 1;
```

## Bulk Population Script

Run this to populate ALL tables with sample data:

```sql
-- 1. Estados de cuenta (3 records)
INSERT INTO estados_cuenta (residencial_id, residente_id, periodo, total_mantenimiento, total_pagado, saldo_pendiente)
SELECT
  r.id,
  p.id,
  periodo,
  2500.00,
  CASE
    WHEN periodo = 'Octubre 2025' THEN 2500.00
    WHEN periodo = 'Septiembre 2025' THEN 2000.00
    ELSE 1500.00
  END,
  CASE
    WHEN periodo = 'Octubre 2025' THEN 0
    WHEN periodo = 'Septiembre 2025' THEN 500.00
    ELSE 1000.00
  END
FROM residenciales r
CROSS JOIN profiles p
CROSS JOIN (SELECT unnest(ARRAY['Octubre 2025', 'Septiembre 2025', 'Agosto 2025']) as periodo) periodos
WHERE p.rol = 'RESIDENTE';

-- 2. Pagos (5 records)
INSERT INTO pagos (residencial_id, residente_id, monto, tipo, estado, fecha_pago)
SELECT
  r.id,
  p.id,
  monto,
  tipo,
  estado,
  CURRENT_DATE - (random() * 30)::integer
FROM residenciales r
CROSS JOIN profiles p
CROSS JOIN (
  SELECT
    unnest(ARRAY[2500.00, 1500.00, 3000.00, 2500.00, 1200.00]) as monto,
    unnest(ARRAY['mantenimiento', 'mantenimiento', 'extraordinario', 'mantenimiento', 'multa']::pago_tipo[]) as tipo,
    unnest(ARRAY['pendiente', 'aprobado', 'pendiente', 'aprobado', 'rechazado']::pago_estado[]) as estado
) pagos_data
WHERE p.rol = 'RESIDENTE';

-- 3. Espacios (4 records)
INSERT INTO espacios (residencial_id, nombre, descripcion, capacidad, amueblado, electricidad, estado)
SELECT
  id,
  unnest(ARRAY['Salón de Eventos', 'Alberca', 'Gimnasio', 'Cancha de Tenis']),
  unnest(ARRAY['Espacio para reuniones y celebraciones', 'Área de recreación', 'Equipado con máquinas', 'Deportiva']),
  unnest(ARRAY[50, 30, 20, 10]),
  unnest(ARRAY[true, false, true, false]),
  unnest(ARRAY[true, false, true, true]),
  'activo'::espacio_estado
FROM residenciales;

-- 4. Reservas (3 records)
INSERT INTO reservas (espacio_id, residente_id, fecha_reserva, hora_inicio, hora_fin, estado, motivo)
SELECT
  e.id,
  p.id,
  CURRENT_DATE + (random() * 14)::integer,
  unnest(ARRAY['10:00', '14:00', '18:00']),
  unnest(ARRAY['12:00', '16:00', '20:00']),
  unnest(ARRAY['pendiente', 'aprobada', 'pendiente']::reserva_estado[]),
  unnest(ARRAY['Reunión familiar', 'Fiesta de cumpleaños', 'Sesión de ejercicio'])
FROM espacios e
CROSS JOIN (SELECT id FROM profiles WHERE rol = 'RESIDENTE' LIMIT 1) p
LIMIT 3;

-- 5. Amonestaciones (2 records)
INSERT INTO amonestaciones (residencial_id, tipo, descripcion, emisor_id, receptor_id, estado)
SELECT
  r.id,
  unnest(ARRAY['ruido', 'estacionamiento']::amonestacion_tipo[]),
  unnest(ARRAY['Música alta después de las 10 PM', 'Estacionamiento en lugar prohibido']),
  admin.id,
  residente.id,
  unnest(ARRAY['emitida', 'apelada']::amonestacion_estado[])
FROM residenciales r
CROSS JOIN (SELECT id FROM profiles WHERE rol = 'ADMIN_RESIDENCIAL' LIMIT 1) admin
CROSS JOIN (SELECT id FROM profiles WHERE rol = 'RESIDENTE' LIMIT 1) residente
LIMIT 2;

-- 6. Accesos (2 records)
INSERT INTO accesos (residente_id, tipo, codigo_acceso, estado, aprobado_por)
SELECT
  p.id,
  tipo,
  'AC-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
  'activo'::acceso_estado,
  it.id
FROM profiles p
CROSS JOIN (SELECT id FROM profiles WHERE rol = 'IT' LIMIT 1) it
CROSS JOIN (SELECT unnest(ARRAY['tarjeta_permanente', 'codigo_temporal']::acceso_tipo[]) as tipo) tipos
WHERE p.rol = 'RESIDENTE'
LIMIT 2;

-- 7. Solicitudes de acceso (1 record)
INSERT INTO solicitudes_acceso (residente_id, tipo, motivo, estado)
SELECT
  id,
  'invitado'::acceso_tipo,
  'Visita familiar el fin de semana',
  'pendiente'::pago_estado
FROM profiles
WHERE rol = 'RESIDENTE'
LIMIT 1;

-- 8. Mudanzas (2 records)
INSERT INTO mudanzas (residencial_id, residente_id, tipo, fecha, hora, observaciones, estado)
SELECT
  r.id,
  p.id,
  tipo,
  CURRENT_DATE + dias,
  hora,
  observaciones,
  estado
FROM residenciales r
CROSS JOIN (SELECT id FROM profiles WHERE rol = 'RESIDENTE' LIMIT 1) p
CROSS JOIN (
  SELECT
    unnest(ARRAY['entrada', 'salida']::mudanza_tipo[]) as tipo,
    unnest(ARRAY[7, 14]) as dias,
    unnest(ARRAY['09:00', '15:00']) as hora,
    unnest(ARRAY['Mudanza de muebles de sala', 'Mudanza completa']) as observaciones,
    unnest(ARRAY['solicitada', 'aprobada']::mudanza_estado[]) as estado
) mudanza_data
LIMIT 2;
```

## Verify Data Population

After running the scripts, verify with these queries:

```sql
-- Check row counts
SELECT 'estados_cuenta' as table_name, COUNT(*) FROM estados_cuenta
UNION ALL
SELECT 'pagos', COUNT(*) FROM pagos
UNION ALL
SELECT 'espacios', COUNT(*) FROM espacios
UNION ALL
SELECT 'reservas', COUNT(*) FROM reservas
UNION ALL
SELECT 'amonestaciones', COUNT(*) FROM amonestaciones
UNION ALL
SELECT 'accesos', COUNT(*) FROM accesos
UNION ALL
SELECT 'solicitudes_acceso', COUNT(*) FROM solicitudes_acceso
UNION ALL
SELECT 'mudanzas', COUNT(*) FROM mudanzas
UNION ALL
SELECT 'garita_registros', COUNT(*) FROM garita_registros;
```

Expected results after bulk population:
- estados_cuenta: 3-6 rows
- pagos: 5-10 rows
- espacios: 4 rows
- reservas: 3-6 rows
- amonestaciones: 2 rows
- accesos: 2 rows
- solicitudes_acceso: 1 row
- mudanzas: 2 rows
- garita_registros: 0-1 rows

## Testing the Dashboard

After populating data:

1. Refresh the dashboard at `/dashboard`
2. You should see:
   - **Total Residentes**: 2-3 (number of RESIDENTE profiles)
   - **Pagos Pendientes**: 2-3 (payments with estado = 'pendiente')
   - **Reservas Activas**: 2-4 (reservations with estado in 'pendiente' or 'aprobada')
   - **Total Residenciales**: 1 (for SUPERADMIN)

## Testing Individual Modules

Navigate to each module to test:

1. **Estados de Cuenta** (`/dashboard/estados`) - Should show generated statements
2. **Pagos** (`/dashboard/pagos`) - Should show payment list with status badges
3. **Espacios** (`/dashboard/espacios`) - Should show common areas
4. **Reservas** (`/dashboard/reservas`) - Should show reservation requests
5. **Amonestaciones** (`/dashboard/amonestaciones`) - Should show warnings
6. **Accesos** (`/dashboard/accesos`) - Should show access cards/codes
7. **Mudanzas** (`/dashboard/mudanzas`) - Should show moving permits

## Troubleshooting

### No data appears in dashboard
- Check browser console for errors
- Verify data was inserted: Run verify queries above
- Check RLS policies: User must have SUPERADMIN role

### "Permission denied" errors
- RLS policies are enforcing correctly
- User needs appropriate role for the action
- For testing, use SUPERADMIN account

### Foreign key violations
- Ensure residenciales and profiles have data
- Use the SELECT queries at the top to get valid IDs
- Run scripts in order (espacios before reservas, etc.)

## Clean Up Data

To reset and start fresh:

```sql
-- Delete in reverse order of dependencies
DELETE FROM garita_registros;
DELETE FROM mudanzas;
DELETE FROM solicitudes_acceso;
DELETE FROM accesos;
DELETE FROM amonestaciones;
DELETE FROM reservas;
DELETE FROM espacios;
DELETE FROM pagos;
DELETE FROM estados_cuenta;
```

---

**Note**: Always test with small datasets first before running bulk population scripts.
