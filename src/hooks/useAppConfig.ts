import { useState, useCallback, useEffect } from 'react';
import type { AppConfig, ConfigItem, ColumnConfig } from '../types/config';
import {
  DEFAULT_SHOPS, DEFAULT_STATUSES, DEFAULT_PRIORITIES, DEFAULT_COLUMNS,
} from '../types/config';

const CONFIG_KEY = 'creative-launch-tracker-config';

function loadConfig(): AppConfig {
  try {
    const data = localStorage.getItem(CONFIG_KEY);
    if (data) {
      const parsed = JSON.parse(data) as AppConfig;
      // Ensure columns are never empty
      if (!parsed.columns || parsed.columns.length === 0) {
        parsed.columns = DEFAULT_COLUMNS;
      }
      if (!parsed.shops || parsed.shops.length === 0) {
        parsed.shops = DEFAULT_SHOPS;
      }
      if (!parsed.statuses || parsed.statuses.length === 0) {
        parsed.statuses = DEFAULT_STATUSES;
      }
      if (!parsed.priorities || parsed.priorities.length === 0) {
        parsed.priorities = DEFAULT_PRIORITIES;
      }
      return parsed;
    }
  } catch {
    console.error('Errore nel caricamento della configurazione');
  }
  return {
    shops: DEFAULT_SHOPS,
    statuses: DEFAULT_STATUSES,
    priorities: DEFAULT_PRIORITIES,
    columns: DEFAULT_COLUMNS,
  };
}

function saveConfig(config: AppConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    console.error('Errore nel salvataggio della configurazione');
  }
}

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(loadConfig);

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  const getStatusById = useCallback((id: string): ConfigItem | undefined => {
    return config.statuses.find(s => s.id === id);
  }, [config.statuses]);

  const getPriorityById = useCallback((id: string): ConfigItem | undefined => {
    return config.priorities.find(p => p.id === id);
  }, [config.priorities]);

  const getShopById = useCallback((id: string): ConfigItem | undefined => {
    return config.shops.find(s => s.id === id);
  }, [config.shops]);

  const generateItemId = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);

  // --- Shops ---
  const addShop = useCallback((name: string, color: string) => {
    setConfig(prev => ({
      ...prev,
      shops: [...prev.shops, {
        id: generateItemId(name),
        name,
        color,
        order: prev.shops.length,
      }],
    }));
  }, []);

  const updateShop = useCallback((id: string, updates: Partial<ConfigItem>) => {
    setConfig(prev => ({
      ...prev,
      shops: prev.shops.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const removeShop = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      shops: prev.shops.filter(s => s.id !== id),
    }));
  }, []);

  // --- Statuses ---
  const addStatus = useCallback((name: string, color: string) => {
    setConfig(prev => ({
      ...prev,
      statuses: [...prev.statuses, {
        id: generateItemId(name),
        name,
        color,
        order: prev.statuses.length,
      }],
    }));
  }, []);

  const updateStatus = useCallback((id: string, updates: Partial<ConfigItem>) => {
    setConfig(prev => ({
      ...prev,
      statuses: prev.statuses.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const removeStatus = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      statuses: prev.statuses.filter(s => s.id !== id),
    }));
  }, []);

  // --- Priorities ---
  const addPriority = useCallback((name: string, color: string) => {
    setConfig(prev => ({
      ...prev,
      priorities: [...prev.priorities, {
        id: generateItemId(name),
        name,
        color,
        order: prev.priorities.length,
      }],
    }));
  }, []);

  const updatePriority = useCallback((id: string, updates: Partial<ConfigItem>) => {
    setConfig(prev => ({
      ...prev,
      priorities: prev.priorities.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  const removePriority = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      priorities: prev.priorities.filter(p => p.id !== id),
    }));
  }, []);

  // --- Columns ---
  const addColumn = useCallback((name: string, type: ColumnConfig['type']) => {
    setConfig(prev => ({
      ...prev,
      columns: [...prev.columns, {
        id: 'custom-' + generateItemId(name),
        name,
        type,
        visible: true,
        order: prev.columns.length,
        pinned: false,
        isCustom: true,
      }],
    }));
  }, []);

  const updateColumn = useCallback((id: string, updates: Partial<ColumnConfig>) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  const removeColumn = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.map(c =>
        c.id === id ? { ...c, deletedAt: new Date().toISOString(), visible: false } : c
      ),
    }));
  }, []);

  const restoreColumn = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.map(c => {
        if (c.id !== id) return c;
        const { deletedAt: _, ...rest } = c;
        return { ...rest, visible: true };
      }),
    }));
  }, []);

  const permanentlyDeleteColumn = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.filter(c => c.id !== id),
    }));
  }, []);

  const reorderColumns = useCallback((orderedIds: string[]) => {
    setConfig(prev => {
      const reordered = orderedIds.map((id, i) => {
        const col = prev.columns.find(c => c.id === id);
        return col ? { ...col, order: i } : col!;
      }).filter(Boolean);
      // Preserve deleted columns that aren't in the orderedIds
      const deletedCols = prev.columns.filter(c => c.deletedAt && !orderedIds.includes(c.id));
      return { ...prev, columns: [...reordered, ...deletedCols] };
    });
  }, []);

  return {
    config,
    // Lookups
    getStatusById,
    getPriorityById,
    getShopById,
    // Shops
    addShop,
    updateShop,
    removeShop,
    // Statuses
    addStatus,
    updateStatus,
    removeStatus,
    // Priorities
    addPriority,
    updatePriority,
    removePriority,
    // Columns
    addColumn,
    updateColumn,
    removeColumn,
    restoreColumn,
    permanentlyDeleteColumn,
    reorderColumns,
  };
}
