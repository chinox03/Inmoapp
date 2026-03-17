import React, { useState, useRef, useEffect } from 'react';
import { Search, X, User, Home } from 'lucide-react';

export interface Resident {
  id: string;
  name: string;
  unitNumber: string;
  phone?: string;
  email?: string;
}

interface ResidentSearchProps {
  residents: Resident[];
  selectedResident: Resident | null;
  onSelectResident: (resident: Resident | null) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

export function ResidentSearch({
  residents,
  selectedResident,
  onSelectResident,
  label = 'Residente',
  required = false,
  error,
}: ResidentSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredResidents = residents.filter((resident) => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;

    const nameLower = resident.name.toLowerCase();
    const unitLower = resident.unitNumber.toLowerCase();

    return nameLower.includes(searchLower) || unitLower.includes(searchLower);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && filteredResidents.length > 0) {
      setHighlightedIndex(0);
    }
  }, [filteredResidents.length, isOpen]);

  const handleSelectResident = (resident: Resident) => {
    onSelectResident(resident);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    onSelectResident(null);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (selectedResident) {
      onSelectResident(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredResidents.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResidents[highlightedIndex]) {
          handleSelectResident(filteredResidents[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const getDisplayText = () => {
    if (selectedResident) {
      return `${selectedResident.name} - ${selectedResident.unitNumber}`;
    }
    return searchTerm;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-bold text-gray-900 mb-2">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <div className="relative">
        {selectedResident ? (
          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <User className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {selectedResident.name}
                </div>
                <div className="text-xs text-gray-600 flex items-center space-x-1">
                  <Home className="h-3 w-3" />
                  <span>{selectedResident.unitNumber}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar por nombre o unidad..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {isOpen && !selectedResident && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredResidents.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No se encontraron residentes
            </div>
          ) : (
            <ul className="py-1">
              {filteredResidents.map((resident, index) => (
                <li
                  key={resident.id}
                  onClick={() => handleSelectResident(resident)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    index === highlightedIndex
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {resident.name}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Home className="h-3 w-3" />
                          <span>{resident.unitNumber}</span>
                        </div>
                        {resident.phone && (
                          <span className="text-gray-400">•</span>
                        )}
                        {resident.phone && <span>{resident.phone}</span>}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-1 text-xs text-gray-500">
        Busque por nombre o número de unidad
      </div>
    </div>
  );
}
