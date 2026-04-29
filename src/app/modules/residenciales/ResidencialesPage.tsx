import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2, MapPin, Users, Home, Search, Grid3x3, List,
  Eye, CreditCard as Edit, Plus, Filter, X, Trash2,
  DollarSign, FileText, Settings, Percent, Hash, Save,
  CheckSquare, Square,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Dialog } from '../../../components/ui/Dialog';
import { DangerConfirmDialog } from '../../../components/ui/DangerConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import {
  getResidenciales, createResidencial, updateResidencial, deleteResidencial,
  getProyectoConfigComercial, upsertProyectoConfigComercial,
  Residencial, MontoReserva,
} from './service';

const MOCK_IMAGE = 'https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg';

const AMENIDADES_OPTIONS = [
  'Piscina', 'Gimnasio', 'Salon Social', 'Firepit',
  'Mancave', 'Cancha Polideportiva', 'Terraza', 'Pergola',
  'Parque Infantil', 'Seguridad 24/7', 'BBQ', 'Estacionamiento',
];

const DOCUMENTOS_OPTIONS = [
  'DPI / Cedula (Frente)',
  'DPI / Cedula (Reverso)',
  'Comprobante de pago - Cheque de caja',
  'Comprobante de pago - Transferencia bancaria',
  'Voucher de tarjeta de credito',
  'Deposito bancario',
  'Estado financiero',
  'Carta de trabajo',
];

type DetailTab = 'info' | 'config';

export function ResidencialesPage() {
  const { showToast } = useToast();
  const [residentials, setResidentials] = useState<Residencial[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedResidential, setSelectedResidential] = useState<Residencial | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>('info');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Residencial | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);

  // Config comercial state
  const [configLoading, setConfigLoading] = useState(false);
  const [montosReserva, setMontosReserva] = useState<MontoReserva[]>([]);
  const [documentosRequeridos, setDocumentosRequeridos] = useState<string[]>([]);

  // Add form state
  const [formData, setFormData] = useState({
    nombre: '', direccion: '', ciudad: '', pais: 'Guatemala',
    total_unidades: '', cuota_mantenimiento: '', administrador: '',
    telefono: '', email: '', amenidades: [] as string[],
    tipos_proyecto: [] as string[],
    tipos_unidades: [{
      id: '1', tipo: '', nombre: '', metros_cuadrados: '',
      dormitorios: '', banos: '', plano: null as File | null,
    }],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadResidentials();
  }, []);

  const loadResidentials = async () => {
    setLoading(true);
    const data = await getResidenciales();
    setResidentials(data);
    setLoading(false);
  };

  const filteredResidentials = useMemo(() => {
    return residentials.filter((res) => {
      const matchesSearch =
        res.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (res.ciudad || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (res.direccion || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || res.estado === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [residentials, searchTerm, filterStatus]);

  const totalStats = useMemo(() => ({
    totalResidentials: residentials.length,
    totalUnits: residentials.reduce((acc, r) => acc + (r.total_unidades || 0), 0),
    totalResidents: residentials.reduce((acc, r) => acc + 0, 0),
    occupancyRate: residentials.length
      ? Math.round(
          (residentials.reduce((acc, r) => acc + (r.unidades_ocupadas || 0), 0) /
            Math.max(residentials.reduce((acc, r) => acc + (r.total_unidades || 0), 0), 1)) * 100
        )
      : 0,
  }), [residentials]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'inactivo': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'mantenimiento': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'activo': return 'Activo';
      case 'inactivo': return 'Inactivo';
      case 'mantenimiento': return 'Mantenimiento';
      default: return status;
    }
  };

  const handleViewDetails = async (residential: Residencial) => {
    setSelectedResidential(residential);
    setDetailTab('info');
    setShowDetailModal(true);
    setConfigLoading(true);
    const config = await getProyectoConfigComercial(residential.id);
    setMontosReserva(config?.montos_reserva || []);
    setDocumentosRequeridos(config?.documentos_requeridos || []);
    setConfigLoading(false);
  };

  // --- Config comercial handlers ---
  const handleAddMonto = () => {
    setMontosReserva(prev => [
      ...prev,
      { id: Date.now().toString(), tipo: 'fijo', valor: 0, etiqueta: '' },
    ]);
  };

  const handleRemoveMonto = (id: string) => {
    setMontosReserva(prev => prev.filter(m => m.id !== id));
  };

  const handleMontoChange = (id: string, field: keyof MontoReserva, value: string | number) => {
    setMontosReserva(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleDocToggle = (doc: string) => {
    setDocumentosRequeridos(prev =>
      prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]
    );
  };

  const handleSaveConfig = async () => {
    if (!selectedResidential) return;
    setSavingConfig(true);
    const result = await upsertProyectoConfigComercial(selectedResidential.id, {
      montos_reserva: montosReserva,
      documentos_requeridos: documentosRequeridos,
    });
    setSavingConfig(false);
    if (result.success) {
      showToast('Configuracion comercial guardada correctamente.', 'success');
    } else {
      showToast(result.error || 'Error al guardar la configuracion', 'error');
    }
  };

  // --- Add form handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenidadToggle = (amenidad: string) => {
    setFormData(prev => ({
      ...prev,
      amenidades: prev.amenidades.includes(amenidad)
        ? prev.amenidades.filter(a => a !== amenidad)
        : [...prev.amenidades, amenidad],
    }));
  };

  const handleTipoProyectoToggle = (tipo: string) => {
    setFormData(prev => ({
      ...prev,
      tipos_proyecto: prev.tipos_proyecto.includes(tipo)
        ? prev.tipos_proyecto.filter(t => t !== tipo)
        : [...prev.tipos_proyecto, tipo],
    }));
    if (errors.tipos_proyecto) setErrors(prev => ({ ...prev, tipos_proyecto: '' }));
  };

  const handleAddTipoUnidad = () => {
    setFormData(prev => ({
      ...prev,
      tipos_unidades: [...prev.tipos_unidades, {
        id: Date.now().toString(), tipo: '', nombre: '',
        metros_cuadrados: '', dormitorios: '', banos: '', plano: null,
      }],
    }));
  };

  const handleRemoveTipoUnidad = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tipos_unidades: prev.tipos_unidades.filter(u => u.id !== id),
    }));
  };

  const handleTipoUnidadChange = (id: string, field: string, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      tipos_unidades: prev.tipos_unidades.map(u => u.id === id ? { ...u, [field]: value } : u),
    }));
    const errorKey = `unidad_${id}_${field}`;
    if (errors[errorKey]) setErrors(prev => ({ ...prev, [errorKey]: '' }));
  };

  const handleFileUpload = (id: string, file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [`unidad_${id}_plano`]: 'El archivo no debe exceder 5MB' }));
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) {
      setErrors(prev => ({ ...prev, [`unidad_${id}_plano`]: 'Solo se permiten archivos JPG, PNG o PDF' }));
      return;
    }
    handleTipoUnidadChange(id, 'plano', file);
    setErrors(prev => ({ ...prev, [`unidad_${id}_plano`]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Campo requerido';
    if (formData.tipos_proyecto.length === 0) newErrors.tipos_proyecto = 'Debe seleccionar al menos un tipo de proyecto';
    formData.tipos_unidades.forEach(unidad => {
      if (!unidad.tipo) newErrors[`unidad_${unidad.id}_tipo`] = 'Campo requerido';
      if (!unidad.nombre || unidad.nombre.length < 3) newErrors[`unidad_${unidad.id}_nombre`] = 'Debe tener al menos 3 caracteres';
      if (!unidad.metros_cuadrados || parseFloat(unidad.metros_cuadrados) <= 0) newErrors[`unidad_${unidad.id}_metros_cuadrados`] = 'Debe ser un numero positivo';
      if (!unidad.dormitorios) newErrors[`unidad_${unidad.id}_dormitorios`] = 'Campo requerido';
      if (!unidad.banos) newErrors[`unidad_${unidad.id}_banos`] = 'Campo requerido';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      nombre: '', direccion: '', ciudad: '', pais: 'Guatemala',
      total_unidades: '', cuota_mantenimiento: '', administrador: '',
      telefono: '', email: '', amenidades: [], tipos_proyecto: [],
      tipos_unidades: [{ id: '1', tipo: '', nombre: '', metros_cuadrados: '', dormitorios: '', banos: '', plano: null }],
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    const result = await createResidencial({
      nombre: formData.nombre,
      codigo: '',
      direccion: formData.direccion,
      ciudad: formData.ciudad,
      pais: formData.pais,
      total_unidades: parseInt(formData.total_unidades) || 0,
      unidades_ocupadas: 0,
      cuota_mantenimiento: parseFloat(formData.cuota_mantenimiento) || 0,
      administrador: formData.administrador,
      telefono: formData.telefono,
      email: formData.email,
      estado: 'activo',
      amenidades: formData.amenidades,
      imagen: MOCK_IMAGE,
      fecha_fundacion: null,
      tipos_proyecto: formData.tipos_proyecto,
    });
    setSubmitting(false);
    if (result.success) {
      showToast(`Residencial "${formData.nombre}" creado correctamente.`, 'success');
      handleCloseAddModal();
      loadResidentials();
    } else {
      showToast(result.error || 'Error al crear el residencial', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteResidencial(deleteTarget.id);
    if (result.success) {
      showToast('Residencial eliminado correctamente.', 'success');
      setDeleteTarget(null);
      loadResidentials();
    } else {
      showToast(result.error || 'Error al eliminar', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestion de Residenciales</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administra todos los complejos residenciales del sistema</p>
        </div>
        <Button className="bg-green-500 hover:bg-green-600" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Residencial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Residenciales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalStats.totalResidentials}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Unidades</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalStats.totalUnits}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Home className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Residentes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalStats.totalResidents}</p>
            </div>
            <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
              <Users className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ocupacion</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalStats.occupancyRate}%</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre, ciudad o direccion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 items-center w-full md:w-auto">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Todos</option>
                <option value="activo">Activo</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="inactivo">Inactivo</option>
              </select>
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredResidentials.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No se encontraron residenciales</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {residentials.length === 0
                  ? 'Agrega el primer residencial con el boton "Nuevo Residencial"'
                  : 'Intenta con otros terminos de busqueda o filtros'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResidentials.map((res) => (
                <Card key={res.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {res.imagen ? (
                      <img src={res.imagen} alt={res.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(res.estado)}`}>
                        {getStatusLabel(res.estado)}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{res.nombre}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        {res.ciudad ? `${res.ciudad}, ${res.pais}` : res.pais || 'Sin ubicacion'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Home className="w-4 h-4 mr-2 flex-shrink-0" />
                        {res.unidades_ocupadas}/{res.total_unidades} unidades ocupadas
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(res)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver detalles
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteTarget(res)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResidentials.map((res) => (
                <Card key={res.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        {res.imagen
                          ? <img src={res.imagen} alt={res.nombre} className="w-full h-full object-cover" />
                          : <Building2 className="w-8 h-8 m-8 text-gray-300 dark:text-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{res.nombre}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{res.direccion || 'Sin direccion'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(res.estado)}`}>
                            {getStatusLabel(res.estado)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Ciudad</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{res.ciudad || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Unidades</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{res.unidades_ocupadas}/{res.total_unidades}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{res.administrador || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Mantenimiento</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Q{(res.cuota_mantenimiento || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(res)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Ver detalles
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteTarget(res)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedResidential && (
        <Dialog
          isOpen={showDetailModal}
          onClose={() => { setShowDetailModal(false); setSelectedResidential(null); }}
          title={selectedResidential.nombre}
          size="xl"
        >
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setDetailTab('info')}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                  detailTab === 'info'
                    ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Informacion
              </button>
              <button
                onClick={() => setDetailTab('config')}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                  detailTab === 'config'
                    ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Settings className="w-4 h-4" />
                Config. Comercial
              </button>
            </div>

            {detailTab === 'info' && (
              <div className="space-y-5">
                {selectedResidential.imagen && (
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <img src={selectedResidential.imagen} alt={selectedResidential.nombre} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Direccion</h4>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedResidential.direccion || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Ciudad</h4>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedResidential.ciudad || '-'}, {selectedResidential.pais || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Administrador</h4>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedResidential.administrador || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Telefono</h4>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedResidential.telefono || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</h4>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedResidential.email || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Estado</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedResidential.estado)}`}>
                      {getStatusLabel(selectedResidential.estado)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedResidential.total_unidades}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Unidades</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedResidential.unidades_ocupadas}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ocupadas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      Q{(selectedResidential.cuota_mantenimiento || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Cuota/mes</p>
                  </div>
                </div>
                {selectedResidential.amenidades?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Amenidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedResidential.amenidades.map((a, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {detailTab === 'config' && (
              <div className="space-y-6">
                {configLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Montos de reserva */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            Montos de Reserva
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Define las opciones que el vendedor podra seleccionar al generar una reserva.
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={handleAddMonto} className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20">
                          <Plus className="w-3 h-3 mr-1" />
                          Agregar monto
                        </Button>
                      </div>

                      {montosReserva.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                          <DollarSign className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">Sin montos configurados</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Agrega opciones de monto para que los vendedores puedan seleccionarlas</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {montosReserva.map((monto) => (
                            <div key={monto.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              {/* Toggle fijo / porcentaje */}
                              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleMontoChange(monto.id, 'tipo', 'fijo')}
                                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                                    monto.tipo === 'fijo'
                                      ? 'bg-green-500 text-white'
                                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                  }`}
                                >
                                  <Hash className="w-3 h-3" />
                                  Fijo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMontoChange(monto.id, 'tipo', 'porcentaje')}
                                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                                    monto.tipo === 'porcentaje'
                                      ? 'bg-green-500 text-white'
                                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                  }`}
                                >
                                  <Percent className="w-3 h-3" />
                                  %
                                </button>
                              </div>

                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                                    {monto.tipo === 'fijo' ? 'Q' : '%'}
                                  </span>
                                  <input
                                    type="number"
                                    value={monto.valor}
                                    onChange={(e) => handleMontoChange(monto.id, 'valor', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step={monto.tipo === 'porcentaje' ? '0.1' : '100'}
                                    className="w-full pl-6 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                                    placeholder="0"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={monto.etiqueta}
                                  onChange={(e) => handleMontoChange(monto.id, 'etiqueta', e.target.value)}
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                                  placeholder="Etiqueta (ej: Enganche inicial)"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveMonto(monto.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Documentos requeridos */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                      <div className="mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Documentos Requeridos
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Selecciona los documentos que el comprador debe presentar para completar la reserva.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {DOCUMENTOS_OPTIONS.map((doc) => {
                          const checked = documentosRequeridos.includes(doc);
                          return (
                            <label
                              key={doc}
                              onClick={() => handleDocToggle(doc)}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                checked
                                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                            >
                              {checked
                                ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                : <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              }
                              <span className={`text-sm ${checked ? 'text-blue-800 dark:text-blue-200 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                                {doc}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                      <Button
                        onClick={handleSaveConfig}
                        disabled={savingConfig}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {savingConfig ? 'Guardando...' : 'Guardar Configuracion'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Dialog>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <Dialog isOpen={showAddModal} onClose={handleCloseAddModal} title="Agregar Nuevo Residencial" size="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Residencial <span className="text-red-500">*</span>
                </label>
                <Input name="nombre" type="text" placeholder="Ej: Torres del Valle" value={formData.nombre} onChange={handleInputChange} required />
                {errors.nombre && <p className="text-sm text-red-600 mt-1">{errors.nombre}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Tipo de Proyecto <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  {['Apartamentos', 'Casas'].map(tipo => (
                    <label key={tipo} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tipos_proyecto.includes(tipo)}
                        onChange={() => handleTipoProyectoToggle(tipo)}
                        className="w-5 h-5 text-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tipo}</span>
                    </label>
                  ))}
                </div>
                {errors.tipos_proyecto && <p className="text-sm text-red-600 mt-1">{errors.tipos_proyecto}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Direccion <span className="text-red-500">*</span></label>
                <Input name="direccion" type="text" placeholder="Ej: Av. Las Americas 456" value={formData.direccion} onChange={handleInputChange} required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ciudad <span className="text-red-500">*</span></label>
                <Input name="ciudad" type="text" placeholder="Ej: Guatemala" value={formData.ciudad} onChange={handleInputChange} required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pais <span className="text-red-500">*</span></label>
                <select name="pais" value={formData.pais} onChange={handleInputChange} required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  {['Guatemala','El Salvador','Honduras','Nicaragua','Costa Rica','Panama'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Total de Unidades <span className="text-red-500">*</span></label>
                <Input name="total_unidades" type="number" placeholder="Ej: 120" value={formData.total_unidades} onChange={handleInputChange} min="1" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cuota de Mantenimiento (Q) <span className="text-red-500">*</span></label>
                <Input name="cuota_mantenimiento" type="number" placeholder="Ej: 1500" value={formData.cuota_mantenimiento} onChange={handleInputChange} min="0" step="0.01" required />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre del Administrador <span className="text-red-500">*</span></label>
                <Input name="administrador" type="text" placeholder="Ej: Maria Gonzalez" value={formData.administrador} onChange={handleInputChange} required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Telefono <span className="text-red-500">*</span></label>
                <Input name="telefono" type="tel" placeholder="Ej: +502 2345-6789" value={formData.telefono} onChange={handleInputChange} required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email <span className="text-red-500">*</span></label>
                <Input name="email" type="email" placeholder="Ej: admin@residencial.com" value={formData.email} onChange={handleInputChange} required />
              </div>

              {/* Tipos de Unidades */}
              <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-6 mt-2">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tipos de Unidades <span className="text-red-500">*</span>
                  </label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddTipoUnidad} className="text-green-600 border-green-300 hover:bg-green-50">
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar Tipo
                  </Button>
                </div>
                <div className="space-y-4">
                  {formData.tipos_unidades.map((unidad, index) => (
                    <div key={unidad.id} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 relative">
                      {formData.tipos_unidades.length > 1 && (
                        <button type="button" onClick={() => handleRemoveTipoUnidad(unidad.id)}
                          className="absolute top-3 right-3 text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Unidad #{index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo <span className="text-red-600">*</span></label>
                          <select value={unidad.tipo} onChange={(e) => handleTipoUnidadChange(unidad.id, 'tipo', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            <option value="">Seleccione</option>
                            <option value="Casa">Casa</option>
                            <option value="Apartamento">Apartamento</option>
                          </select>
                          {errors[`unidad_${unidad.id}_tipo`] && <p className="text-xs text-red-600 mt-1">{errors[`unidad_${unidad.id}_tipo`]}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre <span className="text-red-600">*</span></label>
                          <input type="text" value={unidad.nombre} onChange={(e) => handleTipoUnidadChange(unidad.id, 'nombre', e.target.value)}
                            placeholder="Ej: Tipo A - 2 habitaciones"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                          {errors[`unidad_${unidad.id}_nombre`] && <p className="text-xs text-red-600 mt-1">{errors[`unidad_${unidad.id}_nombre`]}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Metros Cuadrados <span className="text-red-600">*</span></label>
                          <input type="number" value={unidad.metros_cuadrados} onChange={(e) => handleTipoUnidadChange(unidad.id, 'metros_cuadrados', e.target.value)}
                            placeholder="Ej: 85.5" step="0.01" min="0"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                          {errors[`unidad_${unidad.id}_metros_cuadrados`] && <p className="text-xs text-red-600 mt-1">{errors[`unidad_${unidad.id}_metros_cuadrados`]}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dormitorios <span className="text-red-600">*</span></label>
                          <select value={unidad.dormitorios} onChange={(e) => handleTipoUnidadChange(unidad.id, 'dormitorios', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            <option value="">Seleccione</option>
                            {['1','2','3','4','5+'].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                          {errors[`unidad_${unidad.id}_dormitorios`] && <p className="text-xs text-red-600 mt-1">{errors[`unidad_${unidad.id}_dormitorios`]}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Banos <span className="text-red-600">*</span></label>
                          <select value={unidad.banos} onChange={(e) => handleTipoUnidadChange(unidad.id, 'banos', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            <option value="">Seleccione</option>
                            {['1','1.5','2','2.5','3','3.5','4+'].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                          {errors[`unidad_${unidad.id}_banos`] && <p className="text-xs text-red-600 mt-1">{errors[`unidad_${unidad.id}_banos`]}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Plano de Planta</label>
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer">
                              <div className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-center bg-white dark:bg-gray-700">
                                {unidad.plano
                                  ? <span className="text-green-600 dark:text-green-400 font-medium">{unidad.plano.name}</span>
                                  : <span className="text-gray-600 dark:text-gray-400">Subir plano</span>}
                              </div>
                              <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileUpload(unidad.id, e.target.files?.[0] || null)} className="hidden" />
                            </label>
                            {unidad.plano && (
                              <button type="button" onClick={() => handleTipoUnidadChange(unidad.id, 'plano', null)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG o PDF (max. 5MB)</p>
                          {errors[`unidad_${unidad.id}_plano`] && <p className="text-xs text-red-600 mt-1">{errors[`unidad_${unidad.id}_plano`]}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenidades */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Amenidades</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AMENIDADES_OPTIONS.map(amenidad => (
                    <label key={amenidad} className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                      <input type="checkbox" checked={formData.amenidades.includes(amenidad)} onChange={() => handleAmenidadToggle(amenidad)}
                        className="w-4 h-4 text-green-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{amenidad}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={handleCloseAddModal}>Cancelar</Button>
              <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar Residencial'}
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      <DangerConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.nombre || ''}
        warningMessage="Esta accion eliminara el residencial y todos sus datos asociados. Esta operacion es irreversible."
      />
    </div>
  );
}
