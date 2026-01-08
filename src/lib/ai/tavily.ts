import "server-only";
import { tool } from "ai";
import { tavily } from "@tavily/core";
import { z } from "zod";

// Lazy-initialize Tavily client to avoid build-time errors
let _client: ReturnType<typeof tavily> | null = null;

function getClient() {
  if (!_client) {
    _client = tavily();
  }
  return _client;
}

/**
 * Web search tool using Tavily API
 *
 * Performs real-time web searches optimized for LLM consumption.
 * Returns search results with titles, URLs, content snippets, and an optional AI-generated answer.
 */
export const webSearch = tool({
  description:
    "Search the web for current information. Use for recent events, news, live data, or when users explicitly ask to search the internet. Always cite sources when using search results.",
  inputSchema: z.object({
    query: z.string().describe("The search query to execute"),
    topic: z
      .enum(["general", "news", "finance"])
      .optional()
      .describe("Search category: general (default), news, or finance"),
    maxResults: z
      .number()
      .min(1)
      .max(10)
      .optional()
      .describe("Number of results to return (default: 5, max: 10)"),
  }),
  execute: async ({
    query,
    topic = "general",
    maxResults = 5,
  }: {
    query: string;
    topic?: "general" | "news" | "finance";
    maxResults?: number;
  }) => {
    const response = await getClient().search(query, {
      searchDepth: "basic",
      topic,
      maxResults,
      includeAnswer: true,
    });

    return {
      query,
      answer: response.answer,
      results: response.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })),
    };
  },
});

/**
 * Export grouped tools object for convenience
 */
export const webSearchTools = {
  webSearch,
};
