import React, { useState } from 'react';
import { TrendingUp, Users, FolderKanban, Bot, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { AIAssistant } from '../../../components/ui/AIAssistant';
import { CommercialInsights } from './CommercialInsights';
import { CustomerExperienceInsights } from './CustomerExperienceInsights';
import { ProjectManagementInsights } from './ProjectManagementInsights';

type Module = 'commercial' | 'customer' | 'project';
type UserLevel = 'Directivo' | 'Gerente' | 'Operación';

const MODULES = [
  {
    id: 'commercial' as Module,
    name: 'Insights Comerciales',
    icon: TrendingUp,
    description: 'Análisis de ventas, conversión y pipeline comercial',
    color: 'blue',
  },
  {
    id: 'customer' as Module,
    name: 'Insights Experiencia al Cliente',
    icon: Users,
    description: 'Satisfacción, NPS, garantías y entregas',
    color: 'green',
  },
  {
    id: 'project' as Module,
    name: 'Insights Administración de Proyecto',
    icon: FolderKanban,
    description: 'Avances, pagos, espacios comunes y operaciones',
    color: 'orange',
  },
];

const USER_LEVELS: UserLevel[] = ['Directivo', 'Gerente', 'Operación'];

export function InsightsPage() {
  const [selectedModule, setSelectedModule] = useState<Module>('commercial');
  const [userLevel, setUserLevel] = useState<UserLevel>('Directivo');
  const [showAI, setShowAI] = useState(false);

  const renderModule = () => {
    switch (selectedModule) {
      case 'commercial':
        return <CommercialInsights userLevel={userLevel} />;
      case 'customer':
        return <CustomerExperienceInsights userLevel={userLevel} />;
      case 'project':
        return <ProjectManagementInsights userLevel={userLevel} />;
      default:
        return null;
    }
  };

  const currentModule = MODULES.find((m) => m.id === selectedModule);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Insights & Analytics
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Inteligencia de negocio para toma de decisiones estratégicas
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={userLevel}
                  onChange={(e) => setUserLevel(e.target.value as UserLevel)}
                  className="appearance-none px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                >
                  {USER_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      Vista: {level}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>

              <Button
                onClick={() => setShowAI(true)}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Bot className="h-5 w-5" />
                Asistente BI
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {MODULES.map((module) => {
              const Icon = module.icon;
              const isActive = selectedModule === module.id;
              const colorClasses = {
                blue: isActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700',
                green: isActive
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700',
                orange: isActive
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700',
              };

              const iconColorClasses = {
                blue: isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400',
                green: isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400',
                orange: isActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400',
              };

              return (
                <button
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    colorClasses[module.color as keyof typeof colorClasses]
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isActive
                          ? `bg-${module.color}-100 dark:bg-${module.color}-900/30`
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${iconColorClasses[module.color as keyof typeof iconColorClasses]}`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold ${
                          isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {module.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{module.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          {currentModule && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-gray-100">{currentModule.name}</span>
              <span>•</span>
              <span>Vista: {userLevel}</span>
            </div>
          )}
        </div>

        {renderModule()}
      </div>

      {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
    </div>
  );
}
