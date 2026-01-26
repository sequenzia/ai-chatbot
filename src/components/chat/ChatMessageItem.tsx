import React from 'react';
import { motion } from 'motion/react';
import type { UIMessage } from '@ai-sdk/react';
import type { ToolUIPart } from 'ai';
import { Streamdown } from 'streamdown';
import {
  Message,
  MessageContent,
} from '@/components/ai-elements/message';
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ai-elements/reasoning';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { messageVariants } from '@/lib/motion/variants';
import { ContentBlock } from '@/components/blocks/ContentBlock';
import { Tool, ToolHeader, ToolContent, ToolOutput } from '@/components/ai-elements/tool';
import type { ContentBlock as ContentBlockType } from '@/types/content-blocks';

interface ChatMessageItemProps {
  message: UIMessage;
  isStreaming?: boolean;
}

// Content block tool names
const CONTENT_BLOCK_TOOLS = [
  'generateForm',
  'generateChart',
  'generateCode',
  'generateCard',
];

export function ChatMessageItem({ message, isStreaming = false }: ChatMessageItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const isUser = message.role === 'user';

  // Extract reasoning part if present
  const reasoningPart = message.parts?.find(
    (part) => part.type === 'reasoning'
  ) as { type: 'reasoning'; reasoning: string } | undefined;

  return (
    <motion.div
      layout
      initial={prefersReducedMotion ? false : 'initial'}
      animate="animate"
      exit={prefersReducedMotion ? undefined : 'exit'}
      variants={messageVariants}
    >
      <Message from={isUser ? 'user' : 'assistant'}>
        <MessageContent
          className={cn(
            isUser
              ? 'max-w-[85%] sm:max-w-[75%] !bg-transparent !p-0'
              : 'w-full max-w-full'
          )}
        >
          {/* Reasoning display (for models that support it) */}
          {reasoningPart && !isUser && (
            <Reasoning isStreaming={isStreaming} defaultOpen={isStreaming}>
              <ReasoningTrigger />
              <ReasoningContent>{reasoningPart.reasoning}</ReasoningContent>
            </Reasoning>
          )}

          {/* Render message parts */}
          {message.parts?.map((part, index) => {
            const key = `${message.id}-${index}`;

            switch (part.type) {
              case 'text':
                if (!part.text) return null;

                // User messages: plain text bubble
                if (isUser) {
                  return (
                    <div
                      key={key}
                      className="rounded-2xl whitespace-pre-wrap bg-primary text-primary-foreground py-2.5 px-5"
                    >
                      {part.text}
                    </div>
                  );
                }

                // Assistant messages: markdown via StreamDown
                return (
                  <div
                    key={key}
                    className="rounded-2xl bg-card border border-border p-4 md:p-5"
                  >
                    <Streamdown
                      isAnimating={isStreaming}
                      shikiTheme={['github-light', 'github-dark']}
                    >
                      {part.text}
                    </Streamdown>
                  </div>
                );

              case 'reasoning':
                // Already handled above
                return null;

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

          <span className="text-xs text-muted-foreground px-1 mt-1">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
        </MessageContent>
      </Message>
    </motion.div>
  );
}
