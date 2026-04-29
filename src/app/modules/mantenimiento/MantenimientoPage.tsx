import React from 'react';
import { Wrench, HardHat, Clock, ChevronRight } from 'lucide-react';

const UPCOMING_FEATURES = [
  'Registro y seguimiento de solicitudes de mantenimiento',
  'Asignacion de tecnicos y proveedores',
  'Historial de trabajos por unidad y area comun',
  'Gestion de garantias de equipos e instalaciones',
  'Reportes de mantenimiento preventivo y correctivo',
];

export function MantenimientoPage() {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-amber-50 dark:bg-amber-900/20 mb-6 relative">
            <Wrench className="h-12 w-12 text-amber-500" />
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500">
              <HardHat className="h-3.5 w-3.5 text-white" />
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Mantenimiento
          </h1>

          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span>Modulo en construccion</span>
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-md mx-auto">
            Estamos desarrollando un modulo completo para gestionar el mantenimiento
            de tu residencial. Pronto podras administrar solicitudes, tecnicos y reportes
            desde un solo lugar.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center space-x-3">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Funcionalidades proximas
            </span>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {UPCOMING_FEATURES.map((feature, i) => (
              <li
                key={i}
                className="flex items-center space-x-3 px-6 py-3.5 text-sm text-gray-600 dark:text-gray-400"
              >
                <ChevronRight className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Progreso de desarrollo</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">15%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000"
              style={{ width: '15%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
