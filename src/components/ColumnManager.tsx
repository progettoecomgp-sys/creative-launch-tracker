import { useState } from 'react';
import { X, Plus, Eye, EyeOff, Trash2, Link, Unlink } from 'lucide-react';
import type { ColumnConfig } from '../types/config';

interface Props {
  open: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  onAddColumn: (name: string, type: ColumnConfig['type']) => void;
  onUpdateColumn: (id: string, updates: Partial<ColumnConfig>) => void;
  onRemoveColumn: (id: string) => void;
}

export default function ColumnManager({
  open, onClose, columns, onAddColumn, onUpdateColumn, onRemoveColumn,
}: Props) {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ColumnConfig['type']>('text');

  if (!open) return null;

  const activeCols = columns.filter(c => !c.deletedAt);
  const sortedCols = [...activeCols].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddColumn(newName.trim(), newType);
    setNewName('');
    setNewType('text');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md
                     max-h-[80vh] overflow-hidden slide-up flex flex-col">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center
                       justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Gestione Colonne</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400
                      transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {sortedCols.map(col => (
            <div key={col.id} className="flex items-center gap-3 group">
              <button
                onClick={() => onUpdateColumn(col.id, { visible: !col.visible })}
                className={`p-1.5 rounded-md transition-colors cursor-pointer
                           ${col.visible ? 'text-blue-500' : 'text-gray-300'}`}
                title={col.visible ? 'Nascondi' : 'Mostra'}
              >
                {col.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              {col.isCustom ? (
                <input
                  type="text"
                  value={col.name}
                  onChange={e => onUpdateColumn(col.id, { name: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                            text-sm bg-white dark:bg-gray-800 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                />
              ) : (
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 px-3 py-2">
                  {col.name}
                </span>
              )}
              <span className="text-xs text-gray-400 uppercase">{col.type}</span>
              {(col.id === 'deadline' || col.id === 'timeline') && (
                <button
                  onClick={() => onUpdateColumn(col.id, { colorLinked: col.colorLinked === false })}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1
                             ${col.colorLinked !== false
                               ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30'
                               : 'text-gray-300 hover:text-gray-500'}`}
                  title={col.colorLinked !== false
                    ? 'Colore collegato allo stato (clicca per scollegare)'
                    : 'Colore non collegato allo stato (clicca per collegare)'}
                >
                  {col.colorLinked !== false ? <Link size={14} /> : <Unlink size={14} />}
                </button>
              )}
              {col.isCustom && (
                <button
                  onClick={() => onRemoveColumn(col.id)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50
                            dark:hover:bg-red-900/20 transition-colors cursor-pointer
                            opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          {/* Add new column */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
              placeholder="Nome colonna..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                        text-sm bg-white dark:bg-gray-800 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            />
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as ColumnConfig['type'])}
              className="px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs
                        bg-white dark:bg-gray-800 dark:text-white cursor-pointer
                        focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            >
              <option value="text">Testo</option>
              <option value="number">Numero</option>
              <option value="date">Data</option>
            </select>
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
