// Deterministic keyword-based knowledge base retrieval

import { KNOWLEDGE_BASE, KnowledgeEntry } from './knowledgeBase';

interface SearchResult {
  entry: KnowledgeEntry;
  score: number;
}

function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
}

export function searchKnowledgeBase(query: string, maxResults: number = 3): KnowledgeEntry[] {
  const queryTokens = normalizeText(query);
  
  if (queryTokens.length === 0) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;

    // Check title match
    const titleTokens = normalizeText(entry.title);
    for (const qToken of queryTokens) {
      for (const tToken of titleTokens) {
        if (tToken.includes(qToken) || qToken.includes(tToken)) {
          score += 3;
        }
      }
    }

    // Check keyword match
    for (const qToken of queryTokens) {
      for (const keyword of entry.keywords) {
        if (keyword.includes(qToken) || qToken.includes(keyword)) {
          score += 2;
        }
      }
    }

    // Check answer match
    const answerTokens = normalizeText(entry.answer);
    for (const qToken of queryTokens) {
      for (const aToken of answerTokens) {
        if (aToken.includes(qToken) || qToken.includes(aToken)) {
          score += 1;
        }
      }
    }

    if (score > 0) {
      results.push({ entry, score });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, maxResults).map(r => r.entry);
}
