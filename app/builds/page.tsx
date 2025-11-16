'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/app/components/Navigation';
import { parseSkillExport } from '@/lib/skillParser';

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
  _count: { comments: number };
}

export default function BuildsPage() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchBuilds();
  }, [sortBy, selectedTag]);

  const fetchBuilds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy,
        order: 'desc',
      });
      if (selectedTag) {
        params.append('tag', selectedTag);
      }
      const response = await fetch(`/api/builds?${params}`);
      const data = await response.json();
      setBuilds(data);
    } catch (error) {
      console.error('Error fetching builds:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWinRate = (upvotes: number, downvotes: number) => {
    const total = upvotes + downvotes;
    if (total === 0) return 'N/A';
    return `${Math.round((upvotes / total) * 100)}%`;
  };

  const getCharacterName = (exportString: string) => {
    const parsed = parseSkillExport(exportString);
    return parsed.characterName || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navigation />
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Major League Coin Flipping</h1>
          <p className="text-xl text-gray-300">
            Pro Builds & Championship Strategies for Q-Up
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
            href="/builds/submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
          >
            Submit Build
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading builds...</div>
        ) : builds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              No builds yet. Be the first to submit a championship strategy!
            </p>
            <Link
              href="/builds/submit"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Submit First Build
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {builds.map((build) => (
              <Link
                key={build.id}
                href={`/builds/${build.id}`}
                className="block bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{build.name}</h3>
                    <p className="text-sm text-gray-400">
                      by {build.author} • <span className="text-purple-400">{getCharacterName(build.exportString)}</span>
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-green-400 font-bold">
                        {getWinRate(build.upvotes, build.downvotes)}
                      </div>
                      <div className="text-gray-500">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">{build.views}</div>
                      <div className="text-gray-500">Views</div>
                    </div>
                  </div>
                </div>

                {build.description && (
                  <p className="text-gray-300 mb-3">{build.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {build.tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => setSelectedTag(tag.name)}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-400">
                  <div className="flex gap-4">
                    <span>↑ {build.upvotes}</span>
                    <span>↓ {build.downvotes}</span>
                    <span>💬 {build._count.comments}</span>
                  </div>
                  <span>{new Date(build.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
