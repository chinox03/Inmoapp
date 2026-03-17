import React, { useState } from 'react';
import { FileSignature, Building, User, DollarSign, Calendar, CheckCircle, FileText, Package } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Dialog } from '../../../components/ui/Dialog';

interface PCV {
  id: string;
  prospecto: string;
  unidad: string;
  valorTotal: number;
  montoReserva: number;
  saldoPendiente: number;
  fechaFirma: string;
  fechaEntregaEstimada: string;
  estado: 'Firmado' | 'En Proceso' | 'Listo para Entrega';
  comisionAgente: number;
  porcentajeComision: number;
}

const MOCK_PCV: PCV[] = [
  {
    id: '1',
    prospecto: 'Ana Martínez',
    unidad: 'Casa 20',
    valorTotal: 195000,
    montoReserva: 7500,
    saldoPendiente: 187500,
    fechaFirma: '2025-12-05',
    fechaEntregaEstimada: '2026-06-15',
    estado: 'Firmado',
    comisionAgente: 9750,
    porcentajeComision: 5,
  },
  {
    id: '2',
    prospecto: 'Roberto Solís',
    unidad: 'Torre A - Apto 301',
    valorTotal: 125000,
    montoReserva: 5000,
    saldoPendiente: 120000,
    fechaFirma: '2025-12-03',
    fechaEntregaEstimada: '2026-05-20',
    estado: 'En Proceso',
    comisionAgente: 6250,
    porcentajeComision: 5,
  },
  {
    id: '3',
    prospecto: 'Laura Jiménez',
    unidad: 'Torre B - Apto 502',
    valorTotal: 145000,
    montoReserva: 5800,
    saldoPendiente: 139200,
    fechaFirma: '2025-11-28',
    fechaEntregaEstimada: '2026-04-10',
    estado: 'Listo para Entrega',
    comisionAgente: 7250,
    porcentajeComision: 5,
  },
];

const ESTADO_COLORS = {
  'Firmado': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'En Proceso': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Listo para Entrega': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

export function PCVPage() {
  const [pcvList, setPcvList] = useState<PCV[]>(MOCK_PCV);
  const [selectedPCV, setSelectedPCV] = useState<PCV | null>(null);

  const handleMarkForDelivery = (pcvId: string) => {
    const pcv = pcvList.find(p => p.id === pcvId);
    if (pcv) {
      setPcvList(pcvList.map(p =>
        p.id === pcvId ? { ...p, estado: 'Listo para Entrega' } : p
      ));
      alert(`PCV de "${pcv.prospecto}" marcado como listo para entrega. Ahora se habilitará en el módulo de Entrega de Unidades.`);
    }
  };

  const totalPCVs = pcvList.length;
  const totalValor = pcvList.reduce((acc, pcv) => acc + pcv.valorTotal, 0);
  const totalComisiones = pcvList.reduce((acc, pcv) => acc + pcv.comisionAgente, 0);
  const listosEntrega = pcvList.filter(p => p.estado === 'Listo para Entrega').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            PCV - Promesa de Compra Venta
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Control de promesas firmadas y preparación para entrega
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total PCVs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {totalPCVs}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <FileSignature className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                ${totalValor.toLocaleString()}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Comisiones</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                ${totalComisiones.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Listos Entrega</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {listosEntrega}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
              <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pcvList.map((pcv) => (
          <Card key={pcv.id}>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <FileSignature className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {pcv.prospecto}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <Building className="h-3 w-3 mr-1" />
                      {pcv.unidad}
                    </div>
                    <Badge variant="primary" className={`mt-2 ${ESTADO_COLORS[pcv.estado]}`}>
                      {pcv.estado}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSelectedPCV(pcv)}
                >
                  Ver Detalles
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Valor Total</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                    ${pcv.valorTotal.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Comisión Agente</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                    ${pcv.comisionAgente.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fecha Firma</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                    <p className="text-sm text-gray-900 dark:text-gray-100">{pcv.fechaFirma}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Entrega Estimada</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                    <p className="text-sm text-gray-900 dark:text-gray-100">{pcv.fechaEntregaEstimada}</p>
                  </div>
                </div>
              </div>

              {pcv.estado === 'En Proceso' && (
                <div className="pt-4">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleMarkForDelivery(pcv.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar Listo para Entrega
                  </Button>
                </div>
              )}

              {pcv.estado === 'Listo para Entrega' && (
                <div className="pt-4">
                  <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Habilitado en módulo de Entrega de Unidades
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {selectedPCV && (
        <Dialog
          isOpen={!!selectedPCV}
          onClose={() => setSelectedPCV(null)}
          title={`PCV: ${selectedPCV.prospecto}`}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cliente</p>
                <div className="flex items-center mt-1">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedPCV.prospecto}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unidad</p>
                <div className="flex items-center mt-1">
                  <Building className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedPCV.unidad}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Desglose Financiero
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Valor Total:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${selectedPCV.valorTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monto Reserva:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${selectedPCV.montoReserva.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Saldo Pendiente:
                  </span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    ${selectedPCV.saldoPendiente.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Comisión de Agente
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-green-700 dark:text-green-300">Porcentaje:</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {selectedPCV.porcentajeComision}%
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-200 dark:border-green-800">
                  <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                    Monto Comisión:
                  </span>
                  <span className="font-bold text-green-900 dark:text-green-100">
                    ${selectedPCV.comisionAgente.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Firma PCV</p>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedPCV.fechaFirma}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Entrega Estimada</p>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedPCV.fechaEntregaEstimada}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Estado</p>
              <Badge className={ESTADO_COLORS[selectedPCV.estado]}>
                {selectedPCV.estado}
              </Badge>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
