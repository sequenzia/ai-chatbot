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
    "Generate an interactive form for collecting user input. Use for surveys, registrations, feedback forms, or any structured data collection.",
  inputSchema: FormContentDataSchema,
  execute: async (input) => input,
});

export const generateChart = tool<ChartContentData, ChartContentData>({
  description:
    'Generate a data visualization chart. Include "data" array with {label, value} objects.',
  inputSchema: ChartContentDataSchema,
  execute: async (input) => input,
});

export const generateCode = tool<CodeContentData, CodeContentData>({
  description: "Generate a code block with syntax highlighting.",
  inputSchema: CodeContentDataSchema,
  execute: async (input) => input,
});

export const generateCard = tool<CardContentData, CardContentData>({
  description:
    "Generate a rich content card for displaying structured information with optional media and actions.",
  inputSchema: CardContentDataSchema,
  execute: async (input) => input,
});

export const chatTools = {
  generateForm,
  generateChart,
  generateCode,
  generateCard,
};
