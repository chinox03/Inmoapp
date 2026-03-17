-- Comprehensive Sample Data for Phase 2 Portal
-- This script creates realistic test data for all modules

-- ============================================================================
-- 1. RESIDENCIALES
-- ============================================================================
INSERT INTO residenciales (nombre, direccion, ciudad, codigo, num_unidades, telefono, esta_activo)
VALUES
  ('Residencial Las Flores', 'Av. Principal 123', 'Guatemala', 'RLF-001', 50, '2234-5678', true),
  ('Condominio Vista Verde', 'Calzada San Juan 456', 'Guatemala', 'CVV-002', 30, '2234-9012', true)
ON CONFLICT (codigo) DO NOTHING;

-- Store IDs for reference
DO $$
DECLARE
  v_residencial1_id UUID;
  v_residencial2_id UUID;
  v_admin1_id UUID;
  v_admin2_id UUID;
  v_residente1_id UUID;
  v_residente2_id UUID;
  v_residente3_id UUID;
  v_residente4_id UUID;
  v_residente5_id UUID;
  v_residente6_id UUID;
  v_espacio1_id UUID;
  v_espacio2_id UUID;
  v_espacio3_id UUID;
  v_estado1_id UUID;
  v_estado2_id UUID;
  v_estado3_id UUID;
BEGIN
  -- Get residencial IDs
  SELECT id INTO v_residencial1_id FROM residenciales WHERE codigo = 'RLF-001';
  SELECT id INTO v_residencial2_id FROM residenciales WHERE codigo = 'CVV-002';

  -- ============================================================================
  -- 2. PROFILES (USERS)
  -- ============================================================================

  -- ADMIN_RESIDENCIAL for Las Flores
  INSERT INTO profiles (email, nombre, telefono, rol, residencial_id, direccion_unidad)
  VALUES (
    'admin.lasflores@tech.com',
    'Carlos Méndez',
    '5511-1111',
    'ADMIN_RESIDENCIAL',
    v_residencial1_id,
    'Administración'
  )
  ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
  RETURNING id INTO v_admin1_id;

  -- ADMIN_RESIDENCIAL for Vista Verde
  INSERT INTO profiles (email, nombre, telefono, rol, residencial_id, direccion_unidad)
  VALUES (
    'admin.vistaverde@tech.com',
    'María González',
    '5511-2222',
    'ADMIN_RESIDENCIAL',
    v_residencial2_id,
    'Administración'
  )
  ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
  RETURNING id INTO v_admin2_id;

  -- RESIDENTES for Las Flores
  INSERT INTO profiles (email, nombre, telefono, rol, residencial_id, direccion_unidad)
  VALUES (
    'juan.perez@email.com',
    'Juan Pérez López',
    '5522-1111',
    'RESIDENTE',
    v_residencial1_id,
    'Casa 12-A'
  )
  ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
  RETURNING id INTO v_residente1_id;

  INSERT INTO profiles (email, nombre, telefono, rol, residencial_id, direccion_unidad)
  VALUES (
    'ana.martinez@email.com',
    'Ana Martínez Cruz',
    '5522-2222',
    'RESIDENTE',
    v_residencial1_id,
    'Casa 15-B'
  )
  ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
  RETURNING id INTO v_residente2_id;

  INSERT INTO profiles (email, nombre, telefono, rol, residencial_id, direccion_unidad)
  VALUES (
    'roberto.garcia@email.com',
    'Roberto García Morales',
    '5522-3333',
    'RESIDENTE',
    v_residencial1_id,
    'Casa 20-C'
  )
  ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
  RETURNING id INTO v_residente3_id;

  -- RESIDENTES for Vista Verde
  INSERT INTO profiles (email, nombre, telefono, rol, residencial_id, direccion_unidad)
  VALUES (
    'sofia.rodriguez@email.com',
    'Sofía Rodríguez Vega',
    '5533-1111',
    'RESIDENTE',
    v_residencial2_id,
    'Apto 301'
  )
  ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
  RETURNING id INTO v_residente4_id;

  INSERT INTO profiles (email, nombre, telefono, rol, residencial_id, direccion_unidad)
  VALUES (
    'luis.hernandez@email.com',
    'Luis Hernández Díaz',
    '5533-2222',
    'RESIDENTE',
    v_residencial2_id,
    'Apto 405'
  )
  ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
  RETURNING id INTO v_residente5_id;

  INSERT INTO profiles (email, nombre, telefono, rol, residencial_id, direccion_unidad)
  VALUES (
    'patricia.lopez@email.com',
    'Patricia López Ramírez',
    '5533-3333',
    'RESIDENTE',
    v_residencial2_id,
    'Apto 502'
  )
  ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
  RETURNING id INTO v_residente6_id;

  -- ============================================================================
  -- 3. ESPACIOS (COMMON AREAS)
  -- ============================================================================

  INSERT INTO espacios (residencial_id, nombre, descripcion, capacidad, precio_renta, esta_activo, horario_inicio, horario_fin)
  VALUES (
    v_residencial1_id,
    'Piscina',
    'Piscina semiolímpica con área de chapoteadero y jacuzzi',
    60,
    800.00,
    true,
    '06:00',
    '20:00'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_espacio1_id;

  INSERT INTO espacios (residencial_id, nombre, descripcion, capacidad, precio_renta, esta_activo, horario_inicio, horario_fin)
  VALUES (
    v_residencial1_id,
    'Salón Social',
    'Salón amplio con cocina equipada, ideal para eventos y fiestas',
    100,
    2500.00,
    true,
    '08:00',
    '23:00'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_espacio2_id;

  INSERT INTO espacios (residencial_id, nombre, descripcion, capacidad, precio_renta, esta_activo, horario_inicio, horario_fin)
  VALUES (
    v_residencial1_id,
    'Gimnasio',
    'Gimnasio completamente equipado con máquinas de cardio y pesas',
    25,
    0.00,
    true,
    '05:00',
    '22:00'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_espacio3_id;

  -- ============================================================================
  -- 4. ESTADOS DE CUENTA
  -- ============================================================================

  -- Estados para residentes de Las Flores (Enero 2025)
  INSERT INTO estados_cuenta (
    residencial_id, residente_id, periodo,
    total_mantenimiento, total_agua, total_luz, total_otros,
    total_cargos, total_pagado, saldo_pendiente,
    fecha_generacion, fecha_vencimiento
  )
  VALUES (
    v_residencial1_id, v_residente1_id, 'Enero 2025',
    1500.00, 120.00, 0.00, 0.00,
    1620.00, 1620.00, 0.00,
    '2025-01-01', '2025-01-15'
  )
  RETURNING id INTO v_estado1_id;

  INSERT INTO estados_cuenta (
    residencial_id, residente_id, periodo,
    total_mantenimiento, total_agua, total_luz, total_otros,
    total_cargos, total_pagado, saldo_pendiente,
    fecha_generacion, fecha_vencimiento
  )
  VALUES (
    v_residencial1_id, v_residente2_id, 'Enero 2025',
    1500.00, 95.00, 0.00, 0.00,
    1595.00, 1595.00, 0.00,
    '2025-01-01', '2025-01-15'
  )
  RETURNING id INTO v_estado2_id;

  INSERT INTO estados_cuenta (
    residencial_id, residente_id, periodo,
    total_mantenimiento, total_agua, total_luz, total_otros,
    total_cargos, total_pagado, saldo_pendiente,
    fecha_generacion, fecha_vencimiento
  )
  VALUES (
    v_residencial1_id, v_residente3_id, 'Enero 2025',
    1500.00, 110.00, 0.00, 0.00,
    1610.00, 0.00, 1610.00,
    '2025-01-01', '2025-01-15'
  )
  RETURNING id INTO v_estado3_id;

  -- Estados para Febrero 2025
  INSERT INTO estados_cuenta (
    residencial_id, residente_id, periodo,
    total_mantenimiento, total_agua, total_luz, total_otros,
    total_cargos, total_pagado, saldo_pendiente,
    fecha_generacion, fecha_vencimiento
  )
  VALUES
    (v_residencial1_id, v_residente1_id, 'Febrero 2025', 1500.00, 115.00, 0.00, 0.00, 1615.00, 0.00, 1615.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days'),
    (v_residencial1_id, v_residente2_id, 'Febrero 2025', 1500.00, 100.00, 0.00, 0.00, 1600.00, 0.00, 1600.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days'),
    (v_residencial1_id, v_residente3_id, 'Febrero 2025', 1500.00, 105.00, 0.00, 0.00, 1605.00, 0.00, 1605.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days'),
    (v_residencial2_id, v_residente4_id, 'Febrero 2025', 1800.00, 130.00, 0.00, 0.00, 1930.00, 0.00, 1930.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days'),
    (v_residencial2_id, v_residente5_id, 'Febrero 2025', 1800.00, 125.00, 0.00, 0.00, 1925.00, 1925.00, 0.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days'),
    (v_residencial2_id, v_residente6_id, 'Febrero 2025', 1800.00, 140.00, 0.00, 0.00, 1940.00, 0.00, 1940.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days');

  -- ============================================================================
  -- 5. PAGOS
  -- ============================================================================

  INSERT INTO pagos (
    residencial_id, residente_id, estado_cuenta_id,
    monto, fecha_pago, metodo_pago, referencia, estado, comprobante_url, notas
  )
  VALUES
    -- Pagos aprobados
    (v_residencial1_id, v_residente1_id, v_estado1_id, 1620.00, CURRENT_DATE - INTERVAL '25 days', 'transferencia', 'TRANS-2024-001', 'aprobado', '/storage/comprobantes/fake01.pdf', 'Pago de mantenimiento enero'),
    (v_residencial1_id, v_residente2_id, v_estado2_id, 1595.00, CURRENT_DATE - INTERVAL '23 days', 'tarjeta', 'CARD-2024-002', 'aprobado', '/storage/comprobantes/fake02.pdf', NULL),
    (v_residencial2_id, v_residente5_id, NULL, 1925.00, CURRENT_DATE - INTERVAL '5 days', 'efectivo', NULL, 'aprobado', NULL, 'Pago en efectivo recibido por administración'),
    -- Pagos pendientes
    (v_residencial1_id, v_residente1_id, NULL, 1615.00, CURRENT_DATE - INTERVAL '2 days', 'transferencia', 'TRANS-2025-003', 'pendiente', '/storage/comprobantes/fake03.pdf', 'Pago febrero - pendiente verificación'),
    (v_residencial2_id, v_residente4_id, NULL, 1930.00, CURRENT_DATE - INTERVAL '1 day', 'transferencia', 'TRANS-2025-004', 'pendiente', '/storage/comprobantes/fake04.pdf', NULL),
    (v_residencial2_id, v_residente6_id, NULL, 1940.00, CURRENT_DATE, 'tarjeta', 'CARD-2025-005', 'pendiente', NULL, 'Pago con tarjeta de crédito'),
    -- Pago rechazado
    (v_residencial1_id, v_residente3_id, NULL, 1610.00, CURRENT_DATE - INTERVAL '10 days', 'transferencia', 'TRANS-INV-001', 'rechazado', '/storage/comprobantes/fake05.pdf', 'Comprobante no coincide con el monto');

  -- ============================================================================
  -- 6. RESERVAS
  -- ============================================================================

  INSERT INTO reservas (
    residencial_id, espacio_id, residente_id,
    fecha_inicio, fecha_fin, estado, observaciones
  )
  VALUES
    -- Reservas aprobadas
    (v_residencial1_id, v_espacio1_id, v_residente1_id,
     (CURRENT_DATE + INTERVAL '2 days')::timestamp + TIME '10:00',
     (CURRENT_DATE + INTERVAL '2 days')::timestamp + TIME '14:00',
     'aprobada', 'Fiesta de cumpleaños infantil'),

    (v_residencial1_id, v_espacio2_id, v_residente2_id,
     (CURRENT_DATE + INTERVAL '5 days')::timestamp + TIME '18:00',
     (CURRENT_DATE + INTERVAL '5 days')::timestamp + TIME '23:00',
     'aprobada', 'Cena familiar de aniversario'),

    (v_residencial1_id, v_espacio3_id, v_residente3_id,
     (CURRENT_DATE + INTERVAL '1 day')::timestamp + TIME '06:00',
     (CURRENT_DATE + INTERVAL '1 day')::timestamp + TIME '08:00',
     'aprobada', 'Rutina de ejercicio matutina'),

    -- Reservas pendientes
    (v_residencial1_id, v_espacio1_id, v_residente2_id,
     (CURRENT_DATE + INTERVAL '7 days')::timestamp + TIME '15:00',
     (CURRENT_DATE + INTERVAL '7 days')::timestamp + TIME '19:00',
     'pendiente', 'Reunión con amigos'),

    (v_residencial1_id, v_espacio2_id, v_residente1_id,
     (CURRENT_DATE + INTERVAL '10 days')::timestamp + TIME '12:00',
     (CURRENT_DATE + INTERVAL '10 days')::timestamp + TIME '18:00',
     'pendiente', 'Baby shower'),

    -- Reserva rechazada
    (v_residencial1_id, v_espacio1_id, v_residente3_id,
     (CURRENT_DATE + INTERVAL '3 days')::timestamp + TIME '10:00',
     (CURRENT_DATE + INTERVAL '3 days')::timestamp + TIME '14:00',
     'rechazada', 'Conflicto con mantenimiento programado');

  -- ============================================================================
  -- 7. AMONESTACIONES
  -- ============================================================================

  INSERT INTO amonestaciones (
    residencial_id, residente_id, motivo, descripcion,
    nivel, fecha_amonestacion, estado, resolucion
  )
  VALUES
    (v_residencial1_id, v_residente3_id,
     'Ruido excesivo',
     'Se reportó música a alto volumen después de las 10:00 PM en día entre semana, violando el reglamento interno artículo 15.',
     'leve',
     CURRENT_DATE - INTERVAL '15 days',
     'resuelta',
     'El residente se disculpó y se comprometió a respetar los horarios establecidos.'),

    (v_residencial1_id, v_residente2_id,
     'Mal estacionamiento',
     'Vehículo estacionado en área de visitas por más de 48 horas, bloqueando acceso a otros residentes.',
     'moderada',
     CURRENT_DATE - INTERVAL '8 days',
     'activa',
     NULL),

    (v_residencial2_id, v_residente4_id,
     'Basura fuera de horario',
     'Depósito de basura fuera del horario establecido (después de 8 PM), causando mal olor y atrayendo fauna nociva.',
     'leve',
     CURRENT_DATE - INTERVAL '3 days',
     'apelada',
     'El residente presentó apelación alegando emergencia familiar.');

  -- ============================================================================
  -- 8. ACCESOS
  -- ============================================================================

  INSERT INTO accesos (
    residencial_id, residente_id, tipo_acceso, codigo_acceso,
    fecha_activacion, fecha_expiracion, esta_activo, dispositivo_asignado
  )
  VALUES
    (v_residencial1_id, v_residente1_id, 'qr',
     'QR-' || substring(v_residente1_id::text, 1, 12),
     CURRENT_DATE - INTERVAL '30 days', NULL, true, 'Smartphone iOS'),

    (v_residencial1_id, v_residente1_id, 'rfid',
     'RFID-' || substring(v_residente1_id::text, 1, 8),
     CURRENT_DATE - INTERVAL '30 days', NULL, true, 'Tarjeta RFID #1234'),

    (v_residencial1_id, v_residente2_id, 'qr',
     'QR-' || substring(v_residente2_id::text, 1, 12),
     CURRENT_DATE - INTERVAL '25 days', NULL, true, 'Smartphone Android'),

    (v_residencial1_id, v_residente3_id, 'pin',
     '1234',
     CURRENT_DATE - INTERVAL '20 days', NULL, true, 'Teclado principal'),

    (v_residencial2_id, v_residente4_id, 'qr',
     'QR-' || substring(v_residente4_id::text, 1, 12),
     CURRENT_DATE - INTERVAL '15 days', NULL, true, 'Smartphone iOS'),

    (v_residencial2_id, v_residente5_id, 'biometrico',
     'BIO-' || substring(v_residente5_id::text, 1, 10),
     CURRENT_DATE - INTERVAL '10 days', NULL, true, 'Lector de huella digital'),

    -- Acceso temporal (con fecha de expiración)
    (v_residencial1_id, v_residente1_id, 'pin',
     '9876',
     CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', true, 'Código temporal para visitas');

  -- ============================================================================
  -- 9. MUDANZAS
  -- ============================================================================

  INSERT INTO mudanzas (
    residencial_id, residente_id, tipo_mudanza,
    fecha_programada, hora_inicio, hora_fin,
    empresa_mudanza, contacto_empresa, num_personas, vehiculos,
    estado, observaciones
  )
  VALUES
    (v_residencial1_id, v_residente1_id, 'entrada',
     CURRENT_DATE + INTERVAL '3 days', '08:00', '14:00',
     'Mudanzas Express Guatemala', '2245-6789', 4, '1 camión grande',
     'aprobada', 'Aprobado para entrada por portón principal. Coordinar con garita.'),

    (v_residencial2_id, v_residente6_id, 'salida',
     CURRENT_DATE + INTERVAL '7 days', '09:00', '17:00',
     'Transportes Seguros SA', '2256-7890', 5, '1 camión, 1 pickup',
     'pendiente', 'Solicitud recibida. Pendiente de revisión por administración.'),

    (v_residencial1_id, v_residente3_id, 'entrada',
     CURRENT_DATE - INTERVAL '5 days', '10:00', '15:00',
     'Mudanzas Rápidas', '2267-8901', 3, '1 camión mediano',
     'completada', 'Mudanza completada sin incidentes. Todo en orden.');

  -- ============================================================================
  -- 10. SOLICITUDES DE ACCESO (Optional - for additional testing)
  -- ============================================================================

  INSERT INTO solicitudes_acceso (
    residencial_id, residente_id, tipo_solicitud,
    nombre_visitante, dpi_visitante, fecha_inicio, fecha_fin,
    motivo, estado, observaciones
  )
  VALUES
    (v_residencial1_id, v_residente1_id, 'visitante',
     'Marco Antonio Pérez', '1234567890101',
     CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '2 days',
     'Visita familiar', 'aprobada', 'Acceso aprobado por 1 día'),

    (v_residencial1_id, v_residente2_id, 'trabajador',
     'José Luis Técnico', '9876543210101',
     CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day',
     'Reparación de electrodomésticos', 'pendiente', 'Solicitud recibida hoy'),

    (v_residencial2_id, v_residente4_id, 'proveedor',
     'Agua Purificada El Manantial', NULL,
     CURRENT_DATE, CURRENT_DATE,
     'Entrega de garrafones de agua', 'aprobada', 'Proveedor registrado');

END $$;
