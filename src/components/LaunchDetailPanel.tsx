import { X, Paperclip, FileText, Image, File, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import type { Launch } from '../types';
import type { ConfigItem } from '../types/config';
import TimelineBar from './TimelineBar';
import { generateSubTaskId } from '../utils/storage';
import { useState } from 'react';

interface Props {
  launch: Launch;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Launch>) => void;
  shops: ConfigItem[];
  statuses: ConfigItem[];
  priorities: ConfigItem[];
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) return <FileText size={14} className="text-red-500" />;
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return <Image size={14} className="text-blue-500" />;
  if (['psd', 'ai', 'sketch', 'fig'].includes(ext)) return <Image size={14} className="text-purple-500" />;
  return <File size={14} className="text-gray-400" />;
}

export default function LaunchDetailPanel({
  launch, open, onClose, onUpdate, shops, statuses, priorities,
}: Props) {
  const [newSubtask, setNewSubtask] = useState('');

  if (!open) return null;

  const shopItem = shops.find(s => s.id === launch.shop);
  const statusItem = statuses.find(s => s.id === launch.status);
  const priorityItem = priorities.find(p => p.id === launch.priority);

  const completedSubtasks = launch.subtasks.filter(s => s.completed).length;
  const totalSubtasks = launch.subtasks.length;
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const toggleSubtask = (stId: string) => {
    onUpdate(launch.id, {
      subtasks: launch.subtasks.map(s => s.id === stId ? { ...s, completed: !s.completed } : s),
    });
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    onUpdate(launch.id, {
      subtasks: [...launch.subtasks, {
        id: generateSubTaskId(),
        name: newSubtask.trim(),
        completed: false,
        dueDate: '',
        createdAt: new Date().toISOString(),
        fields: {},
      }],
    });
    setNewSubtask('');
  };

  const removeSubtask = (stId: string) => {
    onUpdate(launch.id, { subtasks: launch.subtasks.filter(s => s.id !== stId) });
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40 fade-in" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900
                     shadow-2xl z-50 overflow-y-auto border-l border-gray-200 dark:border-gray-800"
           style={{ animation: 'slideInRight 0.3s ease-out' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200
                       dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-4">
            {launch.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400
                      transition-colors cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Priority badges */}
          <div className="flex items-center gap-3 flex-wrap">
            {statusItem && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: statusItem.color }}
              >
                {statusItem.name}
              </span>
            )}
            {priorityItem && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                              bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: priorityItem.color }} />
                <span className="text-gray-700 dark:text-gray-300">{priorityItem.name}</span>
              </span>
            )}
          </div>

          {/* Shop */}
          {shopItem && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Shop
              </label>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: shopItem.color }} />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{shopItem.name}</span>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              Timeline
            </label>
            <TimelineBar
              startDate={launch.startDate}
              endDate={launch.endDate}
              statusColor={statusItem?.color}
            />
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(launch.startDate)}
              </span>
              <span>-</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(launch.endDate)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {launch.notes && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Note
              </label>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {launch.notes}
              </p>
            </div>
          )}

          {/* Attachments */}
          {launch.attachments.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Allegati ({launch.attachments.length})
              </label>
              <div className="space-y-1.5">
                {launch.attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50
                                         dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    {getFileIcon(file)}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-tasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sotto-attivita' ({completedSubtasks}/{totalSubtasks})
              </label>
              {totalSubtasks > 0 && (
                <span className="text-xs font-medium" style={{ color: progress === 100 ? '#00c875' : '#0073ea' }}>
                  {progress}%
                </span>
              )}
            </div>
            {totalSubtasks > 0 && (
              <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: progress === 100 ? '#00c875' : '#0073ea',
                  }}
                />
              </div>
            )}
            <div className="space-y-1.5">
              {launch.subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50
                                           dark:hover:bg-gray-800 transition-colors group">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => toggleSubtask(st.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 accent-blue-500 cursor-pointer"
                  />
                  <span className={`flex-1 text-sm text-gray-700 dark:text-gray-300 ${st.completed ? 'line-through opacity-50' : ''}`}>
                    {st.name}
                  </span>
                  {st.completed && <CheckCircle2 size={14} className="text-green-500 shrink-0" />}
                  <button
                    onClick={() => removeSubtask(st.id)}
                    className="p-0.5 text-gray-400 hover:text-red-500 cursor-pointer
                              opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addSubtask(); }}
                  placeholder="Aggiungi sotto-attivita'..."
                  className="flex-1 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700
                            text-sm bg-white dark:bg-gray-800 dark:text-white
                            focus:outline-none focus:ring-1 focus:ring-blue-400/30"
                />
              </div>
            </div>
          </div>

          {/* Custom fields */}
          {Object.keys(launch.customFields || {}).length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Campi personalizzati
              </label>
              <div className="space-y-2">
                {Object.entries(launch.customFields).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{key}</span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              Metadata
            </label>
            <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>Creato: {formatDateTime(launch.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>Aggiornato: {formatDateTime(launch.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Paperclip size={12} />
                <span>ID: {launch.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
