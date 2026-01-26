import React from 'react';
import { AnimatePresence } from 'motion/react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Loader } from '@/components/ai-elements/loader';
import { useChat2 } from './ChatProvider';
import { ChatMessageItem } from './ChatMessageItem';

export function ChatConversation() {
  const { messages, isLoading } = useChat2();

  if (messages.length === 0) {
    return null;
  }

  return (
    <Conversation className="flex-1">
      <ConversationContent className="mx-auto max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-5xl pt-20 pb-60">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              isStreaming={isLoading && index === messages.length - 1 && message.role === 'assistant'}
            />
          ))}
        </AnimatePresence>

        {/* Loading indicator when waiting for assistant response */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-center gap-2 rounded-2xl bg-card border border-border p-4 w-fit">
            <Loader size={16} />
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </div>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
