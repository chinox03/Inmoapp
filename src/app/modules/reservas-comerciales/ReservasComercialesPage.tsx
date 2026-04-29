import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Upload, FileText, CheckCircle, Building, Calendar, DollarSign, Camera } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import {
  getReservasComerciales,
  updateReservaComercial,
  ReservaComercial,
  ReservaComercialDocument,
} from './service';

type Reserva = ReservaComercial;
type Document = ReservaComercialDocument;

const DOCUMENT_TYPES = [
  'Cédula (Frente)',
  'Cédula (Reverso)',
  'Comprobante de Pago',
  'Estado Financiero',
  'Carta de Trabajo',
];

export function ReservasComercialesPage() {
  const { showToast } = useToast();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    tipo: DOCUMENT_TYPES[0],
    archivo: null as File | null,
  });
  const [ocrData, setOcrData] = useState<any>(null);

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    setLoading(true);
    const data = await getReservasComerciales();
    setReservas(data);
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, archivo: file });

      setTimeout(() => {
        setOcrData({
          nombre: 'JOSÉ ALBERTO HERNÁNDEZ GARCÍA',
          cedula: '1-1234-5678',
          fechaNacimiento: '15/03/1985',
          nacionalidad: 'Costarricense',
        });
      }, 1500);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedReserva || !uploadForm.archivo) return;

    const newDocument: Document = {
      id: Date.now().toString(),
      tipo: uploadForm.tipo,
      nombre: uploadForm.archivo.name,
      fechaCarga: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
    };

    const updatedDocumentos = [...selectedReserva.documentos, newDocument];
    const result = await updateReservaComercial(selectedReserva.id, {
      documentos: updatedDocumentos,
    });

    if (result.success) {
      setReservas(reservas.map(reserva =>
        reserva.id === selectedReserva.id
          ? { ...reserva, documentos: updatedDocumentos }
          : reserva
      ));
      showToast('Documento cargado correctamente.', 'success');
    } else {
      showToast(result.error || 'Error al cargar el documento', 'error');
    }

    setIsUploadModalOpen(false);
    setUploadForm({ tipo: DOCUMENT_TYPES[0], archivo: null });
    setOcrData(null);
  };

  const handleMarkAsSuccessful = async (reservaId: string) => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) return;

    const result = await updateReservaComercial(reservaId, { estado: 'Lista para PCV' });
    if (result.success) {
      setReservas(reservas.map(r =>
        r.id === reservaId ? { ...r, estado: 'Lista para PCV' } : r
      ));
      showToast(`Reserva de "${reserva.prospecto}" marcada como exitosa. Lista para PCV.`, 'success');
    } else {
      showToast(result.error || 'Error al actualizar la reserva', 'error');
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reservas Comerciales
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Control administrativo de reservas confirmadas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Reservas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {reservas.length}
              </p>
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
                ${reservas.reduce((acc, r) => acc + r.valor, 0).toLocaleString()}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">En Revisión</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {reservas.filter(r => r.estado === 'En Revisión').length}
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
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reservas.map((reserva) => (
          <Card key={reserva.id}>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <Building className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {reserva.prospecto}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {reserva.unidad}
                    </p>
                    <Badge variant="primary" className="mt-2">
                      {reserva.estado}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    ${reserva.valor.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fecha Reserva</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                    <p className="text-sm text-gray-900 dark:text-gray-100">{reserva.fecha_reserva}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Monto Reserva</p>
                  <div className="flex items-center mt-1">
                    <DollarSign className="h-3 w-3 mr-1 text-gray-400" />
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      ${reserva.monto_reserva.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Documentos ({reserva.documentos.length})
                  </h4>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedReserva(reserva);
                      setIsUploadModalOpen(true);
                    }}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Cargar
                  </Button>
                </div>

                <div className="space-y-2">
                  {reserva.documentos.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                      No hay documentos cargados
                    </p>
                  ) : (
                    reserva.documentos.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {doc.tipo}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {doc.nombre}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            doc.estado === 'Aprobado'
                              ? 'success'
                              : doc.estado === 'Rechazado'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {doc.estado}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {reserva.documentos.length >= 2 && (
                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={() => handleMarkAsSuccessful(reserva.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Exitosa
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {isUploadModalOpen && (
        <Dialog
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setOcrData(null);
          }}
          title="Cargar Documento"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Documento
              </label>
              <select
                value={uploadForm.tipo}
                onChange={(e) => setUploadForm({ ...uploadForm, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-gray-100"
              >
                {DOCUMENT_TYPES.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Archivo
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Camera className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadForm.archivo ? uploadForm.archivo.name : 'Hacer clic para seleccionar archivo'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    PDF, JPG, PNG (máx. 10MB)
                  </span>
                </label>
              </div>
            </div>

            {ocrData && (
              <Card className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                      Datos Extraídos (OCR Simulado)
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-green-800 dark:text-green-200">
                        <span className="font-medium">Nombre:</span> {ocrData.nombre}
                      </p>
                      <p className="text-green-800 dark:text-green-200">
                        <span className="font-medium">Cédula:</span> {ocrData.cedula}
                      </p>
                      <p className="text-green-800 dark:text-green-200">
                        <span className="font-medium">Fecha Nacimiento:</span> {ocrData.fechaNacimiento}
                      </p>
                      <p className="text-green-800 dark:text-green-200">
                        <span className="font-medium">Nacionalidad:</span> {ocrData.nacionalidad}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => {
                setIsUploadModalOpen(false);
                setOcrData(null);
              }}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmUpload}
                disabled={!uploadForm.archivo}
              >
                Confirmar Carga
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
