import { useState } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import type { ConfigItem } from '../types/config';

type Tab = 'shops' | 'statuses' | 'priorities';

interface Props {
  open: boolean;
  onClose: () => void;
  shops: ConfigItem[];
  statuses: ConfigItem[];
  priorities: ConfigItem[];
  onAddShop: (name: string, color: string) => void;
  onUpdateShop: (id: string, updates: Partial<ConfigItem>) => void;
  onRemoveShop: (id: string) => void;
  onAddStatus: (name: string, color: string) => void;
  onUpdateStatus: (id: string, updates: Partial<ConfigItem>) => void;
  onRemoveStatus: (id: string) => void;
  onAddPriority: (name: string, color: string) => void;
  onUpdatePriority: (id: string, updates: Partial<ConfigItem>) => void;
  onRemovePriority: (id: string) => void;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'shops', label: 'Shop' },
  { key: 'statuses', label: 'Stati' },
  { key: 'priorities', label: 'Priorita\'' },
];

export default function SettingsModal({
  open, onClose,
  shops, statuses, priorities,
  onAddShop, onUpdateShop, onRemoveShop,
  onAddStatus, onUpdateStatus, onRemoveStatus,
  onAddPriority, onUpdatePriority, onRemovePriority,
}: Props) {
  const [tab, setTab] = useState<Tab>('shops');
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#0073ea');

  if (!open) return null;

  const getItems = () => {
    switch (tab) {
      case 'shops': return shops;
      case 'statuses': return statuses;
      case 'priorities': return priorities;
    }
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    switch (tab) {
      case 'shops': onAddShop(newName.trim(), newColor); break;
      case 'statuses': onAddStatus(newName.trim(), newColor); break;
      case 'priorities': onAddPriority(newName.trim(), newColor); break;
    }
    setNewName('');
    setNewColor('#0073ea');
  };

  const handleUpdate = (id: string, updates: Partial<ConfigItem>) => {
    switch (tab) {
      case 'shops': onUpdateShop(id, updates); break;
      case 'statuses': onUpdateStatus(id, updates); break;
      case 'priorities': onUpdatePriority(id, updates); break;
    }
  };

  const handleRemove = (id: string) => {
    switch (tab) {
      case 'shops': onRemoveShop(id); break;
      case 'statuses': onRemoveStatus(id); break;
      case 'priorities': onRemovePriority(id); break;
    }
  };

  const items = getItems();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg
                     max-h-[80vh] overflow-hidden slide-up flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center
                       justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Impostazioni</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400
                      transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 shrink-0">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer
                         ${tab === t.key
                           ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                           : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 group">
              <GripVertical size={14} className="text-gray-300 shrink-0" />
              <input
                type="color"
                value={item.color}
                onChange={e => handleUpdate(item.id, { color: e.target.value })}
                className="w-8 h-8 rounded border border-gray-200 dark:border-gray-700 cursor-pointer
                          shrink-0 p-0.5"
              />
              <input
                type="text"
                value={item.name}
                onChange={e => handleUpdate(item.id, { name: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                          text-sm bg-white dark:bg-gray-800 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
              <button
                onClick={() => handleRemove(item.id)}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50
                          dark:hover:bg-red-900/20 transition-colors cursor-pointer
                          opacity-0 group-hover:opacity-100"
                title="Elimina"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Add new */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <input
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-200 dark:border-gray-700 cursor-pointer
                        shrink-0 p-0.5"
            />
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
              placeholder={`Nuovo ${tab === 'shops' ? 'shop' : tab === 'statuses' ? 'stato' : 'priorita\''}...`}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                        text-sm bg-white dark:bg-gray-800 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            />
            <button
              onClick={handleAdd}
              className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors
                        cursor-pointer"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
