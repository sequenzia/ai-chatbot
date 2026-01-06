import { z } from "zod";

// Form field option schema
export const FormFieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export type FormFieldOption = z.infer<typeof FormFieldOptionSchema>;

// Form field schema
export const FormFieldSchema = z.object({
  id: z.string(),
  type: z.enum([
    "text",
    "textarea",
    "select",
    "checkbox",
    "radio",
    "date",
    "slider",
    "file",
    "number",
    "email",
  ]),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  options: z.array(FormFieldOptionSchema).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
});

export type FormField = z.infer<typeof FormFieldSchema>;

// Form content data
export const FormContentDataSchema = z.object({
  type: z.literal("form").describe('Must always be exactly "form"'),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
  submitLabel: z.string().optional(),
});

export type FormContentData = z.infer<typeof FormContentDataSchema>;

// Chart data point
export const ChartDataPointSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>;

// Chart content data
export const ChartContentDataSchema = z.object({
  type: z.literal("chart").describe('Must always be exactly "chart"'),
  chartType: z.enum(["line", "bar", "pie", "area"]),
  title: z.string(),
  description: z.string().optional(),
  data: z.array(ChartDataPointSchema),
});

export type ChartContentData = z.infer<typeof ChartContentDataSchema>;

// Code content data
export const CodeContentDataSchema = z.object({
  type: z.literal("code").describe('Must always be exactly "code"'),
  language: z.string(),
  filename: z.string().optional(),
  code: z.string(),
  editable: z.boolean().optional(),
  showLineNumbers: z.boolean().optional(),
});

export type CodeContentData = z.infer<typeof CodeContentDataSchema>;

// Card media schema
export const CardMediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string(),
  alt: z.string().optional(),
});

export type CardMedia = z.infer<typeof CardMediaSchema>;

// Card action schema
export const CardActionSchema = z.object({
  label: z.string(),
  action: z.string(),
  variant: z
    .enum(["default", "secondary", "destructive", "outline"])
    .optional(),
});

export type CardAction = z.infer<typeof CardActionSchema>;

// Card content data
export const CardContentDataSchema = z.object({
  type: z.literal("card"),
  title: z.string(),
  description: z.string().optional(),
  content: z.string().optional(),
  media: CardMediaSchema.optional(),
  actions: z.array(CardActionSchema).optional(),
});

export type CardContentData = z.infer<typeof CardContentDataSchema>;

// Union of all content block types
export type ContentBlock =
  | FormContentData
  | ChartContentData
  | CodeContentData
  | CardContentData;

// Content block schema (discriminated union)
export const ContentBlockSchema = z.discriminatedUnion("type", [
  FormContentDataSchema,
  ChartContentDataSchema,
  CodeContentDataSchema,
  CardContentDataSchema,
]);
