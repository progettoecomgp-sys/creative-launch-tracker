import { Calendar, Paperclip } from 'lucide-react';
import type { Launch } from '../types';
import type { ConfigItem } from '../types/config';

interface Props {
  launches: Launch[];
  onUpdate: (id: string, data: Partial<Launch>) => void;
  onOpenDetail: (launch: Launch) => void;
  statuses: ConfigItem[];
  priorities: ConfigItem[];
  shops: ConfigItem[];
}

export default function KanbanView({ launches, onUpdate, onOpenDetail, statuses, priorities, shops }: Props) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 fade-in">
      {statuses.map(status => {
        const items = launches.filter(l => l.status === status.id);
        return (
          <div key={status.id} className="flex-shrink-0 w-72">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: status.color }}
              />
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">{status.name}</h3>
              <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100
                            dark:bg-gray-800 rounded-full px-2 py-0.5">
                {items.length}
              </span>
            </div>

            {/* Column body */}
            <div
              className="space-y-2.5 min-h-[200px] p-2 rounded-xl bg-gray-50 dark:bg-gray-800/30
                        border border-gray-200 dark:border-gray-700/50"
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('bg-blue-50', 'dark:bg-blue-900/10'); }}
              onDragLeave={e => { e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/10'); }}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/10');
                const id = e.dataTransfer.getData('text/plain');
                if (id) onUpdate(id, { status: status.id });
              }}
            >
              {items.map(launch => {
                const priorityItem = priorities.find(p => p.id === launch.priority);
                const shopItem = shops.find(s => s.id === launch.shop);
                const completedSubs = launch.subtasks?.filter(s => s.completed).length || 0;
                const totalSubs = launch.subtasks?.length || 0;

                return (
                  <div
                    key={launch.id}
                    draggable
                    onDragStart={e => e.dataTransfer.setData('text/plain', launch.id)}
                    onClick={() => onOpenDetail(launch)}
                    className="bg-white dark:bg-gray-900 rounded-lg p-3.5 shadow-sm border
                             border-gray-200 dark:border-gray-700 cursor-pointer
                             hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
                             active:scale-[0.98]"
                  >
                    {/* Priority strip */}
                    <div
                      className="w-full h-1 rounded-full mb-2.5"
                      style={{ backgroundColor: priorityItem?.color || '#fdab3d' }}
                    />

                    {/* Title */}
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 leading-snug">
                      {launch.name}
                    </h4>

                    {/* Shop */}
                    {shopItem && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: shopItem.color }}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{shopItem.name}</span>
                      </div>
                    )}

                    {/* Sub-task progress */}
                    {totalSubs > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.round((completedSubs / totalSubs) * 100)}%`,
                              backgroundColor: completedSubs === totalSubs ? '#00c875' : '#0073ea',
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400">{completedSubs}/{totalSubs}</span>
                      </div>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-2 pt-2
                                 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(launch.startDate)} - {formatDate(launch.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {launch.attachments.length > 0 && (
                          <Paperclip size={11} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {items.length === 0 && (
                <div className="flex items-center justify-center h-24 text-xs text-gray-400">
                  Nessun lancio
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
