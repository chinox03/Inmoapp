/*
  # Add Missing Foreign Key Indexes

  1. Problem
    - Several foreign key columns lack covering indexes, causing suboptimal JOIN and DELETE performance

  2. New Indexes
    - `accesos.aprobado_por` (fk to profiles)
    - `encuestas.residente_id` (fk to profiles)
    - `entregas.creado_por` (fk to profiles)
    - `entregas.residente_id` (fk to profiles)
    - `entregas_tickets.entrega_id` (fk to entregas)
    - `garantias.residente_id` (fk to profiles)
    - `garantias.revisado_por` (fk to profiles)
    - `mudanzas.aprobado_por` (fk to profiles)
    - `pagos.aprobado_por` (fk to profiles)
    - `reservas.aprobado_por` (fk to profiles)
    - `solicitudes_acceso.aprobado_por` (fk to profiles)
    - `visitas.registrado_por` (fk to profiles)
    - `webhook_endpoints.creado_por` (fk to profiles)

  3. Notes
    - All indexes use IF NOT EXISTS to be safe for re-runs
*/

CREATE INDEX IF NOT EXISTS idx_accesos_aprobado_por ON public.accesos (aprobado_por);
CREATE INDEX IF NOT EXISTS idx_encuestas_residente_id ON public.encuestas (residente_id);
CREATE INDEX IF NOT EXISTS idx_entregas_creado_por ON public.entregas (creado_por);
CREATE INDEX IF NOT EXISTS idx_entregas_residente_id ON public.entregas (residente_id);
CREATE INDEX IF NOT EXISTS idx_entregas_tickets_entrega_id ON public.entregas_tickets (entrega_id);
CREATE INDEX IF NOT EXISTS idx_garantias_residente_id ON public.garantias (residente_id);
CREATE INDEX IF NOT EXISTS idx_garantias_revisado_por ON public.garantias (revisado_por);
CREATE INDEX IF NOT EXISTS idx_mudanzas_aprobado_por ON public.mudanzas (aprobado_por);
CREATE INDEX IF NOT EXISTS idx_pagos_aprobado_por ON public.pagos (aprobado_por);
CREATE INDEX IF NOT EXISTS idx_reservas_aprobado_por ON public.reservas (aprobado_por);
CREATE INDEX IF NOT EXISTS idx_solicitudes_acceso_aprobado_por ON public.solicitudes_acceso (aprobado_por);
CREATE INDEX IF NOT EXISTS idx_visitas_registrado_por ON public.visitas (registrado_por);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_creado_por ON public.webhook_endpoints (creado_por);
