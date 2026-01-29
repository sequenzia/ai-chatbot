# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed
- Replace AI Gateway with direct OpenAI API integration via `@ai-sdk/openai`
- Simplify model selector to OpenAI models only (gpt-5-nano, gpt-5-mini, gpt-5, gpt-4o, gpt-4o-mini)
- Update default chat model to gpt-4o
- Update title generation model to gpt-4o-mini
- Change environment variable from `AI_GATEWAY_API_KEY` to `OPENAI_API_KEY`

### Added
- Add `agent` parameter to chat API requests with hardcoded value "main" for mamba-server backend compatibility
- Add comprehensive MkDocs documentation for developers
  - Architecture overview with Mermaid dependency graphs
  - Data flow diagrams for message lifecycle, tool execution, and persistence
  - Getting started guide with environment setup and project structure
  - Module documentation for chat system, AI integration, rendering blocks, and persistence
  - Step-by-step tutorials for adding AI tools and extending persistence
  - API and component reference documentation
  - Supports Material theme with light/dark mode, code highlighting, and navigation tabs
- Add configurable backend URL via `NEXT_PUBLIC_CHAT_API_URL` environment variable
  - Enables frontend-only deployment connecting to external backend servers
  - When unset, uses built-in `/api/chat` and `/api/generate-title` endpoints (default)
- Add configurable OpenAI API mode via `OPENAI_API_MODE` environment variable
  - `chat-completions`: Use Chat Completions API (default)
  - `responses`: Use Responses API
- API key validation with clear error message when `OPENAI_API_KEY` is missing
- Model ID validation in `getModel()` function

### Removed
- AI Gateway multi-provider support (OpenAI, Anthropic, Google, DeepSeek, Baseten)
- Non-OpenAI models from model selector

### Fixed
- Fix reasoning message display not showing actual reasoning text content
- Fix reasoning panel auto-collapse after streaming ends
