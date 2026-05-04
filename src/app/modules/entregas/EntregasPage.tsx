import React, { useState, useEffect } from 'react';
import { Plus, PackageCheck, AlertTriangle, CheckCircle, Ticket as TicketIcon, RefreshCw, Loader2, Trash2, Clock, UserCog } from 'lucide-react';
import { Delivery } from './types';
import { EntregaDB, EntregaTicketDB, getEntregas, getEntregaTickets, createEntrega, createEntregaTicket, deleteEntrega } from './service';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { DataTable } from '../../../components/ui/DataTable';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { useToast } from '../../../components/ui/Toast';
import { DeliveryFormModal } from './DeliveryFormModal';
import { TicketDetailModal } from './TicketDetailModal';
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

type Tab = 'entregas' | 'tickets';

export default function EntregasPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('entregas');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [tickets, setTickets] = useState<EntregaTicketDB[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<EntregaTicketDB | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [entregasData, ticketsData] = await Promise.all([
      getEntregas(user),
      getEntregaTickets(),
    ]);
    setDeliveries(entregasData.map(mapEntregaToDelivery));
    setTickets(ticketsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const stats = {
    total: deliveries.length,
    completed: deliveries.filter((d) => d.status === 'completed').length,
    withIssues: deliveries.filter((d) => d.status === 'with_issues').length,
    openTickets: tickets.filter((t) => t.estado !== 'resolved' && t.estado !== 'closed').length,
  };

  const handleSubmitDelivery = async (delivery: Delivery, ticket?: any) => {
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
        estado: 'open',
        prioridad: ticket.priority,
        items_pendientes: ticket.pendingItems,
      }, user);
      showToast('Entrega registrada y ticket de seguimiento creado', 'success');
    } else if (result.success) {
      showToast('Entrega registrada exitosamente', 'success');
    }

    setShowFormModal(false);
    loadData();
  };

  const ticketsByDelivery = tickets.reduce<Record<string, EntregaTicketDB>>((acc, t) => {
    acc[t.entrega_id] = t;
    return acc;
  }, {});

  const columns = [
    {
      key: 'deliveryDate',
      label: 'Fecha',
      sortable: true,
      render: (delivery: Delivery) => (
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {delivery.deliveryDate ? format(new Date(delivery.deliveryDate), 'dd/MM/yyyy') : '-'}
        </p>
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
      render: (delivery: Delivery) => (
        <p className="text-sm text-gray-700 dark:text-gray-300">{delivery.residentName}</p>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (delivery: Delivery) => {
        if (delivery.status === 'completed') {
          return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1 inline" />Completada</Badge>;
        } else if (delivery.status === 'with_issues') {
          return <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1 inline" />Con Observaciones</Badge>;
        }
        return <Badge variant="default">Borrador</Badge>;
      },
    },
    {
      key: 'ticket',
      label: 'Ticket',
      render: (delivery: Delivery) => {
        const t = ticketsByDelivery[delivery.id];
        if (!t) return <span className="text-xs text-gray-400">-</span>;
        const resuelto = t.estado === 'resolved' || t.estado === 'closed';
        return (
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedTicket(t); }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
          >
            <TicketIcon className="h-3 w-3" />
            {t.numero_ticket || 'Ticket'}
            {resuelto ? ' - Resuelto' : ' - Abierto'}
          </button>
        );
      },
    },
    {
      key: 'checklistItems',
      label: 'Verificacion',
      render: (delivery: Delivery) => {
        const items = delivery.checklistItems || [];
        const total = items.length;
        const compliant = items.filter((item: any) => item.status === 'compliant').length;
        const nonCompliant = items.filter((item: any) => item.status === 'non_compliant').length;
        return (
          <div className="text-sm">
            <p className="text-gray-900 dark:text-gray-100 font-medium">{compliant}/{total} conformes</p>
            {nonCompliant > 0 && (
              <p className="text-red-600 dark:text-red-400">{nonCompliant} no conformes</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (delivery: Delivery) => (
        <Button size="sm" variant="outline" onClick={() => setDeleteTarget(delivery)}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      ),
    },
  ];

  const ticketColumns = [
    {
      key: 'numero_ticket',
      label: 'Ticket',
      render: (t: EntregaTicketDB) => (
        <p className="font-medium text-gray-900 dark:text-gray-100">{t.numero_ticket || t.id.slice(0, 8)}</p>
      ),
    },
    {
      key: 'unidad',
      label: 'Unidad / Cliente',
      render: (t: EntregaTicketDB) => (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.unidad}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{t.residente_nombre}</p>
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (t: EntregaTicketDB) => {
        switch (t.estado) {
          case 'open':
            return <Badge variant="info"><Clock className="h-3 w-3 mr-1 inline" />Abierto</Badge>;
          case 'assigned':
            return <Badge variant="info"><UserCog className="h-3 w-3 mr-1 inline" />Asignado</Badge>;
          case 'in_progress':
            return <Badge variant="warning">En Progreso</Badge>;
          case 'resolved':
            return <Badge variant="success">Resuelto</Badge>;
          case 'closed':
            return <Badge variant="default">Cerrado</Badge>;
          default:
            return <Badge variant="default">{t.estado}</Badge>;
        }
      },
    },
    {
      key: 'prioridad',
      label: 'Prioridad',
      render: (t: EntregaTicketDB) =>
        t.prioridad === 'high' ? <Badge variant="danger">Alta</Badge> :
        t.prioridad === 'medium' ? <Badge variant="warning">Media</Badge> :
        <Badge variant="default">Baja</Badge>,
    },
    {
      key: 'responsable',
      label: 'Responsable',
      render: (t: EntregaTicketDB) => (
        <div className="text-sm">
          <p className="text-gray-900 dark:text-gray-100">{t.responsable_nombre || 'Sin asignar'}</p>
          {t.equipo_asignado && <p className="text-xs text-gray-500 dark:text-gray-400">{t.equipo_asignado}</p>}
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (t: EntregaTicketDB) => {
        const items = t.items_pendientes || [];
        const total = items.length;
        const resueltos = items.filter((it: any) => typeof it !== 'string' && it.resuelto).length;
        return <p className="text-sm text-gray-700 dark:text-gray-300">{resueltos}/{total}</p>;
      },
    },
    {
      key: 'fecha_compromiso',
      label: 'Compromiso',
      render: (t: EntregaTicketDB) => {
        if (!t.fecha_compromiso) return <span className="text-xs text-gray-400">-</span>;
        const d = new Date(t.fecha_compromiso);
        const vencido = d < new Date() && t.estado !== 'resolved' && t.estado !== 'closed';
        return (
          <p className={`text-sm ${vencido ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
            {format(d, 'dd/MM/yyyy')}
            {vencido && ' (vencido)'}
          </p>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      render: (t: EntregaTicketDB) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedTicket(t)}>
          Ver
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
            Gestion de entregas y seguimiento de pendientes
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

        <button
          onClick={() => setTab('tickets')}
          className="text-left"
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
        </button>
      </div>

      <Card>
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setTab('entregas')}
              className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                tab === 'entregas'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Entregas ({deliveries.length})
            </button>
            <button
              onClick={() => setTab('tickets')}
              className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                tab === 'tickets'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Tickets de Seguimiento ({tickets.length})
            </button>
          </div>
        </div>
        <div className="p-6">
          {tab === 'entregas' ? (
            <DataTable data={deliveries} columns={columns} emptyMessage="No hay entregas registradas" />
          ) : (
            <DataTable data={tickets} columns={ticketColumns} emptyMessage="No hay tickets de seguimiento" />
          )}
        </div>
      </Card>

      {showFormModal && (
        <DeliveryFormModal
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSubmitDelivery}
        />
      )}

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={() => {
            loadData();
            // refresh modal data
            getEntregaTickets().then((ts) => {
              const updated = ts.find((t) => t.id === selectedTicket.id);
              if (updated) setSelectedTicket(updated);
            });
          }}
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
