import React, { useEffect, useState } from 'react';
import { Settings, Plus, Trash2, Save, Loader2, Users, Clock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { ConfiguracionEntregas, getConfiguracionEntregas, updateConfiguracionEntregas } from './service';

export function ConfiguracionEntregasPage() {
  const { showToast } = useToast();
  const [config, setConfig] = useState<ConfiguracionEntregas | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nuevoEquipo, setNuevoEquipo] = useState('');

  useEffect(() => {
    getConfiguracionEntregas().then((c) => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  const handleAddEquipo = () => {
    if (!config || !nuevoEquipo.trim()) return;
    if (config.equipos.includes(nuevoEquipo.trim())) {
      showToast('El equipo ya existe', 'error');
      return;
    }
    setConfig({ ...config, equipos: [...config.equipos, nuevoEquipo.trim()] });
    setNuevoEquipo('');
  };

  const handleRemoveEquipo = (equipo: string) => {
    if (!config) return;
    setConfig({ ...config, equipos: config.equipos.filter((e) => e !== equipo) });
  };

  const handleUpdateSLA = (prioridad: 'high' | 'medium' | 'low', dias: number) => {
    if (!config) return;
    setConfig({
      ...config,
      sla_por_prioridad: { ...config.sla_por_prioridad, [prioridad]: dias },
    });
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    const res = await updateConfiguracionEntregas({
      equipos: config.equipos,
      sla_por_prioridad: config.sla_por_prioridad,
    });
    setSaving(false);
    if (res.success) {
      showToast('Configuracion guardada exitosamente', 'success');
      getConfiguracionEntregas().then(setConfig);
    } else {
      showToast(res.error || 'Error al guardar', 'error');
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Configuracion de Entregas
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestiona los equipos y SLAs para tickets de seguimiento
            </p>
          </div>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar Cambios
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Equipos de Trabajo</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Lista de equipos disponibles para asignar a tickets de seguimiento de entregas.
          </p>

          <div className="space-y-2 mb-4">
            {config.equipos.map((equipo) => (
              <div
                key={equipo}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{equipo}</span>
                <button
                  onClick={() => handleRemoveEquipo(equipo)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                  aria-label={`Eliminar ${equipo}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {config.equipos.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No hay equipos configurados
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Input
              placeholder="Nombre del equipo..."
              value={nuevoEquipo}
              onChange={(e) => setNuevoEquipo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddEquipo()}
            />
            <Button variant="outline" onClick={handleAddEquipo} disabled={!nuevoEquipo.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">SLA por Prioridad</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Dias habiles sugeridos para resolver tickets segun su prioridad. Al crear un ticket, el sistema
            sugiere la fecha de compromiso basandose en estos valores.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Alta Prioridad</p>
              <Input
                type="number"
                min={1}
                value={config.sla_por_prioridad.high}
                onChange={(e) => handleUpdateSLA('high', parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">dias</p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">Media Prioridad</p>
              <Input
                type="number"
                min={1}
                value={config.sla_por_prioridad.medium}
                onChange={(e) => handleUpdateSLA('medium', parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">dias</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Baja Prioridad</p>
              <Input
                type="number"
                min={1}
                value={config.sla_por_prioridad.low}
                onChange={(e) => handleUpdateSLA('low', parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">dias</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
