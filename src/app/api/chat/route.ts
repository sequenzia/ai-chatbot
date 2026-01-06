import { convertToModelMessages, streamText, type UIMessage, gateway } from 'ai';
import { config } from '@/config';
import { chatTools } from '@/lib/ai/tools';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, model }: { messages: UIMessage[]; model?: string } = await req.json();

    const selectedModel = model || config.ai.defaultModel;

    const result = streamText({
      model: gateway(selectedModel),
      system: `You are a helpful assistant with access to tools for creating interactive content.

When appropriate, use the available tools to enhance your responses:
- generateForm: Create interactive forms for collecting user input (surveys, registrations, etc.)
- generateChart: Create data visualizations (line, bar, pie, or area charts)
- generateCode: Display code with syntax highlighting
- generateCard: Create rich content cards with optional media and actions

Important: When you use a tool, do NOT repeat the tool's content in your text response. The tool output will be displayed automatically. Only provide brief context or follow-up if needed.`,
      messages: await convertToModelMessages(messages),
      tools: chatTools,
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
