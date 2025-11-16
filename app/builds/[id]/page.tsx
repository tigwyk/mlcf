'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/app/components/Navigation';

interface Build {
  id: string;
  name: string;
  description: string | null;
  exportString: string;
  author: string;
  upvotes: number;
  downvotes: number;
  views: number;
  createdAt: string;
  tags: { id: string; name: string }[];
  comments: { id: string; content: string; author: string; createdAt: string }[];
}

export default function BuildDetailPage() {
  const params = useParams();
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBuild();
  }, [params.id]);

  const fetchBuild = async () => {
    try {
      const response = await fetch(`/api/builds/${params.id}`);
      if (!response.ok) {
        throw new Error('Build not found');
      }
      const data = await response.json();
      setBuild(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load build');
    } finally {
      setLoading(false);
    }
  };

  const getWinRate = (upvotes: number, downvotes: number) => {
    const total = upvotes + downvotes;
    if (total === 0) return 'N/A';
    return `${Math.round((upvotes / total) * 100)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navigation />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-400">
          Loading build...
        </div>
      </div>
    );
  }

  if (error || !build) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navigation />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <p className="text-red-400 mb-4">{error || 'Build not found'}</p>
          <Link href="/builds" className="text-blue-400 hover:text-blue-300">
            ← Back to Builds
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navigation />
      
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/builds" className="text-blue-300 hover:text-blue-200 mb-4 inline-block">
            ← Back to Builds
          </Link>
          <h1 className="text-4xl font-bold mb-2">{build.name}</h1>
          <p className="text-gray-300">by {build.author}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {getWinRate(build.upvotes, build.downvotes)}
            </div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{build.views}</div>
            <div className="text-sm text-gray-400">Views</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{build.upvotes}</div>
            <div className="text-sm text-gray-400">Upvotes</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{build.downvotes}</div>
            <div className="text-sm text-gray-400">Downvotes</div>
          </div>
        </div>

        {/* Description */}
        {build.description && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-3">Description</h2>
            <p className="text-gray-300">{build.description}</p>
          </div>
        )}

        {/* Tags */}
        {build.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {build.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/builds?tag=${encodeURIComponent(tag.name)}`}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Skill Export String */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">Skill Export String</h2>
          <div className="bg-gray-900 border border-gray-700 rounded p-4 overflow-x-auto">
            <code className="text-sm text-green-400 font-mono break-all">
              {build.exportString}
            </code>
          </div>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(build.exportString);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
            >
              Copy to Clipboard
            </button>
            <Link
              href={`/calculator?import=${encodeURIComponent(build.exportString)}`}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors inline-block"
            >
              Open in Calculator
            </Link>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            Comments ({build.comments.length})
          </h2>
          {build.comments.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-4">
              {build.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-blue-300">{comment.author}</span>
                    <span className="text-sm text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-200">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Created on {new Date(build.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
