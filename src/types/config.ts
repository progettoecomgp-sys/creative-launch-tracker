export interface ConfigItem {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface ColumnConfig {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date';
  visible: boolean;
  order: number;
  pinned: boolean;
  isCustom: boolean;
  colorLinked?: boolean;
  deletedAt?: string;
}

export interface AppConfig {
  shops: ConfigItem[];
  statuses: ConfigItem[];
  priorities: ConfigItem[];
  columns: ColumnConfig[];
}

export const DEFAULT_STATUSES: ConfigItem[] = [
  { id: 'da-fare', name: 'Da fare', color: '#c4c4c4', order: 0 },
  { id: 'in-corso', name: 'In corso', color: '#0073ea', order: 1 },
  { id: 'in-revisione', name: 'In revisione', color: '#fdab3d', order: 2 },
  { id: 'completato', name: 'Completato', color: '#00c875', order: 3 },
  { id: 'in-pausa', name: 'In pausa', color: '#e2445c', order: 4 },
];

export const DEFAULT_PRIORITIES: ConfigItem[] = [
  { id: 'alta', name: 'Alta', color: '#e2445c', order: 0 },
  { id: 'media', name: 'Media', color: '#fdab3d', order: 1 },
  { id: 'bassa', name: 'Bassa', color: '#00c875', order: 2 },
];

export const DEFAULT_SHOPS: ConfigItem[] = [
  { id: 'shop-italia', name: 'Shop Italia', color: '#0073ea', order: 0 },
  { id: 'shop-francia', name: 'Shop Francia', color: '#a25ddc', order: 1 },
  { id: 'shop-germania', name: 'Shop Germania', color: '#fdab3d', order: 2 },
  { id: 'shop-spagna', name: 'Shop Spagna', color: '#e2445c', order: 3 },
  { id: 'shop-uk', name: 'Shop UK', color: '#00c875', order: 4 },
];

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'name', name: 'Attivita\'', type: 'text', visible: true, order: 0, pinned: true, isCustom: false },
  { id: 'shop', name: 'Shop', type: 'text', visible: true, order: 1, pinned: false, isCustom: false },
  { id: 'status', name: 'Stato', type: 'text', visible: true, order: 2, pinned: false, isCustom: false },
  { id: 'deadline', name: 'Scadenza', type: 'date', visible: true, order: 3, pinned: false, isCustom: false, colorLinked: true },
  { id: 'priority', name: 'Priorita\'', type: 'text', visible: true, order: 4, pinned: false, isCustom: false },
  { id: 'timeline', name: 'Timeline', type: 'date', visible: true, order: 5, pinned: false, isCustom: false, colorLinked: true },
  { id: 'actions', name: '', type: 'text', visible: true, order: 6, pinned: true, isCustom: false },
];
