import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Launch, Filters } from '../types';
import { loadLaunches, saveLaunches, generateId } from '../utils/storage';

export function useLaunches() {
  const [launches, setLaunches] = useState<Launch[]>(loadLaunches);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    shop: 'all',
    status: 'all',
    priority: 'all',
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    saveLaunches(launches);
  }, [launches]);

  // Active launches (not soft-deleted)
  const activeLaunches = useMemo(() =>
    launches.filter(l => !l.deletedAt),
  [launches]);

  // Deleted launches (soft-deleted)
  const deletedLaunches = useMemo(() =>
    launches.filter(l => l.deletedAt).sort((a, b) =>
      new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime()
    ),
  [launches]);

  const addLaunch = useCallback((data: Omit<Launch, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newLaunch: Launch = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    setLaunches(prev => [newLaunch, ...prev]);
    return newLaunch;
  }, []);

  const updateLaunch = useCallback((id: string, updates: Partial<Launch>) => {
    setLaunches(prev =>
      prev.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l)
    );
  }, []);

  // Soft delete
  const deleteLaunch = useCallback((id: string) => {
    setLaunches(prev =>
      prev.map(l => l.id === id ? { ...l, deletedAt: new Date().toISOString() } : l)
    );
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Restore from trash
  const restoreLaunch = useCallback((id: string) => {
    setLaunches(prev =>
      prev.map(l => {
        if (l.id !== id) return l;
        const { deletedAt: _, ...rest } = l;
        return rest as Launch;
      })
    );
  }, []);

  // Permanently delete
  const permanentlyDeleteLaunch = useCallback((id: string) => {
    setLaunches(prev => prev.filter(l => l.id !== id));
  }, []);

  const duplicateLaunch = useCallback((id: string) => {
    const original = activeLaunches.find(l => l.id === id);
    if (!original) return;
    const now = new Date().toISOString();
    const copy: Launch = {
      ...original,
      id: generateId(),
      name: `${original.name} (copia)`,
      status: 'da-fare',
      subtasks: original.subtasks.map(st => ({ ...st, id: `subtask-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` })),
      createdAt: now,
      updatedAt: now,
    };
    // Remove deletedAt if present
    delete copy.deletedAt;
    setLaunches(prev => {
      const idx = prev.findIndex(l => l.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    return copy;
  }, [activeLaunches]);

  // Soft delete selected
  const deleteSelected = useCallback(() => {
    const now = new Date().toISOString();
    setLaunches(prev =>
      prev.map(l => selectedIds.has(l.id) ? { ...l, deletedAt: now } : l)
    );
    setSelectedIds(new Set());
  }, [selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((filteredIds: string[]) => {
    setSelectedIds(prev => {
      const allSelected = filteredIds.every(id => prev.has(id));
      if (allSelected) return new Set();
      return new Set(filteredIds);
    });
  }, []);

  // Filter only active launches
  const filteredLaunches = useMemo(() => {
    return activeLaunches.filter(l => {
      if (filters.shop !== 'all' && l.shop !== filters.shop) return false;
      if (filters.status !== 'all' && l.status !== filters.status) return false;
      if (filters.priority !== 'all' && l.priority !== filters.priority) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.shop.toLowerCase().includes(q) ||
          l.notes.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeLaunches, filters]);

  // Stats only from active launches
  const stats = useMemo(() => {
    const total = activeLaunches.length;
    const byStatus = activeLaunches.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const expiringSoon = activeLaunches.filter(l => {
      if (l.status === 'completato') return false;
      const diff = new Date(l.endDate).getTime() - Date.now();
      return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
    });
    return { total, byStatus, expiringSoon };
  }, [activeLaunches]);

  return {
    launches: filteredLaunches,
    allLaunches: activeLaunches,
    deletedLaunches,
    filters,
    setFilters,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    addLaunch,
    updateLaunch,
    deleteLaunch,
    restoreLaunch,
    permanentlyDeleteLaunch,
    duplicateLaunch,
    deleteSelected,
    stats,
  };
}
