import React, { useState, useMemo } from 'react';
import { Building2, MapPin, Users, Home, Search, Grid3x3, List, Eye, CreditCard as Edit, Plus, Filter, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Dialog } from '../../../components/ui/Dialog';
import { DangerConfirmDialog } from '../../../components/ui/DangerConfirmDialog';
import { useToast } from '../../../components/ui/Toast';

interface Residential {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  pais: string;
  total_unidades: number;
  unidades_ocupadas: number;
  total_residentes: number;
  cuota_mantenimiento: number;
  fecha_fundacion: string;
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  administrador: string;
  telefono: string;
  email: string;
  amenidades: string[];
  imagen: string;
}

const MOCK_RESIDENTIALS: Residential[] = [
  {
    id: '1',
    nombre: 'Torres del Valle',
    direccion: 'Av. Las Américas 456',
    ciudad: 'Guatemala',
    pais: 'Guatemala',
    total_unidades: 120,
    unidades_ocupadas: 98,
    total_residentes: 245,
    cuota_mantenimiento: 1500,
    fecha_fundacion: '2018-03-15',
    estado: 'activo',
    administrador: 'María González',
    telefono: '+502 2345-6789',
    email: 'admin@torresdelValle.com',
    amenidades: ['Piscina', 'Gimnasio', 'Salón Social', 'Parque Infantil', 'Seguridad 24/7'],
    imagen: 'https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg',
  },
  {
    id: '2',
    nombre: 'Condominio El Roble',
    direccion: 'Calle Principal 123',
    ciudad: 'Antigua',
    pais: 'Guatemala',
    total_unidades: 45,
    unidades_ocupadas: 42,
    total_residentes: 98,
    cuota_mantenimiento: 1200,
    fecha_fundacion: '2015-08-20',
    estado: 'activo',
    administrador: 'Carlos Méndez',
    telefono: '+502 7890-1234',
    email: 'info@elroble.com',
    amenidades: ['Jardines', 'BBQ', 'Estacionamiento', 'Seguridad'],
    imagen: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
  },
  {
    id: '3',
    nombre: 'Residencial Las Palmas',
    direccion: 'Blvd. Vista Hermosa 789',
    ciudad: 'Guatemala',
    pais: 'Guatemala',
    total_unidades: 85,
    unidades_ocupadas: 76,
    total_residentes: 189,
    cuota_mantenimiento: 1350,
    fecha_fundacion: '2020-01-10',
    estado: 'activo',
    administrador: 'Ana Martínez',
    telefono: '+502 5678-9012',
    email: 'contacto@laspalmas.com',
    amenidades: ['Piscina', 'Cancha Tenis', 'Salón de Eventos', 'Área Verde', 'Gym'],
    imagen: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
  },
  {
    id: '4',
    nombre: 'Villas del Sol',
    direccion: 'Km 15.5 Carretera a El Salvador',
    ciudad: 'Santa Catarina Pinula',
    pais: 'Guatemala',
    total_unidades: 30,
    unidades_ocupadas: 28,
    total_residentes: 72,
    cuota_mantenimiento: 1800,
    fecha_fundacion: '2019-06-05',
    estado: 'activo',
    administrador: 'Roberto Castillo',
    telefono: '+502 3456-7890',
    email: 'admin@villasdelsol.com',
    amenidades: ['Piscina Privada', 'Casa Club', 'Parque', 'Seguridad'],
    imagen: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg',
  },
  {
    id: '5',
    nombre: 'Edificio Central Plaza',
    direccion: 'Zona 10, Diagonal 6',
    ciudad: 'Guatemala',
    pais: 'Guatemala',
    total_unidades: 60,
    unidades_ocupadas: 55,
    total_residentes: 132,
    cuota_mantenimiento: 2200,
    fecha_fundacion: '2017-11-30',
    estado: 'activo',
    administrador: 'Patricia Ruiz',
    telefono: '+502 2234-5678',
    email: 'info@centralplaza.com',
    amenidades: ['Roof Garden', 'Gimnasio', 'Coworking', 'Parqueo Techado'],
    imagen: 'https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg',
  },
  {
    id: '6',
    nombre: 'Condominio Los Pinos',
    direccion: 'Carretera a San Lucas 234',
    ciudad: 'Sacatepéquez',
    pais: 'Guatemala',
    total_unidades: 38,
    unidades_ocupadas: 30,
    total_residentes: 75,
    cuota_mantenimiento: 950,
    fecha_fundacion: '2016-04-18',
    estado: 'mantenimiento',
    administrador: 'Juan López',
    telefono: '+502 4567-8901',
    email: 'contacto@lospinos.com',
    amenidades: ['Jardines', 'Seguridad', 'Estacionamiento'],
    imagen: 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg',
  },
];

export function ResidencialesPage() {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedResidential, setSelectedResidential] = useState<Residential | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Residential | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    pais: 'Guatemala',
    total_unidades: '',
    cuota_mantenimiento: '',
    administrador: '',
    telefono: '',
    email: '',
    amenidades: [] as string[],
    tipos_proyecto: [] as string[],
    tipos_unidades: [
      {
        id: '1',
        tipo: '',
        nombre: '',
        metros_cuadrados: '',
        dormitorios: '',
        banos: '',
        plano: null as File | null,
      },
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const amenidadesOptions = [
    'Piscina',
    'Gimnasio',
    'Salón Social',
    'Firepit',
    'Mancave',
    'Cancha Polideportiva',
    'Terraza',
    'Pérgola',
  ];

  const filteredResidentials = useMemo(() => {
    return MOCK_RESIDENTIALS.filter((res) => {
      const matchesSearch =
        res.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.direccion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || res.estado === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  const totalStats = useMemo(() => {
    return {
      totalResidentials: MOCK_RESIDENTIALS.length,
      totalUnits: MOCK_RESIDENTIALS.reduce((acc, res) => acc + res.total_unidades, 0),
      totalResidents: MOCK_RESIDENTIALS.reduce((acc, res) => acc + res.total_residentes, 0),
      occupancyRate: Math.round(
        (MOCK_RESIDENTIALS.reduce((acc, res) => acc + res.unidades_ocupadas, 0) /
          MOCK_RESIDENTIALS.reduce((acc, res) => acc + res.total_unidades, 0)) *
          100
      ),
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'inactivo':
        return 'Inactivo';
      case 'mantenimiento':
        return 'Mantenimiento';
      default:
        return status;
    }
  };

  const handleViewDetails = (residential: Residential) => {
    setSelectedResidential(residential);
    setShowDetailModal(true);
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      nombre: '',
      direccion: '',
      ciudad: '',
      pais: 'Guatemala',
      total_unidades: '',
      cuota_mantenimiento: '',
      administrador: '',
      telefono: '',
      email: '',
      amenidades: [],
      tipos_proyecto: [],
      tipos_unidades: [
        {
          id: '1',
          tipo: '',
          nombre: '',
          metros_cuadrados: '',
          dormitorios: '',
          banos: '',
          plano: null,
        },
      ],
    });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenidadToggle = (amenidad: string) => {
    setFormData((prev) => {
      const amenidades = prev.amenidades.includes(amenidad)
        ? prev.amenidades.filter((a) => a !== amenidad)
        : [...prev.amenidades, amenidad];
      return { ...prev, amenidades };
    });
  };

  const handleTipoProyectoToggle = (tipo: string) => {
    setFormData((prev) => {
      const tipos_proyecto = prev.tipos_proyecto.includes(tipo)
        ? prev.tipos_proyecto.filter((t) => t !== tipo)
        : [...prev.tipos_proyecto, tipo];
      return { ...prev, tipos_proyecto };
    });
    if (errors.tipos_proyecto) {
      setErrors((prev) => ({ ...prev, tipos_proyecto: '' }));
    }
  };

  const handleAddTipoUnidad = () => {
    setFormData((prev) => ({
      ...prev,
      tipos_unidades: [
        ...prev.tipos_unidades,
        {
          id: Date.now().toString(),
          tipo: '',
          nombre: '',
          metros_cuadrados: '',
          dormitorios: '',
          banos: '',
          plano: null,
        },
      ],
    }));
  };

  const handleRemoveTipoUnidad = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      tipos_unidades: prev.tipos_unidades.filter((u) => u.id !== id),
    }));
  };

  const handleTipoUnidadChange = (id: string, field: string, value: string | File | null) => {
    setFormData((prev) => ({
      ...prev,
      tipos_unidades: prev.tipos_unidades.map((u) =>
        u.id === id ? { ...u, [field]: value } : u
      ),
    }));
    const errorKey = `unidad_${id}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleFileUpload = (id: string, file: File | null) => {
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        [`unidad_${id}_plano`]: 'El archivo no debe exceder 5MB',
      }));
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [`unidad_${id}_plano`]: 'Solo se permiten archivos JPG, PNG o PDF',
      }));
      return;
    }

    handleTipoUnidadChange(id, 'plano', file);
    setErrors((prev) => ({ ...prev, [`unidad_${id}_plano`]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.tipos_proyecto.length === 0) {
      newErrors.tipos_proyecto = 'Debe seleccionar al menos un tipo de proyecto';
    }

    formData.tipos_unidades.forEach((unidad) => {
      if (!unidad.tipo) {
        newErrors[`unidad_${unidad.id}_tipo`] = 'Campo requerido';
      }
      if (!unidad.nombre || unidad.nombre.length < 3) {
        newErrors[`unidad_${unidad.id}_nombre`] = 'Debe tener al menos 3 caracteres';
      }
      if (!unidad.metros_cuadrados || parseFloat(unidad.metros_cuadrados) <= 0) {
        newErrors[`unidad_${unidad.id}_metros_cuadrados`] = 'Debe ser un número positivo';
      }
      if (!unidad.dormitorios) {
        newErrors[`unidad_${unidad.id}_dormitorios`] = 'Campo requerido';
      }
      if (!unidad.banos) {
        newErrors[`unidad_${unidad.id}_banos`] = 'Campo requerido';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const tiposProyectoText = `\nTipos de Proyecto: ${formData.tipos_proyecto.join(', ')}`;
    const unidadesText = `\nTipos de Unidades Configurados: ${formData.tipos_unidades.length}`;
    const amenidadesText = formData.amenidades.length > 0
      ? `\nAmenidades: ${formData.amenidades.join(', ')}`
      : '';

    alert(`¡Éxito! Residencial "${formData.nombre}" agregado correctamente.${tiposProyectoText}${unidadesText}${amenidadesText}\n\nNota: Esta es una demostración. En producción, los datos se guardarían en el sistema.`);

    handleCloseAddModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestión de Residenciales</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administra todos los complejos residenciales del sistema</p>
        </div>
        <Button className="bg-green-500 hover:bg-green-600" onClick={handleOpenAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Residencial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Residenciales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalStats.totalResidentials}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Unidades</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalStats.totalUnits}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Home className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Residentes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalStats.totalResidents}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ocupación</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalStats.occupancyRate}%</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, ciudad o dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 items-center w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="activo">Activo</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list' ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
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
              <p className="text-gray-600 dark:text-gray-400">Intenta con otros términos de búsqueda o filtros</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResidentials.map((residential) => (
                <Card key={residential.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={residential.imagen}
                      alt={residential.nombre}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className={getStatusColor(residential.estado)}>
                        {getStatusLabel(residential.estado)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{residential.nombre}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {residential.ciudad}, {residential.pais}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Home className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {residential.unidades_ocupadas} / {residential.total_unidades} unidades ocupadas
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {residential.total_residentes} residentes
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetails(residential)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver detalles
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(residential)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResidentials.map((residential) => (
                <Card key={residential.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={residential.imagen}
                        alt={residential.nombre}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{residential.nombre}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{residential.direccion}</p>
                          </div>
                          <Badge className={getStatusColor(residential.estado)}>
                            {getStatusLabel(residential.estado)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Ciudad</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{residential.ciudad}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Unidades</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {residential.unidades_ocupadas}/{residential.total_unidades}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Residentes</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{residential.total_residentes}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Mantenimiento</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Q{residential.cuota_mantenimiento.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(residential)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver detalles
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTarget(residential)}
                          >
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

      {showDetailModal && selectedResidential && (
        <Dialog
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedResidential(null);
          }}
          title={selectedResidential.nombre}
          size="lg"
        >
          <div className="space-y-6">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <img
                src={selectedResidential.imagen}
                alt={selectedResidential.nombre}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Dirección</h4>
                <p className="text-sm text-gray-900">{selectedResidential.direccion}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Ciudad</h4>
                <p className="text-sm text-gray-900">{selectedResidential.ciudad}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Administrador</h4>
                <p className="text-sm text-gray-900">{selectedResidential.administrador}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Teléfono</h4>
                <p className="text-sm text-gray-900">{selectedResidential.telefono}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Email</h4>
                <p className="text-sm text-gray-900">{selectedResidential.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Estado</h4>
                <Badge className={getStatusColor(selectedResidential.estado)}>
                  {getStatusLabel(selectedResidential.estado)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{selectedResidential.total_unidades}</p>
                <p className="text-xs text-gray-600 mt-1">Total Unidades</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{selectedResidential.unidades_ocupadas}</p>
                <p className="text-xs text-gray-600 mt-1">Ocupadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{selectedResidential.total_residentes}</p>
                <p className="text-xs text-gray-600 mt-1">Residentes</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Amenidades</h4>
              <div className="flex flex-wrap gap-2">
                {selectedResidential.amenidades.map((amenidad, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800">
                    {amenidad}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Cuota de Mantenimiento</h4>
                <p className="text-lg font-bold text-gray-900">
                  Q{selectedResidential.cuota_mantenimiento.toLocaleString()}/mes
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Fecha de Fundación</h4>
                <p className="text-sm text-gray-900">
                  {new Date(selectedResidential.fecha_fundacion).toLocaleDateString('es-GT', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      <DangerConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          showToast('Residencial eliminado exitosamente', 'success');
          setDeleteTarget(null);
        }}
        itemName={deleteTarget?.nombre || ''}
        warningMessage="Esta accion eliminara el residencial y todos sus datos asociados: unidades, residentes, reservas, pagos, accesos, mudanzas, amonestaciones y mas. Esta operacion es irreversible en produccion."
      />

      {showAddModal && (
        <Dialog
          open={showAddModal}
          onClose={handleCloseAddModal}
          title="Agregar Nuevo Residencial"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Residencial <span className="text-red-500">*</span>
                </label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Ej: Torres del Valle"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tipo de Proyecto <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tipos_proyecto.includes('Apartamentos')}
                      onChange={() => handleTipoProyectoToggle('Apartamentos')}
                      className="w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Apartamentos</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tipos_proyecto.includes('Casas')}
                      onChange={() => handleTipoProyectoToggle('Casas')}
                      className="w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Casas</span>
                  </label>
                </div>
                {errors.tipos_proyecto && (
                  <p className="text-sm text-red-600 mt-1">{errors.tipos_proyecto}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="direccion" className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <Input
                  id="direccion"
                  name="direccion"
                  type="text"
                  placeholder="Ej: Av. Las Américas 456"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="ciudad" className="block text-sm font-semibold text-gray-700 mb-2">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <Input
                  id="ciudad"
                  name="ciudad"
                  type="text"
                  placeholder="Ej: Guatemala"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="pais" className="block text-sm font-semibold text-gray-700 mb-2">
                  País <span className="text-red-500">*</span>
                </label>
                <select
                  id="pais"
                  name="pais"
                  value={formData.pais}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Guatemala">Guatemala</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="Honduras">Honduras</option>
                  <option value="Nicaragua">Nicaragua</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Panamá">Panamá</option>
                </select>
              </div>

              <div>
                <label htmlFor="total_unidades" className="block text-sm font-semibold text-gray-700 mb-2">
                  Total de Unidades <span className="text-red-500">*</span>
                </label>
                <Input
                  id="total_unidades"
                  name="total_unidades"
                  type="number"
                  placeholder="Ej: 120"
                  value={formData.total_unidades}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label htmlFor="cuota_mantenimiento" className="block text-sm font-semibold text-gray-700 mb-2">
                  Cuota de Mantenimiento (Q) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="cuota_mantenimiento"
                  name="cuota_mantenimiento"
                  type="number"
                  placeholder="Ej: 1500"
                  value={formData.cuota_mantenimiento}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="administrador" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Administrador <span className="text-red-500">*</span>
                </label>
                <Input
                  id="administrador"
                  name="administrador"
                  type="text"
                  placeholder="Ej: María González"
                  value={formData.administrador}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  placeholder="Ej: +502 2345-6789"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ej: admin@residencial.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="md:col-span-2 border-t border-gray-200 pt-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tipos de Unidades <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTipoUnidad}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar Tipo de Unidad
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.tipos_unidades.map((unidad, index) => (
                    <div
                      key={unidad.id}
                      className="p-4 border border-gray-300 rounded-lg bg-gray-50 relative"
                    >
                      {formData.tipos_unidades.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTipoUnidad(unidad.id)}
                          className="absolute top-3 right-3 text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Unidad #{index + 1}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tipo de Unidad <span className="text-red-600">*</span>
                          </label>
                          <select
                            value={unidad.tipo}
                            onChange={(e) => handleTipoUnidadChange(unidad.id, 'tipo', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">Seleccione</option>
                            <option value="Casa">Casa</option>
                            <option value="Apartamento">Apartamento</option>
                          </select>
                          {errors[`unidad_${unidad.id}_tipo`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`unidad_${unidad.id}_tipo`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nombre de la Unidad <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={unidad.nombre}
                            onChange={(e) => handleTipoUnidadChange(unidad.id, 'nombre', e.target.value)}
                            placeholder="Ej: Torre A - Apto 101"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          {errors[`unidad_${unidad.id}_nombre`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`unidad_${unidad.id}_nombre`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Metros Cuadrados <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="number"
                            value={unidad.metros_cuadrados}
                            onChange={(e) => handleTipoUnidadChange(unidad.id, 'metros_cuadrados', e.target.value)}
                            placeholder="Ej: 85.5"
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          {errors[`unidad_${unidad.id}_metros_cuadrados`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`unidad_${unidad.id}_metros_cuadrados`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Dormitorios <span className="text-red-600">*</span>
                          </label>
                          <select
                            value={unidad.dormitorios}
                            onChange={(e) => handleTipoUnidadChange(unidad.id, 'dormitorios', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">Seleccione</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5+">5+</option>
                          </select>
                          {errors[`unidad_${unidad.id}_dormitorios`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`unidad_${unidad.id}_dormitorios`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Baños <span className="text-red-600">*</span>
                          </label>
                          <select
                            value={unidad.banos}
                            onChange={(e) => handleTipoUnidadChange(unidad.id, 'banos', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">Seleccione</option>
                            <option value="1">1</option>
                            <option value="1.5">1.5</option>
                            <option value="2">2</option>
                            <option value="2.5">2.5</option>
                            <option value="3">3</option>
                            <option value="3.5">3.5</option>
                            <option value="4+">4+</option>
                          </select>
                          {errors[`unidad_${unidad.id}_banos`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`unidad_${unidad.id}_banos`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Plano de Planta
                          </label>
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer">
                              <div className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center bg-white">
                                {unidad.plano ? (
                                  <span className="text-green-600 font-medium">{unidad.plano.name}</span>
                                ) : (
                                  <span className="text-gray-600">Subir plano</span>
                                )}
                              </div>
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => handleFileUpload(unidad.id, e.target.files?.[0] || null)}
                                className="hidden"
                              />
                            </label>
                            {unidad.plano && (
                              <button
                                type="button"
                                onClick={() => handleTipoUnidadChange(unidad.id, 'plano', null)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG o PDF (máx. 5MB)</p>
                          {errors[`unidad_${unidad.id}_plano`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`unidad_${unidad.id}_plano`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Amenidades
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenidadesOptions.map((amenidad) => (
                    <label
                      key={amenidad}
                      className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.amenidades.includes(amenidad)}
                        onChange={() => handleAmenidadToggle(amenidad)}
                        className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{amenidad}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseAddModal}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600"
              >
                Guardar Residencial
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
