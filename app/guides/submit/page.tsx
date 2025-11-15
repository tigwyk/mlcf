'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitGuide() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    summary: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit guide');
      }

      router.push('/guides');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Write a Strategy Guide
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Share your advanced coin-flipping tactics and game theory analysis
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-lg">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Guide Title *
            </label>
            <input
              type="text"
              id="title"
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Advanced Psychology Tactics for Competitive Flipping"
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium mb-2">
              Your Name *
            </label>
            <input
              type="text"
              id="author"
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="CoinMaster2000"
            />
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium mb-2">
              Summary
            </label>
            <textarea
              id="summary"
              rows={2}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="A brief overview of what your guide covers"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="content" className="block text-sm font-medium">
                Guide Content (Markdown) *
              </label>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {preview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {preview ? (
              <div className="w-full min-h-[400px] px-4 py-2 bg-gray-700 border border-gray-600 rounded prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{formData.content || 'Nothing to preview yet...'}</div>
              </div>
            ) : (
              <textarea
                id="content"
                required
                rows={20}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 font-mono text-sm"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="# Introduction&#10;&#10;Write your guide here using Markdown formatting...&#10;&#10;## Section 1&#10;&#10;Your content here..."
              />
            )}
            <p className="text-sm text-gray-400 mt-2">
              Use Markdown formatting (headings, lists, bold, italic, etc.)
            </p>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="strategy, beginner, advanced, psychology (comma separated)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-colors"
          >
            {loading ? 'Publishing...' : 'Publish Guide'}
          </button>
        </form>
      </div>
    </div>
  );
}
