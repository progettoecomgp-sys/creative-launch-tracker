import { useState, useRef, useEffect } from 'react';
import { Inbox, GripVertical, MoreHorizontal, Pencil, Trash2, Settings, Plus } from 'lucide-react';
import type { Launch } from '../types';
import type { ConfigItem, ColumnConfig } from '../types/config';
import LaunchRow from './LaunchRow';
import AddColumnMenu from './AddColumnMenu';

interface Props {
  launches: Launch[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
  onUpdate: (id: string, data: Partial<Launch>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEdit: (launch: Launch) => void;
  onOpenDetail: (launch: Launch) => void;
  onAddInline: (name: string) => void;
  shops: ConfigItem[];
  statuses: ConfigItem[];
  priorities: ConfigItem[];
  columns: ColumnConfig[];
  onReorderColumns: (orderedIds: string[]) => void;
  onAddColumn: (name: string, type: ColumnConfig['type']) => void;
  onUpdateColumn: (id: string, updates: Partial<ColumnConfig>) => void;
  onRemoveColumn: (id: string) => void;
  // Config handlers for column settings
  onAddConfigItem?: (type: 'shops' | 'statuses' | 'priorities', name: string, color: string) => void;
  onUpdateConfigItem?: (type: 'shops' | 'statuses' | 'priorities', id: string, updates: Partial<ConfigItem>) => void;
  onRemoveConfigItem?: (type: 'shops' | 'statuses' | 'priorities', id: string) => void;
}

// ── Inline settings panel for column config items ──
function ColumnSettingsPanel({ items, onAdd, onUpdate, onRemove, label }: {
  items: ConfigItem[];
  onAdd: (name: string, color: string) => void;
  onUpdate: (id: string, updates: Partial<ConfigItem>) => void;
  onRemove: (id: string) => void;
  label: string;
}) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#0073ea');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim(), newColor);
    setNewName('');
    setNewColor('#0073ea');
  };

  return (
    <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        Personalizza {label}
      </span>
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-2 group/item">
          <input
            type="color"
            value={item.color}
            onChange={e => onUpdate(item.id, { color: e.target.value })}
            className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700 cursor-pointer
                      shrink-0 p-0.5"
          />
          <input
            type="text"
            value={item.name}
            onChange={e => onUpdate(item.id, { name: e.target.value })}
            className="flex-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-700
                      text-xs bg-white dark:bg-gray-800 dark:text-white min-w-0
                      focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          />
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50
                      dark:hover:bg-red-900/20 transition-colors cursor-pointer
                      opacity-0 group-hover/item:opacity-100 shrink-0"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <input
          type="color"
          value={newColor}
          onChange={e => setNewColor(e.target.value)}
          className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700 cursor-pointer
                    shrink-0 p-0.5"
        />
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          placeholder={`Nuovo ${label}...`}
          className="flex-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-700
                    text-xs bg-white dark:bg-gray-800 dark:text-white min-w-0
                    focus:outline-none focus:ring-2 focus:ring-blue-400/30"
        />
        <button
          onClick={handleAdd}
          className="p-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors
                    cursor-pointer shrink-0"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Inline editable column header with "..." menu ──
function EditableColumnHeader({
  col, isDragging, dragOverId,
  onDragStart, onDragOver, onDrop, onDragEnd, onRename, onRemove,
  configItems, onAddConfigItem, onUpdateConfigItem, onRemoveConfigItem, configLabel,
}: {
  col: ColumnConfig;
  isDragging: boolean;
  dragOverId: string | null;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onRename: (name: string) => void;
  onRemove?: () => void;
  configItems?: ConfigItem[];
  onAddConfigItem?: (name: string, color: string) => void;
  onUpdateConfigItem?: (id: string, updates: Partial<ConfigItem>) => void;
  onRemoveConfigItem?: (id: string) => void;
  configLabel?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [value, setValue] = useState(col.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasSettings = configItems && onAddConfigItem && onUpdateConfigItem && onRemoveConfigItem;

  useEffect(() => { setValue(col.name); }, [col.name]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  useEffect(() => {
    if (!menuOpen && !settingsOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen, settingsOpen]);

  const save = () => {
    if (value.trim() && value.trim() !== col.name) {
      onRename(value.trim());
    } else {
      setValue(col.name);
    }
    setEditing(false);
  };

  const isCenter = ['status', 'priority', 'timeline'].includes(col.id);
  const isDragOver = dragOverId === col.id && !isDragging;

  return (
    <th
      draggable={!col.pinned && !editing && !menuOpen && !settingsOpen}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`group/th relative px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
                  border-b border-gray-200 dark:border-gray-700 select-none whitespace-nowrap
                  transition-all duration-150
                  ${isCenter ? 'text-center' : ''}
                  ${isDragging ? 'opacity-40 scale-95' : ''}
                  ${isDragOver ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                  ${!col.pinned && !editing
                    ? 'cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-700/60'
                    : ''}`}
    >
      {isDragOver && (
        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-blue-500" />
      )}

      <div className="flex items-center gap-1.5">
        {!col.pinned && !editing && (
          <GripVertical size={12}
            className="shrink-0 text-gray-300 dark:text-gray-600
                      opacity-0 group-hover/th:opacity-100 transition-opacity" />
        )}

        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={save}
            onKeyDown={e => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') { setValue(col.name); setEditing(false); }
            }}
            className="w-full min-w-[60px] px-1.5 py-0.5 -my-0.5 rounded border border-blue-400
                      text-xs font-semibold uppercase tracking-wider bg-white dark:bg-gray-800
                      dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          />
        ) : (
          <span className="text-gray-500 dark:text-gray-400 group-hover/th:text-gray-700
                         dark:group-hover/th:text-gray-200 transition-colors">
            {col.name}
          </span>
        )}

        {/* "..." menu button on hover */}
        {!col.pinned && !editing && col.name && (
          <div ref={menuRef} className="relative shrink-0">
            <button
              onClick={e => {
                e.stopPropagation();
                if (settingsOpen) { setSettingsOpen(false); }
                else { setMenuOpen(!menuOpen); }
              }}
              className={`p-0.5 rounded cursor-pointer transition-all
                         ${menuOpen || settingsOpen
                           ? 'text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-600'
                           : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 opacity-0 group-hover/th:opacity-100'}`}
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen && !settingsOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl
                             border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-[180px] slide-down">
                <button
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); setEditing(true); }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 cursor-pointer
                            hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                            text-gray-700 dark:text-gray-300"
                >
                  <Pencil size={13} className="text-gray-400" />
                  Rinomina colonna
                </button>
                {hasSettings && (
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); setSettingsOpen(true); }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 cursor-pointer
                              hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                              text-gray-700 dark:text-gray-300"
                  >
                    <Settings size={13} className="text-gray-400" />
                    Personalizza colonna
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); onRemove(); }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 cursor-pointer
                              hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
                              text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 size={13} className="text-gray-400" />
                    Elimina colonna
                  </button>
                )}
              </div>
            )}

            {settingsOpen && hasSettings && (
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl
                             border border-gray-200 dark:border-gray-700 z-50 min-w-[250px] slide-down">
                <ColumnSettingsPanel
                  items={configItems}
                  onAdd={onAddConfigItem}
                  onUpdate={onUpdateConfigItem}
                  onRemove={onRemoveConfigItem}
                  label={configLabel || ''}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </th>
  );
}

export default function LaunchTable({
  launches, selectedIds, onToggleSelect, onToggleSelectAll,
  onUpdate, onDelete, onDuplicate, onEdit, onOpenDetail, onAddInline,
  shops, statuses, priorities, columns, onReorderColumns, onAddColumn, onUpdateColumn, onRemoveColumn,
  onAddConfigItem, onUpdateConfigItem, onRemoveConfigItem,
}: Props) {
  // Map column IDs to their config data
  const colConfigMap: Record<string, { items: ConfigItem[]; type: 'shops' | 'statuses' | 'priorities'; label: string }> = {
    shop: { items: shops, type: 'shops', label: 'shop' },
    status: { items: statuses, type: 'statuses', label: 'stati' },
    priority: { items: priorities, type: 'priorities', label: 'priorita\'' },
  };
  const allIds = launches.map(l => l.id);
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id));
  const [draggedCol, setDraggedCol] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [inlineName, setInlineName] = useState('');
  const [inlineFocused, setInlineFocused] = useState(false);

  const handleInlineAdd = () => {
    if (inlineName.trim()) {
      onAddInline(inlineName.trim());
      setInlineName('');
    }
  };

  const visibleColumns = columns
    .filter(c => c.visible && !c.deletedAt)
    .sort((a, b) => a.order - b.order);

  const handleDragStart = (colId: string) => {
    const col = columns.find(c => c.id === colId);
    if (col?.pinned) return;
    setDraggedCol(colId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const col = columns.find(c => c.id === colId);
    if (col?.pinned) return;
    if (colId !== draggedCol) setDragOverCol(colId);
  };

  const handleDrop = (targetColId: string) => {
    if (!draggedCol || draggedCol === targetColId) {
      setDraggedCol(null);
      setDragOverCol(null);
      return;
    }
    const targetCol = columns.find(c => c.id === targetColId);
    if (targetCol?.pinned) {
      setDraggedCol(null);
      setDragOverCol(null);
      return;
    }

    const currentOrder = visibleColumns.map(c => c.id);
    const fromIdx = currentOrder.indexOf(draggedCol);
    const toIdx = currentOrder.indexOf(targetColId);
    if (fromIdx === -1 || toIdx === -1) {
      setDraggedCol(null);
      setDragOverCol(null);
      return;
    }

    const newOrder = [...currentOrder];
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, draggedCol);

    const hiddenCols = columns.filter(c => !c.visible).map(c => c.id);
    onReorderColumns([...newOrder, ...hiddenCols]);
    setDraggedCol(null);
    setDragOverCol(null);
  };

  if (launches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 fade-in">
        <Inbox size={48} className="mb-3" />
        <p className="text-lg font-medium">Nessun lancio trovato</p>
        <p className="text-sm mt-1">Prova a modificare i filtri o aggiungi un nuovo lancio</p>
      </div>
    );
  }

  // ── Resoconto data ──
  const fmtShort = (d: string) =>
    new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }).replace('.', '');

  const deadlines = launches.map(l => l.endDate).filter(Boolean).sort();
  const tlStarts = launches.map(l => l.startDate).filter(Boolean).sort();
  const tlEnds = launches.map(l => l.endDate).filter(Boolean).sort();

  const deadlineRange = deadlines.length > 0
    ? `${fmtShort(deadlines[0])} - ${fmtShort(deadlines[deadlines.length - 1])}`
    : '';
  const timelineRange = tlStarts.length > 0 && tlEnds.length > 0
    ? `${fmtShort(tlStarts[0])} - ${fmtShort(tlEnds[tlEnds.length - 1])}`
    : '';

  // Status color segments for each launch
  const segments = launches.map(l => {
    const s = statuses.find(st => st.id === l.status);
    return s?.color || '#c4c4c4';
  });

  const renderSummaryCell = (col: ColumnConfig) => {
    const tdClass = 'px-4 py-3 border-t border-gray-200 dark:border-gray-700';

    if (col.id === 'deadline' && deadlineRange) {
      return (
        <td key={col.id} className={tdClass}>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-[22px] w-full rounded-[3px] overflow-hidden gap-[2px]">
              {segments.map((color, i) => (
                <div key={i} className="flex-1 min-w-[6px]" style={{ backgroundColor: color }} />
              ))}
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700
                           text-[11px] font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {deadlineRange}
            </span>
          </div>
        </td>
      );
    }
    if (col.id === 'timeline' && timelineRange) {
      return (
        <td key={col.id} className={tdClass}>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-[22px] w-full rounded-[3px] overflow-hidden gap-[2px]">
              {segments.map((color, i) => (
                <div key={i} className="flex-1 min-w-[6px]" style={{ backgroundColor: color }} />
              ))}
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700
                           text-[11px] font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {timelineRange}
            </span>
          </div>
        </td>
      );
    }
    return <td key={col.id} className={tdClass} />;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200
                   dark:border-gray-800 overflow-hidden fade-in">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left border-b border-gray-200 dark:border-gray-700 w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onToggleSelectAll(allIds)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400
                            cursor-pointer accent-blue-500"
                />
              </th>
              {visibleColumns.map(col => {
                const cfg = colConfigMap[col.id];
                return (
                  <EditableColumnHeader
                    key={col.id}
                    col={col}
                    isDragging={draggedCol === col.id}
                    dragOverId={dragOverCol}
                    onDragStart={() => handleDragStart(col.id)}
                    onDragOver={e => handleDragOver(e, col.id)}
                    onDrop={() => handleDrop(col.id)}
                    onDragEnd={() => { setDraggedCol(null); setDragOverCol(null); }}
                    onRename={name => onUpdateColumn(col.id, { name })}
                    onRemove={() => onRemoveColumn(col.id)}
                    configItems={cfg?.items}
                    configLabel={cfg?.label}
                    onAddConfigItem={cfg && onAddConfigItem ? (n, c) => onAddConfigItem(cfg.type, n, c) : undefined}
                    onUpdateConfigItem={cfg && onUpdateConfigItem ? (id, u) => onUpdateConfigItem(cfg.type, id, u) : undefined}
                    onRemoveConfigItem={cfg && onRemoveConfigItem ? (id) => onRemoveConfigItem(cfg.type, id) : undefined}
                  />
                );
              })}
              {/* Monday-style "+" column for adding columns */}
              <th className="px-2 py-3 border-b border-gray-200 dark:border-gray-700 w-8">
                <AddColumnMenu onAdd={onAddColumn} align="left" />
              </th>
            </tr>
          </thead>
          <tbody>
            {launches.map((launch, idx) => (
              <LaunchRow
                key={launch.id}
                launch={launch}
                index={idx}
                selected={selectedIds.has(launch.id)}
                onToggleSelect={() => onToggleSelect(launch.id)}
                onUpdate={onUpdate}
                onDelete={() => onDelete(launch.id)}
                onDuplicate={() => onDuplicate(launch.id)}
                onEdit={() => onEdit(launch)}
                onOpenDetail={() => onOpenDetail(launch)}
                shops={shops}
                statuses={statuses}
                priorities={priorities}
                columns={columns}
              />
            ))}
            {/* ── Monday-style inline "Aggiungi attivita'" row ── */}
            <tr className={`transition-colors ${inlineFocused
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}`}>
              <td className="relative px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 w-12">
                {inlineFocused && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r bg-blue-500" />
                )}
                <input type="checkbox" disabled
                  className="w-4 h-4 rounded border-gray-200 dark:border-gray-700 opacity-30" />
              </td>
              <td colSpan={visibleColumns.length} className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                <input
                  type="text"
                  value={inlineName}
                  onChange={e => setInlineName(e.target.value)}
                  onFocus={() => setInlineFocused(true)}
                  onBlur={() => { setInlineFocused(false); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleInlineAdd();
                    if (e.key === 'Escape') { setInlineName(''); (e.target as HTMLInputElement).blur(); }
                  }}
                  placeholder="+ Aggiungi attivita'"
                  className="w-full max-w-[320px] text-sm bg-transparent border-none outline-none
                            text-gray-700 dark:text-gray-300 placeholder-gray-400
                            dark:placeholder-gray-500"
                />
              </td>
              <td className="border-b border-gray-100 dark:border-gray-800" />
            </tr>
          </tbody>
          {/* ── Resoconto (summary) row ── */}
          <tfoot>
            <tr className="bg-gray-50/60 dark:bg-gray-800/40">
              <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 w-12" />
              {visibleColumns.map(col => renderSummaryCell(col))}
              <td className="border-t border-gray-200 dark:border-gray-700" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer stats */}
      <div className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50
                     dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 flex items-center
                     justify-between">
        <span>{launches.length} lanci visualizzati</span>
        {selectedIds.size > 0 && (
          <span className="text-blue-500 font-medium">{selectedIds.size} selezionati</span>
        )}
      </div>
    </div>
  );
}
