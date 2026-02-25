import { useState } from 'react';
import {
  Rocket, Table2, LayoutGrid, Moon, Sun,
  ChevronLeft, ChevronRight, Search, FolderOpen, Trash2,
} from 'lucide-react';
import type { ViewMode } from '../types';

interface Props {
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  onOpenTrash: () => void;
  trashCount: number;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Sidebar({
  viewMode, onViewModeChange,
  onOpenTrash, trashCount, darkMode, toggleDarkMode,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'table' as ViewMode, label: 'Tabella', icon: Table2 },
    { id: 'kanban' as ViewMode, label: 'Kanban', icon: LayoutGrid },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col border-r border-gray-200 dark:border-gray-800
                  bg-white dark:bg-gray-900 transition-all duration-300 shrink-0 z-30
                  ${collapsed ? 'w-[52px]' : 'w-[220px]'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shrink-0">
          <Rocket size={18} />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">
            Launch Tracker
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {/* Search placeholder */}
        <button
          className={`w-full flex items-center gap-2.5 rounded-md text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer
                     ${collapsed ? 'justify-center p-2' : 'px-2.5 py-2'}`}
          title="Cerca"
        >
          <Search size={16} className="shrink-0" />
          {!collapsed && <span className="text-sm">Cerca</span>}
        </button>

        {/* Separator */}
        <div className="h-px bg-gray-200 dark:bg-gray-800 my-2!" />

        {/* View modes */}
        {navItems.map(item => {
          const Icon = item.icon;
          const active = viewMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewModeChange(item.id)}
              className={`w-full flex items-center gap-2.5 rounded-md transition-colors cursor-pointer
                         ${collapsed ? 'justify-center p-2' : 'px-2.5 py-2'}
                         ${active
                           ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                           : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title={item.label}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}

        {/* Separator */}
        <div className="h-px bg-gray-200 dark:bg-gray-800 my-2!" />

        {/* Cestino */}
        <button
          onClick={onOpenTrash}
          className={`w-full flex items-center gap-2.5 rounded-md text-gray-600 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer relative
                     ${collapsed ? 'justify-center p-2' : 'px-2.5 py-2'}`}
          title="Cestino"
        >
          <Trash2 size={16} className="shrink-0" />
          {!collapsed && (
            <span className="text-sm flex items-center gap-1.5">
              Cestino
              {trashCount > 0 && (
                <span className="text-[10px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-500
                               dark:text-gray-400 px-1.5 py-0.5 rounded-full">
                  {trashCount}
                </span>
              )}
            </span>
          )}
          {collapsed && trashCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-400" />
          )}
        </button>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2 space-y-1">
        {/* Workspace indicator */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-gray-50 dark:bg-gray-800/50">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-green-400 to-blue-500 flex items-center
                           justify-center text-white text-[10px] font-bold shrink-0">
              C
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                Creative Team
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <FolderOpen size={9} />
                Area di lavoro
              </p>
            </div>
          </div>
        )}

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center gap-2.5 rounded-md text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer
                     ${collapsed ? 'justify-center p-2' : 'px-2.5 py-2'}`}
          title={darkMode ? 'Modalita\' chiara' : 'Modalita\' scura'}
        >
          {darkMode ? <Sun size={16} className="shrink-0" /> : <Moon size={16} className="shrink-0" />}
          {!collapsed && <span className="text-sm">{darkMode ? 'Chiaro' : 'Scuro'}</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2.5 rounded-md text-gray-400 dark:text-gray-500
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer
                     ${collapsed ? 'justify-center p-2' : 'px-2.5 py-2'}`}
          title={collapsed ? 'Espandi' : 'Comprimi'}
        >
          {collapsed
            ? <ChevronRight size={16} className="shrink-0" />
            : <ChevronLeft size={16} className="shrink-0" />
          }
          {!collapsed && <span className="text-xs">Comprimi</span>}
        </button>
      </div>
    </aside>
  );
}
