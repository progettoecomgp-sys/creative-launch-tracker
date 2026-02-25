import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ConfigItem } from '../types/config';

interface Props {
  priority: string;
  priorities: ConfigItem[];
  onChange: (id: string) => void;
}

export default function PriorityBadge({ priority, priorities, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = priorities.find(p => p.id === priority);
  const color = current?.color || '#fdab3d';
  const label = current?.name || priority;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center gap-1 px-4 py-1.5 rounded-sm text-xs font-semibold
                   text-white cursor-pointer transition-all duration-200 hover:opacity-90
                   hover:shadow-md active:scale-95 whitespace-nowrap min-w-[80px]"
        style={{ backgroundColor: color }}
      >
        {label}
        <ChevronDown size={11} className="opacity-70" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg
                       border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-[120px] slide-down">
          {priorities.map(p => (
            <button
              key={p.id}
              onClick={() => { onChange(p.id); setOpen(false); }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 cursor-pointer
                        hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: p.color }}
              />
              <span className={`dark:text-gray-300 ${p.id === priority ? 'font-semibold' : ''}`}>
                {p.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
