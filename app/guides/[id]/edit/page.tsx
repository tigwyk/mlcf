'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/app/components/Navigation';

export const dynamic = 'force-dynamic';

interface Guide {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  tags: { id: string; name: string }[];
  author?: {
    id: string;
  };
}

export default function EditGuidePage() {
  const router = useRouter();
  const params = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    tags: '',
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      // Fetch user session
      const sessionRes = await fetch('/api/auth/steam/session');
      const sessionData = await sessionRes.json();
      setUser(sessionData.user);

      // Fetch guide
      const guideRes = await fetch(`/api/guides/${params.id}`);
      if (!guideRes.ok) {
        throw new Error('Guide not found');
      }
      const guideData = await guideRes.json();
      setGuide(guideData);

      // Pre-populate form
      setFormData({
        title: guideData.title,
        content: guideData.content,
        summary: guideData.summary || '',
        tags: guideData.tags.map((t: any) => t.name).join(', '),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load guide');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await fetch(`/api/guides/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          summary: formData.summary,
          tags,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update guide');
      }

      router.push(`/guides/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navigation />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (error || !guide || !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navigation />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <p className="text-red-400 mb-4">{error || 'Guide not found'}</p>
          <Link href="/guides" className="text-purple-400 hover:text-purple-300">
            ← Back to Guides
          </Link>
        </div>
      </div>
    );
  }

  if (guide.author?.id !== user.id) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navigation />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <p className="text-red-400 mb-4">You can only edit your own guides</p>
          <Link href={`/guides/${params.id}`} className="text-purple-400 hover:text-purple-300">
            ← Back to Guide
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navigation />
      <div className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href={`/guides/${params.id}`} className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to Guide
          </Link>
          <h1 className="text-4xl font-bold mb-8 text-center">
            Edit Guide
          </h1>

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
                  className="text-sm text-purple-400 hover:text-purple-300"
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
                placeholder="strategy, beginner, advanced (comma separated)"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-colors"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href={`/guides/${params.id}`}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
