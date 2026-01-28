'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { useChat, type UIMessage, Chat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MODELS, DEFAULT_MODEL, type ModelId } from '@/lib/ai/models';
import { getApiUrl } from '@/config';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { useTitleGeneration } from '@/hooks/useTitleGeneration';
import { useConversations } from '@/hooks/useConversations';
import { getTextFromMessage } from '@/lib/utils/message';

interface ChatContextType {
  messages: UIMessage[];
  sendMessage: (text: string) => void;
  status: 'ready' | 'submitted' | 'streaming' | 'error';
  isLoading: boolean;
  selectedModel: ModelId;
  setSelectedModel: (model: ModelId) => void;
  clearMessages: () => void;
  stop: () => void;
  // Persistence-related
  conversationId: string;
  switchConversation: (id: string) => void;
  startNewConversation: () => Promise<string>;
  isDbLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL.id);
  const previousMessagesRef = useRef<UIMessage[]>([]);
  const hasLoadedRef = useRef(false);
  const titleGeneratedRef = useRef<Set<string>>(new Set());

  // Persistence hook
  const {
    conversationId,
    storedMessages,
    isLoading: isDbLoading,
    saveMessage,
    updateMessage,
    createConversation,
    clearConversation,
    switchConversation: switchConversationDb,
  } = useChatPersistence();

  // Conversations hook for updating titles
  const { updateTitle } = useConversations();

  // Title generation hook
  const { generateTitle, generateFallbackTitle } = useTitleGeneration({
    onTitleGenerated: (convId, title) => {
      updateTitle(convId, title);
      titleGeneratedRef.current.add(convId);
    },
    onError: (error) => {
      console.error('Title generation error:', error);
    },
  });

  // Create transport with model in body
  const chat = useMemo(() => {
    return new Chat({
      transport: new DefaultChatTransport({
        api: getApiUrl('chat'),
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

  // Load stored messages when conversation changes or on initial load
  useEffect(() => {
    if (!isDbLoading && !hasLoadedRef.current) {
      // Mark as loaded immediately to prevent race conditions
      hasLoadedRef.current = true;

      if (storedMessages.length > 0) {
        setMessages(storedMessages);
        previousMessagesRef.current = storedMessages;
      }
    }
  }, [isDbLoading, storedMessages, setMessages]);

  // Save new messages when they are added (after streaming completes)
  useEffect(() => {
    const saveNewMessages = async () => {
      // Only save when status is ready (not during streaming)
      if (status !== 'ready') return;

      // Check if we have new messages compared to what was previously tracked
      const prevIds = new Set(previousMessagesRef.current.map((m) => m.id));
      const newMessages = messages.filter((m) => !prevIds.has(m.id));

      // Get first user message for fallback title
      const firstUserMessage = messages.find((m) => m.role === 'user');
      const fallbackTitle = firstUserMessage
        ? generateFallbackTitle(getTextFromMessage(firstUserMessage))
        : 'New Chat';

      // Save each new message (with fallback title for first save)
      for (const message of newMessages) {
        await saveMessage(message, fallbackTitle);
      }

      // Update existing messages that may have changed (e.g., streaming content finalized)
      for (const message of messages) {
        if (prevIds.has(message.id)) {
          await updateMessage(message);
        }
      }

      previousMessagesRef.current = messages;

      // Trigger title generation after first complete exchange
      const hasUserMessage = messages.some((m) => m.role === 'user');
      const hasAssistantMessage = messages.some((m) => m.role === 'assistant');

      if (
        hasUserMessage &&
        hasAssistantMessage &&
        !titleGeneratedRef.current.has(conversationId)
      ) {
        const userMsg = messages.find((m) => m.role === 'user');
        if (userMsg) {
          generateTitle(conversationId, getTextFromMessage(userMsg));
        }
      }
    };

    if (messages.length > 0) {
      saveNewMessages();
    }
  }, [
    messages,
    status,
    saveMessage,
    updateMessage,
    conversationId,
    generateTitle,
    generateFallbackTitle,
  ]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      sendChatMessage({ text });
    },
    [sendChatMessage]
  );

  const clearMessages = useCallback(async () => {
    setMessages([]);
    previousMessagesRef.current = [];
    await clearConversation();
  }, [setMessages, clearConversation]);

  const startNewConversation = useCallback(async () => {
    setMessages([]);
    previousMessagesRef.current = [];
    hasLoadedRef.current = true; // Prevent effect from overwriting with stale data
    const newId = await createConversation();
    return newId;
  }, [setMessages, createConversation]);

  const switchConversation = useCallback(
    async (id: string) => {
      // Clear UI immediately
      setMessages([]);
      previousMessagesRef.current = [];
      hasLoadedRef.current = true; // Mark as loaded to prevent effect from overwriting
      // Existing conversations already have titles, don't regenerate
      titleGeneratedRef.current.add(id);

      // Fetch and set messages directly - no race condition
      const messages = await switchConversationDb(id);
      if (messages.length > 0) {
        setMessages(messages);
        previousMessagesRef.current = messages;
      }
    },
    [setMessages, switchConversationDb]
  );

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
        conversationId,
        switchConversation,
        startNewConversation,
        isDbLoading,
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
