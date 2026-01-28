# Codebase Analysis Report

> **Generated:** 2026-01-28
> **Scope:** /Users/sequenzia/dev/repos/ai-chatbot
> **Branch:** main

---

## Executive Summary

This codebase is a sophisticated AI chatbot application built on Next.js 15 with Vercel AI SDK v6. It demonstrates a **modular monolith** architecture with clear feature-based organization, local-first data persistence, and production-ready AI streaming capabilities.

The application provides an interactive chat experience with five specialized AI tools (forms, charts, code blocks, cards, and web search), backed by OpenAI's GPT models. A notable architectural decision is the **delayed conversation creation** pattern, where conversations are only persisted to IndexedDB after the first message exchange, preventing orphan records and improving data integrity.

Overall, this is a well-structured, maintainable codebase with clear separation of concerns. The primary areas for improvement are the lack of test coverage and the need to refactor the oversized Sidebar component. The codebase is ready for production use with appropriate attention to these items.

---

## Project Overview

| Attribute | Value |
|-----------|-------|
| **Project Name** | AI Chatbot |
| **Primary Language(s)** | TypeScript |
| **Framework(s)** | Next.js 15, React 18, Vercel AI SDK v6 |
| **Repository Type** | Single Application (Modular Monolith) |
| **Styling** | Tailwind CSS v4 |
| **Data Persistence** | IndexedDB (via Dexie) |

### Purpose

This project is a full-featured AI chatbot application designed to provide intelligent conversational experiences with rich interactive content. It leverages OpenAI's language models through the Vercel AI SDK to stream responses in real-time, while offering specialized tools for generating forms, charts, code snippets, and informational cards.

The application supports flexible deployment modes: it can run as a complete full-stack application with built-in API routes, or as a frontend-only client connecting to a custom backend via the `NEXT_PUBLIC_CHAT_API_URL` environment variable.

---

## Architecture

### Architecture Style

**Primary Pattern:** Modular Monolith with Local-First Data Architecture

This codebase exhibits clear modular monolith characteristics that balance simplicity with maintainability:

1. **Single Deployable Unit** - The entire application deploys as one Next.js application, simplifying infrastructure and deployment pipelines
2. **Clear Module Boundaries** - Code is organized by feature (chat, ai-elements, blocks) and technical concern (lib/ai, lib/db, hooks), making navigation intuitive
3. **Internal APIs** - Modules communicate through well-defined interfaces including React hooks, context providers, and TypeScript types
4. **Shared Infrastructure** - Common utilities, database operations, and configuration are centralized in the `lib/` directory

The architecture also demonstrates **local-first** principles by using IndexedDB as the primary data store, enabling offline-capable chat history without requiring a backend database.

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AI CHATBOT APPLICATION                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         PRESENTATION LAYER                           │    │
│  │                                                                       │    │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐     │    │
│  │   │   Sidebar   │    │ ChatProvider│    │   WelcomeScreen     │     │    │
│  │   │  (History)  │    │  (Context)  │    │                     │     │    │
│  │   └──────┬──────┘    └──────┬──────┘    └─────────────────────┘     │    │
│  │          │                  │                                        │    │
│  │          │    ┌─────────────┼─────────────┐                         │    │
│  │          │    │             │             │                         │    │
│  │   ┌──────▼────▼──┐   ┌──────▼──────┐   ┌──▼──────────┐             │    │
│  │   │ Conversation │   │  ChatInput  │   │ MessageItem │             │    │
│  │   │    List      │   │  (Composer) │   │  (Renderer) │             │    │
│  │   └──────────────┘   └─────────────┘   └─────────────┘             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│  ┌─────────────────────────────────▼───────────────────────────────────┐    │
│  │                          STATE LAYER                                 │    │
│  │                                                                       │    │
│  │   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │    │
│  │   │useChatPersistence│  │useConversations  │  │useTitleGeneration│  │    │
│  │   │ (Save/Load Msgs) │  │  (CRUD + Live)   │  │ (LLM + Retry)    │  │    │
│  │   └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │    │
│  └────────────┼─────────────────────┼─────────────────────┼────────────┘    │
│               │                     │                     │                  │
│  ┌────────────▼─────────────────────▼─────────────────────▼────────────┐    │
│  │                       INFRASTRUCTURE LAYER                           │    │
│  │                                                                       │    │
│  │   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │    │
│  │   │   Dexie (DB)     │  │   /api/chat      │  │/api/generate-title│  │    │
│  │   │   IndexedDB      │  │  (Streaming)     │  │  (GPT-4o-mini)   │  │    │
│  │   └──────────────────┘  └────────┬─────────┘  └──────────────────┘  │    │
│  └──────────────────────────────────┼──────────────────────────────────┘    │
│                                     │                                        │
│  ┌──────────────────────────────────▼──────────────────────────────────┐    │
│  │                          AI LAYER                                    │    │
│  │                                                                       │    │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │    │
│  │   │  getModel()  │  │   tools.ts   │  │      System Prompts      │  │    │
│  │   │  (Factory)   │  │  (5 Tools)   │  │                          │  │    │
│  │   └──────┬───────┘  └──────┬───────┘  └──────────────────────────┘  │    │
│  └──────────┼─────────────────┼────────────────────────────────────────┘    │
│             │                 │                                              │
└─────────────┼─────────────────┼──────────────────────────────────────────────┘
              │                 │
    ┌─────────▼─────────┐   ┌───▼───────────────┐
    │  @ai-sdk/openai   │   │   @tavily/core    │
    │   (OpenAI API)    │   │   (Web Search)    │
    └───────────────────┘   └───────────────────┘
```

### Key Modules

| Module | Purpose | Location |
|--------|---------|----------|
| Chat Core | Chat UI and state orchestration | `src/components/chat/` |
| AI Integration | Model factory, tools, prompts | `src/lib/ai/` |
| Database | IndexedDB schema and operations | `src/lib/db/` |
| State Hooks | Reusable state management logic | `src/hooks/` |
| Content Blocks | Interactive content renderers | `src/components/blocks/` |
| UI Library | shadcn/ui component library | `src/components/ui/` |
| API Routes | AI streaming endpoints | `src/app/api/` |

#### Chat Core

**Purpose:** Orchestrates the chat user interface and manages state flow between user input, AI responses, and persistence.

**Key Components:**
- `ChatProvider.tsx` - Central context provider wrapping AI SDK's useChat, persistence hooks, and title generation
- `ChatConversation.tsx` - Message list with auto-scroll behavior
- `ChatMessageItem.tsx` - Individual message rendering with support for tool results
- `ChatInput.tsx` - Input composer with integrated model selector

**Relationships:** Consumes hooks from `/src/hooks/`, renders components from `/src/components/blocks/`, communicates with API routes.

#### AI Integration Layer

**Purpose:** Abstracts AI model configuration, tool definitions, and prompt management.

**Key Components:**
- `model.ts` - Factory function `getModel()` creating OpenAI instances with optional DevTools middleware
- `models.ts` - Model catalog with GPT-5 variants and GPT-4o models
- `tools.ts` - Five AI tools (generateForm, generateChart, generateCode, generateCard, webSearch)
- `tavily.ts` - Lazy-initialized Tavily client for web search functionality
- `prompts.ts` - System prompts with tool selection guidance

**Relationships:** Used by API routes, depends on @ai-sdk/openai and @tavily/core.

#### Database Layer

**Purpose:** Provides local persistence using IndexedDB through the Dexie library.

**Key Components:**
- `schema.ts` - Database schema definition with conversations and messages tables
- `db.ts` - Dexie database instance

**Relationships:** Consumed by persistence hooks, operates independently of network connectivity.

#### State Management Hooks

**Purpose:** Encapsulates complex state logic into reusable, composable hooks.

**Key Components:**
- `useChatPersistence.ts` - Message save/load with delayed conversation creation and transactions
- `useConversations.ts` - Live query of conversations with CRUD operations
- `useTitleGeneration.ts` - LLM title generation with retry logic (3 attempts, exponential backoff)
- `useReducedMotion.ts` - Accessibility-focused motion preference detection

**Relationships:** Consumed by ChatProvider and Sidebar components.

---

## Technology Stack

### Languages & Frameworks

| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | ~5.x | Primary language with strict typing |
| Next.js | 15.5.10 | React framework with App Router |
| React | 18.3.1 | UI component library |
| Vercel AI SDK | 6.0.12 | AI streaming and tool orchestration |
| Tailwind CSS | 4.1.18 | Utility-first CSS framework |

### Dependencies

#### Production Dependencies

| Package | Purpose |
|---------|---------|
| `@ai-sdk/openai` | OpenAI provider for Vercel AI SDK |
| `@ai-sdk/react` | React hooks and components for AI |
| `@tavily/core` | Web search API client |
| `dexie` | IndexedDB wrapper for local persistence |
| `zod` | Schema validation for tool parameters |
| `recharts` | Data visualization for chart tool |
| `shiki` | Syntax highlighting for code tool |
| `react-hook-form` | Form handling for form tool |
| `motion` | Animation library (Framer Motion) |
| `lucide-react` | Icon library |

#### Development Dependencies

| Package | Purpose |
|---------|---------|
| `@tailwindcss/postcss` | Tailwind CSS v4 PostCSS plugin |
| `typescript` | TypeScript compiler |
| `eslint` | Code linting |
| `@types/*` | TypeScript type definitions |

### Build & Tooling

| Tool | Purpose |
|------|---------|
| Turbopack | Development server bundler (via `next dev --turbo`) |
| PostCSS | CSS processing for Tailwind |
| ESLint | JavaScript/TypeScript linting |

---

## Code Organization

### Directory Structure

```
ai-chatbot/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/
│   │   │   ├── chat/               # POST - Streaming chat endpoint
│   │   │   │   └── route.ts
│   │   │   └── generate-title/     # POST - Title generation endpoint
│   │   │       └── route.ts
│   │   ├── layout.tsx              # Root layout with ThemeProvider
│   │   └── page.tsx                # Main chat page entry
│   │
│   ├── components/
│   │   ├── chat/                   # Core chat UI components
│   │   │   ├── ChatProvider.tsx    # Context provider (AI + persistence)
│   │   │   ├── ChatConversation.tsx# Message list with auto-scroll
│   │   │   ├── ChatMessageItem.tsx # Individual message renderer
│   │   │   └── ChatInput.tsx       # Input composer
│   │   │
│   │   ├── ai-elements/            # AI SDK UI wrappers
│   │   │   ├── prompt-input.tsx
│   │   │   ├── model-selector.tsx
│   │   │   └── message.tsx
│   │   │
│   │   ├── blocks/                 # Interactive content renderers
│   │   │   ├── ContentBlock.tsx    # Discriminated union dispatcher
│   │   │   ├── FormBlock.tsx       # Dynamic form generation
│   │   │   ├── ChartBlock.tsx      # recharts visualization
│   │   │   ├── CodeBlock.tsx       # shiki syntax highlighting
│   │   │   └── CardBlock.tsx       # Rich content cards
│   │   │
│   │   ├── layout/                 # Application layout
│   │   │   └── Sidebar.tsx         # Navigation + chat history
│   │   │
│   │   ├── providers/              # React context providers
│   │   │   └── ThemeProvider.tsx   # Dark/light mode
│   │   │
│   │   └── ui/                     # shadcn/ui component library
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── ...
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useChatPersistence.ts   # Message persistence logic
│   │   ├── useConversations.ts     # Conversation management
│   │   ├── useTitleGeneration.ts   # LLM title with retry
│   │   └── useReducedMotion.ts     # Accessibility preference
│   │
│   ├── lib/
│   │   ├── ai/                     # AI configuration
│   │   │   ├── model.ts            # getModel() factory
│   │   │   ├── models.ts           # Model catalog
│   │   │   ├── tools.ts            # Tool definitions
│   │   │   ├── tavily.ts           # Web search client
│   │   │   └── prompts.ts          # System prompts
│   │   │
│   │   ├── db/                     # Database layer
│   │   │   ├── db.ts               # Dexie instance
│   │   │   └── schema.ts           # Table definitions
│   │   │
│   │   ├── motion/                 # Animation configuration
│   │   │   └── variants.ts
│   │   │
│   │   └── utils/                  # Utility functions
│   │       ├── message.ts          # Text extraction, truncation
│   │       └── index.ts            # cn() class merger
│   │
│   ├── styles/                     # CSS files
│   │   ├── tailwind.css            # Tailwind imports
│   │   └── theme.css               # CSS custom properties
│   │
│   ├── types/                      # TypeScript definitions
│   │   └── index.ts
│   │
│   └── config.ts                   # Environment configuration
│
├── public/                         # Static assets
├── internal/                       # Internal documentation
│   └── reports/                    # Generated reports
├── package.json
├── tsconfig.json
├── next.config.ts
└── CLAUDE.md                       # AI assistant instructions
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files (Components) | PascalCase | `ChatProvider.tsx` |
| Files (Hooks) | camelCase with `use` prefix | `useChatPersistence.ts` |
| Files (Utilities) | camelCase | `message.ts` |
| React Components | PascalCase | `ChatConversation` |
| Hooks | camelCase with `use` prefix | `useConversations` |
| Constants | SCREAMING_SNAKE_CASE | `MODELS` |
| CSS Variables | kebab-case with `--` prefix | `--background` |

### Code Patterns

The codebase consistently uses these patterns:

1. **Provider Pattern**
   - Where: `src/components/chat/ChatProvider.tsx`, `src/components/providers/ThemeProvider.tsx`
   - How: React Context wraps children with shared state and actions

2. **Factory Pattern**
   - Where: `src/lib/ai/model.ts`
   - How: `getModel()` creates configured AI model instances based on parameters

3. **Repository Pattern**
   - Where: `src/hooks/useChatPersistence.ts`, `src/hooks/useConversations.ts`
   - How: Database operations encapsulated behind hook interfaces

4. **Observer Pattern**
   - Where: `src/hooks/useConversations.ts`
   - How: Dexie `useLiveQuery` provides reactive updates when data changes

5. **Discriminated Unions**
   - Where: `src/components/blocks/ContentBlock.tsx`
   - How: Zod schemas define type-safe content blocks with discriminator field

6. **Lazy Initialization**
   - Where: `src/lib/ai/tavily.ts`
   - How: Tavily client created on first use, not at module load

7. **Retry with Exponential Backoff**
   - Where: `src/hooks/useTitleGeneration.ts`
   - How: 3 attempts with 1s, 2s, 4s delays for resilience

---

## Entry Points

| Entry Point | Type | Location | Purpose |
|-------------|------|----------|---------|
| Main Page | HTTP GET | `src/app/page.tsx` | Renders chat UI with sidebar |
| Root Layout | HTTP GET | `src/app/layout.tsx` | ThemeProvider, global styles, metadata |
| Chat API | HTTP POST | `src/app/api/chat/route.ts` | Streams AI responses |
| Title API | HTTP POST | `src/app/api/generate-title/route.ts` | Generates conversation titles |

### Primary Entry Point

Users interact with the application primarily through the main page at `/`. This renders the `ChatProvider` context with its children: the `Sidebar` for conversation history navigation and the main chat interface with `ChatConversation` and `ChatInput` components.

For API consumers (including the frontend itself), the `/api/chat` endpoint accepts POST requests with messages and model selection, returning a streaming response using Server-Sent Events.

---

## Data Flow

```
┌─────────┐    ┌────────────┐    ┌─────────────┐    ┌───────────┐    ┌──────────┐
│  User   │───▶│ ChatInput  │───▶│ sendMessage │───▶│ /api/chat │───▶│ OpenAI   │
│  Input  │    │            │    │   (SDK)     │    │ (stream)  │    │   API    │
└─────────┘    └────────────┘    └─────────────┘    └───────────┘    └──────────┘
                                                           │
                                                           ▼
┌─────────┐    ┌────────────┐    ┌─────────────┐    ┌───────────┐
│IndexedDB│◀───│Persistence │◀───│   status    │◀───│  Stream   │
│  (Save) │    │   Hook     │    │  'ready'    │    │ Response  │
└─────────┘    └────────────┘    └─────────────┘    └───────────┘
                                                           │
                                                           ▼
                                                    ┌───────────┐
                                                    │ UI Update │
                                                    │ (Realtime)│
                                                    └───────────┘
```

### Request Lifecycle

1. **Entry:** User types a message in `ChatInput` and submits. The `sendMessage()` function from `useChat2()` context is called.

2. **Transport:** The AI SDK's `DefaultChatTransport` serializes the message and POSTs to `/api/chat` with the current messages array and selected model.

3. **Processing:** The API route extracts parameters, calls `streamText()` with the OpenAI model, system prompt, and tools. Tool execution happens server-side when the AI invokes tools.

4. **Streaming:** The response streams back via `toUIMessageStreamResponse()`, using Server-Sent Events. The frontend receives chunks and updates the UI in real-time.

5. **Persistence:** After streaming completes (status changes to 'ready'), the `useChatPersistence` hook saves messages to IndexedDB. New conversations are created only at this point (delayed creation pattern).

6. **Title Generation:** After the first user+assistant message exchange, an async call to `/api/generate-title` generates a meaningful conversation title. Failures fall back to truncating the first user message.

---

## External Integrations

| Integration | Type | Purpose | Configuration |
|-------------|------|---------|---------------|
| OpenAI API | REST API | Chat completions, embeddings | `OPENAI_API_KEY` env var |
| Tavily API | REST API | Web search tool | `TAVILY_API_KEY` env var |
| Custom Backend | REST API | Alternative API hosting | `NEXT_PUBLIC_CHAT_API_URL` env var |

### OpenAI API

The primary AI provider, accessed through the `@ai-sdk/openai` package. Supports multiple models including GPT-4o and GPT-5 variants. The API key is read from environment variables and used by the model factory in `src/lib/ai/model.ts`.

### Tavily API

Optional web search integration, enabled via the `WEB_SEARCH_ENABLED` environment variable. The Tavily client is lazily initialized on first use in `src/lib/ai/tavily.ts` to avoid unnecessary API calls when web search is disabled.

### Custom Backend Mode

The application supports frontend-only deployment by setting `NEXT_PUBLIC_CHAT_API_URL`. When configured, all API calls route to the custom backend with `/chat` and `/generate-title` paths appended automatically.

---

## Testing

### Test Framework(s)

- **Unit Testing:** Not configured
- **Integration Testing:** Not configured
- **E2E Testing:** Not configured

### Coverage Areas

| Area | Coverage | Notes |
|------|----------|-------|
| Hooks | Missing | High-value targets for unit tests |
| API Routes | Missing | Should test streaming behavior |
| Components | Missing | Consider React Testing Library |
| AI Tools | Missing | Mock AI responses for deterministic tests |

**Note:** The lack of test coverage is identified as the highest-priority improvement area.

---

## Recommendations

### Strengths

These aspects of the codebase are well-executed:

1. **Clean Module Boundaries**

   The separation between UI components, state management hooks, and infrastructure (database, AI) is exemplary. Each module has a single responsibility and communicates through well-defined interfaces, making the codebase easy to navigate and modify.

2. **Robust Persistence Strategy**

   The delayed conversation creation pattern prevents orphan records, while Dexie's transaction support ensures data integrity. Live queries provide reactive updates without manual refresh logic.

3. **Production-Ready AI Integration**

   Proper streaming implementation, type-safe tools with Zod schemas, and retry logic with exponential backoff demonstrate attention to production concerns. The lazy initialization of the Tavily client shows resource efficiency awareness.

4. **Flexible Deployment Model**

   The ability to deploy as full-stack or frontend-only provides operational flexibility. Environment-based configuration keeps deployment concerns separate from code.

5. **Accessible User Interface**

   Built on shadcn/ui with proper ARIA attributes, reduced motion support via `useReducedMotion()`, and dark mode support demonstrates accessibility awareness.

### Areas for Improvement

These areas could benefit from attention:

1. **No Test Coverage**
   - **Issue:** Zero automated tests exist in the codebase
   - **Impact:** Regression risk during refactoring, reduced confidence in deployments
   - **Suggestion:** Install Vitest as test runner, prioritize testing hooks (`useChatPersistence`, `useTitleGeneration`) and API routes first. Target 70% coverage as initial goal.

2. **Oversized Sidebar Component**
   - **Issue:** `Sidebar.tsx` is 572 lines with multiple responsibilities
   - **Impact:** Difficult to maintain, test, and reason about
   - **Suggestion:** Extract into focused components: `ConversationList.tsx`, `SettingsModal.tsx`, `UserMenu.tsx`. Each should be under 200 lines.

3. **Missing Error Boundaries**
   - **Issue:** No React error boundaries protect against component crashes
   - **Impact:** A single component error can crash the entire application
   - **Suggestion:** Add error boundaries around `ChatConversation`, `ContentBlock`, and `Sidebar` to gracefully handle failures.

4. **Unused Dependencies**
   - **Issue:** `@mui/material` appears in dependencies but is unused
   - **Impact:** Increased bundle size, potential security surface
   - **Suggestion:** Audit dependencies with `npm ls` and remove unused packages.

5. **Hardcoded User Identity**
   - **Issue:** User is hardcoded as "Dev User" placeholder
   - **Impact:** Multi-user scenarios not supported
   - **Suggestion:** Evaluate authentication needs. For personal use, current approach is fine. For production, consider NextAuth.js or Clerk.

### Suggested Next Steps

For developers new to this codebase:

1. **Start with CLAUDE.md** - Read the project-level CLAUDE.md file for comprehensive architecture documentation and development patterns.

2. **Trace a message flow** - Follow a message from `ChatInput` through `ChatProvider` to `/api/chat` and back. This illuminates the core data flow.

3. **Explore the hooks** - The custom hooks in `src/hooks/` encapsulate the most complex state logic. Understanding `useChatPersistence` and `useTitleGeneration` reveals key patterns.

4. **Run the development server** - Execute `npm run dev` and interact with the chat. Try different models and observe tool invocations in the browser DevTools Network tab.

5. **Modify a tool** - Add a parameter to an existing tool in `src/lib/ai/tools.ts` to understand the Zod schema pattern and type flow.

---

## Appendix: Dependency Graph

```
                                  ┌─────────────────┐
                                  │   page.tsx      │
                                  │ (Entry Point)   │
                                  └────────┬────────┘
                                           │
                     ┌─────────────────────┼─────────────────────┐
                     │                     │                     │
            ┌────────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
            │    Sidebar      │   │  ChatProvider   │   │  WelcomeScreen  │
            │  (Layout)       │   │   (Context)     │   │                 │
            └────────┬────────┘   └────────┬────────┘   └─────────────────┘
                     │                     │
                     │      ┌──────────────┼──────────────┐
                     │      │              │              │
            ┌────────▼──────▼──┐  ┌────────▼────────┐  ┌──▼─────────────────┐
            │useConversations  │  │useChatPersistence│ │useTitleGeneration  │
            └────────┬─────────┘  └────────┬────────┘  └────────┬───────────┘
                     │                     │                    │
            ┌────────▼─────────────────────▼────────┐  ┌────────▼───────────┐
            │           Dexie (IndexedDB)           │  │ /api/generate-title │
            └───────────────────────────────────────┘  └────────┬───────────┘
                                                                │
                                     ┌──────────────────────────┘
                                     │
                            ┌────────▼────────┐
                            │   /api/chat     │
                            │  (streaming)    │
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │   src/lib/ai/   │
                            │ (model, tools)  │
                            └────────┬────────┘
                                     │
                     ┌───────────────┼───────────────┐
                     │               │               │
            ┌────────▼────────┐ ┌────▼────────┐ ┌────▼──────────────┐
            │ @ai-sdk/openai  │ │ tools.ts    │ │   @tavily/core    │
            │ (OpenAI API)    │ │ (5 tools)   │ │ (Web Search)      │
            └─────────────────┘ └─────────────┘ └───────────────────┘
```

---

## Appendix: Database Schema

```typescript
// Dexie schema v1 - src/lib/db/schema.ts

interface Conversation {
  id: string;           // UUID
  title: string;        // Generated or fallback
  userId: string;       // User identifier
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id?: number;          // Auto-incremented
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;      // JSON stringified UIMessage.parts
  createdAt: Date;
}

// Indexes
conversations: 'id, updatedAt, userId'
messages: '++id, conversationId, userId, createdAt'
```

---

## Appendix: Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...              # OpenAI API key

# Optional - Web Search
TAVILY_API_KEY=tvly-...            # Tavily API key
WEB_SEARCH_ENABLED=true            # Enable web search tool

# Optional - Custom Backend
NEXT_PUBLIC_CHAT_API_URL=https://api.example.com  # Custom API base URL
```

---

*Report generated by Codebase Analysis Workflow*
