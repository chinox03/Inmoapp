import React, { useState, useEffect } from 'react';
import { Plus, Calendar, CreditCard as Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useResidencial } from '../../../contexts/ResidencialContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Dialog, DialogFooter } from '../../../components/ui/Dialog';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { getEspacios, createEspacio, updateEspacio, deleteEspacio } from './service';

export function EspaciosPage() {
  const { user } = useAuth();
  const { selectedResidencial } = useResidencial();
  const { showToast } = useToast();
  const [espacios, setEspacios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEspacio, setEditingEspacio] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    capacidad: '',
    estado: 'activo',
  });

  const isAdmin = user?.rol === 'SUPERADMIN' || user?.rol === 'ADMIN_RESIDENCIAL';

  useEffect(() => {
    loadEspacios();
  }, [user, selectedResidencial]);

  const loadEspacios = async () => {
    setLoading(true);
    const data = await getEspacios(user, selectedResidencial?.id);
    setEspacios(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedResidencial) return;

    const espacioData = {
      residencial_id: selectedResidencial.id,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      capacidad: parseInt(formData.capacidad),
      estado: formData.estado,
    };

    const result = editingEspacio
      ? await updateEspacio(editingEspacio.id, espacioData, user)
      : await createEspacio(espacioData as any, user);

    if (result.success) {
      showToast(
        `Espacio ${editingEspacio ? 'actualizado' : 'creado'} exitosamente`,
        'success'
      );
      setShowDialog(false);
      setEditingEspacio(null);
      setFormData({ nombre: '', descripcion: '', capacidad: '', estado: 'activo' });
      loadEspacios();
    } else {
      showToast(result.error || 'Error al guardar espacio', 'error');
    }
  };

  const handleEdit = (espacio: any) => {
    setEditingEspacio(espacio);
    setFormData({
      nombre: espacio.nombre,
      descripcion: espacio.descripcion || '',
      capacidad: espacio.capacidad?.toString() || '0',
      estado: espacio.estado || 'activo',
    });
    setShowDialog(true);
  };

  const handleDelete = async () => {
    if (!user || !deleteTarget) return;

    const result = await deleteEspacio(deleteTarget.id, user);

    if (result.success) {
      showToast('Espacio eliminado exitosamente', 'success');
      setDeleteTarget(null);
      loadEspacios();
    } else {
      showToast(result.error || 'Error al eliminar espacio', 'error');
    }
  };

  const estadoLabels: Record<string, string> = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    mantenimiento: 'Mantenimiento',
  };

  const columns: Column<any>[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'descripcion', label: 'Descripcion', render: (item) => item.descripcion || '-' },
    { key: 'capacidad', label: 'Capacidad', render: (item) => `${item.capacidad} personas`, sortable: true },
    {
      key: 'estado',
      label: 'Estado',
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.estado === 'activo' ? 'bg-green-100 text-green-800' :
          item.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {estadoLabels[item.estado] || item.estado}
        </span>
      ),
      sortable: true,
    },
    isAdmin ? {
      key: 'actions',
      label: 'Acciones',
      render: (item) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setDeleteTarget(item)}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    } : null,
  ].filter(Boolean) as Column<any>[];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Espacios Comunes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los espacios comunes disponibles para reserva
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Espacio
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900 dark:text-gray-100">Total Espacios</h3></CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{espacios.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900 dark:text-gray-100">Espacios Activos</h3></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {espacios.filter((e) => e.estado === 'activo').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900 dark:text-gray-100">Capacidad Total</h3></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {espacios.reduce((sum, e) => sum + (e.capacidad || 0), 0)} personas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Lista de Espacios</h2>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={espacios} columns={columns} loading={loading} emptyMessage="No hay espacios registrados" />
        </CardContent>
      </Card>

      <Dialog
        open={showDialog}
        onClose={() => { setShowDialog(false); setEditingEspacio(null); setFormData({ nombre: '', descripcion: '', capacidad: '', estado: 'activo' }); }}
        title={editingEspacio ? 'Editar Espacio' : 'Nuevo Espacio'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre del Espacio" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required placeholder="Ej: Salon de Eventos" />
          <Input label="Descripcion" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Descripcion del espacio (opcional)" />
          <Input label="Capacidad (personas)" type="number" value={formData.capacidad} onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })} required />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
            <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setShowDialog(false); setEditingEspacio(null); }}>Cancelar</Button>
            <Button type="submit">{editingEspacio ? 'Actualizar' : 'Crear'}</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.nombre || ''}
      />
    </div>
  );
}
