'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useChat2 } from './ChatProvider';
import { ChatMessage } from './ChatMessage';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

export function ChatContainer() {
  const { messages, isLoading } = useChat2();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  }, [messages, prefersReducedMotion]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto pt-20 pb-52"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <div className="mx-auto max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-[1024px] px-4">
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={isLoading && index === messages.length - 1 && message.role === 'assistant'}
              />
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-4"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-card border border-border p-4">
                <div className="flex gap-1">
                  <span
                    className="size-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="size-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="size-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
                <span className="sr-only">AI is thinking...</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
