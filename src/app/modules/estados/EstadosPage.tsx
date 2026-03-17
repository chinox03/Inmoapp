import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useResidencial } from '../../../contexts/ResidencialContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Dialog, DialogFooter } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { getEstadosCuenta, createEstadoCuenta } from './service';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';

type FilterMode = 'residencial' | 'residente';

export function EstadosPage() {
  const { user } = useAuth();
  const { selectedResidencial } = useResidencial();
  const { showToast } = useToast();
  const [estados, setEstados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('residencial');
  const [selectedResidencialFilter, setSelectedResidencialFilter] = useState<string>('');
  const [selectedResidenteFilter, setSelectedResidenteFilter] = useState<string>('');
  const [residenciales, setResidenciales] = useState<Array<{ id: string; nombre: string }>>([]);
  const [residentes, setResidentes] = useState<Array<{ id: string; nombre: string; residencial_id: string }>>([]);

  const [formData, setFormData] = useState({
    periodo: '',
    total_mantenimiento: '',
    residente_id: '',
    residencial_id: '',
  });

  const isAdmin = user?.rol === 'SUPERADMIN' || user?.rol === 'ADMIN_RESIDENCIAL';

  useEffect(() => {
    loadInitialData();
  }, [user, selectedResidencial]);

  const loadInitialData = async () => {
    await Promise.all([
      loadResidenciales(),
      loadResidentes(),
      loadEstados()
    ]);
  };

  const loadResidenciales = async () => {
    try {
      const { data, error } = await supabase
        .from('residenciales')
        .select('id, nombre')
        .order('nombre');

      if (error) throw error;

      if (!data || data.length === 0) {
        setResidenciales([
          { id: 'sample-1', nombre: 'Torres del Valle' },
          { id: 'sample-2', nombre: 'Condominio El Roble' },
          { id: 'sample-3', nombre: 'Residencial Las Palmas' },
        ]);
      } else {
        setResidenciales(data);
      }
    } catch (error) {
      console.error('Error loading residenciales:', error);
      setResidenciales([
        { id: 'sample-1', nombre: 'Torres del Valle' },
        { id: 'sample-2', nombre: 'Condominio El Roble' },
      ]);
    }
  };

  const loadResidentes = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombre, residencial_id')
        .eq('rol', 'RESIDENTE')
        .order('nombre');

      if (error) throw error;

      if (!data || data.length === 0) {
        setResidentes([
          { id: 'sample-res-1', nombre: 'Juan Perez', residencial_id: 'sample-1' },
          { id: 'sample-res-2', nombre: 'Maria Garcia', residencial_id: 'sample-1' },
          { id: 'sample-res-3', nombre: 'Carlos Lopez', residencial_id: 'sample-2' },
        ]);
      } else {
        setResidentes(data);
      }
    } catch (error) {
      console.error('Error loading residentes:', error);
      setResidentes([
        { id: 'sample-res-1', nombre: 'Juan Perez', residencial_id: 'sample-1' },
        { id: 'sample-res-2', nombre: 'Maria Garcia', residencial_id: 'sample-1' },
      ]);
    }
  };

  const loadEstados = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const effectiveResidencialId = selectedResidencial?.id || user?.residencial_id;
      const data = await getEstadosCuenta(user, effectiveResidencialId);
      setEstados(data);
    } catch (error) {
      console.error('Error loading estados:', error);
      showToast('Error al cargar estados de cuenta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const residencialId = formData.residencial_id || selectedResidencial?.id;
    if (!residencialId) {
      showToast('Selecciona un residencial', 'error');
      return;
    }

    const result = await createEstadoCuenta(
      {
        residencial_id: residencialId,
        residente_id: formData.residente_id,
        periodo: formData.periodo,
        total_mantenimiento: parseFloat(formData.total_mantenimiento),
        total_pagado: 0,
        saldo_pendiente: parseFloat(formData.total_mantenimiento),
        fecha_generacion: new Date().toISOString().split('T')[0],
      },
      user
    );

    if (result.success) {
      showToast('Estado de cuenta generado exitosamente', 'success');
      setShowDialog(false);
      setFormData({ periodo: '', total_mantenimiento: '', residente_id: '', residencial_id: '' });
      loadEstados();
    } else {
      showToast(result.error || 'Error al generar estado de cuenta', 'error');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(value);
  };

  const getResidenteName = (residenteId: string, item: any) => {
    if (item.residente?.nombre) return item.residente.nombre;
    const found = residentes.find(r => r.id === residenteId);
    return found?.nombre || 'N/A';
  };

  const filteredEstados = useMemo(() => {
    if (filterMode === 'residencial' && selectedResidencialFilter) {
      return estados.filter(e => e.residencial_id === selectedResidencialFilter);
    } else if (filterMode === 'residente' && selectedResidenteFilter) {
      return estados.filter(e => e.residente_id === selectedResidenteFilter);
    }
    return estados;
  }, [estados, filterMode, selectedResidencialFilter, selectedResidenteFilter]);

  const availableResidentes = useMemo(() => {
    if (selectedResidencialFilter && filterMode === 'residente') {
      return residentes.filter(r => r.residencial_id === selectedResidencialFilter);
    }
    return residentes;
  }, [residentes, selectedResidencialFilter, filterMode]);

  const formResidentes = useMemo(() => {
    if (formData.residencial_id) {
      return residentes.filter(r => r.residencial_id === formData.residencial_id);
    }
    return residentes;
  }, [residentes, formData.residencial_id]);

  const columns: Column<any>[] = [
    {
      key: 'residente_id',
      label: 'Residente',
      render: (item) => getResidenteName(item.residente_id, item),
      sortable: true,
    },
    {
      key: 'periodo',
      label: 'Periodo',
      sortable: true,
    },
    {
      key: 'total_mantenimiento',
      label: 'Total Mantenimiento',
      render: (item) => formatCurrency(item.total_mantenimiento || 0),
      sortable: true,
    },
    {
      key: 'total_pagado',
      label: 'Total Pagado',
      render: (item) => formatCurrency(item.total_pagado || 0),
      sortable: true,
    },
    {
      key: 'saldo_pendiente',
      label: 'Saldo Pendiente',
      render: (item) => (
        <span className={(item.saldo_pendiente || 0) > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
          {formatCurrency(item.saldo_pendiente || 0)}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'fecha_generacion',
      label: 'Fecha Generacion',
      render: (item) => item.fecha_generacion ? format(new Date(item.fecha_generacion), 'dd/MM/yyyy') : '-',
      sortable: true,
    },
  ];

  const totalPagado = filteredEstados.reduce((sum, e) => sum + (e.total_pagado || 0), 0);
  const totalPendiente = filteredEstados.reduce((sum, e) => sum + (e.saldo_pendiente || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Estados de Cuenta</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los estados de cuenta de los residentes
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => showToast('Exportando datos...', 'info')}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Generar Estado
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Total Registros</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredEstados.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Total Pagado</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalPagado)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Saldo Pendiente</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalPendiente)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">Filtrar por:</span>
            </div>

            <div className="flex flex-wrap gap-3 flex-1">
              <select
                value={filterMode}
                onChange={(e) => {
                  setFilterMode(e.target.value as FilterMode);
                  setSelectedResidencialFilter('');
                  setSelectedResidenteFilter('');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="residencial">Por Residencial</option>
                <option value="residente">Por Residente</option>
              </select>

              {filterMode === 'residencial' ? (
                <select
                  value={selectedResidencialFilter}
                  onChange={(e) => setSelectedResidencialFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 min-w-[200px]"
                >
                  <option value="">Seleccione un residencial</option>
                  {residenciales.map((residencial) => (
                    <option key={residencial.id} value={residencial.id}>
                      {residencial.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <select
                    value={selectedResidencialFilter}
                    onChange={(e) => {
                      setSelectedResidencialFilter(e.target.value);
                      setSelectedResidenteFilter('');
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los residenciales</option>
                    {residenciales.map((residencial) => (
                      <option key={residencial.id} value={residencial.id}>
                        {residencial.nombre}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedResidenteFilter}
                    onChange={(e) => setSelectedResidenteFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 min-w-[200px]"
                  >
                    <option value="">Seleccione un residente</option>
                    {availableResidentes.map((residente) => (
                      <option key={residente.id} value={residente.id}>
                        {residente.nombre}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {(selectedResidencialFilter || selectedResidenteFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedResidencialFilter('');
                    setSelectedResidenteFilter('');
                  }}
                >
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredEstados}
            columns={columns}
            loading={loading}
            emptyMessage={
              selectedResidencialFilter || selectedResidenteFilter
                ? 'No hay estados de cuenta para los filtros seleccionados'
                : 'No hay estados de cuenta registrados'
            }
          />
        </CardContent>
      </Card>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Generar Estado de Cuenta">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Residencial <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.residencial_id}
              onChange={(e) => setFormData({ ...formData, residencial_id: e.target.value, residente_id: '' })}
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
                {!formData.residencial_id ? 'Primero seleccione un residencial' : 'Seleccione un residente'}
              </option>
              {formResidentes.map((residente) => (
                <option key={residente.id} value={residente.id}>
                  {residente.nombre}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Periodo (ej. Octubre 2025)"
            value={formData.periodo}
            onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
            required
            placeholder="Octubre 2025"
          />

          <Input
            label="Total Mantenimiento"
            type="number"
            step="0.01"
            value={formData.total_mantenimiento}
            onChange={(e) =>
              setFormData({ ...formData, total_mantenimiento: e.target.value })
            }
            required
            placeholder="1500.00"
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit">Generar Estado</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
