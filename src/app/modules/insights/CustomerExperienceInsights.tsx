import React, { useState } from 'react';
import { Heart, ThumbsUp, AlertCircle, PackageCheck, Clock, TrendingUp, Star, MessageSquare } from 'lucide-react';
import { MetricCard, BarChart, LineChart, PieChart, Heatmap } from '../../../components/ui/Charts';
import { Card } from '../../../components/ui/Card';

interface CustomerExperienceInsightsProps {
  userLevel: 'Directivo' | 'Gerente' | 'Operación';
}

export function CustomerExperienceInsights({ userLevel }: CustomerExperienceInsightsProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const npsTrendData = [
    { label: 'Ene', values: { nps: 65, csat: 4.1, quejas: 18 } },
    { label: 'Feb', values: { nps: 67, csat: 4.2, quejas: 15 } },
    { label: 'Mar', values: { nps: 66, csat: 4.1, quejas: 17 } },
    { label: 'Abr', values: { nps: 69, csat: 4.3, quejas: 14 } },
    { label: 'May', values: { nps: 68, csat: 4.2, quejas: 16 } },
    { label: 'Jun', values: { nps: 72, csat: 4.4, quejas: 12 } },
  ];

  const satisfactionByPhaseData = [
    { label: 'Venta', value: 4.5, color: 'bg-green-500' },
    { label: 'Construcción', value: 3.8, color: 'bg-yellow-500' },
    { label: 'Entrega', value: 4.2, color: 'bg-blue-500' },
    { label: 'Post-Venta', value: 4.0, color: 'bg-orange-500' },
    { label: 'Garantías', value: 3.6, color: 'bg-red-500' },
  ];

  const warrantyTypeData = [
    { label: 'Acabados', value: 35, color: '#ef4444' },
    { label: 'Instalaciones', value: 28, color: '#f59e0b' },
    { label: 'Estructural', value: 18, color: '#3b82f6' },
    { label: 'Otros', value: 19, color: '#8b5cf6' },
  ];

  const deliveryPerformanceData = [
    { label: 'Valle Alto', value: 4.8, sublabel: '98% a tiempo' },
    { label: 'Montaña Azul', value: 4.5, sublabel: '95% a tiempo' },
    { label: 'Los Álamos', value: 4.2, sublabel: '87% a tiempo' },
    { label: 'Costa Verde', value: 3.8, sublabel: '78% a tiempo' },
  ];

  const complaintsHeatmapData = [
    { row: 'Acabados', col: 'Valle Alto', value: 3 },
    { row: 'Acabados', col: 'Montaña Azul', value: 5 },
    { row: 'Acabados', col: 'Los Álamos', value: 8 },
    { row: 'Acabados', col: 'Costa Verde', value: 12 },
    { row: 'Instalaciones', col: 'Valle Alto', value: 2 },
    { row: 'Instalaciones', col: 'Montaña Azul', value: 4 },
    { row: 'Instalaciones', col: 'Los Álamos', value: 6 },
    { row: 'Instalaciones', col: 'Costa Verde', value: 9 },
    { row: 'Comunicación', col: 'Valle Alto', value: 1 },
    { row: 'Comunicación', col: 'Montaña Azul', value: 3 },
    { row: 'Comunicación', col: 'Los Álamos', value: 7 },
    { row: 'Comunicación', col: 'Costa Verde', value: 11 },
  ];

  const responseTimeData = [
    { label: '< 24hrs', value: 45, color: 'bg-green-500' },
    { label: '24-48hrs', value: 28, color: 'bg-blue-500' },
    { label: '48-72hrs', value: 18, color: 'bg-yellow-500' },
    { label: '> 72hrs', value: 9, color: 'bg-red-500' },
  ];

  if (userLevel === 'Directivo') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Vista Ejecutiva - Experiencia al Cliente
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
            title="NPS Score"
            value="72"
            change={5.9}
            changeLabel="vs mes anterior"
            icon={<Heart className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="CSAT Promedio"
            value="4.4 / 5.0"
            change={4.8}
            changeLabel="vs mes anterior"
            icon={<Star className="h-6 w-6" />}
            color="blue"
          />
          <MetricCard
            title="Tasa de Quejas"
            value="12%"
            change={-25}
            changeLabel="reducción"
            icon={<AlertCircle className="h-6 w-6" />}
            color="orange"
          />
          <MetricCard
            title="Tiempo Respuesta"
            value="2.8 días"
            change={-18.5}
            changeLabel="promedio garantías"
            icon={<Clock className="h-6 w-6" />}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tendencia de Satisfacción
            </h3>
            <LineChart
              data={npsTrendData}
              lines={[
                { key: 'nps', color: '#10b981', label: 'NPS Score' },
                { key: 'csat', color: '#3b82f6', label: 'CSAT (x20)' },
              ]}
              valueFormatter={(v) => v.toString()}
            />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Satisfacción por Etapa del Cliente
            </h3>
            <BarChart data={satisfactionByPhaseData} valueFormatter={(v) => `${v}/5.0`} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Distribución de Garantías por Tipo
            </h3>
            <PieChart data={warrantyTypeData} valueFormatter={(v) => `${v} casos`} />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Performance de Entregas por Residencial
            </h3>
            <BarChart data={deliveryPerformanceData} showValues={true} valueFormatter={(v) => `${v}/5.0`} />
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Mapa de Quejas por Categoría y Residencial
          </h3>
          <Heatmap
            data={complaintsHeatmapData}
            rows={['Acabados', 'Instalaciones', 'Comunicación']}
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
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-green-900 dark:text-green-100">Mejora Continua</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                NPS creció 11% en 6 meses. Programa de calidad funcionando.
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <PackageCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Best Practice</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Valle Alto: 98% entregas a tiempo. Modelo a replicar en otros proyectos.
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h4 className="font-semibold text-orange-900 dark:text-orange-100">Área Crítica</h4>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Garantías: 35% son acabados. Reforzar QA pre-entrega.
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
          Vista Gerencial - Experiencia al Cliente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Casos Abiertos"
            value="24"
            changeLabel="garantías activas"
            icon={<AlertCircle className="h-6 w-6" />}
            color="orange"
          />
          <MetricCard
            title="Entregas del Mes"
            value="18"
            changeLabel="16 completadas"
            icon={<PackageCheck className="h-6 w-6" />}
            color="blue"
          />
          <MetricCard
            title="Respuesta Promedio"
            value="36 hrs"
            change={-22.5}
            changeLabel="vs mes anterior"
            icon={<Clock className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="Satisfacción Post-Entrega"
            value="4.3 / 5.0"
            change={7.5}
            changeLabel="últimas 20 entregas"
            icon={<Star className="h-6 w-6" />}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tiempo de Respuesta a Garantías
            </h3>
            <BarChart data={responseTimeData} showValues={true} valueFormatter={(v) => `${v}%`} />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Evolución de Quejas (Últimos 6 meses)
            </h3>
            <LineChart
              data={npsTrendData}
              lines={[{ key: 'quejas', color: '#ef4444', label: 'Número de quejas' }]}
              height={250}
            />
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quejas por Categoría y Residencial
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Calor indica mayor volumen de quejas
          </p>
          <Heatmap
            data={complaintsHeatmapData}
            rows={['Acabados', 'Instalaciones', 'Comunicación']}
            cols={['Valle Alto', 'Montaña Azul', 'Los Álamos', 'Costa Verde']}
            valueFormatter={(v) => v.toString()}
          />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Casos Prioritarios
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Garantía #G-2841
                  </span>
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-medium rounded">
                    Crítico
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Fuga en instalación hidráulica</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Costa Verde • Abierto hace 5 días
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Garantía #G-2835
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded">
                    Alta
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Grietas en acabados sala</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Los Álamos • Abierto hace 3 días
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Acciones Recomendadas
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Resolver 2 casos críticos inmediatos
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">SLA excedido</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Implementar checklist Valle Alto
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">En todos los residenciales</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Capacitación en QA acabados
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Equipo Costa Verde</p>
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
        Vista Operativa - Experiencia al Cliente
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Mis Casos Asignados"
          value="8"
          changeLabel="3 vencen hoy"
          icon={<AlertCircle className="h-6 w-6" />}
          color="orange"
        />
        <MetricCard
          title="Entregas Esta Semana"
          value="5"
          changeLabel="2 completadas"
          icon={<PackageCheck className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard
          title="Mi Tiempo Promedio"
          value="28 hrs"
          change={-15}
          changeLabel="respuesta"
          icon={<Clock className="h-6 w-6" />}
          color="green"
        />
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Mis Casos Activos
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border-2 border-red-200 dark:border-red-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold rounded">
                    URGENTE
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">#G-2841</span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Fuga en instalación hidráulica - Unidad 302
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Costa Verde • Cliente: Sr. López • Apertura: 18/Nov
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-gray-500">SLA: Vencido hace 2 días</span>
                  <span className="text-xs text-gray-500">Última actualización: Hace 6 hrs</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Actualizar
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
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">#G-2835</span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Grietas en acabados de sala principal
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Los Álamos • Cliente: Sra. García • Apertura: 20/Nov
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-gray-500">SLA: Vence mañana</span>
                  <span className="text-xs text-gray-500">Última actualización: Hace 1 día</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Actualizar
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
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">#G-2828</span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Ajuste de puerta principal
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Montaña Azul • Cliente: Sr. Martínez • Apertura: 21/Nov
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-gray-500">SLA: 2 días restantes</span>
                  <span className="text-xs text-gray-500">Última actualización: Hace 4 hrs</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Entregas Programadas
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  Unidad 505 - Valle Alto
                </span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  Hoy 10:00
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cliente: Familia Hernández</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  Unidad 208 - Montaña Azul
                </span>
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                  Mañana 14:00
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cliente: Sr. Rodríguez</p>
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
                <span className="text-gray-700 dark:text-gray-300">Casos resueltos este mes</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">24</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700 dark:text-gray-300">Tiempo promedio de respuesta</span>
                <span className="font-semibold text-green-600 dark:text-green-400">28 hrs</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700 dark:text-gray-300">Satisfacción del cliente</span>
                <span className="font-semibold text-green-600 dark:text-green-400">4.6/5.0</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
