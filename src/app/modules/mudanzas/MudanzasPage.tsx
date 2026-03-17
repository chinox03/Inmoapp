import React, { useState, useEffect } from 'react';
import { Plus, Truck, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useResidencial } from '../../../contexts/ResidencialContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { getMudanzas, createMudanza, deleteMudanza } from './service';
import { format } from 'date-fns';

export function MudanzasPage() {
  const { user } = useAuth();
  const { selectedResidencial } = useResidencial();
  const { showToast } = useToast();
  const [mudanzas, setMudanzas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    tipo: 'entrada',
    fecha: new Date().toISOString().split('T')[0],
    hora: '08:00',
    observaciones: '',
  });

  const isAdmin =
    user?.rol === 'SUPERADMIN' ||
    user?.rol === 'SEGURIDAD' ||
    user?.rol === 'ADMIN_RESIDENCIAL';
  const isResidente = user?.rol === 'RESIDENTE';

  useEffect(() => {
    loadMudanzas();
  }, [user, selectedResidencial]);

  const loadMudanzas = async () => {
    if (!user) return;
    setLoading(true);
    const effectiveResidencialId = selectedResidencial?.id || user?.residencial_id;
    const data = await getMudanzas(user, effectiveResidencialId);
    setMudanzas(data);
    setLoading(false);
  };

  const columns: Column<any>[] = [
    isAdmin
      ? {
          key: 'residente',
          label: 'Residente',
          render: (item) => item.residente?.nombre || 'N/A',
          sortable: true,
        }
      : null,
    {
      key: 'tipo',
      label: 'Tipo',
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            item.tipo === 'entrada'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {item.tipo === 'entrada' ? 'Entrada' : 'Salida'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (item) => format(new Date(item.fecha), 'dd/MM/yyyy'),
      sortable: true,
    },
    {
      key: 'hora',
      label: 'Hora',
      render: (item) => item.hora || '-',
    },
    {
      key: 'observaciones',
      label: 'Observaciones',
      render: (item) => {
        const text = item.observaciones || '';
        return text.length > 50 ? text.substring(0, 50) + '...' : text || '-';
      },
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (item) => (
        <StatusBadge
          status={item.estado}
          labels={{
            solicitada: 'Solicitada',
            aprobada: 'Aprobada',
            en_proceso: 'En Proceso',
            completada: 'Completada',
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
          render: (item: any) => (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteTarget(item)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          ),
        }
      : null,
  ].filter(Boolean) as Column<any>[];

  const handleDelete = async () => {
    if (!deleteTarget || !user) return;
    const result = await deleteMudanza(deleteTarget.id, user);
    if (result.success) {
      showToast('Mudanza eliminada exitosamente', 'success');
      setDeleteTarget(null);
      loadMudanzas();
    } else {
      showToast(result.error || 'Error al eliminar mudanza', 'error');
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedResidencial) {
      showToast('Selecciona un residencial primero', 'error');
      return;
    }

    const result = await createMudanza(
      {
        residencial_id: selectedResidencial.id,
        residente_id: user.id,
        tipo: formData.tipo as 'entrada' | 'salida',
        fecha: formData.fecha,
        hora: formData.hora,
        observaciones: formData.observaciones || undefined,
        estado: 'solicitada',
      },
      user
    );

    if (result.success) {
      showToast('Solicitud de mudanza creada exitosamente', 'success');
      setShowAddModal(false);
      resetForm();
      loadMudanzas();
    } else {
      showToast(result.error || 'Error al crear solicitud', 'error');
    }
  }

  function resetForm() {
    setFormData({
      tipo: 'entrada',
      fecha: new Date().toISOString().split('T')[0],
      hora: '08:00',
      observaciones: '',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {isResidente ? 'Mis Mudanzas' : 'Solicitudes de Mudanza'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isResidente
              ? 'Gestiona tus solicitudes de mudanza'
              : 'Administra las solicitudes de mudanza'}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Total Mudanzas</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{mudanzas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Solicitadas</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {mudanzas.filter((m) => m.estado === 'solicitada').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Aprobadas</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {mudanzas.filter((m) => m.estado === 'aprobada').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Completadas</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {mudanzas.filter((m) => m.estado === 'completada').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Historial de Mudanzas</h2>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={mudanzas}
            columns={columns}
            loading={loading}
            emptyMessage="No hay mudanzas registradas"
          />
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)} title="Nueva Solicitud de Mudanza">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Mudanza <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </select>
          </div>

          <Input
            label="Fecha de Mudanza"
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            required
          />

          <Input
            label="Hora"
            type="time"
            value={formData.hora}
            onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Empresa de mudanza, contacto, tipo de vehiculo, placa, conductor, etc."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Solicitud
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget ? `Mudanza ${deleteTarget.tipo === 'entrada' ? 'Entrada' : 'Salida'} - ${deleteTarget.fecha || ''}` : ''}
      />
    </div>
  );
}
