import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, Plus, Briefcase, Calendar, User, Loader2, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Dialog } from '../../../components/ui/Dialog';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { getProspectos, createProspecto, deleteProspecto, Prospecto } from './service';
import { createNegocioFromProspecto } from '../negocios/service';

const TIPO_INTERES_OPTIONS = [
  'Apartamento 1 habitación',
  'Apartamento 2 habitaciones',
  'Apartamento 3 habitaciones',
  'Casa independiente',
  'Casa en condominio',
  'Penthouse',
  'Local comercial',
  'Oficina',
];

const PROYECTOS_DISPONIBLES = [
  'Torres del Sol',
  'Residencial Vista Verde',
  'Condominio Las Palmas',
  'Plaza Comercial Centro',
  'Edificio Oficentro',
  'Residencial Los Robles',
  'Apartamentos del Valle',
  'Condominio Montaña Azul',
];


const ORIGEN_COLORS: Record<string, string> = {
  'Web': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Referido': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Redes Sociales': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  'Llamada Directa': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

const ESTADO_COLORS: Record<string, string> = {
  'Nuevo': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Contactado': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Calificado': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'No Interesado': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export function ProspectosPage() {
  const { showToast } = useToast();
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creatingDealId, setCreatingDealId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Prospecto | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    origen: 'Web',
    interes: TIPO_INTERES_OPTIONS[0],
    proyecto: PROYECTOS_DISPONIBLES[0],
  });

  useEffect(() => {
    loadProspectos();
  }, []);

  const loadProspectos = async () => {
    setLoading(true);
    const data = await getProspectos();
    setProspectos(data);
    setLoading(false);
  };

  const handleCreateProspecto = async () => {
    const result = await createProspecto({
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      telefono: formData.telefono,
      origen: formData.origen,
      interes: formData.interes,
      proyecto: formData.proyecto,
      estado: 'Nuevo',
    });

    if (result.success) {
      showToast('Prospecto creado exitosamente', 'success');
      setIsModalOpen(false);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        origen: 'Web',
        interes: TIPO_INTERES_OPTIONS[0],
        proyecto: PROYECTOS_DISPONIBLES[0],
      });
      loadProspectos();
    } else {
      showToast(result.error || 'Error al crear prospecto', 'error');
    }
  };

  const handleCreateNegocio = async (prospectoId: string) => {
    const prospecto = prospectos.find(p => p.id === prospectoId);
    if (!prospecto) return;

    setCreatingDealId(prospectoId);

    const result = await createNegocioFromProspecto(
      prospecto.id,
      `${prospecto.nombre} ${prospecto.apellido}`.trim(),
      prospecto.email,
      prospecto.telefono,
      prospecto.interes,
      prospecto.proyecto
    );

    if (result.success) {
      showToast('Negocio creado en etapa "Interesado". Puedes verlo en el modulo de Negocios.', 'success');
      loadProspectos();
    } else {
      showToast(result.error || 'Error al crear negocio', 'error');
    }

    setCreatingDealId(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteProspecto(deleteTarget.id);
    if (result.success) {
      showToast('Prospecto eliminado', 'success');
      setDeleteTarget(null);
      loadProspectos();
    } else {
      showToast(result.error || 'Error al eliminar', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Prospectos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestión de leads y oportunidades comerciales
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Prospecto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Prospectos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {prospectos.length}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nuevos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {prospectos.filter(p => p.estado === 'Nuevo').length}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <User className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Calificados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {prospectos.filter(p => p.estado === 'Calificado').length}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Negocios Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {prospectos.filter(p => p.estado === 'Contactado').length}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
              <Briefcase className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prospecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Interés / Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {prospectos.map((prospecto) => (
                <tr key={prospecto.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {prospecto.nombre} {prospecto.apellido}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {prospecto.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center mb-1">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {prospecto.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        {prospecto.telefono}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${ORIGEN_COLORS[prospecto.origen] || 'bg-gray-100 text-gray-800'}`}>
                      {prospecto.origen}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      <div className="font-medium">{prospecto.interes}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {prospecto.proyecto}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${ESTADO_COLORS[prospecto.estado] || 'bg-gray-100 text-gray-800'}`}>
                      {prospecto.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        {prospecto.created_at ? new Date(prospecto.created_at).toLocaleDateString() : '-'}
                      </div>
                      {prospecto.ultimo_contacto && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Ultimo: {new Date(prospecto.ultimo_contacto).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleCreateNegocio(prospecto.id)}
                        disabled={creatingDealId === prospecto.id}
                      >
                        {creatingDealId === prospecto.id ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Briefcase className="h-3 w-3 mr-1" />
                        )}
                        {creatingDealId === prospecto.id ? 'Creando...' : 'Crear Negocio'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteTarget(prospecto)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Prospecto"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre"
            />
            <Input
              label="Apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              placeholder="Apellido"
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="correo@ejemplo.com"
          />
          <Input
            label="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="+506 0000-0000"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Origen
            </label>
            <select
              value={formData.origen}
              onChange={(e) => setFormData({ ...formData, origen: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
            >
              <option value="Web">Web</option>
              <option value="Referido">Referido</option>
              <option value="Redes Sociales">Redes Sociales</option>
              <option value="Llamada Directa">Llamada Directa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Interés
            </label>
            <select
              value={formData.interes}
              onChange={(e) => setFormData({ ...formData, interes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
            >
              {TIPO_INTERES_OPTIONS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proyecto de Interés
            </label>
            <select
              value={formData.proyecto}
              onChange={(e) => setFormData({ ...formData, proyecto: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
            >
              {PROYECTOS_DISPONIBLES.map((proyecto) => (
                <option key={proyecto} value={proyecto}>
                  {proyecto}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProspecto}>
              Crear Prospecto
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget ? `${deleteTarget.nombre} ${deleteTarget.apellido}` : ''}
      />
    </div>
  );
}
