'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BuildEmbedProps {
  buildId: string;
}

interface Build {
  id: string;
  name: string;
  description: string | null;
  author?: {
    username: string;
    avatar: string | null;
  };
  upvotes: number;
  downvotes: number;
  views: number;
  tags: { id: string; name: string }[];
}

export default function BuildEmbed({ buildId }: BuildEmbedProps) {
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchBuild();
  }, [buildId]);

  const fetchBuild = async () => {
    try {
      const response = await fetch(`/api/builds/${buildId}`);
      if (!response.ok) {
        throw new Error('Build not found');
      }
      const data = await response.json();
      setBuild(data);
    } catch (err) {
      setError(true);
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
      <div className="my-4 bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !build) {
    return (
      <div className="my-4 bg-gray-800 border border-red-900/50 rounded-lg p-4">
        <p className="text-red-400 text-sm">Build not found</p>
      </div>
    );
  }

  return (
    <Link
      href={`/builds/${build.id}`}
      className="my-4 block bg-gradient-to-r from-gray-800 to-gray-850 border-2 border-blue-500/30 hover:border-blue-500/60 rounded-lg p-5 transition-all hover:shadow-lg hover:shadow-blue-500/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
              Featured Build
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{build.name}</h3>
          <p className="text-sm text-gray-400 mb-3">
            by {build.author?.username || 'Anonymous'}
          </p>
          {build.description && (
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {build.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            {build.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="bg-gray-700/50 px-2 py-1 rounded text-xs text-gray-300"
              >
                {tag.name}
              </span>
            ))}
            {build.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{build.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="text-center bg-gray-900/50 rounded px-3 py-2">
            <div className="text-green-400 font-bold">
              {getWinRate(build.upvotes, build.downvotes)}
            </div>
            <div className="text-gray-500 text-xs">Win Rate</div>
          </div>
          <div className="text-center bg-gray-900/50 rounded px-3 py-2">
            <div className="text-blue-400 font-bold">{build.views}</div>
            <div className="text-gray-500 text-xs">Views</div>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
        <div className="flex gap-4 text-sm text-gray-400">
          <span>↑ {build.upvotes}</span>
          <span>↓ {build.downvotes}</span>
        </div>
        <span className="text-blue-400 text-sm font-medium">
          View Build →
        </span>
      </div>
    </Link>
  );
}
