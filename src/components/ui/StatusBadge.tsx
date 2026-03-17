import React from 'react';
import { Badge } from './Badge';
import {
  PagoEstado,
  ReservaEstado,
  AmonestacionEstado,
  AccesoEstado,
  MudanzaEstado,
  EspacioEstado
} from '../../types/database.types';

interface StatusBadgeProps {
  status: PagoEstado | ReservaEstado | AmonestacionEstado | AccesoEstado | MudanzaEstado | EspacioEstado;
  type: 'pago' | 'reserva' | 'amonestacion' | 'acceso' | 'mudanza' | 'espacio';
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const configs: Record<string, Record<string, { label: string; variant: string }>> = {
    pago: {
      pendiente: { label: 'Pendiente', variant: 'bg-yellow-100 text-yellow-800' },
      aprobado: { label: 'Aprobado', variant: 'bg-green-100 text-green-800' },
      rechazado: { label: 'Rechazado', variant: 'bg-red-100 text-red-800' },
    },
    reserva: {
      pendiente: { label: 'Pendiente', variant: 'bg-yellow-100 text-yellow-800' },
      aprobada: { label: 'Aprobada', variant: 'bg-green-100 text-green-800' },
      rechazada: { label: 'Rechazada', variant: 'bg-red-100 text-red-800' },
      cancelada: { label: 'Cancelada', variant: 'bg-gray-100 text-gray-800' },
      completada: { label: 'Completada', variant: 'bg-blue-100 text-blue-800' },
    },
    amonestacion: {
      emitida: { label: 'Emitida', variant: 'bg-orange-100 text-orange-800' },
      apelada: { label: 'Apelada', variant: 'bg-blue-100 text-blue-800' },
      cerrada: { label: 'Cerrada', variant: 'bg-gray-100 text-gray-800' },
    },
    acceso: {
      activo: { label: 'Activo', variant: 'bg-green-100 text-green-800' },
      expirado: { label: 'Expirado', variant: 'bg-gray-100 text-gray-800' },
      revocado: { label: 'Revocado', variant: 'bg-red-100 text-red-800' },
    },
    mudanza: {
      solicitada: { label: 'Solicitada', variant: 'bg-yellow-100 text-yellow-800' },
      aprobada: { label: 'Aprobada', variant: 'bg-green-100 text-green-800' },
      en_proceso: { label: 'En Proceso', variant: 'bg-blue-100 text-blue-800' },
      completada: { label: 'Completada', variant: 'bg-gray-100 text-gray-800' },
      cancelada: { label: 'Cancelada', variant: 'bg-red-100 text-red-800' },
    },
    espacio: {
      activo: { label: 'Activo', variant: 'bg-green-100 text-green-800' },
      inactivo: { label: 'Inactivo', variant: 'bg-gray-100 text-gray-800' },
      mantenimiento: { label: 'Mantenimiento', variant: 'bg-yellow-100 text-yellow-800' },
    },
  };

  const config = configs[type]?.[status];
  if (!config) return <Badge>{status}</Badge>;

  return <Badge className={config.variant}>{config.label}</Badge>;
}
