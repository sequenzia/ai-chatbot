# Project Structure

This document explains how the codebase is organized and helps you find your way around.

## Directory Overview

```
ai-chatbot/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   ├── chat/           # Streaming chat endpoint
│   │   │   └── generate-title/ # Title generation endpoint
│   │   ├── layout.tsx          # Root layout with ThemeProvider
│   │   └── page.tsx            # Main chat page
│   ├── components/
│   │   ├── chat/               # Core chat components
│   │   ├── ai-elements/        # AI SDK UI wrappers
│   │   ├── blocks/             # Interactive content blocks
│   │   ├── layout/             # Sidebar and layout
│   │   ├── providers/          # Context providers
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/
│   │   ├── ai/                 # AI model, tools, prompts
│   │   ├── db/                 # Dexie database schema
│   │   ├── motion/             # Animation variants
│   │   └── utils/              # Utility functions
│   ├── styles/                 # CSS files
│   ├── types/                  # TypeScript definitions
│   ├── constants/              # Static data
│   └── config.ts               # Environment configuration
├── docs/                       # This documentation (MkDocs)
├── public/                     # Static assets
├── mkdocs.yml                  # Documentation config
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript config
```

## Key Directories

### `src/app/` - Next.js App Router

The application entry points and API routes.

| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout, wraps app with ThemeProvider |
| `page.tsx` | Main chat page with WelcomeScreen |
| `api/chat/route.ts` | Streaming chat API endpoint |
| `api/generate-title/route.ts` | Title generation API |

### `src/components/` - React Components

Organized by feature and responsibility.

#### `chat/` - Core Chat Components

| Component | Lines | Purpose |
|-----------|-------|---------|
| `ChatProvider.tsx` | ~235 | Central context, orchestrates AI + persistence |
| `ChatConversation.tsx` | ~60 | Message list with auto-scroll |
| `ChatMessageItem.tsx` | ~170 | Individual message rendering |
| `ChatInput.tsx` | ~80 | Input composer with model selector |

#### `blocks/` - Interactive Content Blocks

| Component | Lines | Purpose |
|-----------|-------|---------|
| `ContentBlock.tsx` | ~43 | Dispatcher routing to block renderers |
| `FormContent.tsx` | ~252 | Interactive form renderer |
| `ChartContent.tsx` | ~100 | Recharts data visualization |
| `CodeContent.tsx` | ~80 | Shiki syntax-highlighted code |
| `CardContent.tsx` | ~90 | Rich content cards |

#### `ui/` - shadcn/ui Components

Reusable UI primitives following [shadcn/ui](https://ui.shadcn.com/) conventions:

- `button.tsx` - Button with variants
- `card.tsx` - Card layout components
- `input.tsx` - Text input
- `select.tsx` - Dropdown select
- And many more...

### `src/hooks/` - Custom Hooks

| Hook | Lines | Purpose |
|------|-------|---------|
| `useChatPersistence.ts` | ~191 | Message save/load with IndexedDB |
| `useConversations.ts` | ~51 | Conversation list management |
| `useTitleGeneration.ts` | ~96 | LLM title generation with retry |
| `useReducedMotion.ts` | ~15 | Accessibility motion preference |

### `src/lib/` - Shared Libraries

#### `ai/` - AI Integration

| File | Purpose |
|------|---------|
| `model.ts` | Model factory with middleware |
| `models.ts` | Model catalog (GPT-5, GPT-4o variants) |
| `tools.ts` | 5 AI tool definitions |
| `prompts.ts` | System prompts |
| `tavily.ts` | Web search integration |

#### `db/` - Database Layer

| File | Purpose |
|------|---------|
| `schema.ts` | Dexie database class definition |
| `types.ts` | TypeScript interfaces for records |
| `index.ts` | Database singleton export |

#### `motion/` - Animation

| File | Purpose |
|------|---------|
| `variants.ts` | Framer Motion animation definitions |

### `src/types/` - TypeScript Types

| File | Purpose |
|------|---------|
| `content-blocks.ts` | Zod schemas and types for tool outputs |
| `message.ts` | Message-related type helpers |

### `src/config.ts` - Configuration

Centralized environment configuration:

```typescript
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_CHAT_API_URL || '',
  },
  ai: {
    webSearch: {
      enabled: !!process.env.TAVILY_API_KEY,
    },
  },
};

export function getApiUrl(endpoint: 'chat' | 'generate-title'): string {
  // Returns correct URL based on deployment mode
}
```

## File Naming Conventions

| Pattern | Example | Used For |
|---------|---------|----------|
| `PascalCase.tsx` | `ChatProvider.tsx` | React components |
| `camelCase.ts` | `useChatPersistence.ts` | Hooks, utilities |
| `kebab-case.ts` | `content-blocks.ts` | Type definitions |
| `index.ts` | `db/index.ts` | Module exports |
| `route.ts` | `api/chat/route.ts` | Next.js API routes |

## Key Files to Understand First

Start with these files when learning the codebase:

### 1. Entry Point

**`src/app/page.tsx`** - Understand how the app bootstraps:

- `ChatProvider` wraps everything
- `WelcomeScreen` shown when no messages
- `ChatConversation` + `ChatInput` for active chats

### 2. State Management

**`src/components/chat/ChatProvider.tsx`** - The orchestration hub:

- AI SDK integration
- Persistence coordination
- Title generation triggers
- Context API exports

### 3. AI Tools

**`src/lib/ai/tools.ts`** - How interactive content is defined:

- Zod schemas for validation
- Tool execute functions
- Conditional web search

### 4. Content Rendering

**`src/components/chat/ChatMessageItem.tsx`** - How messages are displayed:

- Text rendering with Streamdown
- Tool result detection
- Block component routing

### 5. Persistence

**`src/hooks/useChatPersistence.ts`** - How data is saved:

- Delayed conversation creation
- Transaction handling
- Live query integration

## Import Paths

The project uses `@/` as an alias to `./src`:

```typescript
// Instead of relative imports
import { Button } from '../../../components/ui/button';

// Use the alias
import { Button } from '@/components/ui/button';
```

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Next Steps

- **[Development](development.md)** - Learn the development workflow
- **[Architecture](../architecture/index.md)** - Understand how modules connect
- **[Chat System](../modules/chat-system.md)** - Deep dive into ChatProvider
