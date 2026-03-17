import React from 'react';
import { DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export function ComisionesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Comisiones
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestión y cálculo de comisiones de venta
          </p>
        </div>
      </div>

      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-2xl w-full p-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-6 rounded-full">
                  <DollarSign className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Funcionalidad en Desarrollo
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                El módulo de Comisiones estará disponible en la Fase 2
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-center space-x-2 text-blue-900 dark:text-blue-100">
                <TrendingUp className="h-5 w-5" />
                <h3 className="font-semibold">Próximas Funcionalidades</h3>
              </div>
              <ul className="text-left space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  <span>Cálculo automático de comisiones basado en PCVs firmados</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  <span>Dashboard de comisiones por agente y período</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  <span>Reportes de comisiones pagadas y pendientes</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  <span>Configuración de porcentajes por tipo de propiedad</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  <span>Historial completo de pagos de comisiones</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  <span>Exportación de reportes en PDF y Excel</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Los datos de comisiones se calculan automáticamente desde el módulo PCV
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
