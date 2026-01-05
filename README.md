# AI Chatbot

A modern AI chatbot template built with Next.js 15, Vercel AI SDK, and Tailwind CSS v4.

## Features

- **Multi-Provider Support** - Switch between AI providers (Anthropic, OpenAI, Google) via AI Gateway
- **Streaming Responses** - Real-time streaming chat with the AI SDK
- **Dark/Light Mode** - System-aware theme with manual toggle
- **Responsive Design** - Mobile-first design with collapsible sidebar
- **Accessibility** - Reduced motion support, proper ARIA labels

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **AI**: Vercel AI SDK v6 with AI Gateway
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
AI_GATEWAY_API_KEY=your_api_key_here
```

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
│   ├── api/chat/route.ts    # AI streaming endpoint
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main chat page
├── components/
│   ├── chat/
│   │   ├── ChatProvider.tsx    # useChat wrapper + model state
│   │   ├── ChatContainer.tsx   # Message list with auto-scroll
│   │   ├── ChatMessage.tsx     # Message rendering
│   │   └── InputComposer.tsx   # Input + model selector
│   ├── layout/
│   │   └── Sidebar.tsx         # Navigation sidebar
│   ├── providers/
│   │   └── ThemeProvider.tsx   # Theme context
│   └── ui/                     # shadcn/ui components
├── config.ts                   # Environment configuration
├── hooks/                      # Custom React hooks
├── lib/
│   ├── ai/models.ts           # AI model definitions
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
| Claude Sonnet 4 | Anthropic |
| Claude Haiku | Anthropic |
| GPT-4o | OpenAI |
| GPT-4o Mini | OpenAI |
| Gemini 1.5 Pro | Google |
| Gemini 1.5 Flash | Google |

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
