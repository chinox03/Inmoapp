import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Shield, Clock, CheckCircle, XCircle, AlertTriangle, Search, RefreshCw, Loader2, Trash2 } from 'lucide-react';
import { WarrantyClaim, WarrantyStatus, TeamType, StatusHistory } from './types';
import { GarantiaDB, getGarantias, createGarantia, updateGarantia, deleteGarantia, getResidenciales as fetchResidenciales } from './service';
import { STATUS_LABELS, PRIORITY_LABELS, CLAIM_TYPE_LABELS, TEAM_LABELS } from './constants';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { DataTable } from '../../../components/ui/DataTable';
import { Select } from '../../../components/ui/Select';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { WarrantyFormModal } from './WarrantyFormModal';
import { ApprovalModal } from './ApprovalModal';
import { ResolutionModal } from './ResolutionModal';
import { format } from 'date-fns';

function mapGarantiaToClaim(g: GarantiaDB): WarrantyClaim {
  return {
    id: g.id,
    claimNumber: g.numero_reclamo,
    residencialId: g.residencial_id || '',
    residencialName: g.residencial?.nombre || '',
    unitNumber: g.unidad,
    residentId: g.residente_id || '',
    residentName: g.residente_nombre,
    residentPhone: g.residente_telefono || '',
    claims: g.claims || [],
    status: g.estado as WarrantyStatus,
    priority: g.prioridad as 'low' | 'medium' | 'high',
    submittedAt: g.fecha_envio || g.created_at,
    reviewedAt: g.fecha_revision || undefined,
    resolvedAt: g.fecha_resolucion || undefined,
    reviewedBy: g.revisor?.nombre || undefined,
    adminNotes: g.notas_admin || undefined,
    estimatedCompletionDate: g.fecha_estimada_completado || undefined,
    assignedTeam: g.equipo_asignado as TeamType | undefined,
    scheduledVisitDate: g.fecha_visita_programada || undefined,
    rejectionReason: g.razon_rechazo as any,
    rejectionNotes: g.notas_rechazo || undefined,
    signature: g.firma || undefined,
    statusHistory: g.historial || [],
  };
}

export default function GarantiasPageNew() {
  const { user } = useAuth();
  const [warranties, setWarranties] = useState<WarrantyClaim[]>([]);
  const [residenciales, setResidenciales] = useState<{ id: string; nombre: string }[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyClaim | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WarrantyStatus | 'all'>('all');
  const [residencialFilter, setResidencialFilter] = useState('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WarrantyClaim | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [garantiasData, residencialesData] = await Promise.all([
      getGarantias(user),
      fetchResidenciales(),
    ]);
    setWarranties(garantiasData.map(mapGarantiaToClaim));
    setResidenciales(residencialesData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const stats = {
    total: warranties.length,
    pending: warranties.filter((w) => w.status === 'pending').length,
    approved: warranties.filter((w) => w.status === 'approved').length,
    inProgress: warranties.filter((w) => w.status === 'in_progress').length,
    resolved: warranties.filter((w) => w.status === 'resolved').length,
    rejected: warranties.filter((w) => w.status === 'rejected').length,
  };

  const filteredWarranties = useMemo(() => {
    return warranties.filter((warranty) => {
      const matchesSearch =
        searchTerm === '' ||
        warranty.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.unitNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || warranty.status === statusFilter;
      const matchesResidencial =
        residencialFilter === 'all' || warranty.residencialId === residencialFilter;

      return matchesSearch && matchesStatus && matchesResidencial;
    });
  }, [warranties, searchTerm, statusFilter, residencialFilter]);

  const handleSubmitWarranty = async (warranty: WarrantyClaim) => {
    const result = await createGarantia({
      numero_reclamo: warranty.claimNumber,
      residencial_id: warranty.residencialId || null,
      unidad: warranty.unitNumber,
      residente_id: warranty.residentId || null,
      residente_nombre: warranty.residentName,
      residente_telefono: warranty.residentPhone,
      claims: warranty.claims,
      estado: warranty.status,
      prioridad: warranty.priority,
      historial: warranty.statusHistory || [],
    }, user);

    if (result.success) {
      setShowFormModal(false);
      showToast('Gestion creada exitosamente', 'success');
      loadData();
    } else {
      showToast(result.error || 'Error al crear gestion', 'error');
    }
  };

  const handleApprove = async (data: { team: TeamType; visitDate: string; notes: string }) => {
    if (!selectedWarranty) return;

    const history: StatusHistory = {
      id: `h-${Date.now()}`,
      status: 'approved',
      timestamp: new Date().toISOString(),
      changedBy: user?.nombre || 'Admin',
      notes: data.notes,
    };

    const result = await updateGarantia(selectedWarranty.id, {
      estado: 'approved',
      equipo_asignado: data.team,
      fecha_visita_programada: data.visitDate,
      fecha_revision: new Date().toISOString(),
      revisado_por: user?.id || null,
      notas_admin: data.notes,
      historial: [...(selectedWarranty.statusHistory || []), history],
    } as any, user);

    if (result.success) {
      setShowApprovalModal(false);
      setSelectedWarranty(null);
      showToast('Gestion aprobada y asignada correctamente', 'success');
      loadData();
    }
  };

  const handleReject = async (data: { reason: any; notes: string }) => {
    if (!selectedWarranty) return;

    const history: StatusHistory = {
      id: `h-${Date.now()}`,
      status: 'rejected',
      timestamp: new Date().toISOString(),
      changedBy: user?.nombre || 'Admin',
      notes: `Motivo: ${data.reason}. ${data.notes}`,
    };

    const result = await updateGarantia(selectedWarranty.id, {
      estado: 'rejected',
      razon_rechazo: data.reason,
      notas_rechazo: data.notes,
      fecha_revision: new Date().toISOString(),
      revisado_por: user?.id || null,
      historial: [...(selectedWarranty.statusHistory || []), history],
    } as any, user);

    if (result.success) {
      setShowApprovalModal(false);
      setSelectedWarranty(null);
      showToast('Gestion rechazada', 'success');
      loadData();
    }
  };

  const handleResolve = async (data: { claims: any[]; signature: string }) => {
    if (!selectedWarranty) return;

    const history: StatusHistory = {
      id: `h-${Date.now()}`,
      status: 'resolved',
      timestamp: new Date().toISOString(),
      changedBy: user?.nombre || 'Equipo Tecnico',
      notes: 'Garantia resuelta y firmada por residente',
    };

    const result = await updateGarantia(selectedWarranty.id, {
      estado: 'resolved',
      claims: data.claims,
      firma: data.signature,
      fecha_resolucion: new Date().toISOString(),
      historial: [...(selectedWarranty.statusHistory || []), history],
    } as any, user);

    if (result.success) {
      setShowResolutionModal(false);
      setSelectedWarranty(null);
      showToast('Garantia resuelta correctamente', 'success');
      loadData();
    }
  };

  const handleStartWork = async (warranty: WarrantyClaim) => {
    const history: StatusHistory = {
      id: `h-${Date.now()}`,
      status: 'in_progress',
      timestamp: new Date().toISOString(),
      changedBy: user?.nombre || 'Equipo Tecnico',
      notes: 'Trabajo iniciado en sitio',
    };

    const result = await updateGarantia(warranty.id, {
      estado: 'in_progress',
      historial: [...(warranty.statusHistory || []), history],
    } as any, user);

    if (result.success) {
      showToast('Trabajo iniciado', 'success');
      loadData();
    }
  };

  const getStatusBadge = (status: WarrantyStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">{STATUS_LABELS[status]}</Badge>;
      case 'approved':
        return <Badge variant="success">{STATUS_LABELS[status]}</Badge>;
      case 'in_progress':
        return <Badge variant="default">{STATUS_LABELS[status]}</Badge>;
      case 'resolved':
        return <Badge variant="success">{STATUS_LABELS[status]}</Badge>;
      case 'rejected':
        return <Badge variant="danger">{STATUS_LABELS[status]}</Badge>;
    }
  };

  const getPriorityBadge = (priority: WarrantyClaim['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger">{PRIORITY_LABELS[priority]}</Badge>;
      case 'medium':
        return <Badge variant="warning">{PRIORITY_LABELS[priority]}</Badge>;
      case 'low':
        return <Badge variant="default">{PRIORITY_LABELS[priority]}</Badge>;
    }
  };

  const columns = [
    {
      key: 'claimNumber',
      label: 'N Reclamo',
      sortable: true,
      render: (warranty: WarrantyClaim) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{warranty.claimNumber}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {format(new Date(warranty.submittedAt), 'dd/MM/yyyy')}
          </p>
        </div>
      ),
    },
    {
      key: 'residencialName',
      label: 'Residencial',
      sortable: true,
      render: (warranty: WarrantyClaim) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{warranty.residencialName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{warranty.unitNumber}</p>
        </div>
      ),
    },
    {
      key: 'residentName',
      label: 'Residente',
      sortable: true,
      render: (warranty: WarrantyClaim) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-gray-100">{warranty.residentName}</p>
        </div>
      ),
    },
    {
      key: 'claims',
      label: 'Problemas',
      render: (warranty: WarrantyClaim) => (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {warranty.claims.length} {warranty.claims.length === 1 ? 'problema' : 'problemas'}
        </p>
      ),
    },
    {
      key: 'assignedTeam',
      label: 'Equipo',
      render: (warranty: WarrantyClaim) =>
        warranty.assignedTeam ? (
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
            {TEAM_LABELS[warranty.assignedTeam]}
          </span>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
        ),
    },
    {
      key: 'priority',
      label: 'Prioridad',
      sortable: true,
      render: (warranty: WarrantyClaim) => getPriorityBadge(warranty.priority),
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (warranty: WarrantyClaim) => getStatusBadge(warranty.status),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (warranty: WarrantyClaim) => (
        <div className="flex gap-2">
          {warranty.status === 'pending' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedWarranty(warranty);
                setShowApprovalModal(true);
              }}
            >
              Revisar
            </Button>
          )}
          {warranty.status === 'approved' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStartWork(warranty)}
            >
              Iniciar
            </Button>
          )}
          {warranty.status === 'in_progress' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedWarranty(warranty);
                setShowResolutionModal(true);
              }}
            >
              Resolver
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeleteTarget(warranty)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
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
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Garantias</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Sistema de gestion de reclamos de garantia
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="primary" onClick={() => setShowFormModal(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Nueva Gestion
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Aprobadas</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">En Progreso</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Resueltas</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Rechazadas</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por numero, residente o unidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="md:w-48"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>

            <Select
              value={residencialFilter}
              onChange={(e) => setResidencialFilter(e.target.value)}
              className="md:w-48"
            >
              <option value="all">Todos los residenciales</option>
              {residenciales.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </Select>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <DataTable
              data={filteredWarranties}
              columns={columns}
              emptyMessage="No se encontraron gestiones"
            />
          </div>
        </div>
      </Card>

      {showFormModal && (
        <WarrantyFormModal
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSubmitWarranty}
        />
      )}

      {showApprovalModal && selectedWarranty && (
        <ApprovalModal
          warranty={selectedWarranty}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedWarranty(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {showResolutionModal && selectedWarranty && (
        <ResolutionModal
          warranty={selectedWarranty}
          onClose={() => {
            setShowResolutionModal(false);
            setSelectedWarranty(null);
          }}
          onResolve={handleResolve}
        />
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget || !user) return;
          const result = await deleteGarantia(deleteTarget.id, user);
          if (result.success) {
            showToast('Garantia eliminada exitosamente', 'success');
            setDeleteTarget(null);
            loadData();
          } else {
            showToast(result.error || 'Error al eliminar garantia', 'error');
          }
        }}
        itemName={deleteTarget ? `Garantia ${deleteTarget.claimNumber} - ${deleteTarget.residentName}` : ''}
      />
    </div>
  );
}
