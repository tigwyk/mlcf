'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/app/components/Navigation';

export const dynamic = 'force-dynamic';

interface Build {
  id: string;
  name: string;
  description: string | null;
  exportString: string;
  tags: { id: string; name: string }[];
  author?: {
    id: string;
  };
}

export default function EditBuildPage() {
  const router = useRouter();
  const params = useParams();
  const [build, setBuild] = useState<Build | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    exportString: '',
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

      // Fetch build
      const buildRes = await fetch(`/api/builds/${params.id}`);
      if (!buildRes.ok) {
        throw new Error('Build not found');
      }
      const buildData = await buildRes.json();
      setBuild(buildData);

      // Pre-populate form
      setFormData({
        name: buildData.name,
        description: buildData.description || '',
        exportString: buildData.exportString,
        tags: buildData.tags.map((t: any) => t.name).join(', '),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load build');
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

      const response = await fetch(`/api/builds/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          exportString: formData.exportString,
          tags,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update build');
      }

      router.push(`/builds/${params.id}`);
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
        <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (error || !build || !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-red-400 mb-4">{error || 'Build not found'}</p>
          <Link href="/builds" className="text-blue-400 hover:text-blue-300">
            ← Back to Builds
          </Link>
        </div>
      </div>
    );
  }

  if (build.author?.id !== user.id) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-red-400 mb-4">You can only edit your own builds</p>
          <Link href={`/builds/${params.id}`} className="text-blue-400 hover:text-blue-300">
            ← Back to Build
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navigation />
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href={`/builds/${params.id}`} className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Build
          </Link>
          <h1 className="text-4xl font-bold mb-8 text-center">
            Edit Build
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-lg">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Build Name *
              </label>
              <input
                type="text"
                id="name"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="exportString" className="block text-sm font-medium mb-2">
                Skill Export String *
              </label>
              <textarea
                id="exportString"
                required
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 font-mono text-sm"
                value={formData.exportString}
                onChange={(e) => setFormData({ ...formData, exportString: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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
                placeholder="aggressive, defensive, meta (comma separated)"
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
                href={`/builds/${params.id}`}
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
