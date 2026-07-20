import type { ChatMessage } from '../types/chat';
import { hasGroqApiKey, sendGroqMessage } from './groqClient';
import { sendPollinationsMessage } from './pollinationsClient';

export type { ChatMessage } from '../types/chat';

export interface ChatProviderInfo {
  id: 'groq' | 'pollinations';
  label: string;
}

/**
 * Groq is used when a key is configured (set VITE_GROQ_API_KEY locally for a
 * faster, higher-quality model when demoing). Otherwise falls back to a
 * free, keyless provider so the page works out of the box on the deployed
 * site, where no key is shipped.
 */
export function getChatProviderInfo(): ChatProviderInfo {
  return hasGroqApiKey()
    ? { id: 'groq', label: 'Groq (llama-3.3-70b-versatile)' }
    : { id: 'pollinations', label: 'Pollinations (free, no API key)' };
}

export function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  return hasGroqApiKey() ? sendGroqMessage(messages) : sendPollinationsMessage(messages);
}
