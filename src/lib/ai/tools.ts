import { tool } from "ai";
import {
  FormContentDataSchema,
  ChartContentDataSchema,
  CodeContentDataSchema,
  CardContentDataSchema,
  type FormContentData,
  type ChartContentData,
  type CodeContentData,
  type CardContentData,
} from "@/types/content-blocks";

export const generateForm = tool<FormContentData, FormContentData>({
  description:
    "Generate an interactive form for COLLECTING user input. Use ONLY when the user needs to INPUT or SUBMIT data (surveys, registrations, contact forms, feedback forms, order forms, applications). Do NOT use for displaying information - use generateCard instead.",
  inputSchema: FormContentDataSchema,
  execute: async (input) => input,
});

export const generateChart = tool<ChartContentData, ChartContentData>({
  description:
    'Generate a data VISUALIZATION chart for numerical data. Use ONLY when the user wants to VISUALIZE statistics, trends, or compare numbers (line charts, bar charts, pie charts, area charts). Requires a "data" array with {label, value} objects. Do NOT use for collecting input or showing code.',
  inputSchema: ChartContentDataSchema,
  execute: async (input) => input,
});

export const generateCode = tool<CodeContentData, CodeContentData>({
  description:
    "Generate a syntax-highlighted CODE block. Use ONLY when the user asks for CODE, PROGRAMMING, functions, scripts, or technical implementation examples. Do NOT use for displaying non-code text - use generateCard instead.",
  inputSchema: CodeContentDataSchema,
  execute: async (input) => input,
});

export const generateCard = tool<CardContentData, CardContentData>({
  description:
    "Generate a rich content CARD for DISPLAYING or SHOWCASING structured information (profiles, products, summaries, previews). Supports optional images and action buttons. Do NOT use for collecting user input (use generateForm), showing code (use generateCode), or visualizing numerical data (use generateChart).",
  inputSchema: CardContentDataSchema,
  execute: async (input) => input,
});

export const chatTools = {
  generateForm,
  generateChart,
  generateCode,
  generateCard,
};
