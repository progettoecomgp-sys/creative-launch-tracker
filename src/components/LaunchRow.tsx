import { useState, useRef, useEffect } from 'react';
import {
  Edit3, Trash2, Copy, Paperclip, ChevronRight, ChevronDown,
  X, Star, CirclePlus,
} from 'lucide-react';
import type { Launch, SubTask } from '../types';
import { ROW_ACCENT_COLORS } from '../types';
import type { ConfigItem, ColumnConfig } from '../types/config';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TimelineBar from './TimelineBar';
import AddColumnMenu from './AddColumnMenu';
import { generateSubTaskId } from '../utils/storage';

interface Props {
  launch: Launch;
  index: number;
  selected: boolean;
  onToggleSelect: () => void;
  onUpdate: (id: string, data: Partial<Launch>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onOpenDetail: () => void;
  shops: ConfigItem[];
  statuses: ConfigItem[];
  priorities: ConfigItem[];
  columns: ColumnConfig[];
}

// ── Sub-task status dropdown (inline) ──
function SubStatusBadge({ completed, onChange }: { completed: boolean; onChange: (v: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const color = completed ? '#00c875' : '#c4c4c4';
  const label = completed ? 'Fatto' : 'Da fare';

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center px-3 py-1 rounded-sm text-[11px]
                   font-semibold text-white cursor-pointer hover:opacity-90 transition-all
                   w-full max-w-[100px]"
        style={{ backgroundColor: color }}
      >
        {label}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg
                       border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-[110px] slide-down">
          {[{ val: false, name: 'Da fare', col: '#c4c4c4' },
            { val: true, name: 'Fatto', col: '#00c875' },
          ].map(opt => (
            <button
              key={opt.name}
              onClick={() => { onChange(opt.val); setOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 cursor-pointer
                        hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: opt.col }} />
              <span className={`dark:text-gray-300 ${opt.val === completed ? 'font-bold' : ''}`}>{opt.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Inline date editor ──
function InlineDateCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);

  const fmtDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }).replace('.', '');
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="date"
        value={value}
        onChange={e => { onChange(e.target.value); setEditing(false); }}
        onBlur={() => setEditing(false)}
        className="w-[110px] px-1.5 py-0.5 rounded border border-blue-400 text-xs bg-white
                  dark:bg-gray-800 dark:text-white focus:outline-none"
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-500
                transition-colors"
    >
      {fmtDate(value)}
    </span>
  );
}

// ── Deadline badge (click-to-edit with status icon) ──
function DeadlineBadge({ date, statusColor, statusId, linked, onChange }: {
  date: string;
  statusColor?: string;
  statusId: string;
  linked: boolean;
  onChange: (date: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setEditing(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [editing]);

  const end = new Date(date);
  const now = new Date();
  const days = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  const isCompleted = statusId === 'completato';

  // Monday-style filled circle icons
  let icon: React.ReactNode;
  const iconCls = 'w-[16px] h-[16px] rounded-full inline-flex items-center justify-center text-white text-[9px] font-bold shrink-0 leading-none';
  if (isCompleted) {
    icon = <span className={iconCls} style={{ backgroundColor: linked ? statusColor : '#00c875' }}>&#10003;</span>;
  } else if (days < 0) {
    icon = <span className={iconCls} style={{ backgroundColor: linked ? statusColor : '#e2445c' }}>!</span>;
  } else if (days < 3) {
    icon = <span className={iconCls} style={{ backgroundColor: linked ? statusColor : '#fdab3d' }}>!</span>;
  } else {
    icon = <span className="w-[10px] h-[10px] rounded-full shrink-0"
                 style={{ backgroundColor: linked ? (statusColor || '#c4c4c4') : '#c4c4c4' }} />;
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }).replace('.', '');

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setEditing(!editing)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400
                  hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors
                  px-2 py-1 -mx-2 -my-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50"
      >
        {icon}
        <span>{fmtDate(date)}</span>
      </button>
      {editing && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white dark:bg-gray-800
                       rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50
                       min-w-[200px] slide-down">
          <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400
                           uppercase tracking-wider mb-1.5">
            Scadenza
          </label>
          <input
            autoFocus
            type="date"
            value={date}
            onChange={e => { onChange(e.target.value); setEditing(false); }}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                      text-sm bg-white dark:bg-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
          />
        </div>
      )}
    </div>
  );
}

// ── Main component ──
export default function LaunchRow({
  launch, index, selected, onToggleSelect, onUpdate, onDelete, onDuplicate, onEdit, onOpenDetail,
  shops, statuses, priorities, columns,
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(launch.name);
  const [expanded, setExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const accentColor = ROW_ACCENT_COLORS[index % ROW_ACCENT_COLORS.length];

  const shopItem = shops.find(s => s.id === launch.shop);
  const statusItem = statuses.find(s => s.id === launch.status);

  // Collect all custom sub-task column keys across all subtasks
  const subCustomCols = Array.from(new Set(
    launch.subtasks.flatMap(st => Object.keys(st.fields || {}))
  ));

  const saveName = () => {
    if (nameValue.trim() && nameValue !== launch.name) {
      onUpdate(launch.id, { name: nameValue.trim() });
    } else {
      setNameValue(launch.name);
    }
    setEditingName(false);
  };

  const toggleSubtask = (stId: string, val: boolean) => {
    onUpdate(launch.id, {
      subtasks: launch.subtasks.map(s => s.id === stId ? { ...s, completed: val } : s),
    });
  };

  const updateSubtaskDate = (stId: string, dueDate: string) => {
    onUpdate(launch.id, {
      subtasks: launch.subtasks.map(s => s.id === stId ? { ...s, dueDate } : s),
    });
  };

  const updateSubtaskField = (stId: string, fieldKey: string, value: string) => {
    onUpdate(launch.id, {
      subtasks: launch.subtasks.map(s =>
        s.id === stId ? { ...s, fields: { ...(s.fields || {}), [fieldKey]: value } } : s
      ),
    });
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const st: SubTask = {
      id: generateSubTaskId(),
      name: newSubtask.trim(),
      completed: false,
      dueDate: '',
      createdAt: new Date().toISOString(),
      fields: {},
    };
    onUpdate(launch.id, { subtasks: [...launch.subtasks, st] });
    setNewSubtask('');
  };

  const removeSubtask = (stId: string) => {
    onUpdate(launch.id, { subtasks: launch.subtasks.filter(s => s.id !== stId) });
  };

  const addSubColumn = (name: string, _type: string) => {
    // Initialize field in all existing subtasks
    onUpdate(launch.id, {
      subtasks: launch.subtasks.map(s => ({ ...s, fields: { ...(s.fields || {}), [name]: '' } })),
    });
  };

  const visibleColumns = columns
    .filter(c => c.visible && !c.deletedAt)
    .sort((a, b) => a.order - b.order);

  const renderCell = (col: ColumnConfig) => {
    switch (col.id) {
      case 'name':
        return (
          <td key={col.id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 min-w-[280px]">
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400
                          cursor-pointer shrink-0 flex items-center gap-0.5"
              >
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {launch.subtasks.length > 0 && (
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 min-w-[14px] text-center">
                    {launch.subtasks.length}
                  </span>
                )}
              </button>
              {editingName ? (
                <input
                  autoFocus type="text" value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setNameValue(launch.name); setEditingName(false); } }}
                  className="w-full px-2 py-1 rounded border border-blue-400 text-sm bg-white
                            dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                />
              ) : (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <span onClick={() => onOpenDetail()}
                    className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer
                              hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
                    {launch.name}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setEditingName(true); }}
                      className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-300 hover:text-amber-400 cursor-pointer" title="Rinomina">
                      <Star size={13} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
                      className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-300 hover:text-blue-500 cursor-pointer" title="Apri dettaglio">
                      <CirclePlus size={13} />
                    </button>
                  </div>
                  {launch.attachments.length > 0 && (
                    <span className="text-gray-400 shrink-0 ml-1" title={`${launch.attachments.length} allegati`}>
                      <Paperclip size={12} />
                    </span>
                  )}
                </div>
              )}
            </div>
          </td>
        );
      case 'shop':
        return (
          <td key={col.id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-700">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: shopItem?.color || '#999' }} />
              <span className="text-gray-700 dark:text-gray-300">{shopItem?.name || launch.shop}</span>
            </span>
          </td>
        );
      case 'status':
        return (
          <td key={col.id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-center">
            <StatusBadge status={launch.status} statuses={statuses} onChange={s => onUpdate(launch.id, { status: s })} />
          </td>
        );
      case 'deadline': {
        const dlLinked = col.colorLinked !== false;
        return (
          <td key={col.id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <DeadlineBadge
              date={launch.endDate}
              statusColor={statusItem?.color}
              statusId={launch.status}
              linked={dlLinked}
              onChange={date => onUpdate(launch.id, { endDate: date })}
            />
          </td>
        );
      }
      case 'priority':
        return (
          <td key={col.id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-center">
            <PriorityBadge priority={launch.priority} priorities={priorities} onChange={p => onUpdate(launch.id, { priority: p })} />
          </td>
        );
      case 'timeline': {
        const tlLinked = col.colorLinked !== false;
        return (
          <td key={col.id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-center">
            <TimelineBar startDate={launch.startDate} endDate={launch.endDate}
              statusColor={tlLinked ? statusItem?.color : '#597bfc'}
              onChange={(s, e) => onUpdate(launch.id, { startDate: s, endDate: e })} />
          </td>
        );
      }
      case 'actions':
        return (
          <td key={col.id} className="px-2 py-3 border-b border-gray-100 dark:border-gray-800 w-10">
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onEdit} className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer" title="Modifica"><Edit3 size={14} /></button>
              <button onClick={onDuplicate} className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-400 hover:text-purple-500 transition-colors cursor-pointer" title="Duplica"><Copy size={14} /></button>
              <button onClick={onDelete} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors cursor-pointer" title="Elimina"><Trash2 size={14} /></button>
            </div>
          </td>
        );
      default:
        if (col.isCustom) {
          const value = launch.customFields?.[col.id] ?? '';
          return (
            <td key={col.id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-700 dark:text-gray-300">{String(value)}</span>
            </td>
          );
        }
        return <td key={col.id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-800" />;
    }
  };

  const totalColSpan = visibleColumns.length + 1;

  // Grid template for sub-items: checkbox | name | status | date | ...customCols | +
  const subGridCols = `40px 1fr 120px 110px ${subCustomCols.map(() => '110px').join(' ')} 40px`;

  return (
    <>
      {/* Parent row */}
      <tr className={`group transition-all duration-150 hover:bg-blue-50/50 dark:hover:bg-blue-900/10
                      ${selected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
        <td className="relative px-4 py-3 border-b border-gray-100 dark:border-gray-800 w-12">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r" style={{ backgroundColor: accentColor }} />
          <input type="checkbox" checked={selected} onChange={onToggleSelect}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer accent-blue-500" />
        </td>
        {visibleColumns.map(col => renderCell(col))}
      </tr>

      {/* ── Monday-style sub-items block ── */}
      {expanded && (
        <tr>
          <td colSpan={totalColSpan} className="p-0 border-b border-gray-200 dark:border-gray-700">
            <div className="ml-12 mr-4 my-2 rounded-lg border border-gray-200 dark:border-gray-700 overflow-visible"
                 style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}>

              {/* ── Sub-item header ── */}
              <div className="grid bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700"
                   style={{ gridTemplateColumns: subGridCols }}>
                <div className="px-2 py-2" />
                <div className="px-3 py-2">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Sotto elemento</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Stato</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Data</span>
                </div>
                {subCustomCols.map(key => (
                  <div key={key} className="px-3 py-2 text-center">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">
                      {key}
                    </span>
                  </div>
                ))}
                {/* "+" button to add column */}
                <div className="px-2 py-2 flex items-center justify-center">
                  <AddColumnMenu onAdd={addSubColumn} align="left" size="sm" />
                </div>
              </div>

              {/* ── Sub-item rows ── */}
              {launch.subtasks.map(st => (
                <div key={st.id}
                     className="grid group/sub hover:bg-blue-50/40 dark:hover:bg-blue-900/10
                               border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors"
                     style={{ gridTemplateColumns: subGridCols }}>
                  {/* Checkbox */}
                  <div className="px-2 py-2.5 flex items-center justify-center">
                    <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(st.id, !st.completed)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 accent-blue-500 cursor-pointer" />
                  </div>
                  {/* Name */}
                  <div className="px-3 py-2.5 flex items-center gap-2 min-w-0">
                    <span className={`text-sm text-gray-700 dark:text-gray-300 truncate
                                     ${st.completed ? 'line-through opacity-50' : ''}`}>
                      {st.name}
                    </span>
                    <button onClick={() => removeSubtask(st.id)}
                      className="p-0.5 text-gray-300 hover:text-red-500 cursor-pointer
                                opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0">
                      <X size={12} />
                    </button>
                  </div>
                  {/* Status dropdown */}
                  <div className="px-3 py-2.5 flex items-center justify-center">
                    <SubStatusBadge completed={st.completed} onChange={val => toggleSubtask(st.id, val)} />
                  </div>
                  {/* Date (editable) */}
                  <div className="px-3 py-2.5 flex items-center justify-center">
                    <InlineDateCell value={st.dueDate || ''} onChange={val => updateSubtaskDate(st.id, val)} />
                  </div>
                  {/* Custom columns */}
                  {subCustomCols.map(key => (
                    <div key={key} className="px-2 py-2.5 flex items-center justify-center">
                      <input
                        type="text"
                        value={(st.fields || {})[key] || ''}
                        onChange={e => updateSubtaskField(st.id, key, e.target.value)}
                        className="w-full px-1.5 py-0.5 rounded border border-transparent hover:border-gray-300
                                  dark:hover:border-gray-600 focus:border-blue-400 text-xs text-center
                                  bg-transparent dark:text-gray-300 focus:outline-none transition-colors"
                        placeholder="—"
                      />
                    </div>
                  ))}
                  <div className="px-2 py-2.5" />
                </div>
              ))}

              {/* ── "+ Aggiungi sotto elemento" ── */}
              <div className="grid hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors"
                   style={{ gridTemplateColumns: '40px 1fr' }}>
                <div className="px-2 py-2.5" />
                <div className="px-3 py-2.5">
                  <input type="text" value={newSubtask} onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addSubtask(); }}
                    placeholder="+ Aggiungi sotto elemento"
                    className="text-sm text-gray-400 bg-transparent border-none outline-none w-full
                              placeholder-gray-400 hover:placeholder-gray-500 cursor-text
                              focus:text-gray-700 dark:focus:text-gray-300" />
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
