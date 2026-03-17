import { useAuth } from '../contexts/AuthContext';
import { useResidencial } from '../contexts/ResidencialContext';

export function useCurrentUser() {
  const { user } = useAuth();
  const { selectedResidencial } = useResidencial();

  return {
    user,
    selectedResidencial,
    isAuthenticated: !!user,
    isSuperAdmin: user?.rol === 'SUPERADMIN',
    residencialId: user?.residencial_id,
  };
}
