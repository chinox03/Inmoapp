-- Sample Data for Phase 2 Modules
-- Run this in Supabase SQL Editor after confirming residencial_id and user IDs

-- Get the first residencial_id and residente_id for reference
-- Replace these with actual IDs from your database
DO $$
DECLARE
  v_residencial_id UUID;
  v_residente_id UUID;
  v_admin_id UUID;
  v_espacio1_id UUID;
  v_espacio2_id UUID;
BEGIN
  -- Get first residencial
  SELECT id INTO v_residencial_id FROM residenciales LIMIT 1;

  -- Get first residente
  SELECT id INTO v_residente_id FROM profiles WHERE rol = 'RESIDENTE' LIMIT 1;

  -- Get admin user
  SELECT id INTO v_admin_id FROM profiles WHERE rol IN ('SUPERADMIN', 'ADMIN_RESIDENCIAL') LIMIT 1;

  -- Insert sample Espacios
  INSERT INTO espacios (residencial_id, nombre, descripcion, capacidad, precio_renta, esta_activo, horario_inicio, horario_fin)
  VALUES
    (v_residencial_id, 'Salón de Eventos', 'Salón amplio para eventos y fiestas', 100, 2500.00, true, '09:00', '23:00')
  RETURNING id INTO v_espacio1_id;

  INSERT INTO espacios (residencial_id, nombre, descripcion, capacidad, precio_renta, esta_activo, horario_inicio, horario_fin)
  VALUES
    (v_residencial_id, 'Área de BBQ', 'Área exterior con parrillas y mesas', 30, 800.00, true, '10:00', '22:00')
  RETURNING id INTO v_espacio2_id;

  INSERT INTO espacios (residencial_id, nombre, descripcion, capacidad, precio_renta, esta_activo)
  VALUES
    (v_residencial_id, 'Alberca', 'Alberca semiolímpica con área de chapoteadero', 50, 1500.00, true);

  -- Insert sample Reservas
  INSERT INTO reservas (residencial_id, espacio_id, residente_id, fecha_inicio, fecha_fin, estado, observaciones)
  VALUES
    (v_residencial_id, v_espacio1_id, v_residente_id,
     NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '5 hours',
     'pendiente', 'Fiesta de cumpleaños'),
    (v_residencial_id, v_espacio2_id, v_residente_id,
     NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
     'aprobada', 'Reunión familiar');

  -- Insert sample Pagos
  INSERT INTO pagos (residencial_id, residente_id, monto, fecha_pago, metodo_pago, referencia, estado)
  VALUES
    (v_residencial_id, v_residente_id, 1500.00, CURRENT_DATE - INTERVAL '5 days', 'transferencia', 'REF123456', 'aprobado'),
    (v_residencial_id, v_residente_id, 1500.00, CURRENT_DATE - INTERVAL '1 day', 'transferencia', 'REF789012', 'pendiente'),
    (v_residencial_id, v_residente_id, 1500.00, CURRENT_DATE - INTERVAL '35 days', 'efectivo', NULL, 'aprobado');

  -- Insert sample Amonestaciones
  INSERT INTO amonestaciones (residencial_id, residente_id, motivo, descripcion, nivel, fecha_amonestacion, estado)
  VALUES
    (v_residencial_id, v_residente_id,
     'Ruido excesivo',
     'Música a alto volumen después de las 10pm en día entre semana',
     'leve',
     CURRENT_DATE - INTERVAL '15 days',
     'resuelta');

  -- Insert sample Accesos
  INSERT INTO accesos (residencial_id, residente_id, tipo_acceso, codigo_acceso, fecha_activacion, esta_activo)
  VALUES
    (v_residencial_id, v_residente_id, 'qr', 'QR-' || v_residente_id::TEXT, CURRENT_DATE - INTERVAL '30 days', true),
    (v_residencial_id, v_residente_id, 'rfid', 'RFID-' || substring(v_residente_id::TEXT, 1, 8), CURRENT_DATE - INTERVAL '30 days', true);

  -- Insert sample Mudanzas
  INSERT INTO mudanzas (residencial_id, residente_id, tipo_mudanza, fecha_programada, hora_inicio, hora_fin, empresa_mudanza, estado)
  VALUES
    (v_residencial_id, v_residente_id,
     'entrada',
     CURRENT_DATE + INTERVAL '10 days',
     '09:00', '15:00',
     'Mudanzas Express SA',
     'pendiente');

END $$;
