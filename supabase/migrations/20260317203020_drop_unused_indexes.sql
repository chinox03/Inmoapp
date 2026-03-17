/*
  # Drop Unused Indexes

  1. Problem
    - 83 indexes across all tables have not been used, consuming storage and slowing writes

  2. Indexes Dropped
    - profiles: idx_profiles_residencial_id, idx_profiles_rol
    - residencias: idx_residencias_residencial_id
    - audit_log: idx_audit_log_residencial_id, idx_audit_log_user_id, idx_audit_log_created_at, idx_audit_log_entidad
    - estados_cuenta: idx_estados_cuenta_residencial_id, idx_estados_cuenta_residente_id, idx_estados_cuenta_periodo, idx_estados_cuenta_deleted_at
    - pagos: idx_pagos_residencial_id, idx_pagos_residente_id, idx_pagos_estado, idx_pagos_fecha_pago, idx_pagos_fecha, idx_pagos_deleted_at, idx_pagos_aprobado_por
    - espacios: idx_espacios_residencial_id, idx_espacios_estado, idx_espacios_deleted_at
    - reservas: idx_reservas_espacio_id, idx_reservas_residente_id, idx_reservas_fecha, idx_reservas_estado, idx_reservas_deleted_at, idx_reservas_aprobado_por
    - amonestaciones: idx_amonestaciones_residencial_id, idx_amonestaciones_emisor_id, idx_amonestaciones_receptor_id, idx_amonestaciones_estado, idx_amonestaciones_deleted_at
    - accesos: idx_accesos_residente_id, idx_accesos_estado, idx_accesos_codigo, idx_accesos_deleted_at, idx_accesos_aprobado_por
    - solicitudes_acceso: idx_solicitudes_acceso_residente_id, idx_solicitudes_acceso_estado, idx_solicitudes_acceso_aprobado_por
    - mudanzas: idx_mudanzas_residencial_id, idx_mudanzas_residente_id, idx_mudanzas_fecha, idx_mudanzas_estado, idx_mudanzas_deleted_at, idx_mudanzas_aprobado_por
    - garita_registros: idx_garita_registros_mudanza_id, idx_garita_registros_guardia_id
    - entregas: idx_entregas_estado, idx_entregas_residencial, idx_entregas_deleted_at, idx_entregas_creado_por, idx_entregas_residente_id
    - visitas: idx_visitas_residencial, idx_visitas_residente, idx_visitas_estado, idx_visitas_deleted_at, idx_visitas_registrado_por
    - encuestas: idx_encuestas_residencial, idx_encuestas_tipo, idx_encuestas_deleted_at, idx_encuestas_residente_id
    - entregas_tickets: idx_entregas_tickets_deleted_at, idx_entregas_tickets_entrega_id
    - garantias: idx_garantias_residencial, idx_garantias_estado, idx_garantias_numero, idx_garantias_deleted_at, idx_garantias_residente_id, idx_garantias_revisado_por
    - webhook_endpoints: idx_webhook_endpoints_activo, idx_webhook_endpoints_creado_por
    - webhook_logs: idx_webhook_logs_endpoint, idx_webhook_logs_evento
    - prospectos: idx_prospectos_estado, idx_prospectos_created, idx_prospectos_origen, idx_prospectos_deleted_at
    - negocios: idx_negocios_etapa, idx_negocios_prospecto, idx_negocios_created, idx_negocios_proyecto, idx_negocios_deleted_at
    - residenciales: idx_residenciales_deleted_at

  3. Notes
    - These indexes can be recreated if query patterns change
    - No data is affected
*/

-- profiles
DROP INDEX IF EXISTS public.idx_profiles_residencial_id;
DROP INDEX IF EXISTS public.idx_profiles_rol;

-- residencias
DROP INDEX IF EXISTS public.idx_residencias_residencial_id;

-- audit_log
DROP INDEX IF EXISTS public.idx_audit_log_residencial_id;
DROP INDEX IF EXISTS public.idx_audit_log_user_id;
DROP INDEX IF EXISTS public.idx_audit_log_created_at;
DROP INDEX IF EXISTS public.idx_audit_log_entidad;

-- estados_cuenta
DROP INDEX IF EXISTS public.idx_estados_cuenta_residencial_id;
DROP INDEX IF EXISTS public.idx_estados_cuenta_residente_id;
DROP INDEX IF EXISTS public.idx_estados_cuenta_periodo;
DROP INDEX IF EXISTS public.idx_estados_cuenta_deleted_at;

-- pagos
DROP INDEX IF EXISTS public.idx_pagos_residencial_id;
DROP INDEX IF EXISTS public.idx_pagos_residente_id;
DROP INDEX IF EXISTS public.idx_pagos_estado;
DROP INDEX IF EXISTS public.idx_pagos_fecha_pago;
DROP INDEX IF EXISTS public.idx_pagos_fecha;
DROP INDEX IF EXISTS public.idx_pagos_deleted_at;
DROP INDEX IF EXISTS public.idx_pagos_aprobado_por;

-- espacios
DROP INDEX IF EXISTS public.idx_espacios_residencial_id;
DROP INDEX IF EXISTS public.idx_espacios_estado;
DROP INDEX IF EXISTS public.idx_espacios_deleted_at;

-- reservas
DROP INDEX IF EXISTS public.idx_reservas_espacio_id;
DROP INDEX IF EXISTS public.idx_reservas_residente_id;
DROP INDEX IF EXISTS public.idx_reservas_fecha;
DROP INDEX IF EXISTS public.idx_reservas_estado;
DROP INDEX IF EXISTS public.idx_reservas_deleted_at;
DROP INDEX IF EXISTS public.idx_reservas_aprobado_por;

-- amonestaciones
DROP INDEX IF EXISTS public.idx_amonestaciones_residencial_id;
DROP INDEX IF EXISTS public.idx_amonestaciones_emisor_id;
DROP INDEX IF EXISTS public.idx_amonestaciones_receptor_id;
DROP INDEX IF EXISTS public.idx_amonestaciones_estado;
DROP INDEX IF EXISTS public.idx_amonestaciones_deleted_at;

-- accesos
DROP INDEX IF EXISTS public.idx_accesos_residente_id;
DROP INDEX IF EXISTS public.idx_accesos_estado;
DROP INDEX IF EXISTS public.idx_accesos_codigo;
DROP INDEX IF EXISTS public.idx_accesos_deleted_at;
DROP INDEX IF EXISTS public.idx_accesos_aprobado_por;

-- solicitudes_acceso
DROP INDEX IF EXISTS public.idx_solicitudes_acceso_residente_id;
DROP INDEX IF EXISTS public.idx_solicitudes_acceso_estado;
DROP INDEX IF EXISTS public.idx_solicitudes_acceso_aprobado_por;

-- mudanzas
DROP INDEX IF EXISTS public.idx_mudanzas_residencial_id;
DROP INDEX IF EXISTS public.idx_mudanzas_residente_id;
DROP INDEX IF EXISTS public.idx_mudanzas_fecha;
DROP INDEX IF EXISTS public.idx_mudanzas_estado;
DROP INDEX IF EXISTS public.idx_mudanzas_deleted_at;
DROP INDEX IF EXISTS public.idx_mudanzas_aprobado_por;

-- garita_registros
DROP INDEX IF EXISTS public.idx_garita_registros_mudanza_id;
DROP INDEX IF EXISTS public.idx_garita_registros_guardia_id;

-- entregas
DROP INDEX IF EXISTS public.idx_entregas_estado;
DROP INDEX IF EXISTS public.idx_entregas_residencial;
DROP INDEX IF EXISTS public.idx_entregas_deleted_at;
DROP INDEX IF EXISTS public.idx_entregas_creado_por;
DROP INDEX IF EXISTS public.idx_entregas_residente_id;

-- visitas
DROP INDEX IF EXISTS public.idx_visitas_residencial;
DROP INDEX IF EXISTS public.idx_visitas_residente;
DROP INDEX IF EXISTS public.idx_visitas_estado;
DROP INDEX IF EXISTS public.idx_visitas_deleted_at;
DROP INDEX IF EXISTS public.idx_visitas_registrado_por;

-- encuestas
DROP INDEX IF EXISTS public.idx_encuestas_residencial;
DROP INDEX IF EXISTS public.idx_encuestas_tipo;
DROP INDEX IF EXISTS public.idx_encuestas_deleted_at;
DROP INDEX IF EXISTS public.idx_encuestas_residente_id;

-- entregas_tickets
DROP INDEX IF EXISTS public.idx_entregas_tickets_deleted_at;
DROP INDEX IF EXISTS public.idx_entregas_tickets_entrega_id;

-- garantias
DROP INDEX IF EXISTS public.idx_garantias_residencial;
DROP INDEX IF EXISTS public.idx_garantias_estado;
DROP INDEX IF EXISTS public.idx_garantias_numero;
DROP INDEX IF EXISTS public.idx_garantias_deleted_at;
DROP INDEX IF EXISTS public.idx_garantias_residente_id;
DROP INDEX IF EXISTS public.idx_garantias_revisado_por;

-- webhook_endpoints
DROP INDEX IF EXISTS public.idx_webhook_endpoints_activo;
DROP INDEX IF EXISTS public.idx_webhook_endpoints_creado_por;

-- webhook_logs
DROP INDEX IF EXISTS public.idx_webhook_logs_endpoint;
DROP INDEX IF EXISTS public.idx_webhook_logs_evento;

-- prospectos
DROP INDEX IF EXISTS public.idx_prospectos_estado;
DROP INDEX IF EXISTS public.idx_prospectos_created;
DROP INDEX IF EXISTS public.idx_prospectos_origen;
DROP INDEX IF EXISTS public.idx_prospectos_deleted_at;

-- negocios
DROP INDEX IF EXISTS public.idx_negocios_etapa;
DROP INDEX IF EXISTS public.idx_negocios_prospecto;
DROP INDEX IF EXISTS public.idx_negocios_created;
DROP INDEX IF EXISTS public.idx_negocios_proyecto;
DROP INDEX IF EXISTS public.idx_negocios_deleted_at;

-- residenciales
DROP INDEX IF EXISTS public.idx_residenciales_deleted_at;
