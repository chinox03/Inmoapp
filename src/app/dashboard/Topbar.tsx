import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useResidencial } from '../../contexts/ResidencialContext';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, LogOut, User, Building2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ROLE_COLORS, ROLE_LABELS } from '../../utils/constants';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, signOut } = useAuth();
  const { selectedResidencial, residenciales, setSelectedResidencial } = useResidencial();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 lg:ml-0 ml-4">
            {user.rol === 'SUPERADMIN' && residenciales.length > 0 && (
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <select
                  value={selectedResidencial?.id || ''}
                  onChange={(e) => {
                    const selected = residenciales.find((r) => r.id === e.target.value);
                    if (selected) {
                      setSelectedResidencial(selected);
                    }
                  }}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {residenciales.map((residencial) => (
                    <option key={residencial.id} value={residencial.id}>
                      {residencial.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.nombre}</p>
              <Badge className={ROLE_COLORS[user.rol]}>
                {ROLE_LABELS[user.rol]}
              </Badge>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                  {getInitials(user.nombre)}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.nombre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
