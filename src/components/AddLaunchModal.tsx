import { useState } from 'react';
import { X, Plus, Paperclip, Trash2 } from 'lucide-react';
import type { Launch, SubTask } from '../types';
import type { ConfigItem, ColumnConfig } from '../types/config';
import { generateSubTaskId } from '../utils/storage';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: Omit<Launch, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editLaunch?: Launch | null;
  onUpdate?: (id: string, data: Partial<Launch>) => void;
  shops: ConfigItem[];
  statuses: ConfigItem[];
  priorities: ConfigItem[];
  columns: ColumnConfig[];
}

export default function AddLaunchModal({
  open, onClose, onAdd, editLaunch, onUpdate,
  shops, statuses, priorities, columns,
}: Props) {
  const isEdit = !!editLaunch;
  const today = new Date().toISOString().split('T')[0];
  const twoWeeksLater = (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]; })();

  const [form, setForm] = useState(editLaunch ? {
    name: editLaunch.name,
    shop: editLaunch.shop,
    status: editLaunch.status,
    priority: editLaunch.priority,
    startDate: editLaunch.startDate,
    endDate: editLaunch.endDate,
    notes: editLaunch.notes,
    attachments: editLaunch.attachments,
    subtasks: editLaunch.subtasks || [],
    customFields: editLaunch.customFields || {},
  } : {
    name: '',
    shop: shops[0]?.id || '',
    status: statuses[0]?.id || '',
    priority: priorities.length > 1 ? priorities[1].id : priorities[0]?.id || '',
    startDate: today,
    endDate: twoWeeksLater,
    notes: '',
    attachments: [] as string[],
    subtasks: [] as SubTask[],
    customFields: {} as Record<string, string | number>,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAttachment, setNewAttachment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  if (!open) return null;

  const customColumns = columns.filter(c => c.isCustom && c.visible);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Il nome e\' obbligatorio';
    if (!form.startDate) errs.startDate = 'La data inizio e\' obbligatoria';
    if (!form.endDate) errs.endDate = 'La data fine e\' obbligatoria';
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      errs.endDate = 'La data fine deve essere dopo la data inizio';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (isEdit && onUpdate && editLaunch) {
      onUpdate(editLaunch.id, form);
    } else {
      onAdd(form);
    }
    onClose();
  };

  const addAttachment = () => {
    if (newAttachment.trim()) {
      setForm(f => ({ ...f, attachments: [...f.attachments, newAttachment.trim()] }));
      setNewAttachment('');
    }
  };

  const removeAttachment = (idx: number) => {
    setForm(f => ({ ...f, attachments: f.attachments.filter((_, i) => i !== idx) }));
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const st: SubTask = {
        id: generateSubTaskId(),
        name: newSubtask.trim(),
        completed: false,
        dueDate: '',
        createdAt: new Date().toISOString(),
        fields: {},
      };
      setForm(f => ({ ...f, subtasks: [...f.subtasks, st] }));
      setNewSubtask('');
    }
  };

  const removeSubtask = (id: string) => {
    setForm(f => ({ ...f, subtasks: f.subtasks.filter(s => s.id !== id) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl
                     max-h-[90vh] overflow-y-auto slide-up">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200
                       dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {isEdit ? 'Modifica Lancio' : (
              <><Plus size={20} className="text-blue-500" /> Nuovo Lancio</>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400
                      transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome Campagna / Lancio *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Es: Campagna Primavera 2026"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800
                         dark:text-white focus:outline-none focus:ring-2 transition-all duration-200
                         ${errors.name
                           ? 'border-red-400 focus:ring-red-400/30'
                           : 'border-gray-200 dark:border-gray-700 focus:ring-blue-400/30 focus:border-blue-400'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Shop + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shop
              </label>
              <select
                value={form.shop}
                onChange={e => setForm(f => ({ ...f, shop: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700
                          text-sm bg-white dark:bg-gray-800 dark:text-white cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              >
                {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stato
              </label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700
                          text-sm bg-white dark:bg-gray-800 dark:text-white cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              >
                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Priority + Date Inizio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priorita'
              </label>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700
                          text-sm bg-white dark:bg-gray-800 dark:text-white cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              >
                {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Inizio *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800
                           dark:text-white focus:outline-none focus:ring-2 transition-all duration-200
                           ${errors.startDate
                             ? 'border-red-400 focus:ring-red-400/30'
                             : 'border-gray-200 dark:border-gray-700 focus:ring-blue-400/30 focus:border-blue-400'}`}
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>
          </div>

          {/* Data Fine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Fine *
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800
                           dark:text-white focus:outline-none focus:ring-2 transition-all duration-200
                           ${errors.endDate
                             ? 'border-red-400 focus:ring-red-400/30'
                             : 'border-gray-200 dark:border-gray-700 focus:ring-blue-400/30 focus:border-blue-400'}`}
              />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>
            <div />
          </div>

          {/* Custom Fields */}
          {customColumns.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Campi personalizzati
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customColumns.map(col => (
                  <div key={col.id}>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {col.name}
                    </label>
                    <input
                      type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                      value={form.customFields[col.id] ?? ''}
                      onChange={e => setForm(f => ({
                        ...f,
                        customFields: {
                          ...f.customFields,
                          [col.id]: col.type === 'number' ? Number(e.target.value) : e.target.value,
                        },
                      }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                                text-sm bg-white dark:bg-gray-800 dark:text-white
                                focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note / Descrizione
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Aggiungi note sulla campagna..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700
                        text-sm bg-white dark:bg-gray-800 dark:text-white resize-none
                        focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400
                        transition-all duration-200"
            />
          </div>

          {/* Sub-tasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sotto-attivita'
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                placeholder="Nuova sotto-attivita'..."
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                          text-sm bg-white dark:bg-gray-800 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600
                          dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600
                          transition-colors cursor-pointer text-sm"
              >
                <Plus size={16} />
              </button>
            </div>
            {form.subtasks.length > 0 && (
              <div className="space-y-1.5">
                {form.subtasks.map(st => (
                  <div key={st.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50
                                             dark:bg-gray-800 text-sm">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => setForm(f => ({
                        ...f,
                        subtasks: f.subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s),
                      }))}
                      className="w-4 h-4 rounded border-gray-300 text-blue-500 accent-blue-500 cursor-pointer"
                    />
                    <span className={`flex-1 text-gray-700 dark:text-gray-300 ${st.completed ? 'line-through opacity-50' : ''}`}>
                      {st.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSubtask(st.id)}
                      className="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              File Allegati (simulato)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAttachment}
                onChange={e => setNewAttachment(e.target.value)}
                placeholder="nome-file.pdf"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAttachment(); } }}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                          text-sm bg-white dark:bg-gray-800 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
              <button
                type="button"
                onClick={addAttachment}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600
                          dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600
                          transition-colors cursor-pointer text-sm"
              >
                <Paperclip size={16} />
              </button>
            </div>
            {form.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.attachments.map((file, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50
                             dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium"
                  >
                    <Paperclip size={12} />
                    {file}
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="ml-0.5 hover:text-red-500 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400
                        hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-500 text-white
                        hover:bg-blue-600 transition-all duration-200 cursor-pointer
                        hover:shadow-md active:scale-[0.98]"
            >
              {isEdit ? 'Salva Modifiche' : 'Crea Lancio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
