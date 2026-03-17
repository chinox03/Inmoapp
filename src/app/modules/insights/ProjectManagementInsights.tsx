import React, { useState } from 'react';
import { Building2, DollarSign, Calendar, Users, TrendingUp, Activity, Shield, AlertTriangle } from 'lucide-react';
import { MetricCard, BarChart, LineChart, PieChart, Heatmap } from '../../../components/ui/Charts';
import { Card } from '../../../components/ui/Card';

interface ProjectManagementInsightsProps {
  userLevel: 'Directivo' | 'Gerente' | 'Operación';
}

export function ProjectManagementInsights({ userLevel }: ProjectManagementInsightsProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const projectProgressData = [
    { label: 'Valle Alto', value: 95, sublabel: '95%', color: 'bg-green-500' },
    { label: 'Montaña Azul', value: 87, sublabel: '87%', color: 'bg-blue-500' },
    { label: 'Los Álamos', value: 72, sublabel: '72%', color: 'bg-yellow-500' },
    { label: 'Costa Verde', value: 58, sublabel: '58%', color: 'bg-orange-500' },
  ];

  const paymentsComplianceData = [
    { label: 'Al Corriente', value: 78, color: '#10b981' },
    { label: '1-15 días', value: 12, color: '#f59e0b' },
    { label: '16-30 días', value: 6, color: '#ef4444' },
    { label: '> 30 días', value: 4, color: '#7f1d1d' },
  ];

  const commonSpacesUsageData = [
    { label: 'Ene', values: { salon: 45, alberca: 32, gym: 28, canchas: 18 } },
    { label: 'Feb', values: { salon: 52, alberca: 38, gym: 31, canchas: 22 } },
    { label: 'Mar', values: { salon: 48, alberca: 41, gym: 35, canchas: 25 } },
    { label: 'Abr', values: { salon: 58, alberca: 45, gym: 38, canchas: 28 } },
    { label: 'May', values: { salon: 55, alberca: 52, gym: 42, canchas: 31 } },
    { label: 'Jun', values: { salon: 62, alberca: 58, gym: 45, canchas: 35 } },
  ];

  const accessControlData = [
    { label: 'Lun', value: 145 },
    { label: 'Mar', value: 138 },
    { label: 'Mié', value: 152 },
    { label: 'Jue', value: 148 },
    { label: 'Vie', value: 165 },
    { label: 'Sáb', value: 189 },
    { label: 'Dom', value: 172 },
  ];

  const maintenanceByTypeData = [
    { label: 'Preventivo', value: 55, color: '#10b981' },
    { label: 'Correctivo', value: 30, color: '#f59e0b' },
    { label: 'Urgente', value: 15, color: '#ef4444' },
  ];

  const incidentsHeatmapData = [
    { row: 'Mantenimiento', col: 'Valle Alto', value: 3 },
    { row: 'Mantenimiento', col: 'Montaña Azul', value: 5 },
    { row: 'Mantenimiento', col: 'Los Álamos', value: 8 },
    { row: 'Mantenimiento', col: 'Costa Verde', value: 12 },
    { row: 'Seguridad', col: 'Valle Alto', value: 1 },
    { row: 'Seguridad', col: 'Montaña Azul', value: 2 },
    { row: 'Seguridad', col: 'Los Álamos', value: 4 },
    { row: 'Seguridad', col: 'Costa Verde', value: 7 },
    { row: 'Limpieza', col: 'Valle Alto', value: 2 },
    { row: 'Limpieza', col: 'Montaña Azul', value: 3 },
    { row: 'Limpieza', col: 'Los Álamos', value: 6 },
    { row: 'Limpieza', col: 'Costa Verde', value: 9 },
  ];

  const budgetVarianceData = [
    { label: 'Obra Civil', value: 102, sublabel: '+2%', color: 'bg-red-400' },
    { label: 'Acabados', value: 98, sublabel: '-2%', color: 'bg-green-400' },
    { label: 'Instalaciones', value: 105, sublabel: '+5%', color: 'bg-red-500' },
    { label: 'Equipamiento', value: 95, sublabel: '-5%', color: 'bg-green-500' },
  ];

  if (userLevel === 'Directivo') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Vista Ejecutiva - Administración de Proyecto
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                period === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setPeriod('quarter')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                period === 'quarter'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Trimestral
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Avance Global"
            value="78%"
            change={5.2}
            changeLabel="vs mes anterior"
            icon={<Building2 className="h-6 w-6" />}
            color="blue"
          />
          <MetricCard
            title="Cumplimiento de Pagos"
            value="78%"
            changeLabel="al corriente"
            icon={<DollarSign className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="Ocupación Espacios"
            value="68%"
            change={12.3}
            changeLabel="vs mes anterior"
            icon={<Calendar className="h-6 w-6" />}
            color="orange"
          />
          <MetricCard
            title="Incidentes"
            value="8"
            change={-33.3}
            changeLabel="este mes"
            icon={<AlertTriangle className="h-6 w-6" />}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Avance de Construcción por Proyecto
            </h3>
            <BarChart data={projectProgressData} showValues={true} />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Cumplimiento de Pagos (Mora)
            </h3>
            <PieChart data={paymentsComplianceData} valueFormatter={(v) => `${v}%`} />
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Uso de Espacios Comunes (Reservas por mes)
          </h3>
          <LineChart
            data={commonSpacesUsageData}
            lines={[
              { key: 'salon', color: '#3b82f6', label: 'Salón de Eventos' },
              { key: 'alberca', color: '#10b981', label: 'Alberca' },
              { key: 'gym', color: '#f59e0b', label: 'Gimnasio' },
              { key: 'canchas', color: '#8b5cf6', label: 'Canchas' },
            ]}
            height={280}
          />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Variación Presupuestal por Categoría
            </h3>
            <BarChart data={budgetVarianceData} showValues={true} valueFormatter={(v) => `${v}%`} />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Control de Accesos (Última semana)
            </h3>
            <BarChart data={accessControlData} showValues={true} valueFormatter={(v) => `${v}`} height={250} />
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Mapa de Incidentes por Tipo y Residencial
          </h3>
          <Heatmap
            data={incidentsHeatmapData}
            rows={['Mantenimiento', 'Seguridad', 'Limpieza']}
            cols={['Valle Alto', 'Montaña Azul', 'Los Álamos', 'Costa Verde']}
            valueFormatter={(v) => v.toString()}
          />
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Insights Estratégicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-green-900 dark:text-green-100">En Track</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Valle Alto 95% completado. Entrega anticipada 2 semanas.
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Alta Demanda</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Espacios comunes +68% uso. Considerar ampliación de horarios.
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h4 className="font-semibold text-orange-900 dark:text-orange-100">Control Presupuestal</h4>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Instalaciones +5% sobre presupuesto. Requiere ajuste en Los Álamos.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (userLevel === 'Gerente') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Vista Gerencial - Administración de Proyecto
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Pagos Pendientes"
            value="$285K"
            changeLabel="22 unidades en mora"
            icon={<DollarSign className="h-6 w-6" />}
            color="orange"
          />
          <MetricCard
            title="Mantenimientos"
            value="15"
            changeLabel="5 completados hoy"
            icon={<Activity className="h-6 w-6" />}
            color="blue"
          />
          <MetricCard
            title="Reservas Activas"
            value="38"
            changeLabel="esta semana"
            icon={<Calendar className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="Accesos Hoy"
            value="152"
            change={8.6}
            changeLabel="vs ayer"
            icon={<Shield className="h-6 w-6" />}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Ocupación de Espacios Comunes
            </h3>
            <LineChart
              data={commonSpacesUsageData}
              lines={[
                { key: 'salon', color: '#3b82f6', label: 'Salón' },
                { key: 'alberca', color: '#10b981', label: 'Alberca' },
              ]}
              height={250}
            />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tipo de Mantenimientos
            </h3>
            <PieChart data={maintenanceByTypeData} size={180} valueFormatter={(v) => `${v}%`} />
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Incidentes por Tipo y Residencial
          </h3>
          <Heatmap
            data={incidentsHeatmapData}
            rows={['Mantenimiento', 'Seguridad', 'Limpieza']}
            cols={['Valle Alto', 'Montaña Azul', 'Los Álamos', 'Costa Verde']}
            valueFormatter={(v) => v.toString()}
          />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Unidades con Pagos Vencidos
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Unidad 402 - Costa Verde
                  </span>
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-medium rounded">
                    45 días
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Adeudo: $45,000</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Unidad 301 - Los Álamos
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded">
                    22 días
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Adeudo: $32,500</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Mantenimientos Programados
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Limpieza cisterna - Valle Alto
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Mañana 8:00 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Revisión eléctrica - Montaña Azul
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Viernes 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Fumigación áreas comunes - Todos
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Sábado 7:00 AM</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Vista Operativa - Administración de Proyecto
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Mis Tareas Hoy"
          value="8"
          changeLabel="3 completadas"
          icon={<Activity className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard
          title="Reservas Hoy"
          value="12"
          changeLabel="5 pendientes check-in"
          icon={<Calendar className="h-6 w-6" />}
          color="green"
        />
        <MetricCard
          title="Accesos Registrados"
          value="152"
          changeLabel="desde las 6:00 AM"
          icon={<Shield className="h-6 w-6" />}
          color="orange"
        />
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Mis Tareas Pendientes
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border-2 border-red-200 dark:border-red-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold rounded">
                    URGENTE
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Revisar sistema eléctrico - Salón de eventos
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Valle Alto • Reportado por: Administración
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Vence: Hoy 14:00 • Prioridad: Crítica
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Marcar Completa
              </button>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs font-bold rounded">
                    ALTA
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Mantenimiento preventivo alberca
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Montaña Azul • Mantenimiento programado
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Vence: Mañana • Prioridad: Alta
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Marcar Completa
              </button>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold rounded">
                    MEDIA
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Inspección de jardinería
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Los Álamos • Revisión mensual
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Vence: Esta semana • Prioridad: Media
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Marcar Completa
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Reservas de Hoy
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">Salón de Eventos</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  16:00 - 22:00
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unidad 505 • Cumpleaños</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">Cancha de Tenis</span>
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                  18:00 - 20:00
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unidad 302 • Deporte</p>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">Alberca</span>
                <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                  10:00 - 14:00
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unidad 208 • Fiesta Infantil</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Mi Performance
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700 dark:text-gray-300">Tareas completadas este mes</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">47/52</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700 dark:text-gray-300">Tiempo promedio de respuesta</span>
                <span className="font-semibold text-green-600 dark:text-green-400">4.2 hrs</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700 dark:text-gray-300">Calificación de servicio</span>
                <span className="font-semibold text-green-600 dark:text-green-400">4.7/5.0</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
