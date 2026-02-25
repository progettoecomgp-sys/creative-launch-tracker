import { useState, useRef, useEffect } from 'react';
import { Type, Hash, Calendar, Plus } from 'lucide-react';

const COLUMN_TYPES = [
  { type: 'text' as const, icon: Type, label: 'Testo', desc: 'Colonna di testo libero' },
  { type: 'number' as const, icon: Hash, label: 'Numeri', desc: 'Colonna numerica' },
  { type: 'date' as const, icon: Calendar, label: 'Data', desc: 'Selettore data' },
];

interface Props {
  onAdd: (name: string, type: 'text' | 'number' | 'date') => void;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
}

export default function AddColumnMenu({ onAdd, align = 'right', size = 'md' }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'type' | 'name'>('type');
  const [selectedType, setSelectedType] = useState<'text' | 'number' | 'date'>('text');
  const [name, setName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setStep('type');
        setName('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectType = (type: 'text' | 'number' | 'date') => {
    setSelectedType(type);
    const info = COLUMN_TYPES.find(t => t.type === type);
    setName(info?.label || '');
    setStep('name');
  };

  const handleConfirm = () => {
    if (name.trim()) {
      onAdd(name.trim(), selectedType);
      setOpen(false);
      setStep('type');
      setName('');
    }
  };

  const toggle = () => {
    setOpen(!open);
    setStep('type');
    setName('');
  };

  const iconSize = size === 'sm' ? 13 : 14;
  const posClass = align === 'left' ? 'right-0' : 'left-0';

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={toggle}
        className={`rounded hover:bg-gray-200 dark:hover:bg-gray-700
                   hover:text-gray-500 cursor-pointer transition-colors
                   ${open ? 'text-blue-500 bg-gray-100 dark:bg-gray-700' : 'text-gray-300'}
                   ${size === 'sm' ? 'p-0.5' : 'p-1'}`}
        title="Aggiungi colonna"
      >
        <Plus size={iconSize} />
      </button>

      {open && (
        <div className={`absolute ${posClass} top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl
                        border border-gray-200 dark:border-gray-700 z-50 min-w-[230px] slide-down overflow-hidden`}>
          {step === 'type' ? (
            <>
              <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Tipo di colonna
                </span>
              </div>
              <div className="py-1">
                {COLUMN_TYPES.map(ct => {
                  const Icon = ct.icon;
                  return (
                    <button
                      key={ct.type}
                      onClick={() => handleSelectType(ct.type)}
                      className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-blue-50
                                dark:hover:bg-blue-900/20 cursor-pointer transition-colors text-left"
                    >
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500
                                     dark:text-gray-400 shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {ct.label}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate">{ct.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-3 space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-medium uppercase">
                  {COLUMN_TYPES.find(t => t.type === selectedType)?.label}
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400
                                 uppercase tracking-wider mb-1.5">
                  Nome colonna
                </label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleConfirm();
                    if (e.key === 'Escape') { setStep('type'); setName(''); }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                            text-sm bg-white dark:bg-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setStep('type'); setName(''); }}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-gray-500
                            hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  Indietro
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!name.trim()}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-blue-500 text-white
                            hover:bg-blue-600 cursor-pointer transition-colors
                            disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Aggiungi
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
