'use client';

import { useState } from 'react';

interface NotesInputProps {
  onEnrich: (notes: string) => void;
  isLoading: boolean;
}

export default function NotesInput({ onEnrich, isLoading }: NotesInputProps) {
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim() && !isLoading) {
      onEnrich(notes);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-4">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Paste your raw notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter your notes here... Include companies, people, events, or technical terms you'd like researched and enriched."
          className="w-full h-64 p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg
                     bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
                     placeholder-zinc-400 dark:placeholder-zinc-500
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     resize-none transition-colors"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={!notes.trim() || isLoading}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400
                   text-white font-medium rounded-lg transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Enriching...
          </span>
        ) : (
          'Enrich Notes'
        )}
      </button>
    </form>
  );
}
