'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

interface CommentSectionProps {
  resourceType: 'build' | 'guide';
  resourceId: string;
  user: any;
}

export default function CommentSection({ resourceType, resourceId, user }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, [resourceId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/${resourceType}s/${resourceId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/${resourceType}s/${resourceId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to post comment');
      }
    } catch (err) {
      setError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-gray-100 focus:outline-none focus:border-purple-500 resize-none"
            rows={4}
            disabled={submitting}
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded transition-colors"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-900 border border-gray-700 rounded text-center">
          <p className="text-gray-400">
            Please{' '}
            <a href="/api/auth/steam/login" className="text-purple-400 hover:text-purple-300">
              sign in
            </a>{' '}
            to leave a comment
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-900 border border-gray-700 rounded p-4">
              <div className="flex items-start gap-3">
                {comment.author.avatar ? (
                  <Image
                    src={comment.author.avatar}
                    alt={comment.author.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 font-bold">
                      {comment.author.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-purple-300">{comment.author.username}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
