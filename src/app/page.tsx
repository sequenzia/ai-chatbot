'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { ChatProvider, useChat2 } from '@/components/chat/ChatProvider';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { InputComposer } from '@/components/chat/InputComposer';
import { Sidebar } from '@/components/layout/Sidebar';
import { SUGGESTIONS } from '@/constants/suggestions';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function WelcomeScreen() {
  const { sendMessage, isLoading } = useChat2();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center p-6 text-center"
    >
      {/* Icon */}
      <div className="size-16 bg-primary rounded-[24px] shadow-xl flex items-center justify-center mb-6">
        <Sparkles className="size-8 text-primary-foreground" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-2 welcome-landscape-hide">
        Welcome to AI Chatbot
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md welcome-landscape-hide">
        Start a conversation with AI powered by multiple providers
      </p>

      {/* Input */}
      <div className="w-full max-w-2xl mb-8">
        <InputComposer isFixed={false} placeholder="How can I help you today?" />
      </div>

      {/* Suggestions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
        {SUGGESTIONS.map((suggestion, index) => (
          <motion.button
            key={suggestion.title}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => sendMessage(suggestion.prompt)}
            disabled={isLoading}
            className="flex items-center gap-2 p-3 min-h-[44px] bg-card border border-border rounded-xl text-left hover:border-border/60 hover:shadow-sm transition-all disabled:opacity-50"
          >
            <suggestion.icon className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium truncate">{suggestion.title}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { messages, clearMessages } = useChat2();

  // Load sidebar state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-open');
    setIsSidebarOpen(stored === 'true');
  }, []);

  // Save sidebar state to localStorage
  const handleSidebarToggle = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('sidebar-open', String(newState));
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-dvh w-full bg-background text-foreground overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        onNewChat={clearMessages}
        showWelcomeScreen={showWelcome}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Decorative gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[500px] -right-[500px] w-[1000px] h-[1000px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-[500px] -left-[500px] w-[1000px] h-[1000px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        {showWelcome ? (
          <WelcomeScreen />
        ) : (
          <>
            <ChatContainer />
            <InputComposer isFixed={true} />
          </>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
}
