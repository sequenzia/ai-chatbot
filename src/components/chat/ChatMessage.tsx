'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { UIMessage } from '@ai-sdk/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { messageVariants } from '@/lib/motion/variants';

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const prefersReducedMotion = useReducedMotion();
  const isUser = message.role === 'user';

  // Extract text content from message parts
  const textContent = React.useMemo(() => {
    if (!message.parts || message.parts.length === 0) {
      return '';
    }
    return message.parts
      .filter((part) => part.type === 'text')
      .map((part) => (part.type === 'text' ? part.text : ''))
      .join('');
  }, [message.parts]);

  return (
    <motion.div
      layout
      initial={prefersReducedMotion ? false : messageVariants.initial}
      animate={messageVariants.animate}
      exit={prefersReducedMotion ? undefined : messageVariants.exit}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'flex flex-col gap-1',
          isUser ? 'items-end' : 'items-start',
          isUser ? 'max-w-[85%] sm:max-w-[75%]' : 'max-w-[75%]'
        )}
      >
        <div
          className={cn(
            'rounded-2xl whitespace-pre-wrap',
            isUser
              ? 'bg-primary text-primary-foreground py-2.5 px-5'
              : 'bg-card border border-border p-4 md:p-5'
          )}
        >
          {textContent}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {isUser ? 'You' : 'AI Assistant'}
        </span>
      </div>
    </motion.div>
  );
}
