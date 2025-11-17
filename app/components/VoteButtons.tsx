'use client';

import { useState } from 'react';

interface VoteButtonsProps {
  resourceType: 'build' | 'guide';
  resourceId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  user: any;
}

export default function VoteButtons({ 
  resourceType, 
  resourceId, 
  initialUpvotes, 
  initialDownvotes,
  user 
}: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }

    if (isVoting) return;

    setIsVoting(true);

    try {
      const response = await fetch(`/api/${resourceType}s/${resourceId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: voteType }),
      });

      if (response.ok) {
        const data = await response.json();
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
        setUserVote(voteType);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to vote');
      }
    } catch (err) {
      alert('Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote('up')}
        disabled={isVoting || userVote === 'up'}
        className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
          userVote === 'up'
            ? 'bg-green-600 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span>↑</span>
        <span className="font-bold">{upvotes}</span>
      </button>
      <button
        onClick={() => handleVote('down')}
        disabled={isVoting || userVote === 'down'}
        className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
          userVote === 'down'
            ? 'bg-red-600 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span>↓</span>
        <span className="font-bold">{downvotes}</span>
      </button>
    </div>
  );
}
