import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000, // 30 second timeout for OpenAI
    maxRetries: 3,
});

// Set response time limit to 60 seconds
export const maxDuration = 60;

// Enable streaming responses
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the access token from the session
        const accessToken = session.accessToken as string;
        if (!accessToken) {
            return Response.json({ error: 'Google Drive access token not found' }, { status: 401 });
        }

        // Create OAuth2 client
        const oauth2Client = new OAuth2Client();
        oauth2Client.setCredentials({
            access_token: accessToken
        });

        // Parse the request body
        const body = await request.json();
        const { contentType, description, content, mode } = body;

        if (!contentType || (mode === 'ai' && !description) || (mode === 'manual' && !content)) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate content if using AI mode
        let finalContent = content;
        let title = '';

        if (mode === 'ai') {
            try {
                const prompt = `Create a ${contentType} for a school district based on the following description: ${description}\n\nPlease provide both a title and content in the following format:\nTITLE: [Your title here]\nCONTENT: [Your content here]`;

                const completion = await openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: "You are a professional communication specialist for a school district. Write in a clear, professional tone appropriate for school district communications."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                });

                const response = completion.choices[0]?.message?.content;
                if (!response) {
                    throw new Error('No response from AI');
                }

                // Extract title and content from the AI response
                const titleMatch = response.match(/TITLE:\s*(.*)/);
                const contentMatch = response.match(/CONTENT:\s*([\s\S]*)/);

                title = titleMatch?.[1] || `${contentType} - ${new Date().toLocaleDateString()}`;
                finalContent = contentMatch?.[1] || response;
            } catch (error) {
                console.error('Error generating content with AI:', error);
                return Response.json({
                    error: 'Failed to generate content with AI',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }, { status: 500 });
            }
        } else {
            title = `${contentType} - ${new Date().toLocaleDateString()}`;
            finalContent = content;
        }

        try {
            // Create a new document in Google Drive
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            const docs = google.docs({ version: 'v1', auth: oauth2Client });

            // Create an empty document
            const fileMetadata = {
                name: title,
                mimeType: 'application/vnd.google-apps.document',
            };

            const file = await drive.files.create({
                requestBody: fileMetadata,
                fields: 'id',
            });

            const documentId = file.data.id;
            if (!documentId) {
                throw new Error('Failed to create Google Doc');
            }

            // Update the document content
            await docs.documents.batchUpdate({
                documentId,
                requestBody: {
                    requests: [
                        {
                            insertText: {
                                location: {
                                    index: 1,
                                },
                                text: `${title}\n\n${finalContent}`,
                            },
                        },
                    ],
                },
            });

            // Return the document details
            return Response.json({
                title,
                content: finalContent,
                docId: documentId,
                docUrl: `https://docs.google.com/document/d/${documentId}/edit`,
            });
        } catch (error) {
            console.error('Error creating Google Doc:', error);
            return Response.json({
                error: 'Failed to create Google Doc',
                details: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in generate-content:', error);
        return Response.json({
            error: 'Failed to generate content',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 