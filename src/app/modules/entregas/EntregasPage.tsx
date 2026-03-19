import React, { useState, useEffect } from 'react';
import { Plus, PackageCheck, AlertTriangle, CheckCircle, Ticket as TicketIcon, RefreshCw, Loader2, Trash2 } from 'lucide-react';
import { Delivery, Ticket } from './types';
import { EntregaDB, EntregaTicketDB, getEntregas, getEntregaTickets, createEntrega, createEntregaTicket, deleteEntrega } from './service';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { DataTable } from '../../../components/ui/DataTable';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { useToast } from '../../../components/ui/Toast';
import { DeliveryFormModal } from './DeliveryFormModal';
import { TicketModal } from './TicketModal';
import { format } from 'date-fns';

function mapEntregaToDelivery(e: EntregaDB): Delivery {
  return {
    id: e.id,
    residencialId: e.residencial_id || '',
    residencialName: e.residencial?.nombre || '',
    unitNumber: e.unidad,
    residentId: e.residente_id || '',
    residentName: e.residente_nombre,
    deliveryDate: e.fecha_entrega,
    checklistItems: e.checklist || [],
    photos: e.fotos || [],
    signature: e.firma,
    generalObservations: e.observaciones_generales || '',
    status: e.estado,
    createdAt: e.created_at,
    createdBy: e.creador?.nombre || '',
  };
}

function mapTicketDB(t: EntregaTicketDB): Ticket {
  return {
    id: t.id,
    deliveryId: t.entrega_id,
    unitNumber: t.unidad,
    residencialName: '',
    residentName: t.residente_nombre,
    status: t.estado,
    priority: t.prioridad,
    pendingItems: t.items_pendientes || [],
    createdAt: t.created_at,
    resolvedAt: t.resuelto_en || undefined,
  };
}

export default function EntregasPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [entregasData, ticketsData] = await Promise.all([
      getEntregas(user),
      getEntregaTickets(),
    ]);
    setDeliveries(entregasData.map(mapEntregaToDelivery));
    setTickets(ticketsData.map(mapTicketDB));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const stats = {
    total: deliveries.length,
    completed: deliveries.filter((d) => d.status === 'completed').length,
    withIssues: deliveries.filter((d) => d.status === 'with_issues').length,
    openTickets: tickets.filter((t) => t.status !== 'resolved').length,
  };

  const handleSubmitDelivery = async (delivery: Delivery, ticket?: Ticket) => {
    const result = await createEntrega({
      residencial_id: delivery.residencialId || null,
      unidad: delivery.unitNumber,
      residente_id: delivery.residentId || null,
      residente_nombre: delivery.residentName,
      fecha_entrega: delivery.deliveryDate,
      checklist: delivery.checklistItems,
      fotos: delivery.photos,
      firma: delivery.signature,
      observaciones_generales: delivery.generalObservations,
      estado: delivery.status,
      creado_por: user?.id || null,
    }, user);

    if (result.success && result.data && ticket) {
      await createEntregaTicket({
        entrega_id: result.data.id,
        unidad: ticket.unitNumber,
        residente_nombre: ticket.residentName,
        estado: ticket.status,
        prioridad: ticket.priority,
        items_pendientes: ticket.pendingItems,
      }, user);
    }

    setShowFormModal(false);
    loadData();
  };

  const handleViewTicket = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
    }
  };

  const columns = [
    {
      key: 'deliveryDate',
      label: 'Fecha de Entrega',
      sortable: true,
      render: (delivery: Delivery) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {delivery.deliveryDate ? format(new Date(delivery.deliveryDate), 'dd/MM/yyyy') : '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'residencialName',
      label: 'Residencial',
      sortable: true,
      render: (delivery: Delivery) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{delivery.residencialName || '-'}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{delivery.unitNumber}</p>
        </div>
      ),
    },
    {
      key: 'residentName',
      label: 'Propietario',
      sortable: true,
      render: (delivery: Delivery) => (
        <p className="text-sm text-gray-700 dark:text-gray-300">{delivery.residentName}</p>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (delivery: Delivery) => {
        if (delivery.status === 'completed') {
          return (
            <Badge variant="success">
              <CheckCircle className="h-3 w-3 mr-1 inline" />
              Completada
            </Badge>
          );
        } else if (delivery.status === 'with_issues') {
          return (
            <Badge variant="warning">
              <AlertTriangle className="h-3 w-3 mr-1 inline" />
              Con Observaciones
            </Badge>
          );
        }
        return <Badge variant="default">Borrador</Badge>;
      },
    },
    {
      key: 'checklistItems',
      label: 'Verificacion',
      render: (delivery: Delivery) => {
        const items = delivery.checklistItems || [];
        const total = items.length;
        const compliant = items.filter(
          (item: any) => item.status === 'compliant'
        ).length;
        const nonCompliant = items.filter(
          (item: any) => item.status === 'non_compliant'
        ).length;

        return (
          <div className="text-sm">
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {compliant}/{total} conformes
            </p>
            {nonCompliant > 0 && (
              <p className="text-red-600 dark:text-red-400">{nonCompliant} no conformes</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'createdBy',
      label: 'Creado Por',
      render: (delivery: Delivery) => (
        <p className="text-sm text-gray-700 dark:text-gray-300">{delivery.createdBy || '-'}</p>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (delivery: Delivery) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDeleteTarget(delivery)}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Entrega de Unidades</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestion de entregas y control de calidad
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="primary" onClick={() => setShowFormModal(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Nueva Entrega
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entregas</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <PackageCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completadas</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Con Observaciones</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.withIssues}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tickets Abiertos</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.openTickets}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TicketIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Historial de Entregas
          </h2>
          <DataTable
            data={deliveries}
            columns={columns}
            emptyMessage="No hay entregas registradas"
          />
        </div>
      </Card>

      {showFormModal && (
        <DeliveryFormModal
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSubmitDelivery}
        />
      )}

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget || !user) return;
          const result = await deleteEntrega(deleteTarget.id, user);
          if (result.success) {
            showToast('Entrega eliminada exitosamente', 'success');
            setDeleteTarget(null);
            loadData();
          } else {
            showToast(result.error || 'Error al eliminar entrega', 'error');
          }
        }}
        itemName={deleteTarget ? `Entrega - ${deleteTarget.unitNumber} (${deleteTarget.residentName})` : ''}
      />
    </div>
  );
}
