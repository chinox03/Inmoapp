import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NAVIGATION_ITEMS, NavigationItem } from '../../utils/constants';
import { Building2, X, ChevronRight, ChevronDown, LayoutGrid, Users, FolderKanban, PanelLeftClose, PanelLeftOpen, TrendingUp, Wrench } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'commercial',
    label: 'Proceso Comercial',
    icon: TrendingUp,
    items: [
      '/dashboard/prospectos',
      '/dashboard/negocios',
      '/dashboard/reservas-comerciales',
      '/dashboard/pcv',
      '/dashboard/comisiones',
    ],
  },
  {
    id: 'project',
    label: 'Administración de Proyecto',
    icon: FolderKanban,
    items: [
      '/dashboard/estados',
      '/dashboard/mi-estado',
      '/dashboard/pagos',
      '/dashboard/amonestaciones',
      '/dashboard/mis-amonestaciones',
      '/dashboard/espacios',
      '/dashboard/reservas',
      '/dashboard/mis-reservas',
      '/dashboard/accesos',
      '/dashboard/mis-accesos',
      '/dashboard/mudanzas',
      '/dashboard/mis-mudanzas',
      '/dashboard/calendario',
      '/dashboard/visitas',
    ],
  },
  {
    id: 'experience',
    label: 'Experiencia al Cliente',
    icon: Users,
    items: [
      '/dashboard/encuestas',
      '/dashboard/entregas',
      '/dashboard/garantias',
    ],
  },
  {
    id: 'system',
    label: 'Administración de Sistema',
    icon: LayoutGrid,
    items: [
      '/dashboard/usuarios',
      '/dashboard/auditoria',
      '/dashboard/residenciales',
      '/dashboard/configuracion-entregas',
    ],
  },
  {
    id: 'maintenance',
    label: 'Mantenimiento',
    icon: Wrench,
    items: [
      '/dashboard/mantenimiento',
    ],
  },
];

interface MobileSectionItemProps {
  section: NavSection;
  sectionItems: NavigationItem[];
  currentPath: string;
  onClose: () => void;
}

function MobileSectionItem({ section, sectionItems, currentPath, onClose }: MobileSectionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-3">
          <section.icon className="h-5 w-5" />
          <span>{section.label}</span>
        </div>
        <ChevronRight
          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>
      {isExpanded && (
        <ul className="mt-1 space-y-0.5 ml-2">
          {sectionItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              currentPath === item.path ||
              (item.path !== '/dashboard' && currentPath.startsWith(item.path));
            return (
              <li key={`mobile-${item.path}-${item.label}-${index}`}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-sm">{item.label}</span>
                  {item.readOnly && <Badge variant="warning">Solo lectura</Badge>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Sidebar({ isMobileOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsedSections');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const flyoutRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsedSections', JSON.stringify([...collapsedSections]));
    } catch {
      // localStorage unavailable (e.g. restricted iframe)
    }
  }, [collapsedSections]);

  const filteredNavItems = NAVIGATION_ITEMS.filter((item) =>
    user ? item.roles.includes(user.rol) : false
  );

  const standaloneItems = filteredNavItems.filter(
    (item) =>
      item.path === '/dashboard' ||
      item.path === '/dashboard/residentes' ||
      item.path === '/dashboard/insights'
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isCollapsed &&
        flyoutRef.current &&
        sidebarRef.current &&
        !flyoutRef.current.contains(event.target as Node) &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setExpandedSection(null);
      }
    }

    function handleScroll() {
      if (expandedSection && isCollapsed) {
        setExpandedSection(null);
      }
    }

    if (expandedSection && isCollapsed) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [expandedSection, isCollapsed]);

  useEffect(() => {
    setExpandedSection(null);
  }, [location.pathname]);

  const toggleSection = (sectionId: string) => {
    if (isCollapsed) {
      setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
    } else {
      setCollapsedSections((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(sectionId)) {
          newSet.delete(sectionId);
        } else {
          newSet.add(sectionId);
        }
        return newSet;
      });
    }
  };

  const renderStandaloneItem = (item: NavigationItem, index: number) => {
    const Icon = item.icon;
    const isActive =
      location.pathname === item.path ||
      (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

    if (isCollapsed) {
      return (
        <li key={`${item.path}-${item.label}-${index}`}>
          <Link
            to={item.path}
            title={item.label}
            aria-label={item.label}
            className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="h-5 w-5" />
          </Link>
        </li>
      );
    }

    return (
      <li key={`${item.path}-${item.label}-${index}`}>
        <Link
          to={item.path}
          className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
            isActive
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1 text-sm">{item.label}</span>
          {item.readOnly && <Badge variant="warning">Solo lectura</Badge>}
        </Link>
      </li>
    );
  };

  const renderSectionIcon = (section: NavSection) => {
    const sectionItems = filteredNavItems.filter((item) =>
      section.items.includes(item.path)
    );

    if (sectionItems.length === 0) return null;

    const SectionIcon = section.icon;
    const hasActiveItem = sectionItems.some(
      (item) =>
        location.pathname === item.path ||
        (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
    );
    const isExpanded = expandedSection === section.id;

    return (
      <li key={section.id}>
        <button
          onClick={() => toggleSection(section.id)}
          title={section.label}
          aria-label={section.label}
          aria-expanded={isExpanded}
          className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors relative ${
            hasActiveItem || isExpanded
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <SectionIcon className="h-5 w-5" />
          {isExpanded && (
            <div className="absolute right-1 top-1 w-2 h-2 bg-primary-500 rounded-full" />
          )}
        </button>
      </li>
    );
  };

  const renderExpandedSection = (section: NavSection) => {
    const sectionItems = filteredNavItems.filter((item) =>
      section.items.includes(item.path)
    );

    if (sectionItems.length === 0) return null;

    const SectionIcon = section.icon;
    const isSectionCollapsed = collapsedSections.has(section.id);
    const ChevronIcon = isSectionCollapsed ? ChevronRight : ChevronDown;

    return (
      <div key={section.id} className="mb-1">
        <button
          onClick={() => toggleSection(section.id)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-3">
            <SectionIcon className="h-5 w-5" />
            <span>{section.label}</span>
          </div>
          <ChevronIcon className="h-4 w-4" />
        </button>
        {!isSectionCollapsed && (
          <ul className="mt-1 space-y-0.5 ml-2">
            {sectionItems.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

              return (
                <li key={`${item.path}-${item.label}-${index}`}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.readOnly && <Badge variant="warning">Solo lectura</Badge>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  const renderFlyout = () => {
    if (!expandedSection || !isCollapsed) return null;

    const section = NAV_SECTIONS.find((s) => s.id === expandedSection);
    if (!section) return null;

    const sectionItems = filteredNavItems.filter((item) =>
      section.items.includes(item.path)
    );

    if (sectionItems.length === 0) return null;

    return (
      <>
        <div
          className="fixed inset-0 bg-gray-900/20 dark:bg-gray-900/40 z-[55] animate-in fade-in duration-200"
          onClick={() => setExpandedSection(null)}
        />
        <div
          ref={flyoutRef}
          className="fixed left-20 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl z-[60] animate-in slide-in-from-left duration-200"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {section.label}
            </h2>
            <button
              onClick={() => setExpandedSection(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Cerrar panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="p-4 overflow-y-auto h-[calc(100vh-73px)]">
            <ul className="space-y-1">
              {sectionItems.map((item, index) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <li key={`${item.path}-${item.label}-${index}`}>
                    <Link
                      to={item.path}
                      onClick={() => setExpandedSection(null)}
                      className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1 text-sm">{item.label}</span>
                      {item.readOnly && <Badge variant="warning">Solo lectura</Badge>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </>
    );
  };

  const desktopContent = (
    <>
      <aside
        ref={sidebarRef}
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          {isCollapsed ? (
            <div className="flex items-center justify-center w-full">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {import.meta.env.VITE_TECH_BRAND}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Portal de Residentes</p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {isCollapsed ? (
            <>
              <ul className="space-y-2">
                {standaloneItems.map((item, index) => renderStandaloneItem(item, index))}
              </ul>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <ul className="space-y-2">
                  {NAV_SECTIONS.map((section) => renderSectionIcon(section))}
                </ul>
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <ul className="space-y-0.5 mb-4">
                {standaloneItems.map((item, index) => renderStandaloneItem(item, index))}
              </ul>

              <div className="space-y-2">
                {NAV_SECTIONS.map((section) => renderExpandedSection(section))}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
            aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
            className={`${
              isCollapsed ? 'w-full justify-center' : 'w-full justify-between'
            } flex items-center px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <>
                <span className="text-sm font-medium">Contraer menú</span>
                <PanelLeftClose className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </aside>

      {renderFlyout()}
    </>
  );

  const mobileContent = isMobileOpen && (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-75"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {import.meta.env.VITE_TECH_BRAND}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Portal de Residentes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1 mb-4">
            {standaloneItems.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <li key={`mobile-${item.path}-${item.label}-${index}`}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.readOnly && <Badge variant="warning">Solo lectura</Badge>}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="space-y-2">
            {NAV_SECTIONS.map((section) => {
              const sectionItems = filteredNavItems.filter((item) =>
                section.items.includes(item.path)
              );
              if (sectionItems.length === 0) return null;
              return (
                <MobileSectionItem
                  key={`mobile-${section.id}`}
                  section={section}
                  sectionItems={sectionItems}
                  currentPath={location.pathname}
                  onClose={onClose}
                />
              );
            })}
          </div>
        </nav>
      </aside>
    </div>
  );

  return (
    <>
      {desktopContent}
      {mobileContent}
    </>
  );
}
