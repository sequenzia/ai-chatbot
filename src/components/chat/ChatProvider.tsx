'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useChat, type UIMessage, Chat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MODELS, DEFAULT_MODEL, type ModelId } from '@/lib/ai/models';

interface ChatContextType {
  messages: UIMessage[];
  sendMessage: (text: string) => void;
  status: 'ready' | 'submitted' | 'streaming' | 'error';
  isLoading: boolean;
  selectedModel: ModelId;
  setSelectedModel: (model: ModelId) => void;
  clearMessages: () => void;
  stop: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL.id);

  // Create transport with model in body
  const chat = useMemo(() => {
    return new Chat({
      transport: new DefaultChatTransport({
        api: '/api/chat',
        body: { model: selectedModel },
      }),
    });
  }, [selectedModel]);

  const {
    messages,
    sendMessage: sendChatMessage,
    status,
    setMessages,
    stop,
  } = useChat({ chat });

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      sendChatMessage({ text });
    },
    [sendChatMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        status,
        isLoading,
        selectedModel,
        setSelectedModel,
        clearMessages,
        stop,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat2() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat2 must be used within a ChatProvider');
  }
  return context;
}

export { MODELS };
