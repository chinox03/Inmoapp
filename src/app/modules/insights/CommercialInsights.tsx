import React, { useState } from 'react';
import { DollarSign, TrendingUp, Users, Target, Clock, Award, Calendar, Filter } from 'lucide-react';
import { MetricCard, BarChart, LineChart, PieChart, Heatmap } from '../../../components/ui/Charts';
import { Card } from '../../../components/ui/Card';

interface CommercialInsightsProps {
  userLevel: 'Directivo' | 'Gerente' | 'Operación';
}

export function CommercialInsights({ userLevel }: CommercialInsightsProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const salesTrendData = [
    { label: 'Ene', values: { ventas: 1800000, leads: 45, conversiones: 12 } },
    { label: 'Feb', values: { ventas: 2400000, leads: 52, conversiones: 18 } },
    { label: 'Mar', values: { ventas: 2100000, leads: 48, conversiones: 15 } },
    { label: 'Abr', values: { ventas: 2700000, leads: 58, conversiones: 21 } },
    { label: 'May', values: { ventas: 2500000, leads: 55, conversiones: 19 } },
    { label: 'Jun', values: { ventas: 2900000, leads: 62, conversiones: 24 } },
  ];

  const pipelineData = [
    { label: 'Prospecto Nuevo', value: 28, color: 'bg-gray-400' },
    { label: 'Contacto Inicial', value: 18, color: 'bg-blue-400' },
    { label: 'Cotización Enviada', value: 12, color: 'bg-yellow-400' },
    { label: 'Negociación', value: 8, color: 'bg-orange-400' },
    { label: 'Reservado', value: 6, color: 'bg-green-500' },
  ];

  const conversionBySourceData = [
    { label: 'Referidos', value: 35, color: '#10b981' },
    { label: 'Facebook Ads', value: 28, color: '#3b82f6' },
    { label: 'Google Ads', value: 22, color: '#f59e0b' },
    { label: 'Orgánico', value: 15, color: '#8b5cf6' },
  ];

  const residentialPerformanceData = [
    { label: 'Valle Alto', value: 12, sublabel: '$3.2M', color: 'bg-green-500' },
    { label: 'Montaña Azul', value: 9, sublabel: '$2.8M', color: 'bg-blue-500' },
    { label: 'Los Álamos', value: 7, sublabel: '$1.9M', color: 'bg-yellow-500' },
    { label: 'Costa Verde', value: 4, sublabel: '$1.2M', color: 'bg-orange-500' },
  ];

  const salesByAgentData = [
    { label: 'María González', value: 8, sublabel: '$2.1M' },
    { label: 'Carlos Ramírez', value: 7, sublabel: '$1.8M' },
    { label: 'Ana Martínez', value: 6, sublabel: '$1.6M' },
    { label: 'Luis Torres', value: 5, sublabel: '$1.3M' },
    { label: 'Sofia López', value: 4, sublabel: '$1.1M' },
  ];

  const activityHeatmapData = [
    { row: 'Lun', col: '9-12', value: 15 },
    { row: 'Lun', col: '12-15', value: 22 },
    { row: 'Lun', col: '15-18', value: 18 },
    { row: 'Mar', col: '9-12', value: 18 },
    { row: 'Mar', col: '12-15', value: 25 },
    { row: 'Mar', col: '15-18', value: 20 },
    { row: 'Mié', col: '9-12', value: 20 },
    { row: 'Mié', col: '12-15', value: 28 },
    { row: 'Mié', col: '15-18', value: 23 },
    { row: 'Jue', col: '9-12', value: 17 },
    { row: 'Jue', col: '12-15', value: 24 },
    { row: 'Jue', col: '15-18', value: 19 },
    { row: 'Vie', col: '9-12', value: 14 },
    { row: 'Vie', col: '12-15', value: 19 },
    { row: 'Vie', col: '15-18', value: 16 },
    { row: 'Sáb', col: '9-12', value: 25 },
    { row: 'Sáb', col: '12-15', value: 30 },
    { row: 'Sáb', col: '15-18', value: 22 },
  ];

  if (userLevel === 'Directivo') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Vista Ejecutiva - Comercial
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
            title="Ventas Totales"
            value="$14.4M"
            change={18.5}
            changeLabel="vs mes anterior"
            icon={<DollarSign className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="Tasa de Conversión"
            value="29.3%"
            change={4.2}
            changeLabel="vs mes anterior"
            icon={<Target className="h-6 w-6" />}
            color="blue"
          />
          <MetricCard
            title="Pipeline Activo"
            value="$8.2M"
            change={12.1}
            changeLabel="72 oportunidades"
            icon={<TrendingUp className="h-6 w-6" />}
            color="orange"
          />
          <MetricCard
            title="Tiempo Promedio"
            value="32 días"
            change={-15.2}
            changeLabel="lead a cierre"
            icon={<Clock className="h-6 w-6" />}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tendencia de Ventas e Ingresos
            </h3>
            <LineChart
              data={salesTrendData}
              lines={[
                { key: 'ventas', color: '#10b981', label: 'Ventas ($)' },
                { key: 'conversiones', color: '#3b82f6', label: 'Conversiones' },
              ]}
              valueFormatter={(v) => (v > 1000 ? `$${(v / 1000000).toFixed(1)}M` : v.toString())}
            />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Distribución del Pipeline
            </h3>
            <BarChart data={pipelineData} valueFormatter={(v) => `${v} deals`} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Conversión por Fuente de Lead
            </h3>
            <PieChart
              data={conversionBySourceData}
              valueFormatter={(v) => `${v}%`}
            />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Rendimiento por Residencial
            </h3>
            <BarChart data={residentialPerformanceData} showValues={true} />
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Insights Estratégicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-green-900 dark:text-green-100">Top Performer</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Valle Alto lidera con 12 ventas y $3.2M. Replicar modelo de éxito.
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Oportunidad</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Los referidos convierten 35% mejor. Implementar programa de incentivos.
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h4 className="font-semibold text-orange-900 dark:text-orange-100">Atención Requerida</h4>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Costa Verde necesita refuerzo. Solo 4 ventas en periodo actual.
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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Vista Gerencial - Comercial
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="h-4 w-4" />
            <span className="text-sm">Filtros</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Meta Mensual"
            value="87%"
            change={5.3}
            changeLabel="$2.6M de $3M"
            icon={<Target className="h-6 w-6" />}
            color="blue"
          />
          <MetricCard
            title="Leads Nuevos"
            value="62"
            change={8.7}
            changeLabel="esta semana"
            icon={<Users className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="En Negociación"
            value="8"
            changeLabel="$2.1M valor total"
            icon={<TrendingUp className="h-6 w-6" />}
            color="orange"
          />
          <MetricCard
            title="Cierre Proyectado"
            value="24 días"
            change={-8.3}
            changeLabel="ciclo promedio"
            icon={<Clock className="h-6 w-6" />}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Pipeline por Etapa (Últimos 30 días)
            </h3>
            <BarChart data={pipelineData} showValues={true} valueFormatter={(v) => `${v}`} />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Rendimiento del Equipo de Ventas
            </h3>
            <BarChart data={salesByAgentData} showValues={false} height={280} />
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Actividad Comercial por Día y Hora
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Número de interacciones con clientes (llamadas, reuniones, cotizaciones)
          </p>
          <Heatmap
            data={activityHeatmapData}
            rows={['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']}
            cols={['9-12', '12-15', '15-18']}
            valueFormatter={(v) => v.toString()}
          />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Conversión por Canal de Adquisición
            </h3>
            <PieChart data={conversionBySourceData} size={180} valueFormatter={(v) => `${v}%`} />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Acciones Recomendadas
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Seguimiento a 8 negocios en negociación
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Prioridad: Alta • Valor: $2.1M
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Capacitación en cierre consultivo
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    3 agentes con conversión menor a 20%
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Incrementar inversión en Facebook Ads
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    ROI actual: 4.2x • Costo por lead: $450
                  </p>
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Vista Operativa - Comercial
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>Actualizado: Hace 5 minutos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Mis Prospectos Activos"
          value="18"
          changeLabel="6 requieren seguimiento hoy"
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard
          title="Llamadas Pendientes"
          value="12"
          changeLabel="3 prioritarias"
          icon={<Clock className="h-6 w-6" />}
          color="orange"
        />
        <MetricCard
          title="Mi Conversión"
          value="25%"
          change={3.5}
          changeLabel="este mes"
          icon={<Target className="h-6 w-6" />}
          color="green"
        />
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Mis Oportunidades por Etapa
        </h3>
        <BarChart
          data={[
            { label: 'Nuevo', value: 6, color: 'bg-gray-400' },
            { label: 'Contactado', value: 5, color: 'bg-blue-400' },
            { label: 'Cotizado', value: 4, color: 'bg-yellow-400' },
            { label: 'Negociando', value: 3, color: 'bg-orange-400' },
          ]}
          showValues={true}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Actividades Diarias Esta Semana
          </h3>
          <LineChart
            data={[
              { label: 'Lun', values: { llamadas: 8, reuniones: 3, cotizaciones: 2 } },
              { label: 'Mar', values: { llamadas: 12, reuniones: 4, cotizaciones: 3 } },
              { label: 'Mié', values: { llamadas: 10, reuniones: 5, cotizaciones: 4 } },
              { label: 'Jue', values: { llamadas: 15, reuniones: 3, cotizaciones: 2 } },
              { label: 'Vie', values: { llamadas: 9, reuniones: 2, cotizaciones: 1 } },
            ]}
            lines={[
              { key: 'llamadas', color: '#3b82f6', label: 'Llamadas' },
              { key: 'reuniones', color: '#10b981', label: 'Reuniones' },
              { key: 'cotizaciones', color: '#f59e0b', label: 'Cotizaciones' },
            ]}
            height={250}
          />
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Tareas Pendientes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Seguimiento Sr. García - Valle Alto
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Vence: Hoy 14:00</p>
              </div>
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-medium rounded">
                Urgente
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Enviar cotización Sra. Martínez
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Vence: Mañana</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded">
                Alta
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Llamada de seguimiento - 3 prospectos
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Vence: Esta semana</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                Media
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Tips de Productividad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Mejor momento para llamar
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Martes y Miércoles de 10-12am tienen 40% más respuestas positivas
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Tiempo de respuesta óptimo
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Responder en menos de 1 hora aumenta conversión en 45%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
