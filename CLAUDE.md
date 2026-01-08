# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development server (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## Architecture

This is a Next.js 15 + Vercel AI SDK v6 + Tailwind CSS v4 AI chatbot application.

### Entry Points
- `src/app/layout.tsx` - Root layout with ThemeProvider
- `src/app/page.tsx` - Main chat page with WelcomeScreen
- `src/app/api/chat/route.ts` - AI streaming endpoint using AI Gateway
- `src/app/api/generate-title/route.ts` - Title generation endpoint using claude-haiku-4.5

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/chat/` - Chat components (ChatProvider, ChatConversation, ChatMessageItem, ChatInput)
- `src/components/ai-elements/` - AI SDK UI components (prompt-input, model-selector, conversation, message, suggestion, loader)
- `src/components/blocks/` - Interactive content blocks (forms, charts, code, cards)
- `src/components/layout/` - Layout components (Sidebar with chat history)
- `src/components/providers/` - React context providers (ThemeProvider)
- `src/components/ui/` - shadcn/ui component library
- `src/lib/ai/` - AI model and tool definitions
- `src/lib/db/` - Dexie IndexedDB schema and database instance
- `src/lib/motion/` - Animation variants
- `src/hooks/` - Custom React hooks (useChatPersistence, useConversations, useTitleGeneration, etc.)
- `src/lib/utils/` - Utility functions (message text extraction, truncation)
- `src/styles/` - CSS files (tailwind.css, theme.css)
- `src/types/` - TypeScript type definitions

### AI SDK Integration
- **AI SDK v6** with `useChat` hook from `@ai-sdk/react`
- **AI Gateway** for multi-provider support (OpenAI, Anthropic, Google, DeepSeek, Baseten)
- **AI Elements** UI components from `@ai-sdk/react` (conversation, message, prompt-input, model-selector)
- **Chat class** with `DefaultChatTransport` for API communication
- **UIMessage** type for message handling with parts-based content
- **Streaming** via `streamText` and `toUIMessageStreamResponse`
- **StreamDown** for streaming markdown rendering in assistant messages

### Chat State Management
- `ChatProvider` wraps the app with chat context
- Uses AI SDK's `Chat` class with `DefaultChatTransport`
- Model selection persisted in component state
- `useChat2()` hook exposes: messages, sendMessage, status, selectedModel, clearMessages, stop, conversationId, switchConversation, startNewConversation

### Chat Persistence
- **Dexie** (IndexedDB wrapper) stores conversations and messages locally
- `useChatPersistence` hook handles message save/load with live queries
- `useConversations` hook lists and manages all conversations
- Messages auto-save after streaming completes
- Sidebar displays real conversation history with switch/delete functionality
- **Delayed creation**: Conversations only created in DB after first message (no orphan records)
- **Smart titles**: LLM generates title after first user+assistant exchange via `/api/generate-title`
- **Fallback title**: First 50 characters of user message if title generation fails
- **Retry logic**: 3 attempts with exponential backoff (1s, 2s, 4s) for title generation

### Chat Components
- `ChatConversation` - Message list with auto-scroll using AI Elements Conversation
- `ChatMessageItem` - Message rendering with AI Elements Message components
- `ChatInput` - Input textarea with model selector using AI Elements PromptInput and ModelSelector

### Styling System
- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin
- **Theme variables** defined in `src/styles/theme.css` using CSS custom properties
- **Dark mode** uses `.dark` class on `<html>` with `@custom-variant dark (&:is(.dark *))`
- **shadcn/ui components** use `class-variance-authority` (cva) for variants
- **Utility function** `cn()` in `src/lib/utils.ts` merges Tailwind classes

### Path Alias
`@` maps to `./src` (configured in tsconfig.json)

### Component Patterns
- All client components use `'use client'` directive
- UI components follow shadcn/ui conventions with `data-slot` attributes
- Animation uses `motion/react` (Framer Motion) with reduced motion support
- Icons from `lucide-react`
- Theme toggle via `useTheme()` hook from ThemeProvider

### Environment Variables
```env
AI_GATEWAY_API_KEY=your_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

## Key Files

| File | Purpose |
|------|---------|
| `src/config.ts` | Centralized environment configuration (including title generation settings) |
| `src/lib/ai/models.ts` | AI model definitions for model selector |
| `src/lib/ai/tools.ts` | AI tool definitions (generateForm, generateChart, etc.) |
| `src/lib/ai/tavily.ts` | Tavily web search tool with lazy client initialization |
| `src/lib/db/schema.ts` | Dexie database schema (conversations, messages tables) |
| `src/lib/utils/message.ts` | Message text extraction and truncation utilities |
| `src/hooks/useChatPersistence.ts` | Message persistence with IndexedDB (delayed conversation creation) |
| `src/hooks/useConversations.ts` | Conversation list management |
| `src/hooks/useTitleGeneration.ts` | LLM title generation with retry logic |
| `src/components/chat/ChatProvider.tsx` | Chat state management with AI SDK, persistence, and title generation |
| `src/components/chat/ChatConversation.tsx` | Message list with auto-scroll |
| `src/components/chat/ChatMessageItem.tsx` | Individual message rendering |
| `src/components/chat/ChatInput.tsx` | Input composer with model selector |
| `src/components/layout/Sidebar.tsx` | Navigation with chat history list |
| `src/app/api/chat/route.ts` | Streaming chat API endpoint |
| `src/app/api/generate-title/route.ts` | Title generation API endpoint (uses claude-haiku-4.5) |

## Adding New Models

Edit `src/lib/ai/models.ts`:
```typescript
export const MODELS = [
  { id: 'provider/model-name', name: 'Display Name', provider: 'provider' },
] as const;
```

## UI/UX Guidelines

When modifying UI components:
- **Responsive breakpoints**: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
- **Touch targets**: Minimum 44x44px for mobile (Apple HIG)
- **Accessibility**: ARIA labels, focus management, screen reader announcements
- **Safe areas**: Support for device notches and home indicators
- **Performance**: Reduced motion support via `useReducedMotion()` hook
