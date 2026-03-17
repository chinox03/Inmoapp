import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Phone, ClipboardList, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Dialog } from '../../../components/ui/Dialog';
import { useToast } from '../../../components/ui/Toast';
import { format } from 'date-fns';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { getEncuestas, addEncuesta, deleteEncuesta } from './service';
import { TIPOS_ENCUESTA, MOCK_SURVEY_TEMPLATES } from './mockData';
import { Encuesta, RespuestaEncuesta, Pregunta, SurveyTemplate } from './types';
import { CreateSurveyModal } from './CreateSurveyModal';
import { supabase } from '../../../lib/supabase';

interface ResidencialOption {
  id: string;
  nombre: string;
}

interface ResidenteOption {
  id: string;
  nombre: string;
  telefono: string;
  residencial_id: string;
}

export function EncuestasPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateSurveyModal, setShowCreateSurveyModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Encuesta | null>(null);
  const [surveyTemplates, setSurveyTemplates] = useState<SurveyTemplate[]>(MOCK_SURVEY_TEMPLATES);
  const [currentStep, setCurrentStep] = useState(1);
  const [residenciales, setResidenciales] = useState<ResidencialOption[]>([]);
  const [residentes, setResidentes] = useState<ResidenteOption[]>([]);

  const [formData, setFormData] = useState({
    residencial_id: '',
    residente_id: '',
    tipo_encuesta_id: '',
    observaciones: '',
  });

  const [respuestas, setRespuestas] = useState<Record<string, string | number>>({});
  const [startTime] = useState<Date>(new Date());

  const loadEncuestas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEncuestas();
      setEncuestas(data);
    } catch {
      showToast('Error al cargar encuestas', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadResidenciales = useCallback(async () => {
    const { data } = await supabase
      .from('residenciales')
      .select('id, nombre')
      .order('nombre', { ascending: true });
    if (data) setResidenciales(data);
  }, []);

  const loadResidentes = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, nombre, apellido, telefono, residencial_id')
      .eq('rol', 'RESIDENTE')
      .eq('estado', 'activo')
      .order('nombre', { ascending: true });
    if (data) {
      setResidentes(data.map(r => ({
        id: r.id,
        nombre: `${r.nombre || ''} ${r.apellido || ''}`.trim(),
        telefono: r.telefono || '',
        residencial_id: r.residencial_id || '',
      })));
    }
  }, []);

  useEffect(() => {
    loadEncuestas();
    loadResidenciales();
    loadResidentes();
  }, [loadEncuestas, loadResidenciales, loadResidentes]);

  const selectedResidencial = residenciales.find(r => r.id === formData.residencial_id);
  const selectedResidente = residentes.find(r => r.id === formData.residente_id);
  const selectedTipoEncuesta = TIPOS_ENCUESTA.find(t => t.id === formData.tipo_encuesta_id);
  const residentesFiltrados = residentes.filter(r => r.residencial_id === formData.residencial_id);

  const columns: Column<Encuesta>[] = [
    {
      key: 'fecha_realizacion',
      label: 'Fecha',
      render: (item) => format(new Date(item.fecha_realizacion), 'dd/MM/yyyy HH:mm'),
      sortable: true,
    },
    {
      key: 'residencial_nombre',
      label: 'Residencial',
      sortable: true,
    },
    {
      key: 'residente_nombre',
      label: 'Residente',
      sortable: true,
    },
    {
      key: 'residente_telefono',
      label: 'Telefono',
    },
    {
      key: 'tipo_encuesta_nombre',
      label: 'Tipo de Encuesta',
      sortable: true,
    },
    {
      key: 'duracion_minutos',
      label: 'Duracion',
      render: (item) => `${item.duracion_minutos} min`,
    },
    {
      key: 'realizada_por',
      label: 'Realizada por',
    },
    {
      key: 'actions' as any,
      label: 'Acciones',
      render: (item: Encuesta) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDeleteTarget(item)}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      ),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      if (!formData.residencial_id || !formData.residente_id || !formData.tipo_encuesta_id) {
        showToast('Por favor complete todos los campos requeridos', 'error');
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const preguntasRequeridas = selectedTipoEncuesta?.preguntas || [];
      const respuestasCompletas = preguntasRequeridas.every(p => respuestas[p.id] !== undefined && respuestas[p.id] !== '');

      if (!respuestasCompletas) {
        showToast('Por favor responda todas las preguntas', 'error');
        return;
      }

      const duracion = Math.ceil((new Date().getTime() - startTime.getTime()) / 60000);

      const respuestasArray: RespuestaEncuesta[] = Object.entries(respuestas).map(([pregunta_id, respuesta]) => ({
        pregunta_id,
        respuesta,
      }));

      const newEncuesta: Omit<Encuesta, 'id'> = {
        residencial_id: formData.residencial_id,
        residencial_nombre: selectedResidencial?.nombre || '',
        residente_id: formData.residente_id,
        residente_nombre: selectedResidente?.nombre || '',
        residente_telefono: selectedResidente?.telefono || '',
        tipo_encuesta_id: formData.tipo_encuesta_id,
        tipo_encuesta_nombre: selectedTipoEncuesta?.nombre || '',
        fecha_realizacion: new Date().toISOString(),
        realizada_por: user?.nombre || 'Operador',
        duracion_minutos: duracion,
        respuestas: respuestasArray,
        observaciones: formData.observaciones,
      };

      const result = await addEncuesta(newEncuesta);
      if (result.success && result.data) {
        setEncuestas(prev => [result.data!, ...prev]);
        showToast('Encuesta registrada exitosamente', 'success');
      } else {
        showToast(result.error || 'Error al registrar encuesta', 'error');
      }
      closeModal();
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setCurrentStep(1);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      residencial_id: '',
      residente_id: '',
      tipo_encuesta_id: '',
      observaciones: '',
    });
    setRespuestas({});
  };

  const handleRespuestaChange = (preguntaId: string, valor: string | number) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor,
    }));
  };

  const handleSaveSurvey = (survey: SurveyTemplate) => {
    setSurveyTemplates([survey, ...surveyTemplates]);
    setShowCreateSurveyModal(false);
    showToast('Encuesta creada exitosamente', 'success');
  };

  const renderPregunta = (pregunta: Pregunta, index: number) => {
    const valor = respuestas[pregunta.id];

    return (
      <div key={pregunta.id} className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {index + 1}. {pregunta.texto} <span className="text-red-500">*</span>
        </label>

        {pregunta.tipo === 'opcion_multiple' && (
          <select
            value={valor as string || ''}
            onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccione una opcion</option>
            {pregunta.opciones?.map((opcion, idx) => (
              <option key={idx} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        )}

        {pregunta.tipo === 'si_no' && (
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={pregunta.id}
                value="Si"
                checked={valor === 'Si'}
                onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span>Si</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={pregunta.id}
                value="No"
                checked={valor === 'No'}
                onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span>No</span>
            </label>
          </div>
        )}

        {pregunta.tipo === 'escala' && (
          <div>
            <div className="flex items-center space-x-4 mb-2">
              {Array.from(
                { length: (pregunta.escala_max || 5) - (pregunta.escala_min || 1) + 1 },
                (_, i) => (pregunta.escala_min || 1) + i
              ).map((num) => (
                <label key={num} className="flex flex-col items-center cursor-pointer">
                  <input
                    type="radio"
                    name={pregunta.id}
                    value={num}
                    checked={valor === num}
                    onChange={(e) => handleRespuestaChange(pregunta.id, parseInt(e.target.value))}
                    className="w-4 h-4 text-blue-600 mb-1"
                  />
                  <span className="text-sm font-medium">{num}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Muy malo</span>
              <span>Excelente</span>
            </div>
          </div>
        )}

        {pregunta.tipo === 'texto_corto' && (
          <input
            type="text"
            value={valor as string || ''}
            onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Escriba su respuesta"
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Encuestas Telefonicas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Registra y gestiona encuestas telefonicas a residentes
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowCreateSurveyModal(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Crear Encuesta
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Encuesta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Total Encuestas</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{encuestas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Hoy</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {encuestas.filter(e => {
                const today = new Date().toDateString();
                return new Date(e.fecha_realizacion).toDateString() === today;
              }).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Duracion Promedio</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {encuestas.length > 0
                ? Math.round(encuestas.reduce((acc, e) => acc + e.duracion_minutos, 0) / encuestas.length)
                : 0}{' '}
              min
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Tipos Usados</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {new Set(encuestas.map(e => e.tipo_encuesta_id)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ClipboardList className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Historial de Encuestas</h2>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={encuestas}
            columns={columns}
            loading={loading}
            emptyMessage="No hay encuestas registradas"
          />
        </CardContent>
      </Card>

      <Dialog
        open={showAddModal}
        onClose={closeModal}
        title={currentStep === 1 ? 'Nueva Encuesta Telefonica' : selectedTipoEncuesta?.nombre || ''}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentStep === 1 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Informacion de la Llamada</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Complete los datos del residente antes de iniciar la encuesta
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Residencial <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.residencial_id}
                  onChange={(e) =>
                    setFormData({ ...formData, residencial_id: e.target.value, residente_id: '' })
                  }
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
                  disabled={!formData.residencial_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">
                    {!formData.residencial_id
                      ? 'Primero seleccione un residencial'
                      : 'Seleccione un residente'}
                  </option>
                  {residentesFiltrados.map((residente) => (
                    <option key={residente.id} value={residente.id}>
                      {residente.nombre} - {residente.telefono}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Encuesta <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tipo_encuesta_id}
                  onChange={(e) => setFormData({ ...formData, tipo_encuesta_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccione el tipo de encuesta</option>
                  {TIPOS_ENCUESTA.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
                {formData.tipo_encuesta_id && selectedTipoEncuesta && (
                  <p className="text-xs text-gray-500 mt-1">{selectedTipoEncuesta.descripcion}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit">Continuar</Button>
              </div>
            </>
          )}

          {currentStep === 2 && selectedTipoEncuesta && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900">
                  Encuesta a: {selectedResidente?.nombre}
                </p>
                <p className="text-xs text-green-700">
                  Tel: {selectedResidente?.telefono} | {selectedResidencial?.nombre}
                </p>
              </div>

              <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
                {selectedTipoEncuesta.preguntas.map((pregunta, index) =>
                  renderPregunta(pregunta, index)
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Comentarios adicionales sobre la llamada"
                />
              </div>

              <div className="flex justify-between space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  Atras
                </Button>
                <Button type="submit">Finalizar Encuesta</Button>
              </div>
            </>
          )}
        </form>
      </Dialog>

      {showCreateSurveyModal && (
        <CreateSurveyModal
          onClose={() => setShowCreateSurveyModal(false)}
          onSave={handleSaveSurvey}
        />
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const result = await deleteEncuesta(deleteTarget.id);
          if (result.success) {
            showToast('Encuesta eliminada exitosamente', 'success');
            setDeleteTarget(null);
            loadEncuestas();
          } else {
            showToast(result.error || 'Error al eliminar encuesta', 'error');
          }
        }}
        itemName={deleteTarget ? `Encuesta - ${deleteTarget.tipo_encuesta_nombre} (${deleteTarget.residente_nombre})` : ''}
      />
    </div>
  );
}
