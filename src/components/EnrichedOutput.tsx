'use client';

import { useState } from 'react';
import { EnrichmentResult } from '@/types';

interface EnrichedOutputProps {
  result: EnrichmentResult;
}

export default function EnrichedOutput({ result }: EnrichedOutputProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyAll = () => {
    const fullText = `# Key Points\n${result.keyPoints.map(p => `- ${p}`).join('\n')}\n\n# Enriched Summary\n${result.enrichedSummary}\n\n---\n\n# Raw Notes\n${result.rawNotes}`;
    copyToClipboard(fullText, 'all');
  };

  const exportAsMarkdown = () => {
    const markdown = `# Key Points\n\n${result.keyPoints.map(p => `- ${p}`).join('\n')}\n\n# Enriched Summary\n\n${result.enrichedSummary}\n\n---\n\n# Raw Notes\n\n${result.rawNotes}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enriched-notes-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Header with actions */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Enriched Notes
        </h2>
        <div className="flex gap-2">
          <button
            onClick={copyAll}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-700
                       hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-md transition-colors
                       text-zinc-700 dark:text-zinc-300"
          >
            {copiedSection === 'all' ? (
              <>
                <CheckIcon />
                Copied!
              </>
            ) : (
              <>
                <CopyIcon />
                Copy All
              </>
            )}
          </button>
          <button
            onClick={exportAsMarkdown}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-700
                       hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-md transition-colors
                       text-zinc-700 dark:text-zinc-300"
          >
            <DownloadIcon />
            Export MD
          </button>
        </div>
      </div>

      {/* Key Points */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            Key Points
          </h3>
          <button
            onClick={() => copyToClipboard(result.keyPoints.map(p => `- ${p}`).join('\n'), 'keyPoints')}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            {copiedSection === 'keyPoints' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <ul className="space-y-2">
          {result.keyPoints.map((point, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-zinc-800 dark:text-zinc-200"
            >
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400
                             rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                {index + 1}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Enriched Summary */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
            Enriched Summary
          </h3>
          <button
            onClick={() => copyToClipboard(result.enrichedSummary, 'summary')}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            {copiedSection === 'summary' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          {result.enrichedSummary.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-zinc-700 dark:text-zinc-300 mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 px-4 py-2 bg-zinc-100 dark:bg-zinc-900">
        <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-600" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Original Notes
        </span>
        <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-600" />
      </div>

      {/* Raw Notes */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Raw Notes
          </h3>
          <button
            onClick={() => copyToClipboard(result.rawNotes, 'raw')}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            {copiedSection === 'raw' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-600 dark:text-zinc-400
                        bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
          {result.rawNotes}
        </pre>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
