import { User, UserRole } from '../types/database.types';

type Action = 'create' | 'read' | 'update' | 'delete';
type Resource =
  | 'residenciales' | 'usuarios' | 'residentes' | 'auditoria'
  | 'estados' | 'pagos' | 'amonestaciones' | 'espacios'
  | 'reservas' | 'accesos' | 'mudanzas'
  | 'prospectos' | 'negocios' | 'reservas_comerciales' | 'pcv'
  | 'comisiones' | 'insights' | 'encuestas' | 'visitas'
  | 'entregas' | 'garantias' | 'calendario' | 'webhooks';

interface Permission {
  roles: UserRole[];
  actions: Action[];
}

const PERMISSIONS: Record<Resource, Permission> = {
  residenciales: {
    roles: ['SUPERADMIN'],
    actions: ['create', 'read', 'update', 'delete'],
  },
  usuarios: {
    roles: ['SUPERADMIN'],
    actions: ['create', 'read', 'update', 'delete'],
  },
  residentes: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
    actions: ['create', 'read', 'update', 'delete'],
  },
  auditoria: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
    actions: ['read'],
  },
  estados: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL', 'RESIDENTE'],
    actions: ['read'],
  },
  pagos: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
    actions: ['create', 'read', 'update'],
  },
  amonestaciones: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL', 'RESIDENTE'],
    actions: ['create', 'read', 'update'],
  },
  espacios: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
    actions: ['create', 'read', 'update', 'delete'],
  },
  reservas: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL', 'RESIDENTE'],
    actions: ['create', 'read', 'update', 'delete'],
  },
  accesos: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL', 'IT', 'RESIDENTE'],
    actions: ['read'],
  },
  mudanzas: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL', 'SEGURIDAD', 'RESIDENTE'],
    actions: ['create', 'read', 'update'],
  },
  prospectos: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
    actions: ['create', 'read', 'update', 'delete'],
  },
  negocios: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
    actions: ['create', 'read', 'update', 'delete'],
  },
  reservas_comerciales: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
    actions: ['create', 'read', 'update', 'delete'],
  },
  pcv: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
    actions: ['create', 'read', 'update'],
  },
  comisiones: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
    actions: ['create', 'read', 'update'],
  },
  insights: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
    actions: ['read'],
  },
  encuestas: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
    actions: ['create', 'read', 'update', 'delete'],
  },
  visitas: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL', 'SEGURIDAD'],
    actions: ['create', 'read', 'update'],
  },
  entregas: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
    actions: ['create', 'read', 'update'],
  },
  garantias: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL', 'RESIDENTE'],
    actions: ['create', 'read', 'update'],
  },
  calendario: {
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL', 'SEGURIDAD', 'RESIDENTE'],
    actions: ['read'],
  },
  webhooks: {
    roles: ['SUPERADMIN'],
    actions: ['create', 'read', 'update', 'delete'],
  },
};

export function can(user: User | null, action: Action, resource: Resource): boolean {
  if (!user) return false;

  const permission = PERMISSIONS[resource];
  if (!permission) return false;

  return permission.roles.includes(user.rol) && permission.actions.includes(action);
}

export function hasRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.rol);
}
