import { Search, X } from 'lucide-react';
import type { Filters } from '../types';

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
}

export default function FilterBar({ filters, setFilters }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative min-w-[180px]">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cerca..."
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          className="w-full pl-8 pr-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700
                     text-sm bg-white dark:bg-gray-800 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400
                     transition-all duration-200"
        />
        {filters.search && (
          <button
            onClick={() => setFilters({ ...filters, search: '' })}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100
                      dark:hover:bg-gray-700 text-gray-400 cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
