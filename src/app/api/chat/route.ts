import { convertToModelMessages, streamText, stepCountIs, type UIMessage } from 'ai';
import { config } from '@/config';
import { chatTools } from '@/lib/ai/tools';
import { getModel } from '@/lib/ai/model';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { MODELS, REASONING_LEVELS, type ReasoningLevel } from '@/lib/ai/models';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      messages,
      model,
      reasoningLevel,
    }: { messages: UIMessage[]; model?: string; reasoningLevel?: string } =
      await req.json();

    const selectedModel = model || config.ai.defaultModel;

    // Validate reasoning level against allowed values
    const validatedReasoningLevel: ReasoningLevel | undefined =
      reasoningLevel && REASONING_LEVELS.includes(reasoningLevel as ReasoningLevel)
        ? (reasoningLevel as ReasoningLevel)
        : undefined;

    // Check if the selected model supports reasoning
    const modelConfig = MODELS.find((m) => m.id === selectedModel);
    const shouldUseReasoning =
      modelConfig?.supportsReasoning &&
      validatedReasoningLevel &&
      validatedReasoningLevel !== 'none';

    const result = streamText({
      model: getModel(selectedModel),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools: chatTools,
      stopWhen: stepCountIs(3),
      // Pass reasoning effort via providerOptions when applicable
      ...(shouldUseReasoning && {
        providerOptions: {
          openai: { reasoningEffort: validatedReasoningLevel },
        },
      }),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
