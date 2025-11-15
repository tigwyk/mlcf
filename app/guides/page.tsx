'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/app/components/Navigation';

interface Guide {
  id: string;
  title: string;
  summary: string | null;
  author: string;
  upvotes: number;
  downvotes: number;
  views: number;
  createdAt: string;
  tags: { id: string; name: string }[];
  _count: { comments: number };
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchGuides();
  }, [sortBy, selectedTag]);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy,
        order: 'desc',
      });
      if (selectedTag) {
        params.append('tag', selectedTag);
      }
      const response = await fetch(`/api/guides?${params}`);
      const data = await response.json();
      setGuides(data);
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navigation />
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Strategy Guides</h1>
          <p className="text-xl text-gray-300">
            Master the art of competitive coin flipping
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm text-gray-400">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-sm"
            >
              <option value="createdAt">Newest</option>
              <option value="upvotes">Most Popular</option>
              <option value="views">Most Viewed</option>
            </select>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Clear filter
              </button>
            )}
          </div>
          <Link
            href="/guides/submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded transition-colors"
          >
            Write Guide
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading guides...</div>
        ) : guides.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              No guides yet. Share your expertise and write the first guide!
            </p>
            <Link
              href="/guides/submit"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Write First Guide
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {guides.map((guide) => (
              <article
                key={guide.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2 text-purple-300">
                      {guide.title}
                    </h2>
                    <p className="text-sm text-gray-400 mb-3">
                      by {guide.author} • {new Date(guide.createdAt).toLocaleDateString()}
                    </p>
                    {guide.summary && (
                      <p className="text-gray-300 mb-4">{guide.summary}</p>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm ml-6">
                    <div className="text-center">
                      <div className="text-green-400 font-bold">{guide.upvotes}</div>
                      <div className="text-gray-500">Upvotes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">{guide.views}</div>
                      <div className="text-gray-500">Views</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {guide.tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => setSelectedTag(tag.name)}
                      className="bg-purple-900/50 hover:bg-purple-800/50 px-3 py-1 rounded text-sm transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-400 pt-4 border-t border-gray-700">
                  <div className="flex gap-4">
                    <span>↑ {guide.upvotes}</span>
                    <span>↓ {guide.downvotes}</span>
                    <span>💬 {guide._count.comments}</span>
                  </div>
                  <Link
                    href={`/guides/${guide.id}`}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
