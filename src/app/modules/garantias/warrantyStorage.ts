import { WarrantyClaim } from './types';

const STORAGE_KEY = 'warranty_claims';

export const warrantyStorage = {
  getAll: (): WarrantyClaim[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  save: (warranties: WarrantyClaim[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(warranties));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  getById: (id: string): WarrantyClaim | null => {
    const warranties = warrantyStorage.getAll();
    return warranties.find((w) => w.id === id) || null;
  },

  update: (id: string, updates: Partial<WarrantyClaim>): WarrantyClaim | null => {
    const warranties = warrantyStorage.getAll();
    const index = warranties.findIndex((w) => w.id === id);

    if (index === -1) return null;

    warranties[index] = { ...warranties[index], ...updates };
    warrantyStorage.save(warranties);
    return warranties[index];
  },

  add: (warranty: WarrantyClaim): void => {
    const warranties = warrantyStorage.getAll();
    warranties.unshift(warranty);
    warrantyStorage.save(warranties);
  },

  initialize: (initialData: WarrantyClaim[]): void => {
    const existing = warrantyStorage.getAll();
    if (existing.length === 0) {
      warrantyStorage.save(initialData);
    }
  },
};
