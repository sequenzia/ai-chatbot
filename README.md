# AI Chatbot

A modern AI chatbot template built with Next.js 15, Vercel AI SDK, and Tailwind CSS v4.

## Features

- **Multi-Provider Support** - Switch between AI providers (OpenAI, Anthropic, Google, DeepSeek) via AI Gateway
- **Streaming Responses** - Real-time streaming chat with the AI SDK
- **Chat History Persistence** - Conversations saved locally with IndexedDB via Dexie
- **Smart Title Generation** - LLM-powered conversation titles generated automatically after first exchange
- **AI Elements UI** - Pre-built components from Vercel AI SDK (conversation, message, prompt-input, model-selector)
- **Dark/Light Mode** - System-aware theme with manual toggle
- **Responsive Design** - Mobile-first design with collapsible sidebar
- **Accessibility** - Reduced motion support, proper ARIA labels
- **Interactive Content Blocks** - Forms, charts, code blocks, and cards via AI tools

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **AI**: Vercel AI SDK v6 with AI Gateway and AI Elements
- **Storage**: Dexie (IndexedDB) for local chat persistence
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **UI Components**: shadcn/ui

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

# Add your AI Gateway API key to .env.local
```

### Environment Variables

```env
# Required
AI_GATEWAY_API_KEY=your_api_key_here

# Optional - AI Model Configuration
AI_DEFAULT_MODEL=anthropic/claude-sonnet-4
AI_TITLE_MODEL=anthropic/claude-haiku-4.5
AI_TITLE_MAX_LENGTH=50
AI_TITLE_TIMEOUT_MS=10000
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_GATEWAY_API_KEY` | Yes | - | API key for AI Gateway |
| `AI_DEFAULT_MODEL` | No | `anthropic/claude-sonnet-4` | Default model for chat |
| `AI_TITLE_MODEL` | No | `anthropic/claude-haiku-4.5` | Model for title generation |
| `AI_TITLE_MAX_LENGTH` | No | `50` | Max title length (chars) |
| `AI_TITLE_TIMEOUT_MS` | No | `10000` | Title generation timeout (ms) |

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
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # AI streaming endpoint
│   │   └── generate-title/route.ts # Title generation endpoint
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main chat page
├── components/
│   ├── ai-elements/            # AI SDK UI components
│   │   ├── conversation.tsx    # Conversation wrapper
│   │   ├── message.tsx         # Message components
│   │   ├── prompt-input.tsx    # Input textarea
│   │   ├── model-selector.tsx  # Model picker dialog
│   │   ├── suggestion.tsx      # Suggestion buttons
│   │   └── loader.tsx          # Loading indicators
│   ├── chat/
│   │   ├── ChatProvider.tsx    # useChat wrapper + persistence
│   │   ├── ChatConversation.tsx # Message list with auto-scroll
│   │   ├── ChatMessageItem.tsx  # Individual message rendering
│   │   └── ChatInput.tsx        # Input + model selector
│   ├── blocks/                 # Interactive content blocks
│   │   ├── FormContent.tsx     # Dynamic form rendering
│   │   ├── ChartContent.tsx    # Data visualization
│   │   ├── CodeContent.tsx     # Syntax-highlighted code
│   │   └── CardContent.tsx     # Rich content cards
│   ├── layout/
│   │   └── Sidebar.tsx         # Navigation + chat history
│   ├── providers/
│   │   └── ThemeProvider.tsx   # Theme context
│   └── ui/                     # shadcn/ui components
├── config.ts                   # Environment configuration
├── hooks/
│   ├── useChatPersistence.ts  # Message save/load with IndexedDB
│   ├── useConversations.ts    # Conversation list management
│   ├── useTitleGeneration.ts  # LLM title generation with retry
│   └── ...                    # Other custom hooks
├── lib/
│   ├── ai/
│   │   ├── models.ts          # AI model definitions
│   │   └── tools.ts           # AI tool definitions
│   ├── db/
│   │   ├── schema.ts          # Dexie database schema
│   │   ├── types.ts           # Database type definitions
│   │   └── index.ts           # Database instance export
│   ├── motion/variants.ts     # Animation variants
│   └── utils.ts               # Utility functions
├── styles/
│   ├── tailwind.css           # Tailwind imports
│   └── theme.css              # CSS custom properties
└── types/
    └── message.ts             # TypeScript types
```

## Available Models

The chatbot supports multiple AI providers through AI Gateway:

| Model | Provider |
|-------|----------|
| GPT-OSS 120B | Baseten |
| GPT-5 Nano | OpenAI |
| GPT-5 Mini | OpenAI |
| GPT-4o | OpenAI |
| GPT-4o Mini | OpenAI |
| Claude Haiku 4.5 | Anthropic |
| Gemini 2.5 Flash Lite | Google |
| DeepSeek V3.2 | DeepSeek |

## Customization

### Adding New Models

Edit `src/lib/ai/models.ts`:

```typescript
export const MODELS = [
  { id: 'provider/model-name', name: 'Display Name', provider: 'provider' },
  // ...
] as const;
```

### Theming

Theme variables are defined in `src/styles/theme.css` using CSS custom properties. The theme supports both light and dark modes.

## License

MIT
