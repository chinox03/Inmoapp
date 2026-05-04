import { UserRole } from '../types/database.types';
import { Home, Building2, Users, FileText, Receipt, CreditCard, AlertTriangle, Calendar, KeyRound, Truck, Phone, UserCheck, PackageCheck, Shield, UserPlus, Briefcase, ClipboardCheck, Ligature as FileSignature, DollarSign, BarChart3, Wrench } from 'lucide-react';

export interface NavigationItem {
  label: string;
  path: string;
  icon: any;
  roles: UserRole[];
  readOnly?: boolean;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Inicio',
    path: '/dashboard',
    icon: Home,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL', 'IT', 'SEGURIDAD', 'RESIDENTE'],
  },
  {
    label: 'Residenciales',
    path: '/dashboard/residenciales',
    icon: Building2,
    roles: ['SUPERADMIN'],
  },
  {
    label: 'Usuarios',
    path: '/dashboard/usuarios',
    icon: Users,
    roles: ['SUPERADMIN'],
  },
  {
    label: 'Auditoría',
    path: '/dashboard/auditoria',
    icon: FileText,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Residentes',
    path: '/dashboard/residentes',
    icon: Users,
    roles: ['ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Estados de Cuenta',
    path: '/dashboard/estados',
    icon: Receipt,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Mi Estado de Cuenta',
    path: '/dashboard/mi-estado',
    icon: Receipt,
    roles: ['RESIDENTE'],
  },
  {
    label: 'Pagos',
    path: '/dashboard/pagos',
    icon: CreditCard,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Amonestaciones',
    path: '/dashboard/amonestaciones',
    icon: AlertTriangle,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Mis Amonestaciones',
    path: '/dashboard/mis-amonestaciones',
    icon: AlertTriangle,
    roles: ['RESIDENTE'],
  },
  {
    label: 'Espacios Comunes',
    path: '/dashboard/espacios',
    icon: Calendar,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Reservas',
    path: '/dashboard/reservas',
    icon: Calendar,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Mis Reservas',
    path: '/dashboard/mis-reservas',
    icon: Calendar,
    roles: ['RESIDENTE'],
  },
  {
    label: 'Accesos',
    path: '/dashboard/accesos',
    icon: KeyRound,
    roles: ['SUPERADMIN', 'IT'],
  },
  {
    label: 'Accesos',
    path: '/dashboard/accesos',
    icon: KeyRound,
    roles: ['ADMIN_RESIDENCIAL'],
    readOnly: true,
  },
  {
    label: 'Mis Accesos',
    path: '/dashboard/mis-accesos',
    icon: KeyRound,
    roles: ['RESIDENTE'],
  },
  {
    label: 'Mudanzas',
    path: '/dashboard/mudanzas',
    icon: Truck,
    roles: ['SUPERADMIN', 'SEGURIDAD'],
  },
  {
    label: 'Mudanzas',
    path: '/dashboard/mudanzas',
    icon: Truck,
    roles: ['ADMIN_RESIDENCIAL'],
    readOnly: true,
  },
  {
    label: 'Mis Mudanzas',
    path: '/dashboard/mis-mudanzas',
    icon: Truck,
    roles: ['RESIDENTE'],
  },
  {
    label: 'Encuestas Telefónicas',
    path: '/dashboard/encuestas',
    icon: Phone,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Calendario',
    path: '/dashboard/calendario',
    icon: Calendar,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL', 'SEGURIDAD'],
  },
  {
    label: 'Control de Visitas',
    path: '/dashboard/visitas',
    icon: UserCheck,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL', 'SEGURIDAD'],
  },
  {
    label: 'Entrega de Unidades',
    path: '/dashboard/entregas',
    icon: PackageCheck,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Garantías',
    path: '/dashboard/garantias',
    icon: Shield,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Prospectos',
    path: '/dashboard/prospectos',
    icon: UserPlus,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Negocios',
    path: '/dashboard/negocios',
    icon: Briefcase,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Reservas Comerciales',
    path: '/dashboard/reservas-comerciales',
    icon: ClipboardCheck,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'PCV',
    path: '/dashboard/pcv',
    icon: FileSignature,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Comisiones',
    path: '/dashboard/comisiones',
    icon: DollarSign,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Insights',
    path: '/dashboard/insights',
    icon: BarChart3,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Mantenimiento',
    path: '/dashboard/mantenimiento',
    icon: Wrench,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
  {
    label: 'Config. Entregas',
    path: '/dashboard/configuracion-entregas',
    icon: PackageCheck,
    roles: ['SUPERADMIN', 'ADMIN_RESIDENCIAL'],
  },
];

export const ROLE_COLORS: Record<UserRole, string> = {
  SUPERADMIN: 'bg-red-100 text-red-800',
  ADMIN_RESIDENCIAL: 'bg-blue-100 text-blue-800',
  IT: 'bg-purple-100 text-purple-800',
  SEGURIDAD: 'bg-orange-100 text-orange-800',
  RESIDENTE: 'bg-green-100 text-green-800',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN_RESIDENCIAL: 'Admin Residencial',
  IT: 'IT',
  SEGURIDAD: 'Seguridad',
  RESIDENTE: 'Residente',
};
