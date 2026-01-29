# AI Chatbot Developer Documentation

Welcome to the AI Chatbot developer documentation. This guide will help you understand the architecture, contribute to the codebase, and extend the application with new features.

## Overview

This is a modular monolith AI chatbot application built with modern technologies:

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 15.0.0 |
| React | React | 18.3.1 |
| AI | Vercel AI SDK | 6.0.12 |
| AI Provider | @ai-sdk/openai | 3.0.21 |
| AI Search | @tavily/core | 0.6.4 |
| Database | Dexie (IndexedDB) | 4.2.1 |
| Styling | Tailwind CSS | 4.0.0 |
| Animation | Framer Motion | 12.23.24 |
| Forms | react-hook-form | 7.55.0 |
| Validation | Zod | 3.23.0 |
| Charts | recharts | 2.15.2 |
| Code Syntax | shiki | 3.20.0 |

## Key Characteristics

- **Client-server split**: React components handle UI, Next.js API routes handle AI interactions
- **Provider pattern**: State management via `ChatProvider` and `ThemeProvider`
- **Tool-based AI architecture**: 5 interactive tools (forms, charts, code, cards, web search)
- **Local-first persistence**: IndexedDB via Dexie with delayed conversation creation
- **Flexible deployment**: Full-stack or frontend-only (via `NEXT_PUBLIC_CHAT_API_URL`)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/sequenzia/ai-chatbot.git
cd ai-chatbot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation Sections

<div class="grid cards" markdown>

-   :material-sitemap:{ .lg .middle } **Architecture**

    ---

    Understand the high-level architecture, module dependencies, and design decisions.

    [:octicons-arrow-right-24: Architecture Overview](architecture/index.md)

-   :material-rocket-launch:{ .lg .middle } **Getting Started**

    ---

    Set up your development environment and learn the project structure.

    [:octicons-arrow-right-24: Getting Started](getting-started/index.md)

-   :material-view-module:{ .lg .middle } **Modules**

    ---

    Deep dive into each module: chat system, AI integration, rendering blocks, and persistence.

    [:octicons-arrow-right-24: Module Documentation](modules/index.md)

-   :material-school:{ .lg .middle } **Tutorials**

    ---

    Step-by-step guides for common tasks like adding new AI tools.

    [:octicons-arrow-right-24: Tutorials](tutorials/index.md)

-   :material-book-open-variant:{ .lg .middle } **Reference**

    ---

    API documentation and component reference.

    [:octicons-arrow-right-24: Reference](reference/index.md)

</div>

## Entry Points

When exploring the codebase, start with these key files:

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main chat UI entry point |
| `src/app/api/chat/route.ts` | Streaming AI endpoint |
| `src/components/chat/ChatProvider.tsx` | Central state management |
| `src/lib/ai/tools.ts` | AI tool definitions |
| `src/lib/db/schema.ts` | Database schema |

## Environment Variables

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - enables web search tool
TAVILY_API_KEY=your_tavily_api_key_here

# Optional - custom backend URL
NEXT_PUBLIC_CHAT_API_URL=https://api.example.com
```

## Contributing

1. Read the [Architecture Overview](architecture/index.md) to understand the codebase
2. Follow the [Getting Started](getting-started/index.md) guide to set up your environment
3. Check the [Tutorials](tutorials/index.md) for guidance on common tasks
4. Use the [Reference](reference/index.md) for API and component details
