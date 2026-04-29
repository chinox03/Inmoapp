import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Mail, Phone, MessageCircle, Building, Calendar, User, CheckCircle, FileText, StickyNote, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { getNegocios, updateNegocio, deleteNegocio, Negocio } from './service';
import { createReservaComercial } from '../reservas-comerciales/service';

type Stage = 'Interesado' | 'Contactado' | 'Visita Agendada' | 'Visita Realizada' | 'Cotización Formal Enviada';
type ActivityType = 'Correo' | 'Llamada' | 'WhatsApp';

interface Activity {
  id: string;
  tipo: ActivityType;
  descripcion: string;
  fecha: string;
  hora: string;
  usuario: string;
}

interface Note {
  id: string;
  contenido: string;
  fecha: string;
  hora: string;
  usuario: string;
}

interface Deal {
  id: string;
  prospecto: string;
  email: string;
  telefono: string;
  unidad: string;
  proyecto: string;
  tipoInteres: string;
  etapa: Stage;
  fechaCreacion: string;
  actividades: Activity[];
  notas: Note[];
  valor: number;
}

function negocioToDeal(n: Negocio): Deal {
  return {
    id: n.id,
    prospecto: n.prospecto_nombre,
    email: n.email,
    telefono: n.telefono,
    unidad: n.unidad,
    proyecto: n.proyecto,
    tipoInteres: n.tipo_interes,
    etapa: n.etapa as Stage,
    fechaCreacion: n.created_at ? new Date(n.created_at).toISOString().split('T')[0] : '',
    actividades: (n.actividades || []) as Activity[],
    notas: (n.notas || []) as Note[],
    valor: n.valor || 0,
  };
}

const MOCK_DEALS: Deal[] = [
  {
    id: '1',
    prospecto: 'Carlos Ramírez',
    email: 'carlos.ramirez@email.com',
    telefono: '+506 8888-9999',
    unidad: 'Torre A - Apto 301',
    proyecto: 'Torres del Sol',
    tipoInteres: 'Apartamento 2 habitaciones',
    etapa: 'Interesado',
    fechaCreacion: '2025-12-05',
    actividades: [],
    notas: [],
    valor: 125000,
  },
  {
    id: '2',
    prospecto: 'María González',
    email: 'maria.gonzalez@email.com',
    telefono: '+506 7777-8888',
    unidad: 'Casa 15',
    proyecto: 'Residencial Vista Verde',
    tipoInteres: 'Casa independiente',
    etapa: 'Contactado',
    fechaCreacion: '2025-12-04',
    actividades: [
      {
        id: 'a1',
        tipo: 'Llamada',
        descripcion: 'Primera llamada de contacto',
        fecha: '2025-12-05',
        hora: '10:30',
        usuario: 'Juan Pérez',
      },
    ],
    notas: [
      {
        id: 'n1',
        contenido: 'Cliente muy interesado, busca financiamiento',
        fecha: '2025-12-04',
        hora: '15:00',
        usuario: 'Ana López',
      },
    ],
    valor: 180000,
  },
  {
    id: '3',
    prospecto: 'José Hernández',
    email: 'jose.hernandez@email.com',
    telefono: '+506 6666-7777',
    unidad: 'Torre B - Apto 502',
    proyecto: 'Condominio Las Palmas',
    tipoInteres: 'Apartamento 3 habitaciones',
    etapa: 'Visita Agendada',
    fechaCreacion: '2025-12-03',
    actividades: [
      {
        id: 'a2',
        tipo: 'WhatsApp',
        descripcion: 'Confirmación de visita',
        fecha: '2025-12-05',
        hora: '14:00',
        usuario: 'Ana López',
      },
      {
        id: 'a3',
        tipo: 'Correo',
        descripcion: 'Envío de información del proyecto',
        fecha: '2025-12-04',
        hora: '16:45',
        usuario: 'Juan Pérez',
      },
    ],
    notas: [
      {
        id: 'n2',
        contenido: 'Visita agendada para el 10 de diciembre a las 3pm',
        fecha: '2025-12-05',
        hora: '14:05',
        usuario: 'Ana López',
      },
    ],
    valor: 145000,
  },
  {
    id: '4',
    prospecto: 'Ana Martínez',
    email: 'ana.martinez@email.com',
    telefono: '+506 5555-6666',
    unidad: 'Penthouse 1',
    proyecto: 'Torres del Sol',
    tipoInteres: 'Penthouse',
    etapa: 'Visita Realizada',
    fechaCreacion: '2025-12-01',
    actividades: [
      {
        id: 'a4',
        tipo: 'Correo',
        descripcion: 'Envío de planos y especificaciones',
        fecha: '2025-12-03',
        hora: '11:00',
        usuario: 'Juan Pérez',
      },
    ],
    notas: [
      {
        id: 'n3',
        contenido: 'Cliente de alto valor, requiere personalización',
        fecha: '2025-12-02',
        hora: '16:30',
        usuario: 'Juan Pérez',
      },
    ],
    valor: 250000,
  },
  {
    id: '5',
    prospecto: 'Pedro Sánchez',
    email: 'pedro.sanchez@email.com',
    telefono: '+506 4444-5555',
    unidad: 'Local 3',
    proyecto: 'Plaza Comercial Centro',
    tipoInteres: 'Local comercial',
    etapa: 'Cotización Formal Enviada',
    fechaCreacion: '2025-11-28',
    actividades: [
      {
        id: 'a5',
        tipo: 'WhatsApp',
        descripcion: 'Seguimiento de cotización enviada',
        fecha: '2025-12-04',
        hora: '09:30',
        usuario: 'Ana López',
      },
    ],
    notas: [
      {
        id: 'n4',
        contenido: 'Cotización enviada por $95,000. Cliente revisando con su contador',
        fecha: '2025-12-03',
        hora: '10:00',
        usuario: 'Ana López',
      },
    ],
    valor: 95000,
  },
];

const STAGES: Stage[] = [
  'Interesado',
  'Contactado',
  'Visita Agendada',
  'Visita Realizada',
  'Cotización Formal Enviada',
];

const STAGE_COLORS: Record<Stage, string> = {
  'Interesado': 'bg-gray-100 dark:bg-gray-800',
  'Contactado': 'bg-blue-50 dark:bg-blue-900/20',
  'Visita Agendada': 'bg-yellow-50 dark:bg-yellow-900/20',
  'Visita Realizada': 'bg-purple-50 dark:bg-purple-900/20',
  'Cotización Formal Enviada': 'bg-green-50 dark:bg-green-900/20',
};

const ACTIVITY_ICONS = {
  'Correo': Mail,
  'Llamada': Phone,
  'WhatsApp': MessageCircle,
};

const ACTIVITY_COLORS = {
  'Correo': 'text-blue-600 dark:text-blue-400',
  'Llamada': 'text-green-600 dark:text-green-400',
  'WhatsApp': 'text-emerald-600 dark:text-emerald-400',
};

export function NegociosPage() {
  const { showToast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'activities' | 'notes'>('info');
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activityForm, setActivityForm] = useState({
    tipo: 'Correo' as ActivityType,
    descripcion: '',
  });
  const [noteForm, setNoteForm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    const negocios = await getNegocios();
    setDeals(negocios.map(negocioToDeal));
    setLoading(false);
  };

  const persistDeal = async (deal: Deal) => {
    const isMock = deal.id.startsWith('mock-');
    if (isMock) return;

    await updateNegocio(deal.id, {
      etapa: deal.etapa,
      actividades: deal.actividades as any,
      notas: deal.notas as any,
      valor: deal.valor,
    });
  };

  const handleAddActivity = async () => {
    if (!selectedDeal) return;

    const newActivity: Activity = {
      id: Date.now().toString(),
      ...activityForm,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().slice(0, 5),
      usuario: 'Usuario Actual',
    };

    const updatedDeals = deals.map(deal =>
      deal.id === selectedDeal.id
        ? { ...deal, actividades: [newActivity, ...deal.actividades] }
        : deal
    );

    setDeals(updatedDeals);
    const updatedDeal = updatedDeals.find(d => d.id === selectedDeal.id) || null;
    setSelectedDeal(updatedDeal);
    setIsActivityModalOpen(false);
    setActivityForm({ tipo: 'Correo', descripcion: '' });

    if (updatedDeal) {
      await persistDeal(updatedDeal);
    }
  };

  const handleAddNote = async () => {
    if (!selectedDeal || !noteForm.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      contenido: noteForm,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().slice(0, 5),
      usuario: 'Usuario Actual',
    };

    const updatedDeals = deals.map(deal =>
      deal.id === selectedDeal.id
        ? { ...deal, notas: [newNote, ...deal.notas] }
        : deal
    );

    setDeals(updatedDeals);
    const updatedDeal = updatedDeals.find(d => d.id === selectedDeal.id) || null;
    setSelectedDeal(updatedDeal);
    setNoteForm('');

    if (updatedDeal) {
      await persistDeal(updatedDeal);
    }
  };

  const handleGenerateQuote = () => {
    if (!selectedDeal) return;
    setIsQuoteModalOpen(true);
  };

  const handleMarkAsReserved = async (dealId: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    const result = await createReservaComercial({
      negocio_id: deal.id,
      prospecto: deal.prospecto,
      email: deal.email,
      telefono: deal.telefono,
      unidad: deal.unidad,
      proyecto: deal.proyecto,
      tipo_interes: deal.tipoInteres,
      valor: deal.valor,
    });

    if (result.success) {
      showToast(`Reserva generada para "${deal.prospecto}". Visible en Reservas Comerciales.`, 'success');
    } else {
      showToast(result.error || 'Error al generar la reserva', 'error');
    }
  };

  const getDealsByStage = (stage: Stage) => {
    return deals.filter(deal => deal.etapa === stage);
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedDeal(dealId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedDeal) return;

    const updatedDeals = deals.map(deal =>
      deal.id === draggedDeal
        ? { ...deal, etapa: stage }
        : deal
    );

    setDeals(updatedDeals);

    const movedDeal = updatedDeals.find(d => d.id === draggedDeal);
    if (movedDeal) {
      await persistDeal(movedDeal);
    }

    setDraggedDeal(null);
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleDeleteDeal = async () => {
    if (!deleteTarget) return;
    const result = await deleteNegocio(deleteTarget.id);
    if (result.success) {
      showToast('Negocio eliminado', 'success');
      setDeleteTarget(null);
      setSelectedDeal(null);
      loadDeals();
    } else {
      showToast(result.error || 'Error al eliminar', 'error');
    }
  };

  const handleCardClick = (deal: Deal) => {
    if (isDragging) return;
    setSelectedDeal(deal);
    setActiveTab('info');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Negocios
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pipeline de ventas por etapas
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total Pipeline</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${deals.reduce((acc, d) => acc + d.valor, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = getDealsByStage(stage);
          const stageValue = stageDeals.reduce((acc, d) => acc + d.valor, 0);

          return (
            <div
              key={stage}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <Card className={`${STAGE_COLORS[stage]} ${draggedDeal ? 'ring-2 ring-primary-500' : ''}`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {stage}
                    </h3>
                    <Badge variant="secondary">
                      {stageDeals.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ${stageValue.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {stageDeals.map((deal) => (
                    <Card
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onDragEnd={handleDragEnd}
                      className={`p-4 hover:shadow-md transition-all ${
                        draggedDeal === deal.id ? 'opacity-50 scale-95 cursor-grabbing' : 'cursor-grab'
                      }`}
                      onClick={() => handleCardClick(deal)}
                    >
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {deal.prospecto}
                            </h4>
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                              ${deal.valor.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <Building className="h-3 w-3 mr-1" />
                            {deal.unidad}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            {deal.fechaCreacion}
                          </div>
                          <div className="flex items-center space-x-1">
                            {['Correo', 'Llamada', 'WhatsApp'].map((tipo) => {
                              const count = deal.actividades.filter(a => a.tipo === tipo).length;
                              const Icon = ACTIVITY_ICONS[tipo as ActivityType];
                              return count > 0 ? (
                                <div key={tipo} className="flex items-center">
                                  <Icon className={`h-3 w-3 ${ACTIVITY_COLORS[tipo as ActivityType]}`} />
                                  <span className="ml-0.5 text-xs">{count}</span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsReserved(deal.id);
                          }}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Generar Reserva
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                      Sin negocios en esta etapa
                    </div>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {selectedDeal && (
        <Dialog
          isOpen={!!selectedDeal}
          onClose={() => setSelectedDeal(null)}
          title={`Negocio: ${selectedDeal.prospecto}`}
          size="xl"
        >
          <div className="space-y-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Información
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'activities'
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Actividades ({selectedDeal.actividades.length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'notes'
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Notas ({selectedDeal.notas.length})
              </button>
            </div>

            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cliente</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedDeal.prospecto}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedDeal.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedDeal.telefono}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Proyecto</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedDeal.proyecto}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Interés</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedDeal.tipoInteres}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unidad</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedDeal.unidad}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Valor</p>
                    <p className="font-medium text-green-600 dark:text-green-400 text-lg">
                      ${selectedDeal.valor.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Etapa</p>
                    <Badge variant="primary">{selectedDeal.etapa}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Creación</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedDeal.fechaCreacion}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                  <Button onClick={handleGenerateQuote} className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Generar Cotización
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteTarget(selectedDeal)}
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Historial de Actividades
                  </h3>
                  <Button size="sm" onClick={() => setIsActivityModalOpen(true)}>
                    <Plus className="h-3 w-3 mr-1" />
                    Nueva Actividad
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedDeal.actividades.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                      No hay actividades registradas
                    </p>
                  ) : (
                    selectedDeal.actividades.map((activity) => {
                      const Icon = ACTIVITY_ICONS[activity.tipo];
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className={`p-2 rounded-lg bg-white dark:bg-gray-700 ${ACTIVITY_COLORS[activity.tipo]}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {activity.tipo}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {activity.fecha} {activity.hora}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {activity.descripcion}
                            </p>
                            <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <User className="h-3 w-3 mr-1" />
                              {activity.usuario}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <div className="mb-4">
                  <div className="flex items-start space-x-3">
                    <textarea
                      value={noteForm}
                      onChange={(e) => setNoteForm(e.target.value)}
                      rows={3}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none resize-none"
                      placeholder="Escribe una nota sobre este negocio..."
                    />
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!noteForm.trim()}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedDeal.notas.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                      No hay notas registradas
                    </p>
                  ) : (
                    selectedDeal.notas.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <StickyNote className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {note.fecha} {note.hora}
                            </p>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <User className="h-3 w-3 mr-1" />
                            {note.usuario}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {note.contenido}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </Dialog>
      )}

      {isActivityModalOpen && (
        <Dialog
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          title="Nueva Actividad"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Actividad
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Correo', 'Llamada', 'WhatsApp'] as ActivityType[]).map((tipo) => {
                  const Icon = ACTIVITY_ICONS[tipo];
                  return (
                    <button
                      key={tipo}
                      onClick={() => setActivityForm({ ...activityForm, tipo })}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                        activityForm.tipo === tipo
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mb-2 ${ACTIVITY_COLORS[tipo]}`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {tipo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={activityForm.descripcion}
                onChange={(e) => setActivityForm({ ...activityForm, descripcion: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Describe la actividad realizada..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsActivityModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddActivity}>
                Guardar Actividad
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {isQuoteModalOpen && selectedDeal && (
        <Dialog
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          title="Generar Cotización"
          size="lg"
        >
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Información del Cliente
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Cliente:</span>
                  <p className="text-blue-900 dark:text-blue-100">{selectedDeal.prospecto}</p>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Email:</span>
                  <p className="text-blue-900 dark:text-blue-100">{selectedDeal.email}</p>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Teléfono:</span>
                  <p className="text-blue-900 dark:text-blue-100">{selectedDeal.telefono}</p>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Proyecto:</span>
                  <p className="text-blue-900 dark:text-blue-100">{selectedDeal.proyecto}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Detalles de la Propiedad
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-green-600 dark:text-green-400 font-medium">Tipo:</span>
                  <p className="text-green-900 dark:text-green-100">{selectedDeal.tipoInteres}</p>
                </div>
                <div>
                  <span className="text-green-600 dark:text-green-400 font-medium">Unidad:</span>
                  <p className="text-green-900 dark:text-green-100">{selectedDeal.unidad}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-green-600 dark:text-green-400 font-medium">Valor:</span>
                  <p className="text-green-900 dark:text-green-100 text-2xl font-bold">
                    ${selectedDeal.valor.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Resumen de la Cotización
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Precio Base:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${selectedDeal.valor.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mantenimiento (estimado):</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${Math.round(selectedDeal.valor * 0.02).toLocaleString()}/mes
                  </span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">Total:</span>
                    <span className="text-green-600 dark:text-green-400 text-xl font-bold">
                      ${selectedDeal.valor.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Esta cotización se generará en formato PDF y se enviará automáticamente al correo del cliente.
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsQuoteModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  alert(`Cotización generada y enviada a ${selectedDeal.email}`);
                  setIsQuoteModalOpen(false);
                }}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generar y Enviar
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteDeal}
        itemName={deleteTarget ? `${deleteTarget.prospecto} - ${deleteTarget.proyecto}` : ''}
      />
    </div>
  );
}
