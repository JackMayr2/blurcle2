import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import { authOptions } from '@/lib/auth';
import { LLMService } from '@/utils/llm';

interface GoogleDocInfo {
    title: string;
    docId: string;
    docUrl: string;
}

async function createGoogleDoc(accessToken: string, content: { title: string; content: string }): Promise<GoogleDocInfo> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
        access_token: accessToken
    });

    const docs = google.docs({ version: 'v1', auth: oauth2Client });

    // Create the document
    const doc = await docs.documents.create({
        requestBody: {
            title: content.title,
        },
    });

    if (!doc.data.documentId) {
        throw new Error('Failed to create document');
    }

    // Insert the content
    await docs.documents.batchUpdate({
        documentId: doc.data.documentId!, // Add non-null assertion
        requestBody: {
            requests: [{
                insertText: {
                    location: {
                        index: 1,
                    },
                    text: content.content,
                },
            }],
        },
    });

    return {
        title: content.title,
        docId: doc.data.documentId,
        docUrl: `https://docs.google.com/document/d/${doc.data.documentId}/edit`
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        console.log('Session:', session); // Debug session

        if (!session?.accessToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { contentType, description, content, mode } = req.body;
        console.log('Request body:', { contentType, description, content, mode });

        let finalContent: string;
        if (mode === 'manual') {
            finalContent = content;
        } else {
            try {
                console.log('OpenAI API Key:', process.env.OPENAI_API_KEY?.slice(0, 10) + '...'); // Debug API key (safely)

                const llm = new LLMService({
                    provider: 'openai',
                    apiKey: process.env.OPENAI_API_KEY!
                });

                finalContent = await llm.generateContent({
                    type: contentType,
                    description
                });

                console.log('Content generated successfully'); // Debug successful generation
            } catch (error: any) {
                console.error('OpenAI error details:', {
                    name: error?.name || 'Unknown error',
                    message: error?.message || 'No error message',
                    cause: error?.cause,
                    stack: error?.stack
                });
                throw error;
            }
        }

        try {
            const docInfo = await createGoogleDoc(session.accessToken, {
                title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} - ${new Date().toLocaleDateString()}`,
                content: finalContent
            });

            return res.status(200).json({
                title: docInfo.title,
                content: finalContent,
                docId: docInfo.docId,
                docUrl: docInfo.docUrl
            });
        } catch (error) {
            console.error('Google Doc creation error:', error);
            throw error;
        }
    } catch (error: unknown) {
        console.error('Full error details:', error);
        return res.status(500).json({
            error: 'Failed to generate content',
            details: error instanceof Error ? {
                message: error.message,
                name: error.name,
                stack: error.stack
            } : String(error)
        });
    }
} 