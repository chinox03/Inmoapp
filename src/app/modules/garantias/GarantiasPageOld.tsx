import React, { useState, useMemo } from 'react';
import { Plus, Shield, Clock, CheckCircle, XCircle, AlertTriangle, Search, Filter } from 'lucide-react';
import { WarrantyClaim, WarrantyStatus } from './types';
import { MOCK_WARRANTY_CLAIMS } from './mockData';
import { STATUS_LABELS, PRIORITY_LABELS, CLAIM_TYPE_LABELS, LOCATION_LABELS } from './constants';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { DataTable } from '../../../components/ui/DataTable';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { WarrantyFormModal } from './WarrantyFormModal';
import { format } from 'date-fns';

export default function GarantiasPage() {
  const [warranties, setWarranties] = useState<WarrantyClaim[]>(MOCK_WARRANTY_CLAIMS);
  const [showFormModal, setShowFormModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WarrantyStatus | 'all'>('all');
  const [residencialFilter, setResidencialFilter] = useState('all');

  const stats = {
    total: warranties.length,
    pending: warranties.filter((w) => w.status === 'pending').length,
    inProgress: warranties.filter((w) => w.status === 'in_progress').length,
    resolved: warranties.filter((w) => w.status === 'resolved').length,
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

  const uniqueResidenciales = Array.from(
    new Set(warranties.map((w) => ({ id: w.residencialId, name: w.residencialName })))
  ).reduce((acc, curr) => {
    if (!acc.find((item) => item.id === curr.id)) {
      acc.push(curr);
    }
    return acc;
  }, [] as { id: string; name: string }[]);

  const handleSubmitWarranty = (warranty: WarrantyClaim) => {
    setWarranties([warranty, ...warranties]);
    setShowFormModal(false);
  };

  const getStatusBadge = (status: WarrantyStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">{STATUS_LABELS[status]}</Badge>;
      case 'in_review':
        return <Badge variant="default">{STATUS_LABELS[status]}</Badge>;
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
      label: 'N° Reclamo',
      sortable: true,
      render: (warranty: WarrantyClaim) => (
        <div>
          <p className="font-medium text-gray-900">{warranty.claimNumber}</p>
          <p className="text-xs text-gray-500">
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
          <p className="font-medium text-gray-900">{warranty.residencialName}</p>
          <p className="text-sm text-gray-600">{warranty.unitNumber}</p>
        </div>
      ),
    },
    {
      key: 'residentName',
      label: 'Residente',
      sortable: true,
      render: (warranty: WarrantyClaim) => (
        <div>
          <p className="text-sm text-gray-900">{warranty.residentName}</p>
          <p className="text-xs text-gray-600">{warranty.residentPhone}</p>
        </div>
      ),
    },
    {
      key: 'claims',
      label: 'Problemas',
      render: (warranty: WarrantyClaim) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">
            {warranty.claims.length} {warranty.claims.length === 1 ? 'problema' : 'problemas'}
          </p>
          <div className="flex flex-wrap gap-1">
            {warranty.claims.slice(0, 2).map((claim) => (
              <span
                key={claim.id}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
              >
                {CLAIM_TYPE_LABELS[claim.claimType]}
              </span>
            ))}
            {warranty.claims.length > 2 && (
              <span className="text-xs text-gray-500">
                +{warranty.claims.length - 2} más
              </span>
            )}
          </div>
        </div>
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
      key: 'estimatedCompletionDate',
      label: 'Fecha Est.',
      render: (warranty: WarrantyClaim) =>
        warranty.estimatedCompletionDate ? (
          <p className="text-sm text-gray-700">
            {format(new Date(warranty.estimatedCompletionDate), 'dd/MM/yyyy')}
          </p>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Garantías</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestión de reclamos de garantía de unidades
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowFormModal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Reclamo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Progreso</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resueltas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
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
                  placeholder="Buscar por número, residente o unidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              {uniqueResidenciales.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <DataTable
              data={filteredWarranties}
              columns={columns}
              emptyMessage="No se encontraron reclamos de garantía"
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
    </div>
  );
}
