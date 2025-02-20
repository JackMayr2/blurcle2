import OpenAI from 'openai';
// import Anthropic from '@anthropic-ai/sdk';
import { LLMConfig, ContentPrompt } from '../types/llm';

export class LLMService {
    private openai: OpenAI;
    // private anthropic: Anthropic;

    constructor(config: LLMConfig) {
        if (!config.apiKey) {
            throw new Error('OpenAI API key is required');
        }

        this.openai = new OpenAI({
            apiKey: config.apiKey,
            dangerouslyAllowBrowser: false
        });

        // this.anthropic = new Anthropic({
        //     apiKey: process.env.ANTHROPIC_API_KEY,
        // });
    }

    async generateContent(prompt: ContentPrompt): Promise<string> {
        if (!prompt.type || !prompt.description) {
            throw new Error('Invalid prompt: type and description are required');
        }

        const systemPrompt = this.getSystemPrompt(prompt.type);

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
            });

            if (!response.choices[0]?.message?.content) {
                throw new Error('No content received from OpenAI');
            }

            return response.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI API error:', {
                name: error.name,
                message: error.message,
                cause: error.cause
            });
            throw error;
        }
    }

    private getSystemPrompt(type: string): string {
        const prompts = {
            newsletter: `You are an expert at creating school newsletters. 
                Create a professional and engaging newsletter that includes:
                - A compelling headline
                - Key updates and announcements
                - Important dates
                - Community highlights
                Format the content with appropriate sections and maintain a positive, informative tone.`,

            memo: `You are an expert at creating professional memos. 
                Create a clear and concise memo that includes:
                - Subject line
                - Purpose statement
                - Key points
                - Required actions
                - Timeline if applicable
                Keep the tone professional and direct.`,

            emergency: `You are an expert at creating emergency communications. 
                Create an urgent but calm communication that includes:
                - Clear statement of the situation
                - Immediate actions required
                - Safety instructions if needed
                - Contact information
                - Next steps
                Maintain a serious but reassuring tone.`
        };

        return prompts[type] || prompts.memo;
    }
} 