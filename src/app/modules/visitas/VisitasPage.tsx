import { useState, useEffect, useCallback } from 'react';
import { Plus, Users, UserCheck, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { DataTable } from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { VisitRegistrationModal } from './VisitRegistrationModal';
import { getVisits, addVisit, markVisitAsCompleted, getVisitStats, deleteVisit } from './service';
import { Visit, VisitFormData } from './types';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export function VisitasPage() {
  const { showToast } = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'month' | 'range'>('all');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    todayTotal: 0,
    todayActive: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [visitsData, statsData] = await Promise.all([
        getVisits(),
        getVisitStats(),
      ]);
      setVisits(visitsData);
      setStats(statsData);
    } catch {
      showToast('Error al cargar visitas', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let filtered = [...visits];

    if (filterType === 'month' && selectedMonth) {
      const monthDate = new Date(selectedMonth + '-01');
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      filtered = visits.filter(visit => {
        const visitDate = parseISO(visit.timestamp);
        return isWithinInterval(visitDate, { start, end });
      });
    } else if (filterType === 'range' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filtered = visits.filter(visit => {
        const visitDate = parseISO(visit.timestamp);
        return isWithinInterval(visitDate, { start, end });
      });
    }

    setFilteredVisits(filtered);
  }, [filterType, selectedMonth, startDate, endDate, visits]);

  const handleRegisterVisit = async (formData: VisitFormData & {
    residentName: string;
    unitNumber: string;
    residencialName?: string;
  }) => {
    const result = await addVisit(formData, 'current-user');
    if (result.success && result.data) {
      setVisits(prev => [result.data!, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        active: prev.active + 1,
        todayTotal: prev.todayTotal + 1,
        todayActive: prev.todayActive + 1,
      }));
      showToast('Visita registrada exitosamente', 'success');
    } else {
      showToast(result.error || 'Error al registrar visita', 'error');
    }
  };

  const handleMarkAsCompleted = async (visitId: string) => {
    const result = await markVisitAsCompleted(visitId);
    if (result.success) {
      setVisits(prev =>
        prev.map(visit =>
          visit.id === visitId
            ? { ...visit, status: 'completed' as const, exitTime: new Date().toISOString() }
            : visit
        )
      );
      setStats(prev => ({
        ...prev,
        active: Math.max(0, prev.active - 1),
        todayActive: Math.max(0, prev.todayActive - 1),
      }));
      showToast('Salida registrada exitosamente', 'success');
    } else {
      showToast(result.error || 'Error al registrar salida', 'error');
    }
  };

  const columns = [
    {
      key: 'timestamp',
      label: 'Fecha y Hora',
      sortable: true,
      render: (visit: Visit) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {format(new Date(visit.timestamp), 'dd/MM/yyyy')}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {format(new Date(visit.timestamp), 'HH:mm')}
          </p>
        </div>
      ),
    },
    {
      key: 'visitorFirstName',
      label: 'Visitante',
      sortable: true,
      render: (visit: Visit) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {visit.visitorFirstName} {visit.visitorLastName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{visit.visitorDocumentNumber}</p>
        </div>
      ),
    },
    {
      key: 'residentName',
      label: 'Residente',
      sortable: true,
      render: (visit: Visit) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{visit.residentName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{visit.unitNumber}</p>
        </div>
      ),
    },
    {
      key: 'residencialName',
      label: 'Residencial',
      sortable: true,
      render: (visit: Visit) => (
        <p className="text-sm text-gray-700 dark:text-gray-300">{visit.residencialName}</p>
      ),
    },
    {
      key: 'visitPurpose',
      label: 'Motivo',
      render: (visit: Visit) => (
        <p className="text-sm text-gray-700 dark:text-gray-300">{visit.visitPurpose}</p>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (visit: Visit) => (
        <div>
          {visit.status === 'active' ? (
            <Badge variant="success">Activa</Badge>
          ) : (
            <Badge variant="default">Completada</Badge>
          )}
          {visit.exitTime && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Salida: {format(new Date(visit.exitTime), 'HH:mm')}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'id',
      label: 'Acciones',
      render: (visit: Visit) => (
        <div className="flex gap-2">
          {visit.status === 'active' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkAsCompleted(visit.id)}
            >
              Marcar Salida
            </Button>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">Finalizada</span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeleteTarget(visit)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Control de Visitas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Registro y seguimiento de visitantes en el residencial
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 rounded-lg bg-primary-500 px-6 py-3 text-white font-medium hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Registrar Visita</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Visitas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Visitas Activas</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {stats.active}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Visitas Hoy</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.todayTotal}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Activas Hoy</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {stats.todayActive}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.active > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="py-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-orange-900">
                  Hay {stats.active} visita{stats.active !== 1 ? 's' : ''} activa
                  {stats.active !== 1 ? 's' : ''} en este momento
                </p>
                <p className="text-sm text-orange-700 mt-0.5">
                  Recuerda registrar la salida cuando los visitantes se retiren
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Historial de Visitas
            </h2>
            <div className="flex items-center space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'month' | 'range')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="all">Todas</option>
                <option value="month">Por Mes</option>
                <option value="range">Por Rango</option>
              </select>

              {filterType === 'month' && (
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-48"
                />
              )}

              {filterType === 'range' && (
                <>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Desde"
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="Hasta"
                    className="w-40"
                  />
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredVisits} loading={loading} />
        </CardContent>
      </Card>

      <VisitRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRegisterVisit}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const result = await deleteVisit(deleteTarget.id);
          if (result.success) {
            showToast('Visita eliminada exitosamente', 'success');
            setDeleteTarget(null);
            loadData();
          } else {
            showToast(result.error || 'Error al eliminar visita', 'error');
          }
        }}
        itemName={deleteTarget ? `Visita de ${deleteTarget.visitorFirstName} ${deleteTarget.visitorLastName}` : ''}
      />
    </div>
  );
}
