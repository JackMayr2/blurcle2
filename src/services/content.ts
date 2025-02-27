import { api } from '@/lib/api';

export type ContentType = 'newsletter' | 'announcement' | 'event' | 'policy' | 'email';

interface GenerateContentParams {
    prompt: string;
    contentType: ContentType;
}

interface GenerateContentResponse {
    content: string;
}

/**
 * Generate content using the OpenAI API
 */
export async function generateContent(params: GenerateContentParams) {
    return api.post<GenerateContentResponse>('/api/generate-content', params);
}

/**
 * Save content to Google Drive
 */
export async function saveContentToDrive(content: string, fileName: string, folderId?: string) {
    return api.post<{ fileId: string }>('/api/save-to-drive', {
        content,
        fileName,
        folderId
    });
}

/**
 * Content service with all content-related API functions
 */
export const contentService = {
    generateContent,
    saveContentToDrive
}; 