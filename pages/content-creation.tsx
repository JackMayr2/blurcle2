import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../components/LoadingSpinner';

type ContentType = 'newsletter' | 'memo' | 'emergency';
type InputMode = 'manual' | 'ai';

interface GeneratedContent {
    title: string;
    content: string;
    docId?: string;
    docUrl?: string;
}

export default function ContentCreation() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [inputMode, setInputMode] = useState<InputMode>('ai');
    const [contentType, setContentType] = useState<ContentType>('newsletter');
    const [description, setDescription] = useState('');
    const [manualContent, setManualContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

    if (status === 'loading') return <LoadingSpinner />;
    if (!session) {
        router.push('/');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contentType,
                    description,
                    content: inputMode === 'manual' ? manualContent : undefined,
                    mode: inputMode,
                }),
            });

            if (!response.ok) throw new Error('Failed to generate content');

            const data = await response.json();
            setGeneratedContent(data);
        } catch (error) {
            console.error('Error generating content:', error);
            alert('Failed to generate content. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Content Creation</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Content Type Selection */}
                        <div>
                            <label htmlFor="contentType" className="block text-sm font-medium text-gray-700">
                                Content Type
                            </label>
                            <select
                                id="contentType"
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value as ContentType)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="newsletter">Newsletter</option>
                                <option value="memo">Memo</option>
                                <option value="emergency">Emergency Communication</option>
                            </select>
                        </div>

                        {/* Input Mode Toggle */}
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700">Input Mode:</span>
                            <div className="flex items-center space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-indigo-600"
                                        name="inputMode"
                                        value="ai"
                                        checked={inputMode === 'ai'}
                                        onChange={(e) => setInputMode(e.target.value as InputMode)}
                                    />
                                    <span className="ml-2">AI Generated</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-indigo-600"
                                        name="inputMode"
                                        value="manual"
                                        checked={inputMode === 'manual'}
                                        onChange={(e) => setInputMode(e.target.value as InputMode)}
                                    />
                                    <span className="ml-2">Manual Entry</span>
                                </label>
                            </div>
                        </div>

                        {/* AI Description or Manual Content Input */}
                        <div>
                            {inputMode === 'ai' ? (
                                <>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Description for AI Generation
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="description"
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                                            placeholder="Describe what you want to communicate..."
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <label htmlFor="manualContent" className="block text-sm font-medium text-gray-700">
                                        Content
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="manualContent"
                                            rows={8}
                                            value={manualContent}
                                            onChange={(e) => setManualContent(e.target.value)}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                                            placeholder="Enter your content here..."
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isGenerating || (inputMode === 'ai' ? !description.trim() : !manualContent.trim())}
                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                                    ${isGenerating || (inputMode === 'ai' ? !description.trim() : !manualContent.trim())
                                        ? 'bg-gray-400'
                                        : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {inputMode === 'ai' ? 'Generating...' : 'Creating...'}
                                    </>
                                ) : (
                                    inputMode === 'ai' ? 'Generate Content' : 'Create Document'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Generated Content Preview */}
                    {generatedContent && (
                        <div className="mt-8 border-t border-gray-200 pt-8">
                            <h2 className="text-lg font-medium text-gray-900">Generated Document</h2>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">
                                    Your content has been saved to Google Drive.
                                </p>
                                <a
                                    href={generatedContent.docUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                >
                                    View Document
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 