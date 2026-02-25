import { useState, useRef, useEffect } from 'react';
import { X, Search, MoreHorizontal, RotateCcw, Trash2, Columns3, FileText } from 'lucide-react';
import type { Launch } from '../types';
import type { ColumnConfig } from '../types/config';

interface TrashItem {
  id: string;
  name: string;
  type: 'Colonna' | 'Elemento';
  deletedAt: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  deletedColumns: ColumnConfig[];
  deletedLaunches: Launch[];
  onRestoreColumn: (id: string) => void;
  onPermanentlyDeleteColumn: (id: string) => void;
  onRestoreLaunch: (id: string) => void;
  onPermanentlyDeleteLaunch: (id: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'adesso';
  if (diffMin < 60) return `${diffMin} min fa`;
  if (diffHours < 24) return `${diffHours} or${diffHours === 1 ? 'a' : 'e'} fa`;
  if (diffDays < 30) return `${diffDays} g fa`;
  return `${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) === 1 ? 'e' : 'i'} fa`;
}

function ActionMenu({ onRestore, onDelete }: { onRestore: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100
                  dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl
                       border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-[180px] slide-down">
          <button
            onClick={() => { onRestore(); setOpen(false); }}
            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 cursor-pointer
                      hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                      text-gray-700 dark:text-gray-300"
          >
            <RotateCcw size={14} className="text-blue-500" />
            Ripristina
          </button>
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 cursor-pointer
                      hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
                      text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
          >
            <Trash2 size={14} className="text-red-400" />
            Elimina definitivamente
          </button>
        </div>
      )}
    </div>
  );
}

export default function TrashModal({
  open, onClose,
  deletedColumns, deletedLaunches,
  onRestoreColumn, onPermanentlyDeleteColumn,
  onRestoreLaunch, onPermanentlyDeleteLaunch,
}: Props) {
  const [search, setSearch] = useState('');

  if (!open) return null;

  // Build unified list
  const allItems: (TrashItem & { restore: () => void; permDelete: () => void })[] = [
    ...deletedColumns.map(c => ({
      id: `col-${c.id}`,
      name: c.name,
      type: 'Colonna' as const,
      deletedAt: c.deletedAt!,
      restore: () => onRestoreColumn(c.id),
      permDelete: () => onPermanentlyDeleteColumn(c.id),
    })),
    ...deletedLaunches.map(l => ({
      id: `launch-${l.id}`,
      name: l.name,
      type: 'Elemento' as const,
      deletedAt: l.deletedAt!,
      restore: () => onRestoreLaunch(l.id),
      permDelete: () => onPermanentlyDeleteLaunch(l.id),
    })),
  ].sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

  const filtered = search
    ? allItems.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 shadow-2xl w-full h-full max-w-[900px]
                     max-h-[calc(100vh-40px)] mt-5 mx-4 rounded-2xl overflow-hidden flex flex-col slide-up">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-8 pt-6 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cestino</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400
                        transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Questo e' il cestino per le colonne e gli elementi eliminati.
            Puoi ripristinarli o eliminarli definitivamente.
          </p>

          {/* Search */}
          <div className="relative max-w-[240px]">
            <input
              type="text"
              placeholder="Cerca..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 rounded-md border border-gray-200 dark:border-gray-700
                        text-sm bg-white dark:bg-gray-800 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
            />
            <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Trash2 size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">
                {allItems.length === 0 ? 'Il cestino e\' vuoto' : 'Nessun risultato trovato'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50
                             sticky top-0">
                  <th className="text-left px-8 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400
                               uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400
                               uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400
                               uppercase tracking-wider">
                    Data
                  </th>
                  <th className="text-right px-8 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400
                               uppercase tracking-wider">
                    Azione
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50
                               dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-8 py-3.5">
                      <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                        {item.name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        {item.type === 'Colonna'
                          ? <Columns3 size={13} className="text-gray-400" />
                          : <FileText size={13} className="text-gray-400" />
                        }
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(item.deletedAt)}
                      </span>
                    </td>
                    <td className="px-8 py-3.5 text-right">
                      <ActionMenu
                        onRestore={item.restore}
                        onDelete={item.permDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {allItems.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-8 py-3 text-xs text-gray-400
                        dark:text-gray-500 shrink-0">
            {allItems.length} element{allItems.length === 1 ? 'o' : 'i'} nel cestino
          </div>
        )}
      </div>
    </div>
  );
}
