import { User, UserRole } from '../types/database.types';

export const DEV_MODE_ENABLED = true;

export const DEV_ROLE: UserRole = 'SUPERADMIN';

export const DEV_MOCK_USER_ID = 'mock-superadmin-dev-id';

export const DEV_MOCK_USER: User = {
  id: DEV_MOCK_USER_ID,
  email: 'dev@conversion.tech',
  nombre: 'Administrador Desarrollo',
  telefono: '+502 5555 5555',
  rol: DEV_ROLE,
  residencial_id: 'dev-all-access',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const isDevelopmentMode = () => {
  return DEV_MODE_ENABLED;
};

export const shouldBypassFilters = () => {
  return DEV_MODE_ENABLED;
};
