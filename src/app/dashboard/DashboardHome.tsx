import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useResidencial } from '../../contexts/ResidencialContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Users, Receipt, Calendar, Building2 } from 'lucide-react';
import { ROLE_COLORS, ROLE_LABELS } from '../../utils/constants';
import { getDashboardStats } from './service';

export function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedResidencial } = useResidencial();
  const [stats, setStats] = useState({
    totalResidentes: 0,
    pagosPendientes: 0,
    reservasActivas: 0,
    totalResidenciales: 0,
  });

  useEffect(() => {
    loadStats();
  }, [user, selectedResidencial]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const newStats = await getDashboardStats(user);
      setStats(newStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Bienvenido, {user.nombre}
        </h1>
        <div className="flex items-center space-x-2">
          <Badge className={ROLE_COLORS[user.rol]}>
            {ROLE_LABELS[user.rol]}
          </Badge>
          {selectedResidencial && (
            <Badge variant="info">
              {selectedResidencial.nombre}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/dashboard/residentes')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {user.rol === 'SUPERADMIN' ? 'Total Residentes' : 'Residentes'}
              </h3>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalResidentes}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {user.rol === 'SUPERADMIN' ? 'En todo el sistema' : 'En tu residencial'}
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/dashboard/pagos')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Pagos Pendientes</h3>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                <Receipt className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.pagosPendientes}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Por aprobar</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/dashboard/reservas')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Reservas Activas</h3>
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.reservasActivas}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pendientes y aprobadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Información del Sistema</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Versión</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Fase 2</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tu Rol</span>
              <Badge className={ROLE_COLORS[user.rol]}>
                {ROLE_LABELS[user.rol]}
              </Badge>
            </div>
            {user.rol === 'SUPERADMIN' && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Residenciales</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{stats.totalResidenciales}</span>
              </div>
            )}
            {selectedResidencial && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Residencial</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedResidencial.nombre} ({selectedResidencial.codigo})
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
