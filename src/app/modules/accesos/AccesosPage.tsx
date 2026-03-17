import React, { useState, useEffect } from 'react';
import { Plus, KeyRound, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useResidencial } from '../../../contexts/ResidencialContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { getAccesos, deleteAcceso } from './service';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';

interface Residente {
  id: string;
  nombre: string;
  residencial_id?: string;
}

const MOCK_RESIDENTES: Residente[] = [
  { id: '44cfd61b-2d11-42e9-9fe9-ab0250b9103c', nombre: 'Juan Perez', residencial_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
  { id: 'f3d69417-64df-4f77-b025-43dbfb70e14a', nombre: 'Maria Garcia', residencial_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
];

export function AccesosPage() {
  const { user } = useAuth();
  const { selectedResidencial, residenciales } = useResidencial();
  const { showToast } = useToast();
  const [accesos, setAccesos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [loadingResidentes, setLoadingResidentes] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [selectedResidencialForm, setSelectedResidencialForm] = useState('');
  const [formData, setFormData] = useState({
    residente_id: '',
    tipo: 'tarjeta_permanente',
    codigo_acceso: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_expiracion: '',
    estado: 'activo',
  });

  const isAdmin = user?.rol === 'SUPERADMIN' || user?.rol === 'ADMIN_RESIDENCIAL' || user?.rol === 'IT';
  const isResidente = user?.rol === 'RESIDENTE';

  useEffect(() => {
    loadAccesos();
    loadResidentes();
  }, [user, selectedResidencial]);

  const loadResidentes = async () => {
    setLoadingResidentes(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, nombre, residencial_id')
      .eq('rol', 'RESIDENTE')
      .order('nombre');
    if (data && data.length > 0) {
      setResidentes(data);
    } else {
      setResidentes(MOCK_RESIDENTES);
    }
    setLoadingResidentes(false);
  };

  const loadAccesos = async () => {
    if (!user) return;
    setLoading(true);
    const effectiveResidencialId = selectedResidencial?.id || user?.residencial_id;
    const data = await getAccesos(user, effectiveResidencialId);
    setAccesos(data);
    setLoading(false);
  };

  const generateCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setFormData({ ...formData, codigo_acceso: randomCode.toUpperCase() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('accesos').insert({
        residente_id: formData.residente_id,
        tipo: formData.tipo,
        codigo_acceso: formData.codigo_acceso,
        fecha_emision: formData.fecha_emision,
        fecha_expiracion: formData.fecha_expiracion || null,
        estado: formData.estado,
      });

      if (error) throw error;

      showToast('Acceso registrado exitosamente', 'success');
      setShowAddModal(false);
      resetForm();
      loadAccesos();
    } catch (error) {
      console.error('Error creating acceso:', error);
      showToast('Error al registrar el acceso', 'error');
    }
  };

  const resetForm = () => {
    setSelectedResidencialForm('');
    setFormData({
      residente_id: '',
      tipo: 'tarjeta_permanente',
      codigo_acceso: '',
      fecha_emision: new Date().toISOString().split('T')[0],
      fecha_expiracion: '',
      estado: 'activo',
    });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const filteredResidentes = selectedResidencialForm
    ? residentes.filter(r => r.residencial_id === selectedResidencialForm)
    : [];

  const handleResidencialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedResidencialForm(e.target.value);
    setFormData({ ...formData, residente_id: '' });
  };

  const handleDelete = async () => {
    if (!deleteTarget || !user) return;
    const result = await deleteAcceso(deleteTarget.id, user);
    if (result.success) {
      showToast('Acceso eliminado exitosamente', 'success');
      setDeleteTarget(null);
      loadAccesos();
    } else {
      showToast(result.error || 'Error al eliminar acceso', 'error');
    }
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
      render: (item) => (item.tipo || '').replace(/_/g, ' ').toUpperCase(),
      sortable: true,
    },
    {
      key: 'codigo_acceso',
      label: 'Codigo',
      render: (item) => '****' + (item.codigo_acceso || '').slice(-4),
    },
    {
      key: 'fecha_emision',
      label: 'Activacion',
      render: (item) => {
        return item.fecha_emision ? format(new Date(item.fecha_emision), 'dd/MM/yyyy') : 'N/A';
      },
      sortable: true,
    },
    {
      key: 'fecha_expiracion',
      label: 'Expiracion',
      render: (item) =>
        item.fecha_expiracion
          ? format(new Date(item.fecha_expiracion), 'dd/MM/yyyy')
          : 'Sin expiracion',
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            item.estado === 'activo'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {item.estado === 'activo' ? 'Activo' : item.estado === 'expirado' ? 'Expirado' : 'Revocado'}
        </span>
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
            {isResidente ? 'Mis Accesos' : 'Control de Accesos'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isResidente
              ? 'Consulta tus métodos de acceso'
              : 'Administra los accesos del residencial'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Acceso
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Total Accesos</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{accesos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Activos</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {accesos.filter((a) => a.estado === 'activo').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Inactivos</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {accesos.filter((a) => a.estado !== 'activo').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <KeyRound className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Lista de Accesos</h2>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={accesos}
            columns={columns}
            loading={loading}
            emptyMessage="No hay accesos registrados"
          />
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget ? `Acceso - ${(deleteTarget.tipo || '').replace(/_/g, ' ')} ****${(deleteTarget.codigo_acceso || '').slice(-4)}` : ''}
      />

      <Dialog open={showAddModal} onClose={handleCloseModal} title="Nuevo Acceso">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Residencial <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedResidencialForm}
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
              value={formData.residente_id}
              onChange={(e) => setFormData({ ...formData, residente_id: e.target.value })}
              required
              disabled={!selectedResidencialForm || loadingResidentes}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">
                {!selectedResidencialForm
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
              Tipo de Acceso <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tarjeta_permanente">Tarjeta Permanente</option>
              <option value="codigo_temporal">Código Temporal</option>
              <option value="invitado">Invitado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Código de Acceso <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <Input
                value={formData.codigo_acceso}
                onChange={(e) => setFormData({ ...formData, codigo_acceso: e.target.value })}
                required
                placeholder="Ingrese o genere un código"
              />
              <Button type="button" onClick={generateCode} variant="outline">
                Generar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha de Emisión"
              type="date"
              value={formData.fecha_emision}
              onChange={(e) => setFormData({ ...formData, fecha_emision: e.target.value })}
              required
            />

            <Input
              label="Fecha de Expiración (Opcional)"
              type="date"
              value={formData.fecha_expiracion}
              onChange={(e) => setFormData({ ...formData, fecha_expiracion: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="activo">Activo</option>
              <option value="expirado">Expirado</option>
              <option value="revocado">Revocado</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">Registrar Acceso</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
