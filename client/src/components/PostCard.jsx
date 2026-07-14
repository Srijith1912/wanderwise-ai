import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { addComment, deleteComment } from '../services/postService';

const formatPostTime = (dateStr) => {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCount = (n) => {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
};

export default function PostCard({ post, user, onLike, saved, onToggleSave, highlight = false }) {
  const navigate = useNavigate();

  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [popping, setPopping] = useState(false);
  const [shared, setShared] = useState(false);

  const isLiked = post.likes.some((id) => id && id.toString() === user?.id);
  const isOwner = user && post.userId?._id?.toString() === user.id;

  const handleLike = () => {
    setPopping(true);
    setTimeout(() => setPopping(false), 350);
    onLike(post._id);
  };

  const handleAddComment = async () => {
    const text = commentText.trim();
    if (!text || submittingComment) return;
    setSubmittingComment(true);
    try {
      const newComment = await addComment(post._id, text);
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch {
      // Silent fail — the input keeps the text so the user can retry.
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    const prev = comments;
    setComments((c) => c.filter((cm) => cm._id !== commentId));
    try {
      await deleteComment(post._id, commentId);
    } catch {
      setComments(prev); // rollback
    }
  };

  const handleShare = () => {
    const url = window.location.origin + `/feed#${post._id}`;
    navigator.clipboard?.writeText(url).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    });
  };

  return (
    <article
      id={post._id}
      className={`card overflow-hidden hover:shadow-hover transition ${
        highlight ? 'ring-2 ring-forest-500 ring-offset-2 ring-offset-cream-100' : ''
      }`}
    >
      {/* Author row */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(`/profile/${post.userId._id}`)}
          className="flex items-center gap-3 group min-w-0"
        >
          <Avatar name={post.userId?.name} src={post.userId?.profilePicture} size="sm" />
          <div className="text-left min-w-0">
            <p className="font-semibold text-ink-900 text-sm group-hover:text-forest-700 transition truncate">
              {isOwner ? 'You' : post.userId?.name}
            </p>
            <p className="text-xs text-ink-500">{formatPostTime(post.createdAt)}</p>
          </div>
        </button>
        {post.destinationTag && (
          <button
            onClick={() => navigate(`/?tag=${encodeURIComponent(post.destinationTag)}`)}
            className="text-xs font-semibold text-blossom-600 bg-blossom-50 hover:bg-blossom-100 border border-blossom-100 px-2.5 py-1 rounded-full transition shrink-0"
          >
            📍 {post.destinationTag}
          </button>
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="px-5 pb-3 text-ink-800 text-[15px] leading-relaxed whitespace-pre-wrap">
          {post.caption}
        </p>
      )}

      {/* Image */}
      {post.imageUrl && (
        <div className="bg-cream-100 border-y border-cream-200 relative group">
          <img
            src={post.imageUrl}
            alt=""
            className="w-full max-h-[520px] object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Action bar */}
      <div className="px-5 py-3 flex items-center gap-1">
        <button
          onClick={handleLike}
          className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full transition ${
            isLiked ? 'text-blossom-500' : 'text-ink-600 hover:text-blossom-500 hover:bg-blossom-50'
          }`}
        >
          <span className={`relative inline-block ${popping ? 'heart-burst' : ''}`}>
            <svg
              viewBox="0 0 24 24"
              className="w-[22px] h-[22px]"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </span>
          <span className="text-sm font-semibold">{formatCount(post.likes.length)}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full transition ${
            showComments ? 'text-forest-700 bg-forest-50' : 'text-ink-600 hover:text-forest-700 hover:bg-forest-50'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          <span className="text-sm font-medium">{comments.length > 0 ? formatCount(comments.length) : 'Comment'}</span>
        </button>

        <button
          onClick={handleShare}
          title="Copy link"
          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-ink-600 hover:text-forest-700 hover:bg-forest-50 transition"
        >
          {shared ? (
            <>
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-forest-700" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-sm text-forest-700 font-medium">Link copied</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              <span className="text-sm">Share</span>
            </>
          )}
        </button>

        {/* Bookmark / save */}
        <button
          onClick={() => onToggleSave(post._id)}
          title={saved ? 'Saved' : 'Save post'}
          className={`ml-auto inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full transition ${
            saved ? 'text-terracotta-600' : 'text-ink-500 hover:text-terracotta-600 hover:bg-terracotta-50'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-sm font-medium hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-5 pb-4 pt-1 border-t border-cream-200 space-y-3">
          {comments.length === 0 ? (
            <p className="text-xs text-ink-400 pt-2">No comments yet. Be the first to say something.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {comments.map((c) => {
                const author = c.userId || {};
                const canDelete =
                  user && (author._id?.toString() === user.id || isOwner);
                return (
                  <div key={c._id} className="flex items-start gap-2.5 group/comment">
                    <button onClick={() => author._id && navigate(`/profile/${author._id}`)}>
                      <Avatar name={author.name} src={author.profilePicture} size="xs" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="bg-cream-100 rounded-2xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => author._id && navigate(`/profile/${author._id}`)}
                            className="text-xs font-semibold text-ink-900 hover:text-forest-700 transition truncate"
                          >
                            {author.name || 'Traveler'}
                          </button>
                          <span className="text-[10px] text-ink-400">{formatPostTime(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-ink-800 whitespace-pre-wrap break-words">{c.text}</p>
                      </div>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        title="Delete comment"
                        className="text-ink-300 hover:text-coral-600 transition opacity-0 group-hover/comment:opacity-100 mt-1"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add comment */}
          <div className="flex items-center gap-2.5 pt-1">
            <Avatar name={user?.name} src={user?.profilePicture} size="xs" />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
              placeholder="Add a comment…"
              maxLength={500}
              className="flex-1 border border-cream-300 rounded-full px-4 py-2 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
            <button
              onClick={handleAddComment}
              disabled={submittingComment || !commentText.trim()}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
            >
              {submittingComment ? '…' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
