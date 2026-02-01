'use client';

import { HistoryItem } from '@/types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export default function HistoryPanel({ history, onSelect, onClear }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        <HistoryIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No history yet</p>
        <p className="text-xs mt-1">Your enriched notes will appear here</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Recent Notes ({history.length})
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
        >
          Clear All
        </button>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full text-left p-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100
                       dark:hover:bg-zinc-700 rounded-lg transition-colors border border-transparent
                       hover:border-zinc-200 dark:hover:border-zinc-600"
          >
            <p className="text-sm text-zinc-800 dark:text-zinc-200 line-clamp-2 mb-1">
              {item.rawNotes.substring(0, 100)}
              {item.rawNotes.length > 100 ? '...' : ''}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatDate(item.createdAt)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
