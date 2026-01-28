# Getting Started

This guide will help you set up your development environment and start contributing to the AI Chatbot project.

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18.x or later | `node --version` |
| npm | 9.x or later | `npm --version` |
| Git | Any recent version | `git --version` |

You'll also need:

- An **OpenAI API key** for chat functionality
- (Optional) A **Tavily API key** for web search functionality

## Installation

=== "npm"

    ```bash
    # Clone the repository
    git clone https://github.com/sequenzia/ai-chatbot.git
    cd ai-chatbot

    # Install dependencies
    npm install
    ```

=== "yarn"

    ```bash
    # Clone the repository
    git clone https://github.com/sequenzia/ai-chatbot.git
    cd ai-chatbot

    # Install dependencies
    yarn install
    ```

=== "pnpm"

    ```bash
    # Clone the repository
    git clone https://github.com/sequenzia/ai-chatbot.git
    cd ai-chatbot

    # Install dependencies
    pnpm install
    ```

## Environment Setup

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Configure the required environment variables:

```env title=".env.local"
# Required - OpenAI API key for chat completions
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional - Tavily API key for web search tool
TAVILY_API_KEY=tvly-your-tavily-api-key-here

# Optional - Custom backend URL (for frontend-only deployment)
# NEXT_PUBLIC_CHAT_API_URL=https://api.example.com
```

### Getting API Keys

#### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** in the sidebar
4. Click **Create new secret key**
5. Copy the key and add it to your `.env.local`

!!! warning "Keep your API key secret"
    Never commit your `.env.local` file or share your API key publicly.

#### Tavily API Key (Optional)

1. Go to [Tavily](https://tavily.com/)
2. Sign up for an account
3. Navigate to your dashboard
4. Copy your API key

## Running the Development Server

Start the development server with Turbopack:

=== "npm"

    ```bash
    npm run dev
    ```

=== "yarn"

    ```bash
    yarn dev
    ```

=== "pnpm"

    ```bash
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

!!! success "You should see"
    The welcome screen with a chat input and suggestion cards.

## Verifying Your Setup

### Test Chat Functionality

1. Type a message in the chat input
2. Press Enter or click Send
3. Wait for the AI response to stream in

### Test Tool Functionality

Try these prompts to test each AI tool:

| Prompt | Expected Tool |
|--------|---------------|
| "Create a contact form" | Form block |
| "Show a chart of monthly sales: Jan 100, Feb 150, Mar 200" | Chart block |
| "Write a Python function to calculate factorial" | Code block |
| "Create a product card for a laptop" | Card block |

### Test Persistence

1. Send a few messages
2. Refresh the page
3. Your conversation should be preserved in the sidebar

## Common Issues

### "OPENAI_API_KEY is not set"

Ensure your `.env.local` file exists and contains a valid API key:

```bash
# Check if the file exists
cat .env.local

# Verify the key is set (don't share the output!)
grep OPENAI_API_KEY .env.local
```

### "Module not found" errors

Try clearing the node_modules and reinstalling:

```bash
rm -rf node_modules
rm -rf .next
npm install
```

### Port 3000 is already in use

Either stop the other process or use a different port:

```bash
npm run dev -- -p 3001
```

### IndexedDB errors in incognito mode

Some browsers restrict IndexedDB in private/incognito mode. Use a regular browser window for development.

## Next Steps

Now that your environment is set up:

1. **[Project Structure](project-structure.md)** - Learn how the codebase is organized
2. **[Development Workflow](development.md)** - Understand the development commands and workflow
3. **[Architecture Overview](../architecture/index.md)** - Understand the high-level design
4. **[Modules](../modules/index.md)** - Deep dive into each module
