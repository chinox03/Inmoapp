import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useResidencial } from '../../../contexts/ResidencialContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Dialog, DialogFooter } from '../../../components/ui/Dialog';
import { useToast } from '../../../components/ui/Toast';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { getAmonestaciones, createAmonestacion, deleteAmonestacion } from './service';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';

interface Residente {
  id: string;
  nombre: string;
  residencial_id?: string;
}

interface Residencial {
  id: string;
  nombre: string;
}

const TIPOS_AMONESTACION: Record<string, string> = {
  ruido: 'Ruido',
  estacionamiento: 'Estacionamiento',
  mascotas: 'Mascotas',
  basura: 'Basura',
  otro: 'Otro',
};

export function AmonestacionesPage() {
  const { user } = useAuth();
  const { selectedResidencial } = useResidencial();
  const { showToast } = useToast();
  const [amonestaciones, setAmonestaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [residenciales, setResidenciales] = useState<Residencial[]>([]);
  const [loadingResidentes, setLoadingResidentes] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    residencial_id: '',
    receptor_id: '',
    tipo: 'ruido',
    descripcion: '',
  });

  const [filters, setFilters] = useState({
    residencial_id: '',
    receptor_id: '',
    tipo: '',
    estado: '',
  });

  const isAdmin = user?.rol === 'SUPERADMIN' || user?.rol === 'ADMIN_RESIDENCIAL';
  const isResidente = user?.rol === 'RESIDENTE';

  useEffect(() => {
    loadAmonestaciones();
    if (isAdmin) {
      loadResidenciales();
      loadAllResidentes();
    }
  }, [user, selectedResidencial]);

  const loadResidenciales = async () => {
    try {
      const { data, error } = await supabase
        .from('residenciales')
        .select('id, nombre')
        .order('nombre');

      if (error) throw error;

      if (!data || data.length === 0) {
        setResidenciales([
          { id: 'sample-1', nombre: 'Torres del Valle' },
          { id: 'sample-2', nombre: 'Condominio El Roble' },
          { id: 'sample-3', nombre: 'Residencial Las Palmas' },
        ]);
      } else {
        setResidenciales(data);
      }
    } catch (error) {
      console.error('Error loading residenciales:', error);
      setResidenciales([
        { id: 'sample-1', nombre: 'Torres del Valle' },
        { id: 'sample-2', nombre: 'Condominio El Roble' },
      ]);
    }
  };

  const loadAllResidentes = async () => {
    setLoadingResidentes(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombre, residencial_id')
        .eq('rol', 'RESIDENTE')
        .order('nombre');

      if (error) throw error;

      if (!data || data.length === 0) {
        setResidentes([
          { id: 'sample-res-1', nombre: 'Juan Perez', residencial_id: 'sample-1' },
          { id: 'sample-res-2', nombre: 'Maria Garcia', residencial_id: 'sample-1' },
          { id: 'sample-res-3', nombre: 'Carlos Lopez', residencial_id: 'sample-2' },
          { id: 'sample-res-4', nombre: 'Ana Martinez', residencial_id: 'sample-2' },
          { id: 'sample-res-5', nombre: 'Pedro Ramirez', residencial_id: 'sample-3' },
        ]);
      } else {
        setResidentes(data);
      }
    } catch (error) {
      console.error('Error loading residentes:', error);
      setResidentes([
        { id: 'sample-res-1', nombre: 'Juan Perez', residencial_id: 'sample-1' },
        { id: 'sample-res-2', nombre: 'Maria Garcia', residencial_id: 'sample-1' },
      ]);
    } finally {
      setLoadingResidentes(false);
    }
  };

  const loadAmonestaciones = async () => {
    if (!user) return;
    setLoading(true);
    const effectiveResidencialId = selectedResidencial?.id || user?.residencial_id;
    const data = await getAmonestaciones(user, effectiveResidencialId);
    setAmonestaciones(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const residencialId = formData.residencial_id || selectedResidencial?.id;
    if (!residencialId) {
      showToast('Selecciona un residencial', 'error');
      return;
    }

    const result = await createAmonestacion(
      {
        residencial_id: residencialId,
        receptor_id: formData.receptor_id,
        emisor_id: user.id,
        tipo: formData.tipo as any,
        descripcion: formData.descripcion,
        estado: 'emitida',
        fecha_emision: new Date().toISOString().split('T')[0],
      },
      user
    );

    if (result.success) {
      showToast('Amonestacion registrada exitosamente', 'success');
      setShowAddModal(false);
      resetForm();
      loadAmonestaciones();
    } else {
      showToast(result.error || 'Error al registrar la amonestacion', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      residencial_id: '',
      receptor_id: '',
      tipo: 'ruido',
      descripcion: '',
    });
  };

  const filteredResidentes = formData.residencial_id
    ? residentes.filter(r => r.residencial_id === formData.residencial_id)
    : [];

  const handleResidencialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      residencial_id: e.target.value,
      receptor_id: '',
    });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const filteredAmonestaciones = amonestaciones.filter((amonestacion) => {
    if (filters.receptor_id && amonestacion.receptor_id !== filters.receptor_id) {
      return false;
    }
    if (filters.tipo && amonestacion.tipo !== filters.tipo) {
      return false;
    }
    if (filters.estado && amonestacion.estado !== filters.estado) {
      return false;
    }
    return true;
  });

  const filteredResidentesForFilter = filters.residencial_id
    ? residentes.filter(r => r.residencial_id === filters.residencial_id)
    : residentes;

  const clearFilters = () => {
    setFilters({
      residencial_id: '',
      receptor_id: '',
      tipo: '',
      estado: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const handleDelete = async () => {
    if (!deleteTarget || !user) return;
    const result = await deleteAmonestacion(deleteTarget.id, user);
    if (result.success) {
      showToast('Amonestacion eliminada exitosamente', 'success');
      setDeleteTarget(null);
      loadAmonestaciones();
    } else {
      showToast(result.error || 'Error al eliminar amonestacion', 'error');
    }
  };

  const columns: Column<any>[] = [
    isAdmin
      ? {
          key: 'receptor',
          label: 'Residente',
          render: (item) => item.receptor?.nombre || 'N/A',
          sortable: true,
        }
      : null,
    {
      key: 'tipo',
      label: 'Tipo',
      render: (item) => TIPOS_AMONESTACION[item.tipo] || item.tipo,
      sortable: true,
    },
    {
      key: 'descripcion',
      label: 'Descripcion',
      render: (item) => {
        const text = item.descripcion || '';
        return text.length > 60 ? text.substring(0, 60) + '...' : text || '-';
      },
    },
    {
      key: 'fecha_emision',
      label: 'Fecha',
      render: (item) => format(new Date(item.fecha_emision), 'dd/MM/yyyy'),
      sortable: true,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (item) => (
        <StatusBadge
          status={item.estado}
          labels={{
            emitida: 'Emitida',
            apelada: 'Apelada',
            cerrada: 'Cerrada',
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {isResidente ? 'Mis Amonestaciones' : 'Gestion de Amonestaciones'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isResidente
              ? 'Consulta tus amonestaciones'
              : 'Administra las amonestaciones de los residentes'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Amonestacion
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Total Amonestaciones</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredAmonestaciones.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Emitidas</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {filteredAmonestaciones.filter((a) => a.estado === 'emitida').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Cerradas</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {filteredAmonestaciones.filter((a) => a.estado === 'cerrada').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Filtros</h2>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Residencial
                </label>
                <select
                  value={filters.residencial_id}
                  onChange={(e) => setFilters({ ...filters, residencial_id: e.target.value, receptor_id: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Todos</option>
                  {residenciales.map((residencial) => (
                    <option key={residencial.id} value={residencial.id}>
                      {residencial.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Residente
                </label>
                <select
                  value={filters.receptor_id}
                  onChange={(e) => setFilters({ ...filters, receptor_id: e.target.value })}
                  disabled={!filters.residencial_id && residentes.length > 10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
                >
                  <option value="">Todos</option>
                  {filteredResidentesForFilter.map((residente) => (
                    <option key={residente.id} value={residente.id}>
                      {residente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo
                </label>
                <select
                  value={filters.tipo}
                  onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Todos</option>
                  {Object.entries(TIPOS_AMONESTACION).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Todos</option>
                  <option value="emitida">Emitida</option>
                  <option value="apelada">Apelada</option>
                  <option value="cerrada">Cerrada</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Historial de Amonestaciones</h2>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredAmonestaciones}
            columns={columns}
            loading={loading}
            emptyMessage={
              hasActiveFilters
                ? 'No se encontraron amonestaciones con los filtros aplicados'
                : 'No hay amonestaciones registradas'
            }
          />
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onClose={handleCloseModal} title="Nueva Amonestacion">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Residencial <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.residencial_id}
              onChange={handleResidencialChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccione un residencial</option>
              {residenciales.map((residencial) => (
                <option key={residencial.id} value={residencial.id}>
                  {residencial.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Residente <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.receptor_id}
              onChange={(e) => setFormData({ ...formData, receptor_id: e.target.value })}
              required
              disabled={!formData.residencial_id || loadingResidentes}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">
                {!formData.residencial_id
                  ? 'Primero seleccione un residencial'
                  : 'Seleccione un residente'}
              </option>
              {filteredResidentes.map((residente) => (
                <option key={residente.id} value={residente.id}>
                  {residente.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(TIPOS_AMONESTACION).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripcion <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
              rows={4}
              placeholder="Describa detalladamente la situacion que motivo la amonestacion"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">Registrar Amonestacion</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget ? `Amonestacion - ${TIPOS_AMONESTACION[deleteTarget.tipo] || deleteTarget.tipo}` : ''}
      />
    </div>
  );
}
