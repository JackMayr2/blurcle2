export type LLMProvider = 'openai' | 'anthropic' | 'mistral';

export interface LLMConfig {
    provider: LLMProvider;
    apiKey: string;
}

export interface ContentPrompt {
    type: 'newsletter' | 'memo' | 'emergency';
    description: string;
    tone?: string;
    length?: 'short' | 'medium' | 'long';
} 