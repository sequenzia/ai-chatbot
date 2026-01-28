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
- API key validation with clear error message when `OPENAI_API_KEY` is missing
- Model ID validation in `getModel()` function

### Removed
- AI Gateway multi-provider support (OpenAI, Anthropic, Google, DeepSeek, Baseten)
- Non-OpenAI models from model selector

### Fixed
- Fix reasoning message display not showing actual reasoning text content
- Fix reasoning panel auto-collapse after streaming ends
