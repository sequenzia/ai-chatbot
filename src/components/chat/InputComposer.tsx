'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ChevronDown, Lightbulb, Paperclip } from 'lucide-react';
import { useChat2, MODELS } from './ChatProvider';
import { SUGGESTIONS } from '@/constants/suggestions';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useDeviceType } from '@/hooks/useDeviceType';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface InputComposerProps {
  isFixed?: boolean;
  placeholder?: string;
}

export function InputComposer({
  isFixed = true,
  placeholder = 'Ask anything...',
}: InputComposerProps) {
  const { sendMessage, isLoading, selectedModel, setSelectedModel, messages } = useChat2();
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { isMobile } = useDeviceType();

  const selectedModelData = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = isMobile ? 120 : 200;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [input, isMobile]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || isLoading) return;
      sendMessage(input);
      setInput('');
      setShowSuggestions(false);
    },
    [input, isLoading, sendMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div
      className={cn(
        'z-30 pointer-events-none',
        isFixed
          ? 'absolute bottom-0 left-0 right-0'
          : 'relative w-full'
      )}
    >
      <div
        className={cn(
          'pointer-events-auto mx-auto',
          isFixed && 'max-w-[1024px] px-4 pb-8 md:pb-10 pt-10',
          isFixed && 'bg-gradient-to-t from-background via-background/80 to-transparent'
        )}
      >
        {/* Suggestions Panel */}
        <AnimatePresence>
          {showSuggestions && isFixed && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
              className="mb-4 rounded-2xl border border-border bg-card/90 backdrop-blur-xl p-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.slice(0, 4).map((suggestion) => (
                  <button
                    key={suggestion.title}
                    onClick={() => handleSuggestionClick(suggestion.prompt)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left hover:bg-muted/50 transition-colors min-h-[44px]"
                  >
                    <suggestion.icon className="size-5 text-muted-foreground shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{suggestion.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {suggestion.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Container */}
        <form onSubmit={handleSubmit} className="relative">
          <div
            className={cn(
              'flex flex-col rounded-2xl border transition-shadow',
              'bg-card/70 dark:bg-card/40 backdrop-blur-xl',
              'border-border/20 dark:border-border/40',
              'shadow-lg dark:shadow-2xl',
              'focus-within:shadow-xl dark:focus-within:shadow-3xl'
            )}
          >
            {/* Textarea - Full Width */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              disabled={isLoading}
              className={cn(
                'no-focus-ring w-full resize-none bg-transparent py-5 px-5',
                'border-transparent outline-none shadow-none',
                'placeholder:text-muted-foreground',
                'min-h-[120px] max-h-[200px]',
                'disabled:opacity-50'
              )}
            />

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-3 pb-3">
              {/* Left Actions */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-lg"
                  aria-label="Attach file"
                >
                  <Paperclip className="size-5" />
                </Button>
                {isFixed && messages.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-lg"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    aria-label="Show suggestions"
                  >
                    <Lightbulb className="size-5" />
                  </Button>
                )}
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Model Selector */}
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    className="h-9 gap-1 rounded-full px-3"
                  >
                    <span className="text-xs truncate max-w-[100px]">
                      {selectedModelData.name}
                    </span>
                    <ChevronDown className="size-3" />
                  </Button>

                  <AnimatePresence>
                    {showModelSelector && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute bottom-full right-0 mb-2 w-48 rounded-xl border border-border bg-popover shadow-lg overflow-hidden"
                      >
                        {MODELS.map((model) => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              setSelectedModel(model.id);
                              setShowModelSelector(false);
                            }}
                            className={cn(
                              'w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors',
                              model.id === selectedModel && 'bg-muted'
                            )}
                          >
                            <div className="font-medium">{model.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {model.provider}
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Send Button */}
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="size-9 rounded-lg"
                >
                  <Send className="size-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
