import { convertToModelMessages, streamText, stepCountIs, type UIMessage } from 'ai';
import { chatTools } from '@/lib/ai/tools';
import { getModel } from '@/lib/ai/model';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { DEFAULT_MODEL } from '@/lib/ai/models';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, model, agent }: { messages: UIMessage[]; model?: string; agent?: string } = await req.json();

    const selectedModel = model || DEFAULT_MODEL.id;

    const result = streamText({
      model: getModel(selectedModel),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools: chatTools,
      stopWhen: stepCountIs(3),
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
