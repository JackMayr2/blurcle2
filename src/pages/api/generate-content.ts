import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check authentication
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { prompt, contentType } = req.body;

        // Validate request body
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt field is missing in request body' });
        }

        if (!contentType) {
            return res.status(400).json({ error: 'Content type is required' });
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is not configured');
            return res.status(500).json({ error: 'OpenAI API key is not configured' });
        }

        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Create a system message based on content type
        let systemMessage = "You are a professional content creator for school districts.";

        switch (contentType) {
            case 'newsletter':
                systemMessage += " Create a professional newsletter that is informative, engaging, and appropriate for school community members.";
                break;
            case 'announcement':
                systemMessage += " Create a clear, concise announcement that effectively communicates important information to the school community.";
                break;
            case 'event':
                systemMessage += " Create an engaging event description that includes all necessary details and encourages participation.";
                break;
            case 'policy':
                systemMessage += " Create a well-structured policy document that is clear, comprehensive, and uses appropriate formal language.";
                break;
            case 'email':
                systemMessage += " Create a professional email template that is clear, concise, and maintains an appropriate tone for school communications.";
                break;
            default:
                systemMessage += " Create professional content based on the provided prompt.";
        }

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: prompt }
            ],
            max_tokens: 1500,
        });

        const generatedContent = completion.choices[0]?.message?.content || 'No content generated';

        return res.status(200).json({ content: generatedContent });
    } catch (error) {
        console.error('Error in generate-content API:', error);

        // Provide more detailed error information
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Check for specific OpenAI errors
        if (errorMessage.includes('API key')) {
            return res.status(500).json({ error: 'Invalid OpenAI API key' });
        } else if (errorMessage.includes('rate limit')) {
            return res.status(429).json({ error: 'OpenAI rate limit exceeded. Please try again later.' });
        }

        return res.status(500).json({
            error: 'Failed to generate content',
            details: errorMessage
        });
    }
} 