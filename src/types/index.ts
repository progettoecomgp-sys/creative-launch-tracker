export type ViewMode = 'table' | 'kanban';

export interface SubTask {
  id: string;
  name: string;
  completed: boolean;
  dueDate: string;
  createdAt: string;
  fields: Record<string, string>;
}

export interface Launch {
  id: string;
  name: string;
  shop: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  notes: string;
  attachments: string[];
  subtasks: SubTask[];
  customFields: Record<string, string | number>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Filters {
  search: string;
  shop: string | 'all';
  status: string | 'all';
  priority: string | 'all';
}

export const ROW_ACCENT_COLORS = [
  '#0073ea', '#00c875', '#e2445c', '#fdab3d', '#a25ddc', '#66ccff', '#ffcb00',
];
