'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/app/components/Navigation';

interface User {
  id: string;
  steamId: string;
  username: string;
  avatar: string | null;
}

export default function SubmitBuild() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    exportString: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/steam/session')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setSessionLoading(false);
      })
      .catch(() => {
        setSessionLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await fetch('/api/builds', {
        method: 'POST',
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
        throw new Error(data.error || 'Failed to submit build');
      }

      router.push('/builds');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navigation />
        <div className="py-12 px-4 text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navigation />
        <div className="py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-400 mb-8">
              You must be signed in with Steam to submit builds.
            </p>
            <a
              href="/api/auth/steam/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded border border-gray-600 hover:bg-gray-800 transition-colors"
            >
              <img
                src="/steam-icon.svg"
                alt="Steam"
                className="w-5 h-5"
              />
              Sign in with Steam
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navigation />
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Submit Your Pro Build
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Share your championship-winning coin flip strategy with the world
        </p>

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
              placeholder="The Ultimate Edge"
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
              placeholder="Paste your Q-Up skill export string here"
            />
            <p className="text-sm text-gray-400 mt-2">
              Export your skills from Q-Up and paste the string here
            </p>
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
              placeholder="Explain your build strategy and when to use it"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Build'}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
