'use client';

import { useState, useEffect } from 'react';
import NotesInput from '@/components/NotesInput';
import EnrichedOutput from '@/components/EnrichedOutput';
import HistoryPanel from '@/components/HistoryPanel';
import { EnrichmentResult, HistoryItem, EnrichResponse } from '@/types';

const HISTORY_KEY = 'enrichment-history';
const MAX_HISTORY = 10;

export default function Home() {
  const [result, setResult] = useState<EnrichmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      console.error('Failed to load history');
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      console.error('Failed to save history');
    }
  }, [history]);

  const handleEnrich = async (notes: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });

      const data: EnrichResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to enrich notes');
      }

      setResult(data.data);

      // Add to history
      const historyItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        rawNotes: notes,
        result: data.data,
        createdAt: Date.now()
      };

      setHistory(prev => [historyItem, ...prev].slice(0, MAX_HISTORY));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setResult(item.result);
    setShowHistory(false);
    setError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Note Enrichment
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Transform raw notes with AI-powered research
              </p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-700
                         hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg transition-colors
                         text-zinc-700 dark:text-zinc-300"
            >
              <HistoryIcon />
              <span className="hidden sm:inline">History</span>
              {history.length > 0 && (
                <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Input + History */}
          <div className={`${showHistory ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
              <NotesInput onEnrich={handleEnrich} isLoading={isLoading} />
            </div>

            {/* History Panel (Mobile: Below input, Desktop: Sidebar) */}
            {showHistory && (
              <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
                <HistoryPanel
                  history={history}
                  onSelect={handleSelectHistory}
                  onClear={handleClearHistory}
                />
              </div>
            )}
          </div>

          {/* Right column: Output */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <ErrorIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800 dark:text-red-200">
                      Error
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-zinc-200 dark:border-zinc-700 rounded-full" />
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-spin border-t-transparent" />
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                    Enriching your notes...
                  </h3>
                  <div className="mt-3 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <p className="flex items-center gap-2">
                      <SpinnerDot active />
                      Extracting key topics
                    </p>
                    <p className="flex items-center gap-2">
                      <SpinnerDot />
                      Researching with web search
                    </p>
                    <p className="flex items-center gap-2">
                      <SpinnerDot />
                      Generating enriched summary
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !result && !error && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 border-dashed p-12">
                <div className="text-center">
                  <DocumentIcon className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-600" />
                  <h3 className="mt-4 text-lg font-medium text-zinc-700 dark:text-zinc-300">
                    Your enriched notes will appear here
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                    Paste your raw notes on the left and click &quot;Enrich Notes&quot; to get
                    AI-powered key points and context-aware summaries.
                  </p>
                </div>
              </div>
            )}

            {!isLoading && result && <EnrichedOutput result={result} />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Powered by Claude AI with web search
      </footer>
    </div>
  );
}

function HistoryIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function SpinnerDot({ active = false }: { active?: boolean }) {
  return (
    <span className={`w-2 h-2 rounded-full ${active ? 'bg-blue-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
  );
}
