// Device-local persistence for OMNIBRAIN chat history with extended message properties for confidence and follow-up suggestions

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  confidence?: 'high' | 'medium' | 'low';
  suggestedFollowUps?: string[];
}

const STORAGE_KEY = 'omnibrain_chat_history';

export function loadChatHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
}

export function clearChatHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
}
