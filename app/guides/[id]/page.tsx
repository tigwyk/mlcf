'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navigation from '@/app/components/Navigation';
import BuildEmbed from '@/app/components/BuildEmbed';

export const dynamic = 'force-dynamic';

interface Guide {
  id: string;
  title: string;
  content: string;
  summary: string | null;
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

export default function GuideDetailPage() {
  const params = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGuide();
  }, [params.id]);

  const fetchGuide = async () => {
    try {
      const response = await fetch(`/api/guides/${params.id}`);
      if (!response.ok) {
        throw new Error('Guide not found');
      }
      const data = await response.json();
      setGuide(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load guide');
    } finally {
      setLoading(false);
    }
  };

  // Custom component to detect build links and render embeds
  const components = {
    a: ({ node, href, children, ...props }: any) => {
      // Check if this is a build link
      const buildMatch = href?.match(/\/builds\/([a-zA-Z0-9]+)/);
      
      if (buildMatch) {
        const buildId = buildMatch[1];
        return (
          <div>
            <BuildEmbed buildId={buildId} />
          </div>
        );
      }
      
      // Regular link
      return (
        <a
          href={href}
          className="text-purple-400 hover:text-purple-300 underline"
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children}
        </a>
      );
    },
    h1: ({ node, children, ...props }: any) => (
      <h1 className="text-3xl font-bold mb-4 mt-8 text-white" {...props}>
        {children}
      </h1>
    ),
    h2: ({ node, children, ...props }: any) => (
      <h2 className="text-2xl font-bold mb-3 mt-6 text-white" {...props}>
        {children}
      </h2>
    ),
    h3: ({ node, children, ...props }: any) => (
      <h3 className="text-xl font-bold mb-2 mt-4 text-white" {...props}>
        {children}
      </h3>
    ),
    p: ({ node, children, ...props }: any) => (
      <p className="mb-4 text-gray-300 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    ul: ({ node, children, ...props }: any) => (
      <ul className="list-disc list-inside mb-4 text-gray-300 space-y-1" {...props}>
        {children}
      </ul>
    ),
    ol: ({ node, children, ...props }: any) => (
      <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-1" {...props}>
        {children}
      </ol>
    ),
    code: ({ node, inline, children, ...props }: any) =>
      inline ? (
        <code className="bg-gray-800 px-2 py-1 rounded text-sm text-purple-300" {...props}>
          {children}
        </code>
      ) : (
        <code className="block bg-gray-800 p-4 rounded text-sm text-gray-300 overflow-x-auto mb-4" {...props}>
          {children}
        </code>
      ),
    blockquote: ({ node, children, ...props }: any) => (
      <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 mb-4" {...props}>
        {children}
      </blockquote>
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navigation />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-400">
          Loading guide...
        </div>
      </div>
    );
  }

  if (error || !guide) {
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navigation />
      
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/guides" className="text-purple-300 hover:text-purple-200 mb-4 inline-block">
            ← Back to Guides
          </Link>
          <h1 className="text-4xl font-bold mb-2">{guide.title}</h1>
          <p className="text-gray-300">
            by {guide.author?.username || 'Anonymous'} • {new Date(guide.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tags */}
        {guide.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {guide.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/guides?tag=${encodeURIComponent(tag.name)}`}
                  className="bg-purple-900/50 hover:bg-purple-800/50 px-3 py-1 rounded text-sm transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <article className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {guide.content}
          </ReactMarkdown>
        </article>

        {/* Comments Section */}
        <div className="mt-12 bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            Comments ({guide.comments.length})
          </h2>
          {guide.comments.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-4">
              {guide.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-purple-300">{comment.author}</span>
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
          {guide.views} views • {guide.upvotes} upvotes • {guide.downvotes} downvotes
        </div>
      </div>
    </div>
  );
}
