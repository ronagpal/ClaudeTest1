import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { EnrichResponse, EnrichmentResult } from '@/types';

const anthropic = new Anthropic();

export async function POST(request: NextRequest): Promise<NextResponse<EnrichResponse>> {
  try {
    const { notes } = await request.json();

    if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Notes are required' },
        { status: 400 }
      );
    }

    // Step 1: Extract topics that need research
    const topicExtractionResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Analyze these notes and identify key entities that would benefit from web research. List only the most important ones (max 5):
- Companies
- People
- Industries/sectors
- Events
- Technical terms or concepts

Notes:
${notes}

Respond with a JSON array of strings, e.g. ["Company X", "Person Y", "Concept Z"]. If nothing needs research, respond with [].`
        }
      ]
    });

    let topics: string[] = [];
    const topicContent = topicExtractionResponse.content[0];
    if (topicContent.type === 'text') {
      try {
        const jsonMatch = topicContent.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          topics = JSON.parse(jsonMatch[0]);
        }
      } catch {
        topics = [];
      }
    }

    // Step 2: Research topics using web search (if topics found)
    let researchResults = '';
    if (topics.length > 0) {
      const searchQuery = topics.slice(0, 3).join(' ') + ' latest news developments';

      const researchResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 3
          }
        ],
        messages: [
          {
            role: 'user',
            content: `Research the following topics and provide relevant, current information:

Topics: ${topics.join(', ')}

Search query to use: "${searchQuery}"

Provide a brief summary of what you find about each topic. Focus on recent developments, key metrics, and market context.`
          }
        ]
      });

      for (const block of researchResponse.content) {
        if (block.type === 'text') {
          researchResults += block.text + '\n';
        }
      }
    }

    // Step 3: Create enriched output
    const enrichmentPrompt = `You are a note enrichment assistant. Given raw notes and optional research, produce structured output.

${researchResults ? `RESEARCH FINDINGS:\n${researchResults}\n` : ''}

RAW NOTES:
${notes}

Produce the following in JSON format:
{
  "keyPoints": ["point 1", "point 2", ...],  // 3-7 key points, most important first
  "enrichedSummary": "..."  // 2-4 paragraphs providing context and synthesis
}

Guidelines:
- Key points should be actionable insights or critical facts
- Enriched summary should weave together the raw notes with any research context
- Be concise but informative
- If research was done, incorporate those findings naturally
- Preserve the intent and key information from the original notes`;

    const enrichmentResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: enrichmentPrompt
        }
      ]
    });

    let result: EnrichmentResult | null = null;
    const enrichContent = enrichmentResponse.content[0];
    if (enrichContent.type === 'text') {
      try {
        const jsonMatch = enrichContent.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          result = {
            keyPoints: parsed.keyPoints || [],
            enrichedSummary: parsed.enrichedSummary || '',
            rawNotes: notes,
            timestamp: Date.now()
          };
        }
      } catch {
        // If JSON parsing fails, try to extract content
        result = {
          keyPoints: ['Unable to parse structured response'],
          enrichedSummary: enrichContent.text,
          rawNotes: notes,
          timestamp: Date.now()
        };
      }
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate enrichment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Enrichment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
