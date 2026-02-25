import { useState, useCallback } from 'react';
import { Plus, Download, MoreHorizontal } from 'lucide-react';
import type { Launch, ViewMode } from '../types';
import { useLaunches } from '../hooks/useLaunches';
import { useAppConfig } from '../hooks/useAppConfig';
import { exportToCSV, exportToJSON } from '../utils/storage';
import StatsCards from './StatsCards';
import FilterBar from './FilterBar';
import LaunchTable from './LaunchTable';
import KanbanView from './KanbanView';
import AddLaunchModal from './AddLaunchModal';
import ConfirmDialog from './ConfirmDialog';
import LaunchDetailPanel from './LaunchDetailPanel';
import ColumnManager from './ColumnManager';
import TrashModal from './TrashModal';
import SelectionBar from './SelectionBar';
import Sidebar from './Sidebar';
import { toast } from './Toast';

interface Props {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Dashboard({ darkMode, toggleDarkMode }: Props) {
  const {
    launches, allLaunches, deletedLaunches, filters, setFilters, selectedIds,
    toggleSelect, toggleSelectAll, clearSelection, addLaunch, updateLaunch,
    deleteLaunch, restoreLaunch, permanentlyDeleteLaunch,
    duplicateLaunch, deleteSelected, stats,
  } = useLaunches();

  const {
    config,
    addShop, updateShop, removeShop,
    addStatus, updateStatus, removeStatus,
    addPriority, updatePriority, removePriority,
    addColumn, updateColumn, removeColumn, restoreColumn, permanentlyDeleteColumn, reorderColumns,
  } = useAppConfig();

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLaunch, setEditingLaunch] = useState<Launch | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'single' | 'bulk'; id?: string } | null>(null);
  const [detailLaunch, setDetailLaunch] = useState<Launch | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [columnManagerOpen, setColumnManagerOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);

  const deletedColumns = config.columns.filter(c => c.deletedAt);
  const trashCount = deletedColumns.length + deletedLaunches.length;

  const handleAdd = useCallback((data: Omit<Launch, 'id' | 'createdAt' | 'updatedAt'>) => {
    addLaunch(data);
    toast('success', 'Lancio creato con successo!');
  }, [addLaunch]);

  const handleUpdate = useCallback((id: string, data: Partial<Launch>) => {
    updateLaunch(id, data);
    toast('success', 'Lancio aggiornato!');
  }, [updateLaunch]);

  const handleDelete = useCallback((id: string) => {
    setConfirmDelete({ type: 'single', id });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    setConfirmDelete({ type: 'bulk' });
  }, []);

  const handleDuplicateSelected = useCallback(() => {
    selectedIds.forEach(id => duplicateLaunch(id));
    toast('success', `${selectedIds.size} lanci duplicati!`);
    clearSelection();
  }, [selectedIds, duplicateLaunch, clearSelection]);

  const handleExportSelected = useCallback(() => {
    const selected = allLaunches.filter(l => selectedIds.has(l.id));
    exportToCSV(selected);
    toast('success', `${selected.length} lanci esportati!`);
  }, [selectedIds, allLaunches]);

  const confirmDeleteAction = useCallback(() => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'single' && confirmDelete.id) {
      deleteLaunch(confirmDelete.id);
      toast('info', 'Spostato nel cestino');
    } else {
      deleteSelected();
      toast('info', 'Spostati nel cestino');
    }
    setConfirmDelete(null);
  }, [confirmDelete, deleteLaunch, deleteSelected]);

  const handleDuplicate = useCallback((id: string) => {
    duplicateLaunch(id);
    toast('success', 'Lancio duplicato!');
  }, [duplicateLaunch]);

  const handleEdit = useCallback((launch: Launch) => {
    setEditingLaunch(launch);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingLaunch(null);
  }, []);

  const handleOpenDetail = useCallback((launch: Launch) => {
    setDetailLaunch(launch);
    setDetailPanelOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailPanelOpen(false);
    setDetailLaunch(null);
  }, []);

  const handleRestoreColumn = useCallback((id: string) => {
    restoreColumn(id);
    toast('success', 'Colonna ripristinata');
  }, [restoreColumn]);

  const handlePermanentlyDeleteColumn = useCallback((id: string) => {
    permanentlyDeleteColumn(id);
    toast('info', 'Colonna eliminata definitivamente');
  }, [permanentlyDeleteColumn]);

  const handleRestoreLaunch = useCallback((id: string) => {
    restoreLaunch(id);
    toast('success', 'Elemento ripristinato');
  }, [restoreLaunch]);

  const handlePermanentlyDeleteLaunch = useCallback((id: string) => {
    permanentlyDeleteLaunch(id);
    toast('info', 'Elemento eliminato definitivamente');
  }, [permanentlyDeleteLaunch]);

  // Keep detailLaunch in sync with latest data
  const currentDetailLaunch = detailLaunch
    ? allLaunches.find(l => l.id === detailLaunch.id) || detailLaunch
    : null;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Left sidebar */}
      <Sidebar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenTrash={() => setTrashOpen(true)}
        trashCount={trashCount}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar (Monday-style) */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800
                          sticky top-0 z-20 px-5 py-2.5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
              Creative Launch Tracker
            </h1>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Gestione lanci creativi multi-shop
            </p>
          </div>

          {/* Right actions (small icons, Monday-style) */}
          <div className="flex items-center gap-1">
            {/* Export dropdown */}
            <div className="relative group">
              <button
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-gray-500
                          dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800
                          transition-colors cursor-pointer"
                title="Esporta"
              >
                <Download size={14} />
                <span className="hidden md:inline">Esporta</span>
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg
                             shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]
                             opacity-0 invisible group-hover:opacity-100 group-hover:visible
                             transition-all duration-200 z-50">
                <button
                  onClick={() => { exportToCSV(allLaunches); toast('success', 'CSV esportato!'); }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700
                            text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  CSV
                </button>
                <button
                  onClick={() => { exportToJSON(allLaunches); toast('success', 'JSON esportato!'); }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700
                            text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  JSON
                </button>
              </div>
            </div>

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-gray-400
                        dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800
                        transition-colors cursor-pointer"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
        </header>

        {/* Action bar (Monday-style: new button + filters) */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800
                       px-5 py-2 flex items-center gap-3">
          <button
            onClick={() => { setEditingLaunch(null); setModalOpen(true); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-500 text-white
                      text-sm font-medium hover:bg-blue-600 transition-all duration-200
                      cursor-pointer hover:shadow-md active:scale-[0.98] shrink-0"
          >
            <Plus size={16} />
            Nuovo Lancio
          </button>

          <div className="flex-1 min-w-0">
            <FilterBar
              filters={filters}
              setFilters={setFilters}
            />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 px-5 py-4 overflow-y-auto">
          <StatsCards stats={stats} statuses={config.statuses} />

          {viewMode === 'table' ? (
            <LaunchTable
              launches={launches}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onUpdate={updateLaunch}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onEdit={handleEdit}
              onOpenDetail={handleOpenDetail}
              onAddInline={(name: string) => {
                const today = new Date().toISOString().split('T')[0];
                const twoWeeks = (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]; })();
                handleAdd({
                  name,
                  shop: config.shops[0]?.id || '',
                  status: config.statuses[0]?.id || '',
                  priority: config.priorities.length > 1 ? config.priorities[1].id : config.priorities[0]?.id || '',
                  startDate: today,
                  endDate: twoWeeks,
                  notes: '',
                  attachments: [],
                  subtasks: [],
                  customFields: {},
                });
              }}
              shops={config.shops}
              statuses={config.statuses}
              priorities={config.priorities}
              columns={config.columns}
              onReorderColumns={reorderColumns}
              onAddColumn={addColumn}
              onUpdateColumn={updateColumn}
              onRemoveColumn={removeColumn}
              onAddConfigItem={(type, name, color) => {
                if (type === 'shops') addShop(name, color);
                else if (type === 'statuses') addStatus(name, color);
                else addPriority(name, color);
              }}
              onUpdateConfigItem={(type, id, updates) => {
                if (type === 'shops') updateShop(id, updates);
                else if (type === 'statuses') updateStatus(id, updates);
                else updatePriority(id, updates);
              }}
              onRemoveConfigItem={(type, id) => {
                if (type === 'shops') removeShop(id);
                else if (type === 'statuses') removeStatus(id);
                else removePriority(id);
              }}
            />
          ) : (
            <KanbanView
              launches={launches}
              onUpdate={updateLaunch}
              onOpenDetail={handleOpenDetail}
              statuses={config.statuses}
              priorities={config.priorities}
              shops={config.shops}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddLaunchModal
        open={modalOpen}
        onClose={handleCloseModal}
        onAdd={handleAdd}
        editLaunch={editingLaunch}
        onUpdate={handleUpdate}
        shops={config.shops}
        statuses={config.statuses}
        priorities={config.priorities}
        columns={config.columns}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Conferma Eliminazione"
        message={
          confirmDelete?.type === 'bulk'
            ? `Sei sicuro di voler spostare ${selectedIds.size} lanci selezionati nel cestino?`
            : 'Sei sicuro di voler spostare questo lancio nel cestino? Potrai ripristinarlo dal cestino.'
        }
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Detail Panel */}
      {currentDetailLaunch && (
        <LaunchDetailPanel
          launch={currentDetailLaunch}
          open={detailPanelOpen}
          onClose={handleCloseDetail}
          onUpdate={updateLaunch}
          shops={config.shops}
          statuses={config.statuses}
          priorities={config.priorities}
        />
      )}

      {/* Column Manager */}
      <ColumnManager
        open={columnManagerOpen}
        onClose={() => setColumnManagerOpen(false)}
        columns={config.columns}
        onAddColumn={addColumn}
        onUpdateColumn={updateColumn}
        onRemoveColumn={removeColumn}
      />

      {/* Trash Modal (Monday-style) */}
      <TrashModal
        open={trashOpen}
        onClose={() => setTrashOpen(false)}
        deletedColumns={deletedColumns}
        deletedLaunches={deletedLaunches}
        onRestoreColumn={handleRestoreColumn}
        onPermanentlyDeleteColumn={handlePermanentlyDeleteColumn}
        onRestoreLaunch={handleRestoreLaunch}
        onPermanentlyDeleteLaunch={handlePermanentlyDeleteLaunch}
      />

      {/* Floating selection bar (Monday-style) */}
      <SelectionBar
        count={selectedIds.size}
        onDuplicate={handleDuplicateSelected}
        onExport={handleExportSelected}
        onDelete={handleDeleteSelected}
        onClear={clearSelection}
      />
    </div>
  );
}
