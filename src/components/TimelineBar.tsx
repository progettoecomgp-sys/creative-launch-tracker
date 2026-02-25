import { useState, useRef, useEffect } from 'react';

interface Props {
  startDate: string;
  endDate: string;
  statusColor?: string;
  compact?: boolean;
  onChange?: (startDate: string, endDate: string) => void;
}

export default function TimelineBar({ startDate, endDate, statusColor = '#0073ea', compact = false, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [editStart, setEditStart] = useState(startDate);
  const [editEnd, setEditEnd] = useState(endDate);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditStart(startDate);
    setEditEnd(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (open && onChange && (editStart !== startDate || editEnd !== endDate)) {
          onChange(editStart, editEnd);
        }
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, editStart, editEnd, startDate, endDate, onChange]);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const isOverdue = now > end;
  const isCompleted = now >= end;

  const formatShort = (d: Date) =>
    d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }).replace('.', '');

  const isSameDay = startDate === endDate;
  const label = isSameDay ? formatShort(start) : `${formatShort(start)} - ${formatShort(end)}`;

  if (compact) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {label}
      </span>
    );
  }

  const handleSave = () => {
    if (onChange && editStart && editEnd && editStart <= editEnd) {
      onChange(editStart, editEnd);
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
                   whitespace-nowrap transition-all duration-200 cursor-pointer hover:opacity-90
                   hover:shadow-md active:scale-95 text-white"
        style={{ backgroundColor: statusColor }}
      >
        {/* Overdue: red filled circle with white ! */}
        {isOverdue && (
          <span className="w-[15px] h-[15px] rounded-full bg-[#e2445c] inline-flex items-center
                         justify-center text-white text-[9px] font-bold shrink-0 leading-none
                         shadow-sm">!</span>
        )}
        {/* Completed (not overdue): white ✓ */}
        {isCompleted && !isOverdue && (
          <span className="w-[15px] h-[15px] rounded-full bg-white/25 inline-flex items-center
                         justify-center text-white text-[10px] font-bold shrink-0 leading-none">
            &#10003;
          </span>
        )}
        {label}
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white dark:bg-gray-800
                       rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50
                       min-w-[260px] slide-down">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400
                               uppercase tracking-wider mb-1">
                Data inizio
              </label>
              <input
                type="date"
                value={editStart}
                onChange={e => setEditStart(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                          text-sm bg-white dark:bg-gray-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400
                               uppercase tracking-wider mb-1">
                Data fine
              </label>
              <input
                type="date"
                value={editEnd}
                onChange={e => setEditEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                          text-sm bg-white dark:bg-gray-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
              />
            </div>
            {editStart && editEnd && editStart > editEnd && (
              <p className="text-xs text-red-500">La data fine deve essere dopo la data inizio</p>
            )}
            <button
              onClick={handleSave}
              disabled={!editStart || !editEnd || editStart > editEnd}
              className="w-full py-2 rounded-lg text-sm font-medium bg-blue-500 text-white
                        hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-40
                        disabled:cursor-not-allowed"
            >
              Applica
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
