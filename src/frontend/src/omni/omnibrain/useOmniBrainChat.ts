// React hook to manage OMNIBRAIN chat state

import { useState, useEffect } from 'react';
import { ChatMessage, loadChatHistory, saveChatHistory, clearChatHistory } from './chatStorage';

export function useOmniBrainChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const history = loadChatHistory();
    setMessages(history);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveChatHistory(messages);
    }
  }, [messages, isLoading]);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const clear = () => {
    setMessages([]);
    clearChatHistory();
  };

  return {
    messages,
    addMessage,
    clear,
    isLoading,
  };
}
