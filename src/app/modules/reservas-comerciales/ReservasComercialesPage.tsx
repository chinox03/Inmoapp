import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck, Upload, FileText, CheckCircle, Building, Calendar,
  DollarSign, Camera, ChevronDown, ChevronUp, Plus, CreditCard,
  Landmark, AlertCircle, Check, Clock,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import { Input } from '../../../components/ui/Input';
import {
  getReservasComerciales,
  updateReservaComercial,
  ReservaComercial,
  ReservaComercialDocument,
} from './service';
import { supabase } from '../../../lib/supabase';
import { logAuditEvent } from '../../../lib/audit';

type Reserva = ReservaComercial;
type Document = ReservaComercialDocument;

interface PlanFinanciamiento {
  id: string;
  reserva_comercial_id: string;
  tipo: 'enganche' | 'total';
  monto_total: number;
  cuotas: { numero: number; monto: number; fecha: string }[];
  entidad: string;
  estado: string;
  notas: string;
}

const ESTADO_COLORS: Record<string, string> = {
  'Pendiente Documentos': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'En Revision': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'En Revisión': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Aprobada': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Lista para PCV': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
};

export function ReservasComercialesPage() {
  const { showToast } = useToast();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTipo, setUploadTipo] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [ocrData, setOcrData] = useState<any>(null);

  // Financing plans state
  const [expandedFinanciamiento, setExpandedFinanciamiento] = useState<string | null>(null);
  const [planes, setPlanes] = useState<Record<string, PlanFinanciamiento[]>>({});
  const [loadingPlanes, setLoadingPlanes] = useState<string | null>(null);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [planTarget, setPlanTarget] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({
    tipo: 'enganche' as 'enganche' | 'total',
    monto_total: '',
    num_cuotas: '',
    entidad: '',
    notas: '',
  });
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    setLoading(true);
    const data = await getReservasComerciales();
    setReservas(data);
    setLoading(false);
  };

  const loadPlanes = async (reservaId: string) => {
    setLoadingPlanes(reservaId);
    const { data, error } = await supabase
      .from('planes_financiamiento_reserva')
      .select('*')
      .eq('reserva_comercial_id', reservaId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPlanes(prev => ({
        ...prev,
        [reservaId]: data.map((p: Record<string, unknown>) => ({
          ...p,
          cuotas: (p.cuotas as any[]) || [],
        })) as PlanFinanciamiento[],
      }));
    }
    setLoadingPlanes(null);
  };

  const handleToggleFinanciamiento = async (reservaId: string) => {
    if (expandedFinanciamiento === reservaId) {
      setExpandedFinanciamiento(null);
      return;
    }
    setExpandedFinanciamiento(reservaId);
    if (!planes[reservaId]) {
      await loadPlanes(reservaId);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setTimeout(() => {
        setOcrData({
          nombre: 'JOSE ALBERTO HERNANDEZ GARCIA',
          cedula: '1-1234-5678',
          fechaNacimiento: '15/03/1985',
          nacionalidad: 'Guatemala',
        });
      }, 1500);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedReserva || !uploadFile || !uploadTipo) return;

    const newDocument: Document = {
      id: Date.now().toString(),
      tipo: uploadTipo,
      nombre: uploadFile.name,
      fechaCarga: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
    };

    const updatedDocumentos = [...selectedReserva.documentos, newDocument];
    const result = await updateReservaComercial(selectedReserva.id, { documentos: updatedDocumentos });

    if (result.success) {
      const updated = { ...selectedReserva, documentos: updatedDocumentos };
      setReservas(prev => prev.map(r => r.id === selectedReserva.id ? updated : r));
      setSelectedReserva(updated);
      showToast('Documento cargado correctamente.', 'success');
    } else {
      showToast(result.error || 'Error al cargar el documento', 'error');
    }

    setIsUploadModalOpen(false);
    setUploadFile(null);
    setUploadTipo('');
    setOcrData(null);
  };

  const handleMarkAsSuccessful = async (reservaId: string) => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) return;
    const result = await updateReservaComercial(reservaId, { estado: 'Lista para PCV' });
    if (result.success) {
      setReservas(prev => prev.map(r => r.id === reservaId ? { ...r, estado: 'Lista para PCV' } : r));
      showToast(`Reserva de "${reserva.prospecto}" lista para PCV.`, 'success');
    } else {
      showToast(result.error || 'Error al actualizar', 'error');
    }
  };

  const handleOpenAddPlan = (reservaId: string) => {
    setPlanTarget(reservaId);
    setPlanForm({ tipo: 'enganche', monto_total: '', num_cuotas: '', entidad: '', notas: '' });
    setIsAddPlanOpen(true);
  };

  const handleSavePlan = async () => {
    if (!planTarget || !planForm.monto_total) return;
    setSavingPlan(true);

    const numCuotas = parseInt(planForm.num_cuotas) || 1;
    const montoTotal = parseFloat(planForm.monto_total) || 0;
    const cuotas = Array.from({ length: numCuotas }, (_, i) => ({
      numero: i + 1,
      monto: Math.round(montoTotal / numCuotas),
      fecha: '',
    }));

    const { data, error } = await supabase
      .from('planes_financiamiento_reserva')
      .insert([{
        reserva_comercial_id: planTarget,
        tipo: planForm.tipo,
        monto_total: montoTotal,
        cuotas,
        entidad: planForm.entidad,
        estado: 'borrador',
        notas: planForm.notas,
      }])
      .select()
      .single();

    if (!error && data) {
      await logAuditEvent({ entidad: 'planes_financiamiento_reserva', entidadId: data.id, accion: 'CREATE' });
      setPlanes(prev => ({
        ...prev,
        [planTarget]: [...(prev[planTarget] || []), { ...data, cuotas }],
      }));
      showToast('Plan de financiamiento guardado.', 'success');
      setIsAddPlanOpen(false);
    } else {
      showToast(error?.message || 'Error al guardar el plan', 'error');
    }
    setSavingPlan(false);
  };

  const getDocProgress = (reserva: Reserva) => {
    const requeridos = reserva.documentos_requeridos || [];
    if (requeridos.length === 0) return null;
    const cargados = requeridos.filter(req =>
      reserva.documentos.some(d => d.tipo === req)
    ).length;
    return { cargados, total: requeridos.length };
  };

  const getDocumentTypes = (reserva: Reserva): string[] => {
    if (reserva.documentos_requeridos && reserva.documentos_requeridos.length > 0) {
      return reserva.documentos_requeridos;
    }
    return [
      'DPI / Cedula (Frente)', 'DPI / Cedula (Reverso)',
      'Comprobante de pago - Cheque de caja', 'Comprobante de pago - Transferencia bancaria',
      'Voucher de tarjeta de credito', 'Deposito bancario',
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reservas Comerciales</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Control administrativo de reservas confirmadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Reservas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{reservas.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <ClipboardCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                Q{reservas.reduce((acc, r) => acc + r.valor, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">En Revision</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {reservas.filter(r => r.estado === 'En Revision' || r.estado === 'En Revisión').length}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Aprobadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {reservas.filter(r => r.estado === 'Aprobada' || r.estado === 'Lista para PCV').length}
              </p>
            </div>
            <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </Card>
      </div>

      {reservas.length === 0 && (
        <Card className="p-12 text-center">
          <ClipboardCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No hay reservas comerciales aun</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Las reservas aparecen aqui cuando se genera una desde el modulo de Negocios.
          </p>
        </Card>
      )}

      <div className="space-y-6">
        {reservas.map((reserva) => {
          const docProgress = getDocProgress(reserva);
          const docTypes = getDocumentTypes(reserva);
          const allDocsUploaded = docTypes.every(req => reserva.documentos.some(d => d.tipo === req));
          const isFinancExpanded = expandedFinanciamiento === reserva.id;
          const reservaPlanes = planes[reserva.id] || [];

          return (
            <Card key={reserva.id}>
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <Building className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{reserva.prospecto}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{reserva.proyecto}</p>
                      {reserva.unidad && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">{reserva.unidad}</p>
                      )}
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[reserva.estado] || 'bg-gray-100 text-gray-800'}`}>
                        {reserva.estado}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Valor Total</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      Q{reserva.valor.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Reserva: Q{reserva.monto_reserva.toLocaleString()}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3" />
                  Fecha de reserva: {reserva.fecha_reserva}
                </div>

                {/* Document checklist */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Documentos</h4>
                      {docProgress && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          docProgress.cargados === docProgress.total
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {docProgress.cargados}/{docProgress.total}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedReserva(reserva);
                        setUploadTipo(docTypes[0] || '');
                        setIsUploadModalOpen(true);
                      }}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Cargar
                    </Button>
                  </div>

                  {docProgress && (
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-3">
                      <div
                        className="h-1.5 bg-green-500 rounded-full transition-all"
                        style={{ width: `${(docProgress.cargados / docProgress.total) * 100}%` }}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    {docTypes.map((tipoRequerido) => {
                      const uploaded = reserva.documentos.find(d => d.tipo === tipoRequerido);
                      return (
                        <div key={tipoRequerido} className={`flex items-center justify-between p-2 rounded-lg ${
                          uploaded
                            ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800'
                            : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                        }`}>
                          <div className="flex items-center gap-2">
                            {uploaded
                              ? <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                              : <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            }
                            <div>
                              <p className={`text-sm font-medium ${uploaded ? 'text-green-800 dark:text-green-200' : 'text-gray-700 dark:text-gray-300'}`}>
                                {tipoRequerido}
                              </p>
                              {uploaded && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{uploaded.nombre} — {uploaded.fechaCarga}</p>
                              )}
                            </div>
                          </div>
                          {uploaded && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              uploaded.estado === 'Aprobado'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : uploaded.estado === 'Rechazado'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            }`}>
                              {uploaded.estado}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Extra uploaded docs not in required list */}
                    {reserva.documentos
                      .filter(d => !docTypes.includes(d.tipo))
                      .map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{doc.tipo}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{doc.nombre}</p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            Adicional
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Financiamiento section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <button
                    onClick={() => handleToggleFinanciamiento(reserva.id)}
                    className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Landmark className="h-4 w-4" />
                      Planes de Financiamiento
                      {reservaPlanes.length > 0 && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{reservaPlanes.length}</span>
                      )}
                    </span>
                    {isFinancExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {isFinancExpanded && (
                    <div className="mt-4 space-y-3">
                      {loadingPlanes === reserva.id ? (
                        <div className="flex justify-center py-4">
                          <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : reservaPlanes.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                          <CreditCard className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">Sin planes de financiamiento</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Agrega un plan de enganche o plan total</p>
                        </div>
                      ) : (
                        reservaPlanes.map(plan => (
                          <div key={plan.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                  Plan de {plan.tipo}
                                </span>
                              </div>
                              <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full capitalize">
                                {plan.estado}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Monto Total</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">Q{plan.monto_total.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Cuotas</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{plan.cuotas.length}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Entidad</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{plan.entidad || '-'}</p>
                              </div>
                            </div>
                            {plan.notas && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{plan.notas}</p>
                            )}
                          </div>
                        ))
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleOpenAddPlan(reserva.id)} className="w-full">
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar Plan de Financiamiento
                      </Button>
                    </div>
                  )}
                </div>

                {/* CTA */}
                {allDocsUploaded && reserva.estado !== 'Lista para PCV' && (
                  <div className="pt-2">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => handleMarkAsSuccessful(reserva.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Lista para PCV
                    </Button>
                  </div>
                )}

                {!allDocsUploaded && docTypes.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      Faltan documentos requeridos. Completa todos los documentos para poder marcar la reserva como lista para PCV.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Upload modal */}
      {isUploadModalOpen && selectedReserva && (
        <Dialog
          isOpen={isUploadModalOpen}
          onClose={() => { setIsUploadModalOpen(false); setOcrData(null); setUploadFile(null); }}
          title="Cargar Documento"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Documento
              </label>
              <select
                value={uploadTipo}
                onChange={(e) => setUploadTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Seleccione tipo...</option>
                {getDocumentTypes(selectedReserva).map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Archivo</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <input type="file" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                  <Camera className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadFile ? uploadFile.name : 'Hacer clic para seleccionar archivo'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">PDF, JPG, PNG (max. 10MB)</span>
                </label>
              </div>
            </div>

            {ocrData && (
              <Card className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">Datos Extraidos (OCR Simulado)</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(ocrData).map(([k, v]) => (
                        <p key={k} className="text-green-800 dark:text-green-200">
                          <span className="font-medium capitalize">{k}:</span> {String(v)}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => { setIsUploadModalOpen(false); setOcrData(null); setUploadFile(null); }}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmUpload} disabled={!uploadFile || !uploadTipo}>
                Confirmar Carga
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Add plan modal */}
      {isAddPlanOpen && (
        <Dialog
          isOpen={isAddPlanOpen}
          onClose={() => setIsAddPlanOpen(false)}
          title="Agregar Plan de Financiamiento"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Plan</label>
              <div className="grid grid-cols-2 gap-3">
                {(['enganche', 'total'] as const).map(tipo => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setPlanForm(p => ({ ...p, tipo }))}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                      planForm.tipo === tipo
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className={`h-6 w-6 mb-2 ${planForm.tipo === tipo ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">Plan de {tipo}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {tipo === 'enganche' ? 'Solo el enganche inicial' : 'Precio total de la unidad'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monto Total (Q)</label>
                <Input
                  type="number"
                  value={planForm.monto_total}
                  onChange={(e) => setPlanForm(p => ({ ...p, monto_total: e.target.value }))}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Numero de Cuotas</label>
                <Input
                  type="number"
                  value={planForm.num_cuotas}
                  onChange={(e) => setPlanForm(p => ({ ...p, num_cuotas: e.target.value }))}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            {planForm.monto_total && planForm.num_cuotas && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                Cuota mensual estimada: <strong>Q{Math.round(parseFloat(planForm.monto_total) / parseInt(planForm.num_cuotas)).toLocaleString()}</strong>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entidad Financiera</label>
              <Input
                type="text"
                value={planForm.entidad}
                onChange={(e) => setPlanForm(p => ({ ...p, entidad: e.target.value }))}
                placeholder="Ej: Banco Industrial, propio..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas (opcional)</label>
              <textarea
                value={planForm.notas}
                onChange={(e) => setPlanForm(p => ({ ...p, notas: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100 resize-none"
                placeholder="Condiciones especiales, tasa de interes, etc."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setIsAddPlanOpen(false)}>Cancelar</Button>
              <Button onClick={handleSavePlan} disabled={savingPlan || !planForm.monto_total}>
                {savingPlan ? 'Guardando...' : 'Guardar Plan'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
