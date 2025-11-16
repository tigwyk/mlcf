'use client';

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/app/components/Navigation';
import BuildSkillGrid from '@/app/components/BuildSkillGrid';
import CopyButton from '@/app/components/CopyButton';
import { parseSkillExport } from '@/lib/skillParser';
import { getSkillByGuid } from '@/lib/skillData';

interface Build {
  id: string;
  name: string;
  description: string | null;
  exportString: string;
  author?: {
    id: string;
    username: string;
    avatar: string | null;
  };
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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExportString, setShowExportString] = useState(false);

  useEffect(() => {
    fetchBuild();
    fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/steam/session');
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      // User not logged in, that's okay
    }
  };

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

  // Parse skills for visualization
  const parsedSkills = build ? parseSkillExport(build.exportString) : null;
  
  // Debug logging
  useEffect(() => {
    if (parsedSkills) {
      console.log('Parsed skills:', parsedSkills);
      if (parsedSkills.isValid && parsedSkills.skills.length > 0) {
        console.log('Sample skill GUID from export:', parsedSkills.skills[0].guid);
        console.log('Sample skill name from export:', parsedSkills.skills[0].name);
      }
    }
  }, [parsedSkills]);
  
  const placedSkills = parsedSkills?.isValid
    ? parsedSkills.skills.map((skill) => {
        const skillDef = getSkillByGuid(skill.guid);
        if (!skillDef) {
          console.log('No skill definition found for GUID:', skill.guid, 'Name:', skill.name);
        }
        return skillDef
          ? {
              skill: skillDef,
              position: skill.gridPosition,
            }
          : null;
      }).filter((s): s is { skill: any; position: any } => s !== null)
    : [];

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
          <div className="flex justify-between items-start mb-4">
            <Link href="/builds" className="text-blue-300 hover:text-blue-200">
              ← Back to Builds
            </Link>
            {user && build.author?.id === user.id && (
              <Link
                href={`/builds/${build.id}/edit`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
              >
                Edit Build
              </Link>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2">{build.name}</h1>
          <p className="text-gray-300">by {build.author?.username || 'Anonymous'}</p>
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

        {/* Skill Grid Visualization */}
        {parsedSkills?.isValid && (
          <div className="mb-6">
            <BuildSkillGrid
              placedSkills={placedSkills}
              characterLevel={50}
            />
          </div>
        )}

        {/* Export String Actions */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">Export Build</h2>
          <p className="text-gray-400 text-sm mb-4">
            Use the export string to share this build or import it into the game.
          </p>
          <div className="flex gap-3 flex-wrap">
            <CopyButton 
              textToCopy={typeof window !== 'undefined' ? window.location.href : ''} 
              label="Share Build"
              successMessage="Link Copied!"
              className="bg-purple-600 hover:bg-purple-700"
            />
            <CopyButton textToCopy={build.exportString} />
            <Link
              href={`/calculator?import=${encodeURIComponent(build.exportString)}`}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Open in Calculator
            </Link>
            <button
              onClick={() => setShowExportString(!showExportString)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors inline-flex items-center gap-2"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showExportString ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              {showExportString ? 'Hide' : 'Show'} Export String
            </button>
          </div>
          
          {/* Collapsible Export String */}
          {showExportString && (
            <div className="mt-4 bg-gray-900 border border-gray-700 rounded p-4 overflow-x-auto">
              <code className="text-sm text-green-400 font-mono break-all">
                {build.exportString}
              </code>
            </div>
          )}
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
