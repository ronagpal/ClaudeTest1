export interface EnrichmentResult {
  keyPoints: string[];
  enrichedSummary: string;
  rawNotes: string;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  rawNotes: string;
  result: EnrichmentResult;
  createdAt: number;
}

export interface EnrichRequest {
  notes: string;
}

export interface EnrichResponse {
  success: boolean;
  data?: EnrichmentResult;
  error?: string;
}
