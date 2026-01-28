# AI Chatbot

A modern AI chatbot template built with Next.js 15, Vercel AI SDK v6, and Tailwind CSS v4.

## Overview

AI Chatbot is a modular, feature-rich chat application that provides real-time streaming conversations with OpenAI models. Built with a clean separation of concerns, the architecture uses a Provider Pattern for state management and local-first persistence with IndexedDB.

### Key Features

- **Streaming Responses** - Real-time streaming chat powered by Vercel AI SDK v6
- **Chat History Persistence** - Conversations saved locally with IndexedDB via Dexie
- **Smart Title Generation** - LLM-powered conversation titles generated automatically after first exchange
- **AI Elements UI** - Pre-built components from Vercel AI SDK (conversation, message, prompt-input, model-selector)
- **Interactive Content Blocks** - Forms, charts, code blocks, and cards via AI tools
- **Web Search** - Optional real-time web search via Tavily API for current events and live data
- **Dark/Light Mode** - System-aware theme with manual toggle
- **Responsive Design** - Mobile-first design with collapsible sidebar
- **Accessibility** - Reduced motion support, proper ARIA labels

## Architecture

This application follows a **modular monolith** architecture with a local-first data strategy. The codebase is organized into feature-based modules with clear boundaries and well-defined interfaces.

### Design Patterns

| Pattern | Implementation | Purpose |
|---------|----------------|---------|
| **Provider** | `ChatProvider`, `ThemeProvider` | Centralized state management via React Context |
| **Factory** | `getModel()` in `lib/ai/models.ts` | Dynamic AI model instantiation |
| **Repository** | Dexie abstractions in `lib/db/` | Data access layer for IndexedDB |
| **Observer** | `useLiveQuery()` hooks | Reactive UI updates from database changes |
| **Strategy** | Tool definitions in `lib/ai/tools.ts` | Pluggable AI tool implementations |

### Data Flow

```
User Input --> ChatProvider --> AI SDK Transport --> /api/chat --> OpenAI
                    |                                    |
                    v                                    v
              IndexedDB <-- useChatPersistence <-- Streaming Response
```

### Key Technical Decisions

- **Delayed Conversation Creation**: Conversations are only persisted to IndexedDB after the first message, preventing orphan records from abandoned sessions
- **Resilient Title Generation**: Uses exponential backoff retry (3 attempts at 1s, 2s, 4s intervals) for LLM-generated titles with graceful fallback to message truncation
- **State Synchronization**: Refs are used alongside state to prevent race conditions during rapid user interactions

## Tech Stack

| Category | Technologies | Version |
|----------|--------------|---------|
| Framework | Next.js (App Router, Turbopack) | 15.0.0+ |
| React | React | 18.3.1 |
| AI | Vercel AI SDK with @ai-sdk/openai | 6.0.12 / 3.0.21 |
| Storage | Dexie (IndexedDB wrapper) | 4.2.1 |
| Styling | Tailwind CSS, class-variance-authority | 4.0.0+ |
| Animation | Framer Motion (motion) | 12.23.24 |
| Forms | react-hook-form, Zod validation | 7.55.0 / 3.23.0 |
| Charts | Recharts | 2.15.2 |
| Syntax Highlighting | Shiki | 3.20.0 |
| UI Components | shadcn/ui, Radix UI primitives | - |

## Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your OpenAI API key to .env.local
```

### Environment Variables

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - Web Search (disabled by default)
TAVILY_API_KEY=your_tavily_api_key_here
WEB_SEARCH_ENABLED=true
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `TAVILY_API_KEY` | No | - | Tavily API key for web search |
| `WEB_SEARCH_ENABLED` | No | `false` | Enable web search tool |
| `OPENAI_API_MODE` | No | `chat-completions` | API mode (`chat-completions` or `responses`) |
| `AI_DEFAULT_MODEL` | No | `gpt-4o` | Default model for chat |
| `AI_TITLE_MODEL` | No | `gpt-4o-mini` | Model for title generation |
| `AI_TITLE_MAX_LENGTH` | No | `50` | Max title length (chars) |
| `AI_TITLE_TIMEOUT_MS` | No | `10000` | Title generation timeout (ms) |
| `AI_DEBUG_ON` | No | `false` | Enable AI SDK DevTools |
| `NEXT_PUBLIC_CHAT_API_URL` | No | - | Custom backend URL for frontend-only deployments |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── chat/               # AI streaming endpoint
│   │   └── generate-title/     # Title generation endpoint
│   ├── layout.tsx              # Root layout with ThemeProvider
│   └── page.tsx                # Main chat page
├── components/
│   ├── ai-elements/            # AI SDK UI components
│   ├── blocks/                 # Interactive content blocks (forms, charts, code, cards)
│   ├── chat/                   # Chat components (Provider, Conversation, Input)
│   ├── layout/                 # Layout components (Sidebar)
│   ├── providers/              # React context providers
│   └── ui/                     # shadcn/ui component library
├── hooks/                      # Custom React hooks
├── lib/
│   ├── ai/                     # AI model and tool definitions
│   ├── db/                     # Dexie IndexedDB schema
│   ├── motion/                 # Animation variants
│   └── utils/                  # Utility functions
├── styles/                     # CSS files (Tailwind, theme)
└── types/                      # TypeScript type definitions
```

## Available Models

The chatbot supports OpenAI models:

| Model | ID |
|-------|-----|
| GPT-5.2 | `gpt-5.2` |
| GPT-5 | `gpt-5` |
| GPT-5 Mini | `gpt-5-mini` |
| GPT-5 Nano | `gpt-5-nano` |
| GPT-4o | `gpt-4o` |
| GPT-4o Mini | `gpt-4o-mini` |

## Customization

### Adding New Models

Edit `src/lib/ai/models.ts`:

```typescript
export const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  // Add new models here
] as const;
```

### Theming

Theme variables are defined in `src/styles/theme.css` using CSS custom properties. The theme supports both light and dark modes with the `.dark` class on the `<html>` element.

### Custom Backend

The app supports frontend-only deployments connecting to a custom backend:

```env
NEXT_PUBLIC_CHAT_API_URL=https://api.example.com
```

This will route requests to `https://api.example.com/chat` and `https://api.example.com/generate-title`.

## License

MIT
