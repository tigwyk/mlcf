'use client';

import { useEffect, useState } from 'react';

interface Build {
  id: string;
  name: string;
  description: string | null;
  exportString: string;
  author: string;
  upvotes: number;
  downvotes: number;
  views: number;
  tags: { id: string; name: string }[];
}

interface BuildBrowserProps {
  onSelectBuild: (exportString: string, buildName: string) => void;
  onClose: () => void;
}

export default function BuildBrowser({ onSelectBuild, onClose }: BuildBrowserProps) {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('upvotes');

  useEffect(() => {
    fetchBuilds();
  }, [sortBy]);

  const fetchBuilds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy,
        order: 'desc',
      });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-bold">Browse Community Builds</h3>
            <p className="text-sm text-gray-400 mt-1">Select a build to import into the calculator</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Sort Controls */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
            >
              <option value="upvotes">Most Popular</option>
              <option value="createdAt">Newest</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Builds List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading builds...</div>
          ) : builds.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No builds available yet. Be the first to submit one!
            </div>
          ) : (
            <div className="space-y-3">
              {builds.map((build) => (
                <button
                  key={build.id}
                  onClick={() => onSelectBuild(build.exportString, build.name)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 hover:border-gray-500 transition-colors text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-lg">{build.name}</h4>
                      <p className="text-sm text-gray-400">by {build.author}</p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <div className="text-center">
                        <div className="text-green-400 font-bold">
                          {getWinRate(build.upvotes, build.downvotes)}
                        </div>
                        <div className="text-gray-500 text-xs">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 font-bold">{build.views}</div>
                        <div className="text-gray-500 text-xs">Views</div>
                      </div>
                    </div>
                  </div>

                  {build.description && (
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                      {build.description}
                    </p>
                  )}

                  {build.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {build.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-gray-800 px-2 py-0.5 rounded text-xs text-gray-400"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-400">
            Or paste a build export string manually in the Import section
          </p>
        </div>
      </div>
    </div>
  );
}
