import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useResidencial } from '../../../contexts/ResidencialContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Dialog, DialogFooter } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { FileUpload } from '../../../components/ui/FileUpload';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useToast } from '../../../components/ui/Toast';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { getPagos, createPago, approvePayment, uploadComprobanteToSupabase, deletePago } from './service';
import { format } from 'date-fns';

export function PagosPage() {
  const { user } = useAuth();
  const { selectedResidencial } = useResidencial();
  const { showToast } = useToast();
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedPago, setSelectedPago] = useState<any>(null);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    tipo: 'mantenimiento',
    observaciones: '',
  });

  const isAdmin = user?.rol === 'SUPERADMIN' || user?.rol === 'ADMIN_RESIDENCIAL';
  const isResidente = user?.rol === 'RESIDENTE';

  useEffect(() => {
    loadPagos();
  }, [user, selectedResidencial]);

  const loadPagos = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getPagos();
      setPagos(data || []);
    } catch (error) {
      console.error('Error cargando pagos:', error);
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedResidencial) return;

    let comprobanteUrl = '';

    if (comprobante) {
      const tempId = `temp-${Date.now()}`;
      const uploadResult = await uploadComprobanteToSupabase(comprobante, tempId);
      if (uploadResult.url) {
        comprobanteUrl = uploadResult.url;
      }
    }

    const result = await createPago(
      {
        residencial_id: selectedResidencial.id,
        residente_id: user.id,
        monto: parseFloat(formData.monto),
        fecha_pago: formData.fecha_pago,
        tipo: formData.tipo as any,
        estado: 'pendiente',
        comprobante_url: comprobanteUrl || undefined,
        observaciones: formData.observaciones || undefined,
      },
      user
    );

    if (result.success) {
      showToast('Pago registrado exitosamente', 'success');
      setShowDialog(false);
      setFormData({
        monto: '',
        fecha_pago: new Date().toISOString().split('T')[0],
        tipo: 'mantenimiento',
        observaciones: '',
      });
      setComprobante(null);
      loadPagos();
    } else {
      showToast(result.error || 'Error al registrar pago', 'error');
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    if (!user) return;

    const result = await approvePayment(id, approved, undefined, user);

    if (result.success) {
      showToast(
        `Pago ${approved ? 'aprobado' : 'rechazado'} exitosamente`,
        'success'
      );
      loadPagos();
    } else {
      showToast(result.error || 'Error al actualizar pago', 'error');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const tipoLabels: Record<string, string> = {
    mantenimiento: 'Mantenimiento',
    extraordinario: 'Extraordinario',
    multa: 'Multa',
  };

  const handleDelete = async () => {
    if (!deleteTarget || !user) return;
    const result = await deletePago(deleteTarget.id, user);
    if (result.success) {
      showToast('Pago eliminado exitosamente', 'success');
      setDeleteTarget(null);
      loadPagos();
    } else {
      showToast(result.error || 'Error al eliminar pago', 'error');
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
      key: 'monto',
      label: 'Monto',
      render: (item) => formatCurrency(item.monto),
      sortable: true,
    },
    {
      key: 'fecha_pago',
      label: 'Fecha',
      render: (item) => item.fecha_pago ? format(new Date(item.fecha_pago), 'dd/MM/yyyy') : 'N/A',
      sortable: true,
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (item) => tipoLabels[item.tipo] || item.tipo || 'N/A',
      sortable: true,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (item) => (
        <StatusBadge
          status={item.estado}
          labels={{
            pendiente: 'Pendiente',
            aprobado: 'Aprobado',
            rechazado: 'Rechazado',
          }}
        />
      ),
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedPago(item);
              setShowDetailDialog(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {isAdmin && item.estado === 'pendiente' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApprove(item.id, true)}
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApprove(item.id, false)}
              >
                <XCircle className="h-4 w-4 text-red-600" />
              </Button>
            </>
          )}
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteTarget(item)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ].filter(Boolean) as Column<any>[];

  const stats = [
    {
      label: 'Total Pagos',
      value: pagos.length,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Pendientes',
      value: pagos.filter((p) => p.estado === 'pendiente').length,
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Aprobados',
      value: pagos.filter((p) => p.estado === 'aprobado').length,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Monto Total',
      value: formatCurrency(pagos.reduce((sum, p) => sum + (p.monto || 0), 0)),
      color: 'text-primary-600 dark:text-primary-400',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando datos de pagos...</p>
      </div>
    );
  }

  if (!pagos || pagos.length === 0) {
    return (
      <div className="p-10 text-center text-gray-600">
        <h2 className="text-2xl font-semibold mb-2">No hay pagos registrados</h2>
        <p>Verifica la conexion o que existan registros en la tabla <code>pagos</code>.</p>
        <Button className="mt-4" onClick={loadPagos}>
          Recargar datos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestion de Pagos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isResidente
              ? 'Registra y consulta tus pagos'
              : 'Administra los pagos de los residentes'}
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Registrar Pago
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{stat.label}</h3>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Historial de Pagos</h2>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={pagos}
            columns={columns}
            loading={loading}
            emptyMessage="No hay pagos registrados"
          />
        </CardContent>
      </Card>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Registrar Pago">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Monto"
            type="number"
            step="0.01"
            value={formData.monto}
            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
            required
          />
          <Input
            label="Fecha de Pago"
            type="date"
            value={formData.fecha_pago}
            onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
            required
          />
          <Select
            label="Tipo de Pago"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            options={[
              { value: 'mantenimiento', label: 'Mantenimiento' },
              { value: 'extraordinario', label: 'Extraordinario' },
              { value: 'multa', label: 'Multa' },
            ]}
          />
          <Input
            label="Observaciones"
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            placeholder="Notas adicionales (opcional)"
          />
          <FileUpload
            label="Comprobante de Pago"
            onChange={(file) => setComprobante(file)}
            accept="image/*,.pdf"
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Dialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        title="Detalle del Pago"
      >
        {selectedPago && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Residente</label>
              <p className="text-gray-900">{selectedPago.residente?.nombre || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Monto</label>
              <p className="text-gray-900 text-xl font-bold">
                {formatCurrency(selectedPago.monto)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha</label>
              <p className="text-gray-900">
                {selectedPago.fecha_pago ? format(new Date(selectedPago.fecha_pago), 'dd/MM/yyyy') : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <p className="text-gray-900">
                {tipoLabels[selectedPago.tipo] || selectedPago.tipo || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <div className="mt-1">
                <StatusBadge
                  status={selectedPago.estado}
                  labels={{
                    pendiente: 'Pendiente',
                    aprobado: 'Aprobado',
                    rechazado: 'Rechazado',
                  }}
                />
              </div>
            </div>
            {selectedPago.observaciones && (
              <div>
                <label className="text-sm font-medium text-gray-700">Observaciones</label>
                <p className="text-gray-900">{selectedPago.observaciones}</p>
              </div>
            )}
            {selectedPago.comprobante_url && (
              <div>
                <label className="text-sm font-medium text-gray-700">Comprobante</label>
                <a
                  href={selectedPago.comprobante_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Ver comprobante
                </a>
              </div>
            )}
          </div>
        )}
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget ? `Pago ${formatCurrency(deleteTarget.monto)} - ${deleteTarget.fecha_pago || ''}` : ''}
      />
    </div>
  );
}
