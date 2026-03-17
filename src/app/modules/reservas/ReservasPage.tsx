import React, { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle, XCircle, CalendarRange, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useResidencial } from '../../../contexts/ResidencialContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Dialog, DialogFooter } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useToast } from '../../../components/ui/Toast';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { getReservas, createReserva, updateReserva, deleteReserva, getEspaciosDisponibles } from './service';
import { format } from 'date-fns';
import { CalendarView } from './CalendarView';

export function ReservasPage() {
  const { user } = useAuth();
  const { selectedResidencial } = useResidencial();
  const { showToast } = useToast();
  const [reservas, setReservas] = useState<any[]>([]);
  const [espacios, setEspacios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    espacio_id: '',
    fecha_reserva: '',
    hora_inicio: '',
    hora_fin: '',
    motivo: '',
  });

  const isAdmin = user?.rol === 'SUPERADMIN' || user?.rol === 'ADMIN_RESIDENCIAL';
  const isResidente = user?.rol === 'RESIDENTE';

  useEffect(() => {
    loadReservas();
    loadEspacios();
    // force reload if user or residencial context changes
  }, [user, selectedResidencial]);

  const loadReservas = async () => {
    if (!user) return;
    setLoading(true);
    const effectiveResidencialId = selectedResidencial?.id || user?.residencial_id;
    const data = await getReservas(user, effectiveResidencialId);
    setReservas(data);
    setLoading(false);
  };

  const loadEspacios = async () => {
    const effectiveResidencialId = selectedResidencial?.id || user?.residencial_id;
    if (!effectiveResidencialId) return;
    const data = await getEspaciosDisponibles(effectiveResidencialId);
    setEspacios(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedResidencial) return;

    const result = await createReserva(
      {
        residente_id: user.id,
        espacio_id: formData.espacio_id,
        fecha_reserva: formData.fecha_reserva,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        estado: isResidente ? 'pendiente' : 'aprobada',
        motivo: formData.motivo || undefined,
      } as any,
      user
    );

    if (result.success) {
      showToast('Reserva creada exitosamente', 'success');
      setShowDialog(false);
      setFormData({
        espacio_id: '',
        fecha_reserva: '',
        hora_inicio: '',
        hora_fin: '',
        motivo: '',
      });
      loadReservas();
    } else {
      showToast(result.error || 'Error al crear reserva', 'error');
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    if (!user) return;

    const result = await updateReserva(
      id,
      { estado: approved ? 'aprobada' : 'rechazada' },
      user
    );

    if (result.success) {
      showToast(
        `Reserva ${approved ? 'aprobada' : 'rechazada'} exitosamente`,
        'success'
      );
      loadReservas();
    } else {
      showToast(result.error || 'Error al actualizar reserva', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !user) return;
    const result = await deleteReserva(deleteTarget.id, user);
    if (result.success) {
      showToast('Reserva eliminada exitosamente', 'success');
      setDeleteTarget(null);
      loadReservas();
    } else {
      showToast(result.error || 'Error al eliminar reserva', 'error');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'espacio',
      label: 'Espacio',
      render: (item) => item.espacio?.nombre || 'N/A',
      sortable: true,
    },
    isAdmin
      ? {
          key: 'residente',
          label: 'Residente',
          render: (item) => item.residente?.nombre || 'N/A',
          sortable: true,
        }
      : null,
    {
      key: 'fecha_reserva',
      label: 'Fecha',
      render: (item) => item.fecha_reserva ? format(new Date(item.fecha_reserva), 'dd/MM/yyyy') : 'N/A',
      sortable: true,
    },
    {
      key: 'horario',
      label: 'Horario',
      render: (item) => `${item.hora_inicio || ''} - ${item.hora_fin || ''}`,
      sortable: true,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (item) => (
        <StatusBadge
          status={item.estado}
          labels={{
            pendiente: 'Pendiente',
            aprobada: 'Aprobada',
            rechazada: 'Rechazada',
            cancelada: 'Cancelada',
          }}
        />
      ),
      sortable: true,
    },
    isAdmin
      ? {
          key: 'actions',
          label: 'Acciones',
          render: (item) => (
            <div className="flex gap-2">
              {item.estado === 'pendiente' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(item.id, true)}
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(item.id, false)}
                  >
                    <XCircle className="h-4 w-4 text-red-600" />
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeleteTarget(item)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ),
        }
      : null,
  ].filter(Boolean) as Column<any>[];

  const stats = [
    {
      label: 'Total Reservas',
      value: reservas.length,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Pendientes',
      value: reservas.filter((r) => r.estado === 'pendiente').length,
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Aprobadas',
      value: reservas.filter((r) => r.estado === 'aprobada').length,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Rechazadas',
      value: reservas.filter((r) => r.estado === 'rechazada').length,
      color: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {isResidente ? 'Mis Reservas' : 'Sistema de Reservas'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isResidente
              ? 'Gestiona tus reservas de espacios comunes'
              : 'Administra las reservas de los residentes'}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant={showCalendar ? 'primary' : 'outline'}
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <CalendarRange className="h-4 w-4 mr-2" />
            {showCalendar ? 'Ver Lista' : 'Ver Calendario'}
          </Button>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{stat.label}</h3>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Historial de Reservas</h2>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={reservas}
            columns={columns}
            loading={loading}
            emptyMessage="No hay reservas registradas"
          />
        </CardContent>
      </Card>

      {showCalendar && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CalendarRange className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Calendario de Reservas</h2>
            </div>
          </CardHeader>
          <CardContent>
            <CalendarView />
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Nueva Reserva">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Espacio"
            value={formData.espacio_id}
            onChange={(e) => setFormData({ ...formData, espacio_id: e.target.value })}
            options={[
              { value: '', label: 'Seleccione un espacio' },
              ...espacios.map((e) => ({ value: e.id, label: e.nombre })),
            ]}
            required
          />
          <Input
            label="Fecha de Reserva"
            type="date"
            value={formData.fecha_reserva}
            onChange={(e) => setFormData({ ...formData, fecha_reserva: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hora Inicio"
              type="time"
              value={formData.hora_inicio}
              onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
              required
            />
            <Input
              label="Hora Fin"
              type="time"
              value={formData.hora_fin}
              onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
              required
            />
          </div>
          <Input
            label="Motivo"
            value={formData.motivo}
            onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
            placeholder="Motivo de la reserva (opcional)"
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear Reserva</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget ? `Reserva - ${deleteTarget.espacio?.nombre || 'N/A'} (${deleteTarget.fecha_reserva || ''})` : ''}
      />
    </div>
  );
}
