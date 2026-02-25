import { BarChart3, AlertTriangle } from 'lucide-react';
import type { ConfigItem } from '../types/config';

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  expiringSoon: { id: string; name: string; endDate: string }[];
}

interface Props {
  stats: Stats;
  statuses: ConfigItem[];
}

export default function StatsCards({ stats, statuses }: Props) {
  const cards = [
    {
      label: 'Totale Lanci',
      value: stats.total,
      color: '#0073ea',
      bg: 'bg-blue-50',
    },
    ...statuses.map(s => ({
      label: s.name,
      value: stats.byStatus[s.id] || 0,
      color: s.color,
      bg: 'bg-gray-50',
    })),
  ];

  const gridCols = Math.min(cards.length, 6);
  const gridClass = `grid gap-3 mb-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-${gridCols}`;

  return (
    <div className="slide-up">
      <div className={gridClass}>
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} dark:bg-opacity-10 rounded-xl p-4 transition-all duration-200
                       hover:shadow-md hover:-translate-y-0.5 cursor-default border border-transparent
                       hover:border-gray-200 dark:hover:border-gray-700`}
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={18} style={{ color: card.color }} />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {card.label}
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {stats.expiringSoon.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20
                       border border-amber-200 dark:border-amber-800 slide-down">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <span className="text-sm text-amber-700 dark:text-amber-400">
            <strong>{stats.expiringSoon.length} lanci</strong> in scadenza nei prossimi 7 giorni:{' '}
            {stats.expiringSoon.map(l => l.name).join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}
