# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modular monolith AI agents application with feature-based organization. Next.js 15 + Vercel AI SDK v6 + Tailwind CSS v4.

**Key Characteristics:**
- Client-server split: React components handle UI, Next.js API routes handle AI interactions
- Provider pattern for state management (`ChatProvider`, `ThemeProvider`)
- Tool-based AI architecture with 5 interactive tools (forms, charts, code, cards, web search)
- Local-first persistence via IndexedDB (Dexie) with delayed conversation creation
- Deployable as full-stack or frontend-only (via `NEXT_PUBLIC_CHAT_API_URL`)

**Entry Points:**
- `src/app/page.tsx` - Main chat UI
- `src/app/api/chat/route.ts` - Streaming AI endpoint
- `src/app/api/generate-title/route.ts` - Title generation endpoint

## Repository Structure

```
ai-chatbot/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/chat/           # Streaming chat endpoint
│   │   ├── api/generate-title/ # Title generation endpoint
│   │   ├── layout.tsx          # Root layout with ThemeProvider
│   │   └── page.tsx            # Main chat page
│   ├── components/
│   │   ├── chat/               # Core chat components (ChatProvider, ChatConversation, ChatInput)
│   │   ├── ai-elements/        # AI SDK UI wrappers (prompt-input, model-selector, message, reasoning, tool, loader, suggestion, code-block)
│   │   ├── blocks/             # Interactive content (forms, charts, code, cards)
│   │   ├── layout/             # Sidebar with chat history
│   │   ├── providers/          # ThemeProvider
│   │   └── ui/                 # shadcn/ui component library
│   ├── hooks/                  # Custom React hooks
│   │   ├── useChatPersistence.ts  # Message save/load with transactions
│   │   ├── useConversations.ts    # Conversation list management
│   │   ├── useTitleGeneration.ts  # LLM title generation with retry
│   │   ├── useReducedMotion.ts    # Accessibility: prefers-reduced-motion
│   │   ├── useDeviceType.ts       # Mobile/tablet/desktop detection
│   │   └── useVirtualKeyboard.ts  # Virtual keyboard detection
│   ├── constants/              # Static data (suggestion prompts)
│   ├── lib/
│   │   ├── ai/                 # AI model factory, tools, prompts
│   │   ├── db/                 # Dexie IndexedDB schema
│   │   ├── motion/             # Animation variants
│   │   └── utils/              # Message extraction, truncation
│   ├── styles/                 # tailwind.css, theme.css
│   ├── types/                  # TypeScript definitions
│   └── config.ts               # Environment configuration
└── package.json
```

## Key Patterns

- **Provider Pattern:** `ChatProvider` wraps app with `useChat2()` context exposing messages, sendMessage, status, model selection, conversation switching
- **Factory Pattern:** `getModel()` in `src/lib/ai/models.ts` creates AI model instances with optional middleware
- **Repository Pattern:** Dexie abstractions encapsulate IndexedDB operations in `src/lib/db/`
- **Hook Composition:** Complex state logic extracted into reusable hooks (`useChatPersistence`, `useTitleGeneration`)
- **Discriminated Unions:** Content blocks use Zod discriminated unions for type-safe tool results
- **Lazy Initialization:** Tavily client created on first use in `src/lib/ai/tavily.ts`
- **Retry with Exponential Backoff:** Title generation retries 3x with 1s, 2s, 4s delays

### Module Responsibilities

**Chat Core** (`src/components/chat/`):
- `ChatProvider.tsx` - Central context provider wrapping AI SDK's useChat, persistence hooks, and title generation
- `ChatConversation.tsx` - Message list with auto-scroll
- `ChatMessageItem.tsx` - Individual message rendering with tool results
- `ChatInput.tsx` - Input composer with model selector

**AI Integration Layer** (`src/lib/ai/`):
- `model.ts` - Factory function `getModel()` creating OpenAI instances with optional DevTools middleware
- `models.ts` - Model catalog with GPT-5 variants and GPT-4o models
- `tools.ts` - Five AI tools (generateForm, generateChart, generateCode, generateCard, webSearch)
- `tavily.ts` - Lazy-initialized Tavily client for web search
- `prompts.ts` - System prompts with tool selection guidance

**State Management Hooks** (`src/hooks/`):
- `useChatPersistence.ts` - Message save/load with delayed conversation creation
- `useConversations.ts` - Live query of conversations, CRUD operations
- `useTitleGeneration.ts` - LLM title generation with retry logic (3 attempts, exponential backoff)

### Dependency Graph

```
                                  ┌─────────────────┐
                                  │   page.tsx      │
                                  │ (Entry Point)   │
                                  └────────┬────────┘
                                           │
                                  ┌────────▼────────┐
                                  │  ChatProvider   │
                                  │  (Context)      │
                                  └────────┬────────┘
                     ┌─────────────────────┼─────────────────────┐
                     │                     │                     │
            ┌────────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
            │useChatPersistence│  │useTitleGeneration│  │ AI SDK (Chat)   │
            └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
                     │                     │                     │
            ┌────────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
            │  Dexie (db)     │   │ /api/generate-  │   │ /api/chat       │
            │  IndexedDB      │   │ title           │   │ (streaming)     │
            └─────────────────┘   └────────┬────────┘   └────────┬────────┘
                                           │                     │
                                  ┌────────▼─────────────────────▼────────┐
                                  │              src/lib/ai/              │
                                  │  (getModel, tools, prompts)          │
                                  └────────┬─────────────────────────────┘
                                           │
                     ┌─────────────────────┼─────────────────────┐
                     │                     │                     │
            ┌────────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
            │ @ai-sdk/openai  │   │  config.ts      │   │ @tavily/core    │
            │ (OpenAI)        │   │ (Environment)   │   │ (Web Search)    │
            └─────────────────┘   └─────────────────┘   └─────────────────┘
```

### Data Flow

1. **Input:** User types in `ChatInput`, triggers `sendMessage()` from `useChat2()` context
2. **Transport:** AI SDK's `DefaultChatTransport` POSTs to `/api/chat` with messages and model
3. **Processing:** API route calls `streamText()` with OpenAI model and tools
4. **Tool Execution:** AI can invoke tools returning structured data (form, chart, code, card) or web search
5. **Streaming:** Response streams via `toUIMessageStreamResponse()`, UI updates in real-time
6. **Persistence:** After streaming completes (status === 'ready'), messages save to IndexedDB
7. **Title Generation:** After first exchange, async call to `/api/generate-title` updates conversation

### Database Schema

```typescript
// Dexie schema v1 - src/lib/db/schema.ts
conversations: 'id, updatedAt, userId'
messages: '++id, conversationId, userId, createdAt'

// Message content stored as JSON stringified UIMessage.parts
```

### Development Notes

- Use `'use client'` directive for all React components with hooks or state
- Import paths use `@/` alias mapping to `./src`
- UI components follow shadcn/ui conventions with `data-slot` attributes
- Use `cn()` from `src/lib/utils.ts` for Tailwind class merging
- Animation uses `motion/react` with `useReducedMotion()` for accessibility

---

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

This is a Next.js 15 + Vercel AI SDK v6 + Tailwind CSS v4 AI agents application.

### Entry Points
- `src/app/layout.tsx` - Root layout with ThemeProvider
- `src/app/page.tsx` - Main chat page with WelcomeScreen
- `src/app/api/chat/route.ts` - AI streaming endpoint using OpenAI API
- `src/app/api/generate-title/route.ts` - Title generation endpoint using gpt-4o-mini

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
- **OpenAI API** via `@ai-sdk/openai` for chat completions
- **AI Elements** UI components from `@ai-sdk/react` (conversation, message, prompt-input, model-selector)
- **Chat class** with `DefaultChatTransport` for API communication
- **UIMessage** type for message handling with parts-based content
- **Streaming** via `streamText` and `toUIMessageStreamResponse`
- **StreamDown** for streaming markdown rendering in assistant messages

### AI Tools

The agent includes 5 AI tools defined in `src/lib/ai/tools.ts`:
1. `generateForm` - Creates interactive forms for data collection
2. `generateChart` - Creates data visualization charts (recharts)
3. `generateCode` - Generates syntax-highlighted code blocks (shiki)
4. `generateCard` - Creates rich content cards
5. `webSearch` - Tavily web search (conditionally included based on `WEB_SEARCH_ENABLED`)

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
OPENAI_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

### Backend Configuration
The app supports two deployment modes:
- **Full-stack** (default): Uses built-in `/api/chat` and `/api/generate-title` endpoints
- **Frontend-only**: Connects to a custom backend via `NEXT_PUBLIC_CHAT_API_URL`

```env
# Custom backend (optional) - set base URL, endpoints are appended automatically
NEXT_PUBLIC_CHAT_API_URL=https://api.example.com
# Results in: https://api.example.com/chat and https://api.example.com/generate-title
```

Use `getApiUrl('chat')` or `getApiUrl('generate-title')` from `@/config` to get the correct endpoint URL.

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
| `src/app/api/generate-title/route.ts` | Title generation API endpoint (uses gpt-4o-mini) |

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 15.0.0 |
| React | React | 18.3.1 |
| AI | Vercel AI SDK | 6.0.12 |
| AI Provider | @ai-sdk/openai | 3.0.21 |
| AI Search | @tavily/core | 0.6.4 |
| Database | Dexie | 4.2.1 |
| Styling | Tailwind CSS | 4.0.0 |
| Animation | Framer Motion | 12.23.24 |
| Forms | react-hook-form | 7.55.0 |
| Validation | Zod | 3.23.0 |
| Charts | recharts | 2.15.2 |
| Code Syntax | shiki | 3.20.0 |

## Adding New Models

Edit `src/lib/ai/models.ts`:
```typescript
export const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
] as const;
```

## Adding New AI Tools

Edit `src/lib/ai/tools.ts`:
```typescript
export const tools = {
  generateForm: tool({ ... }),
  generateChart: tool({ ... }),
  // Add new tool here with Zod schema for parameters
  newTool: tool({
    description: 'What this tool does',
    parameters: z.object({ ... }),
    execute: async (params) => { ... },
  }),
};
```

## UI/UX Guidelines

When modifying UI components:
- **Responsive breakpoints**: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
- **Touch targets**: Minimum 44x44px for mobile (Apple HIG)
- **Accessibility**: ARIA labels, focus management, screen reader announcements
- **Safe areas**: Support for device notches and home indicators
- **Performance**: Reduced motion support via `useReducedMotion()` hook

---

## Integration Points

When extending the codebase, follow these patterns for each feature type:

### Adding New AI Tools

1. **Define the tool** in `src/lib/ai/tools.ts` with Zod schema for parameters
2. **Add content block type** in `src/types/content-blocks.ts` using discriminated union
3. **Create renderer component** in `src/components/blocks/` following existing patterns
4. **Register renderer** in `ChatMessageItem.tsx` tool result handling

```typescript
// Example: Adding a "generateTable" tool
// 1. src/lib/ai/tools.ts
generateTable: tool({
  description: 'Generate a data table',
  parameters: z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  }),
  execute: async (params) => ({ type: 'table', ...params }),
}),

// 2. src/types/content-blocks.ts - add to discriminated union
// 3. src/components/blocks/TableBlock.tsx - create component
// 4. src/components/chat/ChatMessageItem.tsx - add case for 'table' type
```

### Adding New AI Models

Add to the `MODELS` array in `src/lib/ai/models.ts`:

```typescript
export const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'new-model-id', name: 'Display Name', provider: 'openai' },
] as const;
```

### Adding New API Endpoints

1. **Create route** in `src/app/api/[endpoint-name]/route.ts`
2. **Update config** if external backend support needed - add endpoint to `getApiUrl()` in `src/config.ts`
3. **Create client hook** in `src/hooks/` for frontend consumption

### Extending Chat Persistence

1. **Update schema** in `src/lib/db/schema.ts` - increment version, add migration
2. **Update types** in `src/types/` for new fields
3. **Update hooks** - modify `useChatPersistence.ts` or `useConversations.ts`

```typescript
// Example: Adding message reactions
// 1. src/lib/db/schema.ts
this.version(2).stores({
  conversations: 'id, updatedAt, userId',
  messages: '++id, conversationId, userId, createdAt',
  reactions: '++id, messageId, emoji, userId',  // new table
});
```

### Adding New Chat Features

1. **Extend context type** in `src/components/chat/ChatProvider.tsx`
2. **Add state and handlers** within the provider
3. **Expose via useChat2()** hook return value

```typescript
// Example: Adding typing indicators
// In ChatProvider.tsx, add to ChatContextType:
isTyping: boolean;
setIsTyping: (typing: boolean) => void;
```

### Adding New UI Components

1. **Create component** in `src/components/ui/` following shadcn/ui patterns
2. **Use `'use client'`** directive for interactive components
3. **Apply variants** with `class-variance-authority` (cva)
4. **Include `data-slot`** attribute for styling hooks

---

## Known Technical Debt

| Item | Severity | Description | Suggested Fix |
|------|----------|-------------|---------------|
| No test coverage | High | Zero unit, integration, or e2e tests | Add Vitest for unit tests, Playwright for e2e |
| No CI/CD pipeline | High | Manual deployment, no automated checks | Add GitHub Actions for lint, type-check, build |
| Missing input validation | Medium | API routes trust client input without Zod validation | Add Zod schemas at API boundaries |
| Large Sidebar component | Medium | `Sidebar.tsx` is 572 lines with mixed concerns | Split into `SettingsModal`, `UserMenu`, `ConversationList` components |
| No error boundaries | Medium | React errors crash entire app | Add error boundaries around Chat, Sidebar, and tool blocks |
| Hardcoded user auth | Medium | User identity is placeholder "Dev User" | Implement NextAuth.js or Clerk for real authentication |
| Unused dependencies | Medium | `@mui/material`, `@emotion/*`, `next-themes`, `react-dnd`, `react-popper` appear unused | Run `npx depcheck` and remove from package.json |
| Duplicated truncation logic | Low | `truncateAtWordBoundary` implemented in 3 separate files | Consolidate into `src/lib/utils/message.ts` |
| Inline SVG icons | Low | Sidebar uses hand-written SVG for logout icon | Replace with `lucide-react` icon (already a dependency) |
| No API response validation | Low | Hooks call `response.json()` and access fields without type checking | Add Zod schemas for API response shapes |
| Vercel-specific maxDuration | Low | API routes export `maxDuration` (Vercel serverless only) | Document platform dependency or abstract |

### Architectural Strengths

- **Clean module boundaries** - Unidirectional dependency flow: Pages → Components → Hooks → Lib/DB. No circular imports.
- **Robust persistence** - Delayed conversation creation prevents orphan records; Dexie transactions ensure data integrity; duplicate message prevention guards race conditions
- **Production-ready AI** - Streaming responses, type-safe tools via Zod discriminated unions, retry logic with exponential backoff
- **Flexible deployment** - Works as full-stack or frontend-only via environment configuration
- **Accessible UI** - Reduced motion support, ARIA labels, keyboard navigation
- **Extensible tool system** - Clear 4-step pattern for adding new AI tools (tool → schema → renderer → register)
- **Self-documenting architecture** - Comprehensive CLAUDE.md with dependency graph, data flow, and integration guides
