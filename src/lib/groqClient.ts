import type { ChatMessage } from '../types/chat';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export function hasGroqApiKey(): boolean {
  return Boolean(import.meta.env.VITE_GROQ_API_KEY);
}

/**
 * Calls Groq's OpenAI-compatible chat completions endpoint directly from the
 * browser. Fine for this demo, but note the API key ships in the client
 * bundle — for a real deployment, proxy this call through a backend so the
 * key isn't exposed to end users.
 */
export async function sendGroqMessage(messages: ChatMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error('Missing VITE_GROQ_API_KEY. Add it to a .env file and restart the dev server.');
  }

  const model = (import.meta.env.VITE_GROQ_MODEL as string | undefined) || DEFAULT_MODEL;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Groq API error (${response.status}): ${body || response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('Unexpected response shape from Groq API.');
  }
  return content;
}
