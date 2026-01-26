# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Architecture

This is a **Vite + React** frontend-only AI chatbot with a **mock backend** that simulates AI responses. The application uses AI SDK v6 for the chat interface with IndexedDB for local persistence.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
│  (ChatProvider, ChatConversation, ChatInput, etc.)          │
└─────────────────────────┬───────────────────────────────────┘
                          │ uses
┌─────────────────────────▼───────────────────────────────────┐
│              AI SDK React Hooks (@ai-sdk/react)             │
│              (useChat, Chat class, UIMessage)               │
└─────────────────────────┬───────────────────────────────────┘
                          │ transport
┌─────────────────────────▼───────────────────────────────────┐
│              MockChatTransport                               │
│              (simulates streaming responses)                 │
└─────────────────────────┬───────────────────────────────────┘
                          │ uses
┌─────────────────────────▼───────────────────────────────────┐
│              MockChatService                                 │
│              - streamChat() → streaming text + tool calls   │
│              - generateTitle() → conversation titles         │
└─────────────────────────────────────────────────────────────┘
```

### Entry Points
- `index.html` - HTML entry with theme flash prevention
- `src/main.tsx` - React entry point
- `src/App.tsx` - Root component with ThemeProvider
- `src/pages/ChatPage.tsx` - Main chat page with WelcomeScreen

### Key Directories
- `src/pages/` - Page components
- `src/services/chat/` - Mock chat service and transport layer
- `src/components/chat/` - Chat components (ChatProvider, ChatConversation, ChatMessageItem, ChatInput)
- `src/components/ai-elements/` - AI SDK UI components
- `src/components/blocks/` - Interactive content blocks (forms, charts, code, cards)
- `src/components/layout/` - Layout components (Sidebar)
- `src/components/providers/` - React context providers (ThemeProvider)
- `src/components/ui/` - shadcn/ui component library
- `src/lib/ai/` - AI model and tool definitions
- `src/lib/db/` - Dexie IndexedDB schema
- `src/hooks/` - Custom React hooks
- `src/styles/` - CSS files (tailwind.css, theme.css)
- `src/types/` - TypeScript type definitions

### Mock Backend System
The mock backend simulates AI responses with:
- **Streaming text responses** with realistic character-by-character delays
- **Tool call detection** based on message content patterns:
  - `generateForm` - triggered by form/survey/registration keywords
  - `generateChart` - triggered by chart/graph/visualization keywords
  - `generateCode` - triggered by code/function/programming keywords
  - `generateCard` - triggered by card/profile/product keywords
- **Title generation** based on conversation content

### Service Layer (`src/services/chat/`)
| File | Purpose |
|------|---------|
| `types.ts` | ChatService interface, request/response types |
| `index.ts` | Service factory with `createChatTransport()` |
| `mock/MockChatService.ts` | Mock implementation |
| `mock/responseGenerator.ts` | Streaming response generation |
| `mock/toolDetector.ts` | Pattern-based tool call detection |
| `mock/mockData.ts` | Mock response templates |
| `mock/titleGenerator.ts` | Mock title generation |
| `transport/MockChatTransport.ts` | AI SDK ChatTransport adapter |

### AI SDK Integration
- **AI SDK v6** with `useChat` hook from `@ai-sdk/react`
- **MockChatTransport** for simulated streaming responses
- **UIMessage** type for message handling with parts-based content
- **StreamDown** for streaming markdown rendering

### Chat State Management
- `ChatProvider` wraps the app with chat context
- Uses AI SDK's `Chat` class with `MockChatTransport`
- Model selection persisted in component state
- `useChat2()` hook exposes: messages, sendMessage, status, selectedModel, clearMessages, stop, conversationId, switchConversation, startNewConversation

### Chat Persistence
- **Dexie** (IndexedDB wrapper) stores conversations and messages locally
- `useChatPersistence` hook handles message save/load with live queries
- `useConversations` hook lists and manages all conversations
- Messages auto-save after streaming completes
- **Delayed creation**: Conversations only created in DB after first message
- **Mock titles**: Generated based on message content patterns

### Styling System
- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin
- **Theme variables** defined in `src/styles/theme.css`
- **Dark mode** uses `.dark` class on `<html>`
- **shadcn/ui components** with `class-variance-authority` (cva)

### Path Alias
`@` maps to `./src` (configured in tsconfig.json and vite.config.ts)

### Environment Variables
```env
# Mock backend settings
VITE_USE_MOCK_CHAT=true
VITE_MOCK_STREAM_DELAY_MS=25

# AI settings (for future real backend)
VITE_AI_DEFAULT_MODEL=anthropic/claude-sonnet-4
VITE_AI_DEBUG_ON=false
```

## Key Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite configuration with React plugin and path aliases |
| `src/config.ts` | Centralized environment configuration |
| `src/lib/ai/models.ts` | AI model definitions for model selector |
| `src/lib/ai/tools.ts` | AI tool definitions (generateForm, generateChart, etc.) |
| `src/lib/db/schema.ts` | Dexie database schema (conversations, messages tables) |
| `src/services/chat/index.ts` | Chat service factory |
| `src/services/chat/mock/MockChatService.ts` | Mock chat implementation |
| `src/hooks/useChatPersistence.ts` | Message persistence with IndexedDB |
| `src/hooks/useConversations.ts` | Conversation list management |
| `src/hooks/useTitleGeneration.ts` | Title generation with mock service |
| `src/components/chat/ChatProvider.tsx` | Chat state management |
| `src/pages/ChatPage.tsx` | Main chat page component |

## Extending the Mock Backend

### Adding New Tool Responses
1. Add patterns to `src/services/chat/mock/toolDetector.ts`
2. Add mock data to `src/services/chat/mock/mockData.ts`

### Customizing Response Behavior
- Adjust `charDelayMs` in `src/services/chat/mock/responseGenerator.ts`
- Add new response templates in `mockData.ts`

## Replacing with Real Backend

To switch from mock to a real backend:
1. Create a `RealChatService` implementing `ChatService` interface
2. Update `src/services/chat/index.ts` to return real service when `VITE_USE_MOCK_CHAT=false`
3. Implement actual API calls in the service

## UI/UX Guidelines

When modifying UI components:
- **Responsive breakpoints**: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
- **Touch targets**: Minimum 44x44px for mobile (Apple HIG)
- **Accessibility**: ARIA labels, focus management, screen reader announcements
- **Safe areas**: Support for device notches and home indicators
- **Performance**: Reduced motion support via `useReducedMotion()` hook
