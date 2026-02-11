// OMNIBRAIN deterministic assistant engine with expanded intent detection routing external AI/API-key queries to dedicated unavailability response with tappable follow-up suggestions and public helper for external-AI-unavailable response

import { OmniEvent } from '../types';
import { IntelligenceMode, renderWithMode } from './modes';
import { 
  generateDistractionFacts, 
  generateFocusDropFacts, 
  generateBestFocusTimeFacts,
  generateImprovementFacts,
  generateDailySummaryFacts,
  generateLongestFocusFacts,
  generateMainDistractionsFacts,
  generateMostProductiveFacts,
  FactPayload
} from './templates';
import { searchKnowledgeBase } from './helpSearch';
import { SUGGESTED_QUESTIONS } from './suggestedQuestions';

export interface AssistantResponse {
  text: string;
  confidence: 'high' | 'medium' | 'low';
  suggestedFollowUps?: string[];
}

export type Intent = 
  | { type: 'distraction_today' }
  | { type: 'focus_drop'; afterTime: Date }
  | { type: 'best_focus_time' }
  | { type: 'improvement_week' }
  | { type: 'daily_summary' }
  | { type: 'longest_focus' }
  | { type: 'main_distractions' }
  | { type: 'most_productive' }
  | { type: 'help'; query: string }
  | { type: 'external_ai_unavailable'; query: string }
  | { type: 'unsupported'; query: string };

export function detectIntent(query: string): Intent {
  const lower = query.toLowerCase();
  
  // External AI/API key queries → route to dedicated unavailability response
  if (
    lower.includes('api key') || 
    lower.includes('api-key') || 
    lower.includes('apikey') ||
    lower.includes('openai') || 
    lower.includes('chatgpt') || 
    lower.includes('gpt') ||
    lower.includes('anthropic') || 
    lower.includes('claude') ||
    lower.includes('llm') || 
    lower.includes('ai key') ||
    lower.includes('external ai') ||
    (lower.includes('chatbot') && lower.includes('integrat')) ||
    (lower.includes('connect') && (lower.includes('ai') || lower.includes('api')))
  ) {
    return { type: 'external_ai_unavailable', query };
  }
  
  // Help/app usage queries
  if (
    (lower.includes('how') && (lower.includes('export') || lower.includes('download') || lower.includes('save'))) ||
    lower.includes('wipe') || lower.includes('delete') || lower.includes('clear') ||
    lower.includes('private mode') || lower.includes('blur') ||
    lower.includes('context memory') || lower.includes('scope') ||
    lower.includes('intelligence mode') || lower.includes('explain') || lower.includes('analyze') ||
    lower.includes('smart merg') || lower.includes('cognitive mode') ||
    lower.includes('focus score') || (lower.includes('how') && lower.includes('work'))
  ) {
    return { type: 'help', query };
  }
  
  // Longest focus session
  if ((lower.includes('longest') || lower.includes('longest')) && lower.includes('focus')) {
    return { type: 'longest_focus' };
  }
  
  // Main distractions
  if ((lower.includes('main') || lower.includes('top') || lower.includes('biggest')) && lower.includes('distract')) {
    return { type: 'main_distractions' };
  }
  
  // Most productive time
  if ((lower.includes('most') || lower.includes('when')) && lower.includes('productive')) {
    return { type: 'most_productive' };
  }
  
  // Why was I distracted today?
  if (lower.includes('distract') && (lower.includes('today') || lower.includes('why'))) {
    return { type: 'distraction_today' };
  }
  
  // Why did my focus drop after <time>?
  if (lower.includes('focus') && lower.includes('drop') && lower.includes('after')) {
    const timeMatch = lower.match(/after\s+(\d{1,2})(:\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const isPM = timeMatch[3]?.toLowerCase() === 'pm';
      if (isPM && hour < 12) hour += 12;
      if (!isPM && timeMatch[3]?.toLowerCase() === 'am' && hour === 12) hour = 0;
      
      const afterTime = new Date();
      afterTime.setHours(hour, 0, 0, 0);
      return { type: 'focus_drop', afterTime };
    }
  }
  
  // When do I focus best?
  if ((lower.includes('when') || lower.includes('what time')) && lower.includes('focus') && lower.includes('best')) {
    return { type: 'best_focus_time' };
  }
  
  // Am I improving this week?
  if (lower.includes('improv') && lower.includes('week')) {
    return { type: 'improvement_week' };
  }
  
  // What happened today?
  if (lower.includes('what') && lower.includes('happen') && lower.includes('today')) {
    return { type: 'daily_summary' };
  }
  
  return { type: 'unsupported', query };
}

function buildFallbackResponse(query: string): AssistantResponse {
  // Deterministic fallback with limitation, clarifying question, and suggestions
  const limitation = 'I can only answer questions using your local activity data and app help information. I don\'t guess or make up answers.';
  
  const clarifyingQuestions = [
    'Could you ask about a specific time period (today, this week)?',
    'Are you asking about your focus patterns, distractions, or how OMNITRACE works?',
    'Would you like to know about a specific activity or time of day?',
  ];
  
  // Pick a clarifying question deterministically based on query length
  const clarifyIndex = query.length % clarifyingQuestions.length;
  const clarify = clarifyingQuestions[clarifyIndex];
  
  // Pick 3 relevant suggestions
  const suggestions = SUGGESTED_QUESTIONS.slice(0, 3);
  
  const text = `${limitation}\n\n${clarify}\n\nTry asking:\n${suggestions.map(s => `• ${s}`).join('\n')}`;
  
  return {
    text,
    confidence: 'low',
    suggestedFollowUps: suggestions,
  };
}

export function buildExternalAIUnavailableResponse(): AssistantResponse {
  const explanation = 'External AI services (OpenAI, Anthropic, etc.) are not supported in this build. OMNIBRAIN runs fully offline using only your local OMNITRACE data and a static knowledge base. No API keys are accepted, and no network calls are made.';
  
  // Suggest relevant offline-capable questions
  const suggestions = [
    'What happened today?',
    'Why was I distracted today?',
    'When do I focus best?',
    'How do I export my data?',
    'What is Private Mode?',
    'How does Smart Merging work?',
  ];
  
  const text = `${explanation}\n\nYou can ask me about:\n${suggestions.slice(0, 3).map(s => `• ${s}`).join('\n')}`;
  
  return {
    text,
    confidence: 'high',
    suggestedFollowUps: suggestions.slice(0, 3),
  };
}

export function generateResponse(
  intent: Intent,
  events: OmniEvent[],
  mode: IntelligenceMode
): AssistantResponse {
  let payload: FactPayload;
  let isHelpContent = false;
  
  try {
    switch (intent.type) {
      case 'external_ai_unavailable':
        return buildExternalAIUnavailableResponse();
      case 'help': {
        const results = searchKnowledgeBase(intent.query, 2);
        if (results.length > 0) {
          isHelpContent = true;
          const helpFacts = results.map(entry => `${entry.title}: ${entry.answer}`);
          payload = { facts: helpFacts, confidence: 'high' };
        } else {
          return buildFallbackResponse(intent.query);
        }
        break;
      }
      case 'longest_focus':
        payload = generateLongestFocusFacts(events);
        break;
      case 'main_distractions':
        payload = generateMainDistractionsFacts(events);
        break;
      case 'most_productive':
        payload = generateMostProductiveFacts(events);
        break;
      case 'distraction_today':
        payload = generateDistractionFacts(events);
        break;
      case 'focus_drop':
        payload = generateFocusDropFacts(events, intent.afterTime);
        break;
      case 'best_focus_time':
        payload = generateBestFocusTimeFacts(events);
        break;
      case 'improvement_week':
        payload = generateImprovementFacts(events);
        break;
      case 'daily_summary':
        payload = generateDailySummaryFacts(events);
        break;
      case 'unsupported':
        return buildFallbackResponse(intent.query);
    }
    
    // Label content source
    let text = renderWithMode(payload.facts, mode);
    if (isHelpContent) {
      text = `📚 App help (static):\n\n${text}`;
    } else {
      text = `📊 Your data (computed):\n\n${text}`;
    }
    
    return {
      text,
      confidence: payload.confidence,
    };
  } catch (error) {
    console.error('Error generating response:', error);
    // Fallback with empty query string
    return buildFallbackResponse('');
  }
}
