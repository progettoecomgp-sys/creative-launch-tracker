import { Copy, Download, Trash2, X } from 'lucide-react';

interface Props {
  count: number;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export default function SelectionBar({
  count, onDuplicate, onExport, onDelete, onClear,
}: Props) {
  if (count === 0) return null;

  const actions = [
    { label: 'Duplica', icon: Copy, onClick: onDuplicate },
    { label: 'Esporta', icon: Download, onClick: onExport },
    { label: 'Elimina', icon: Trash2, onClick: onDelete },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 slide-up">
      <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-xl shadow-2xl
                     border border-gray-200 dark:border-gray-700 px-4 py-2.5
                     ring-1 ring-black/5 dark:ring-white/5">
        {/* Count badge + label */}
        <div className="flex items-center gap-2.5 pr-4 border-r border-gray-200 dark:border-gray-700 mr-1">
          <span className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold
                         flex items-center justify-center shrink-0">
            {count}
          </span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
            {count === 1 ? 'Attivita\' selezionato' : 'Attivita\' selezionate'}
          </span>
        </div>

        {/* Action buttons */}
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg
                        hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer
                        text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                        min-w-[52px]"
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium leading-tight">{action.label}</span>
            </button>
          );
        })}

        {/* Close / deselect */}
        <div className="pl-1 border-l border-gray-200 dark:border-gray-700 ml-1">
          <button
            onClick={onClear}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                      text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                      transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
