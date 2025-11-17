'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Comment {
  id: string;
  content: string;
  rating: number | null;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

interface EditingState {
  commentId: string;
  content: string;
}

interface CommentSectionProps {
  resourceType: 'build' | 'guide';
  resourceId: string;
  user: any;
}

export default function CommentSection({ resourceType, resourceId, user }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<EditingState | null>(null);

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
        body: JSON.stringify({ content: newComment, rating }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
        setRating(null);
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

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/${resourceType}s/${resourceId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete comment');
      }
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditing({ commentId: comment.id, content: comment.content });
  };

  const handleCancelEdit = () => {
    setEditing(null);
  };

  const handleSaveEdit = async () => {
    if (!editing || !editing.content.trim()) return;

    try {
      const response = await fetch(`/api/${resourceType}s/${resourceId}/comments/${editing.commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editing.content }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(comments.map(c => c.id === updatedComment.id ? updatedComment : c));
        setEditing(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update comment');
      }
    } catch (err) {
      alert('Failed to update comment');
    }
  };

  const canEditComment = (comment: Comment) => {
    if (!user || comment.author.id !== user.id) return false;
    const commentAge = Date.now() - new Date(comment.createdAt).getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    return commentAge <= fifteenMinutes;
  };

  const renderStars = (currentRating: number | null, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const displayRating = interactive ? (hoverRating || rating) : currentRating;
          const isFilled = displayRating !== null && star <= displayRating;
          
          return interactive ? (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className="text-2xl transition-colors hover:scale-110"
            >
              {isFilled ? '★' : '☆'}
            </button>
          ) : (
            <span key={star} className="text-yellow-400">
              {isFilled ? '★' : '☆'}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Rate this {resourceType} (optional)</label>
            {renderStars(rating, true)}
            {rating && (
              <button
                type="button"
                onClick={() => setRating(null)}
                className="text-sm text-gray-400 hover:text-gray-300 mt-1"
              >
                Clear rating
              </button>
            )}
          </div>
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
          {comments.map((comment) => {
            console.log('Rendering comment:', comment.id, 'Author:', comment.author.username);
            return (
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
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-purple-300">{comment.author.username}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {comment.rating && (
                        <div className="flex items-center gap-1">
                          {renderStars(comment.rating, false)}
                        </div>
                      )}
                    </div>
                    {user && comment.author.id === user.id && (
                      <div className="flex gap-2">
                        {canEditComment(comment) && editing?.commentId !== comment.id && (
                          <button
                            onClick={() => handleEdit(comment)}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-sm text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {editing?.commentId === comment.id ? (
                    <div>
                      <textarea
                        value={editing.content}
                        onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-1 px-4 rounded transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold py-1 px-4 rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                  )}
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
