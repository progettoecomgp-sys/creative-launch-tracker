import type { Launch } from '../types';
import type { AppConfig } from '../types/config';
import { DEFAULT_SHOPS, DEFAULT_STATUSES, DEFAULT_PRIORITIES, DEFAULT_COLUMNS } from '../types/config';

const MIGRATION_KEY = 'creative-launch-tracker-migrated-v3';

interface OldLaunch {
  id: string;
  name: string;
  shop: string;
  status: string;
  priority: string;
  launchDate?: string;
  startDate?: string;
  endDate?: string;
  responsible?: string;
  budget?: number;
  notes: string;
  attachments: string[];
  subtasks?: Launch['subtasks'];
  customFields?: Launch['customFields'];
  createdAt: string;
  updatedAt: string;
}

function nameToId(name: string, items: { id: string; name: string }[]): string {
  const match = items.find(i => i.name === name);
  if (match) return match.id;
  // Already an ID
  if (items.find(i => i.id === name)) return name;
  // Fallback: generate an ID from the name
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function migrateLaunches(raw: OldLaunch[]): Launch[] {
  return raw.map(old => {
    const shopId = nameToId(old.shop, DEFAULT_SHOPS);
    const statusId = nameToId(old.status, DEFAULT_STATUSES);
    const priorityId = nameToId(old.priority, DEFAULT_PRIORITIES);

    // Convert launchDate -> startDate/endDate
    let startDate = old.startDate || old.launchDate || new Date().toISOString().split('T')[0];
    let endDate = old.endDate || '';
    if (!endDate && startDate) {
      // Default endDate = startDate + 14 days
      const d = new Date(startDate);
      d.setDate(d.getDate() + 14);
      endDate = d.toISOString().split('T')[0];
    }

    return {
      id: old.id,
      name: old.name,
      shop: shopId,
      status: statusId,
      priority: priorityId,
      startDate,
      endDate,
      notes: old.notes || '',
      attachments: old.attachments || [],
      subtasks: old.subtasks || [],
      customFields: old.customFields || {},
      createdAt: old.createdAt,
      updatedAt: old.updatedAt,
    };
  });
}

export function needsMigration(): boolean {
  return !localStorage.getItem(MIGRATION_KEY);
}

export function markMigrated(): void {
  localStorage.setItem(MIGRATION_KEY, 'true');
}

export function runMigration(): void {
  if (!needsMigration()) return;

  const STORAGE_KEY = 'creative-launch-tracker';
  const CONFIG_KEY = 'creative-launch-tracker-config';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const launches = JSON.parse(raw) as OldLaunch[];
      // Check if data needs migration (has launchDate or name-based shop/status)
      const needsConversion = launches.some(l =>
        'launchDate' in l || 'budget' in l || 'responsible' in l ||
        DEFAULT_SHOPS.some(s => s.name === l.shop) ||
        DEFAULT_STATUSES.some(s => s.name === l.status)
      );
      if (needsConversion) {
        // Full reset: remove old data so fresh defaults load
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CONFIG_KEY);
      }
    }
  } catch {
    console.error('Errore durante la migrazione dei dati');
  }

  markMigrated();
}

export function ensureConfigExists(): void {
  const CONFIG_KEY = 'creative-launch-tracker-config';
  const existing = localStorage.getItem(CONFIG_KEY);
  if (!existing) {
    const defaultConfig: AppConfig = {
      shops: DEFAULT_SHOPS,
      statuses: DEFAULT_STATUSES,
      priorities: DEFAULT_PRIORITIES,
      columns: DEFAULT_COLUMNS,
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
  } else {
    // Fix existing config if columns are empty
    try {
      const config = JSON.parse(existing) as AppConfig;
      if (!config.columns || config.columns.length === 0) {
        config.columns = DEFAULT_COLUMNS;
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      }
    } catch { /* ignore */ }
  }
}
