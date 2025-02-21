import OpenAI from 'openai';
import type { LLMConfig, ContentPrompt } from '@/types/llm';

type PromptType = 'newsletter' | 'memo' | 'emergency';

export class LLMService {
    private openai: OpenAI;
    private readonly prompts: Record<PromptType, string> = {
        newsletter: `You are an expert at creating school newsletters...`,
        memo: `You are an expert at creating professional memos...`,
        emergency: `You are an expert at creating emergency communications...`
    };

    constructor(config: LLMConfig) {
        if (!config.apiKey) {
            throw new Error('OpenAI API key is required');
        }

        this.openai = new OpenAI({
            apiKey: config.apiKey,
            dangerouslyAllowBrowser: false
        });
    }

    async generateContent(prompt: ContentPrompt): Promise<string> {
        if (!prompt.type || !prompt.description) {
            throw new Error('Invalid prompt: type and description are required');
        }

        const systemPrompt = this.getSystemPrompt(prompt.type as PromptType);

        try {
            console.log('Sending request to OpenAI with prompt type:', prompt.type);

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: prompt.description
                    }
                ],
                temperature: 0.7,
                max_tokens: 1500
            });

            if (!response.choices[0].message.content) {
                throw new Error('No content generated');
            }

            return response.choices[0].message.content;
        } catch (error: unknown) {
            console.error('OpenAI API error:', {
                name: error instanceof Error ? error.name : 'Unknown error',
                message: error instanceof Error ? error.message : String(error),
                cause: error instanceof Error ? error.cause : undefined
            });
            throw error;
        }
    }

    private getSystemPrompt(type: PromptType): string {
        return this.prompts[type] || this.prompts.memo;
    }
} 