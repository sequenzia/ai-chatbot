import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Lightbulb, Paperclip, Send } from 'lucide-react';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
} from '@/components/ai-elements/prompt-input';
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLogo,
  ModelSelectorName,
} from '@/components/ai-elements/model-selector';
import { useChat2 } from './ChatProvider';
import { MODELS } from '@/lib/ai/models';
import { SUGGESTIONS } from '@/constants/suggestions';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  isFixed?: boolean;
  placeholder?: string;
}

export function ChatInput({
  isFixed = true,
  placeholder = 'Ask anything...',
}: ChatInputProps) {
  const { sendMessage, isLoading, selectedModel, setSelectedModel, messages, status } = useChat2();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const selectedModelData = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  // Group models by provider
  const providers = [...new Set(MODELS.map((m) => m.provider))];
  const modelsByProvider = providers.map((provider) => ({
    provider,
    models: MODELS.filter((m) => m.provider === provider),
  }));

  const handleSubmit = useCallback(
    (message: { text: string }) => {
      if (!message.text.trim() || isLoading) return;
      sendMessage(message.text);
      setShowSuggestions(false);
    },
    [isLoading, sendMessage]
  );

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div
      className={cn(
        'z-30 pointer-events-none',
        isFixed ? 'absolute bottom-0 left-0 right-0' : 'relative w-full'
      )}
    >
      <div
        className={cn(
          'pointer-events-auto mx-auto',
          isFixed && 'max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-5xl px-4 pb-8 md:pb-10 pt-10',
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
              className="mb-4"
            >
              <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-4">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                  <Lightbulb className="size-4" />
                  <span className="text-sm font-medium">Suggested Prompts</span>
                </div>

                {/* 2-column grid */}
                <div className="grid grid-cols-2 gap-3">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.title}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion.prompt)}
                      className="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors text-left"
                    >
                      <suggestion.icon className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{suggestion.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {suggestion.prompt}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PromptInput from AI Elements */}
        <PromptInput
          onSubmit={handleSubmit}
          className={cn(
            'rounded-2xl border transition-shadow',
            'bg-card/70 dark:bg-card/40 backdrop-blur-xl',
            'border-border/20 dark:border-transparent',
            'shadow-lg dark:shadow-none',
            'focus-within:shadow-xl dark:focus-within:shadow-none'
          )}
        >
          <PromptInputTextarea
            placeholder={placeholder}
            disabled={isLoading}
            className="min-h-[120px] max-h-[200px] py-5 px-5 border-none shadow-none resize-none bg-transparent"
          />

          <PromptInputFooter className="px-3 pb-3">
            {/* Left Actions */}
            <PromptInputTools>
              <PromptInputButton aria-label="Attach file (coming soon)">
                <Paperclip className="size-5" />
              </PromptInputButton>
              {isFixed && messages.length > 0 && (
                <PromptInputButton
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  aria-label="Show suggestions"
                >
                  <Lightbulb className="size-5" />
                </PromptInputButton>
              )}
            </PromptInputTools>

            {/* Right Actions - Model Selector + Submit */}
            <div className="flex items-center gap-2">
              {/* AI Elements Model Selector */}
              <ModelSelector open={modelSelectorOpen} onOpenChange={setModelSelectorOpen}>
                <ModelSelectorTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1.5 rounded-full px-3"
                  >
                    <ModelSelectorLogo
                      provider={selectedModelData.provider}
                      className="size-4"
                    />
                    <span className="text-xs truncate max-w-[100px]">
                      {selectedModelData.name}
                    </span>
                    <ChevronDown className="size-3" />
                  </Button>
                </ModelSelectorTrigger>
                <ModelSelectorContent title="Select Model">
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    {modelsByProvider.map(({ provider, models }) => (
                      <ModelSelectorGroup
                        key={provider}
                        heading={provider.charAt(0).toUpperCase() + provider.slice(1)}
                      >
                        {models.map((model) => (
                          <ModelSelectorItem
                            key={model.id}
                            value={model.id}
                            onSelect={() => {
                              setSelectedModel(model.id);
                              setModelSelectorOpen(false);
                            }}
                            className="flex items-center gap-2"
                          >
                            <ModelSelectorLogo provider={model.provider} />
                            <ModelSelectorName>{model.name}</ModelSelectorName>
                            {model.id === selectedModel && (
                              <Check className="size-4 text-primary" />
                            )}
                          </ModelSelectorItem>
                        ))}
                      </ModelSelectorGroup>
                    ))}
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>

              <PromptInputSubmit
                status={status}
                disabled={isLoading}
                className="size-9 rounded-lg"
              >
                <Send className="size-4" />
                <span className="sr-only">Send message</span>
              </PromptInputSubmit>
            </div>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
