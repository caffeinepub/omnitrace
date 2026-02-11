// OMNIBRAIN assistant screen with chat UI, context scope selector, intelligence mode switcher, runtime mode badge, tappable follow-up question buttons, suggested questions, and runtime mode awareness that bypasses local processing when API mode is selected

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Send, Clock, Zap, Sparkles, MessageSquare } from 'lucide-react';
import { detectIntent, generateResponse, buildExternalAIUnavailableResponse } from '../omni/omnibrain/engine';
import { ContextScope, loadEventsForScope } from '../omni/omnibrain/contextScope';
import { IntelligenceMode } from '../omni/omnibrain/modes';
import { useOmniBrainChat } from '../omni/omnibrain/useOmniBrainChat';
import { logOmniBrainOpen, logOmniBrainSubmit } from '../omni/omnibrain/instrumentation';
import { SUGGESTED_QUESTIONS } from '../omni/omnibrain/suggestedQuestions';
import { useOmniBrainRuntimeMode, RUNTIME_MODE_LABELS } from '../omni/hooks/useOmniBrainRuntimeMode';

export function OmniBrainScreen() {
  const [query, setQuery] = useState('');
  const [contextScope, setContextScope] = useState<ContextScope>('today');
  const [intelligenceMode, setIntelligenceMode] = useState<IntelligenceMode>('explain');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, addMessage, clear } = useOmniBrainChat();
  const { mode: runtimeMode, displayLabel: runtimeModeLabel, isAPI } = useOmniBrainRuntimeMode();

  useEffect(() => {
    logOmniBrainOpen();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (questionText?: string) => {
    const questionToSubmit = questionText || query.trim();
    if (!questionToSubmit || isProcessing) return;

    setIsProcessing(true);
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: questionToSubmit,
      timestamp: Date.now(),
    };
    addMessage(userMessage);
    setQuery('');

    logOmniBrainSubmit(questionToSubmit, contextScope, intelligenceMode);

    try {
      let response;
      
      // If runtime mode is API (unavailable), bypass local processing and return unavailable response
      if (isAPI) {
        response = buildExternalAIUnavailableResponse();
      } else {
        // Local mode: use existing deterministic behavior
        const events = await loadEventsForScope(contextScope);
        const intent = detectIntent(questionToSubmit);
        response = generateResponse(intent, events, intelligenceMode);
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: response.text,
        timestamp: Date.now(),
        confidence: response.confidence,
        suggestedFollowUps: response.suggestedFollowUps,
      };
      addMessage(assistantMessage);
    } catch (error) {
      console.error('Error processing query:', error);
      const errorMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: Date.now(),
        confidence: 'low' as const,
      };
      addMessage(errorMessage);
    } finally {
      setIsProcessing(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSubmit(question);
  };

  const handleClearHistory = () => {
    clear();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none space-y-4 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">OMNIBRAIN</h2>
            <Badge variant="outline" className="ml-auto text-xs">
              Mode: {runtimeModeLabel}
              {isAPI && <span className="ml-1 text-muted-foreground">({RUNTIME_MODE_LABELS.apiUnavailableNote})</span>}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Offline-only assistant • No OpenAI • No API keys • Local data only
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Select value={contextScope} onValueChange={(v) => setContextScope(v as ContextScope)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <Select value={intelligenceMode} onValueChange={(v) => setIntelligenceMode(v as IntelligenceMode)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="explain">Explain</SelectItem>
                <SelectItem value="analyze">Analyze</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="silent">Silent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {messages.length > 0 && (
            <Button
              onClick={handleClearHistory}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              Clear History
            </Button>
          )}
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 shadow-sm">
        <CardHeader className="flex-none pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 p-0">
          <ScrollArea className="flex-1 px-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="py-8 space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Ask me anything about your activity patterns or how OMNITRACE works.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All responses are generated locally using your data.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Suggested Questions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((question, idx) => (
                      <Button
                        key={idx}
                        onClick={() => handleSuggestedQuestion(question)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-2 px-3"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      {msg.role === 'assistant' && msg.confidence && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              msg.confidence === 'high'
                                ? 'border-green-500/50 text-green-600 dark:text-green-400'
                                : msg.confidence === 'medium'
                                ? 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400'
                                : 'border-red-500/50 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {msg.confidence} confidence
                          </Badge>
                        </div>
                      )}
                      {msg.role === 'assistant' && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-muted-foreground">Follow-up questions:</p>
                          <div className="flex flex-wrap gap-2">
                            {msg.suggestedFollowUps.map((followUp, idx) => (
                              <Button
                                key={idx}
                                onClick={() => handleSuggestedQuestion(followUp)}
                                variant="outline"
                                size="sm"
                                className="text-xs h-auto py-1.5 px-2.5"
                                disabled={isProcessing}
                              >
                                {followUp}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex-none border-t p-4">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isProcessing}
              />
              <Button
                onClick={() => handleSubmit()}
                disabled={!query.trim() || isProcessing}
                size="icon"
                className="h-[60px] w-[60px] flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
