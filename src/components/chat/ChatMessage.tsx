'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { UIMessage } from '@ai-sdk/react';
import type { ToolUIPart } from 'ai';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { messageVariants } from '@/lib/motion/variants';
import { ContentBlock } from '@/components/blocks/ContentBlock';
import { Tool, ToolHeader, ToolContent, ToolOutput } from '@/components/ai-elements/tool';
import type { ContentBlock as ContentBlockType } from '@/types/content-blocks';

interface ChatMessageProps {
  message: UIMessage;
}

// Content block tool names
const CONTENT_BLOCK_TOOLS = [
  'generateForm',
  'generateChart',
  'generateCode',
  'generateCard',
];

export function ChatMessage({ message }: ChatMessageProps) {
  const prefersReducedMotion = useReducedMotion();
  const isUser = message.role === 'user';

  return (
    <motion.div
      layout
      initial={prefersReducedMotion ? false : 'initial'}
      animate="animate"
      exit={prefersReducedMotion ? undefined : 'exit'}
      variants={messageVariants}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'flex flex-col gap-1',
          isUser ? 'items-end' : 'items-start',
          isUser ? 'max-w-[85%] sm:max-w-[75%]' : 'w-full'
        )}
      >
        {message.parts?.map((part, index) => {
          const key = `${message.id}-${index}`;

          switch (part.type) {
            case 'text':
              if (!part.text) return null;
              return (
                <div
                  key={key}
                  className={cn(
                    'rounded-2xl whitespace-pre-wrap',
                    isUser
                      ? 'bg-primary text-primary-foreground py-2.5 px-5'
                      : 'bg-card border border-border p-4 md:p-5'
                  )}
                >
                  {part.text}
                </div>
              );

            default:
              // Handle tool parts
              if (part.type.startsWith('tool-')) {
                const toolName = part.type.replace('tool-', '');
                const toolPart = part as {
                  type: string;
                  state: string;
                  output?: unknown;
                };
                const fullToolPart = part as ToolUIPart;

                // Check if this is one of our content block tools
                if (CONTENT_BLOCK_TOOLS.includes(toolName)) {
                  if (
                    toolPart.state === 'output-available' &&
                    toolPart.output
                  ) {
                    return (
                      <div key={key} className="w-full">
                        <ContentBlock
                          content={toolPart.output as ContentBlockType}
                          messageId={message.id}
                        />
                      </div>
                    );
                  }
                  // Show error or loading state for tools
                  return (
                    <Tool key={key}>
                      <ToolHeader
                        title={toolName}
                        type={part.type as ToolUIPart['type']}
                        state={toolPart.state as ToolUIPart['state']}
                      />
                      {toolPart.state === 'output-error' && (
                        <ToolContent>
                          <ToolOutput
                            output={fullToolPart.output}
                            errorText={fullToolPart.errorText}
                          />
                        </ToolContent>
                      )}
                    </Tool>
                  );
                }

                // Generic tool display for other tools
                return (
                  <Tool key={key}>
                    <ToolHeader
                      title={toolName}
                      type={part.type as ToolUIPart['type']}
                      state={toolPart.state as ToolUIPart['state']}
                    />
                  </Tool>
                );
              }
              return null;
          }
        })}
        <span className="text-xs text-muted-foreground px-1">
          {isUser ? 'You' : 'AI Assistant'}
        </span>
      </div>
    </motion.div>
  );
}
