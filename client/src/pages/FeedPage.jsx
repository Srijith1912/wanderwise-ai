import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createPost, getPosts, likePost } from '../services/postService';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';

const isProbablyImageUrl = (url) =>
  /^https?:\/\//i.test(url) &&
  (/\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url) ||
    /(unsplash|imgur|cloudinary|googleusercontent|pexels|pixabay|images\.|cdn\.|media\.)/i.test(url));

const formatTimeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export default function FeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState('');
  const [destinationTag, setDestinationTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageField, setShowImageField] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [postError, setPostError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoadingFeed(true);
      const data = await getPosts();
      setPosts(data);
    } catch (err) {
      setError('Failed to load posts.');
    } finally {
      setLoadingFeed(false);
    }
  };

  const handleCreatePost = async () => {
    if (!caption.trim()) {
      setPostError('Caption cannot be empty.');
      return;
    }
    if (imageUrl && !isProbablyImageUrl(imageUrl)) {
      setPostError("That doesn't look like an image URL — paste a direct link to an image.");
      return;
    }
    try {
      setSubmitting(true);
      setPostError('');
      const newPost = await createPost(caption, destinationTag, imageUrl);
      setPosts((prev) => [newPost, ...prev]);
      setCaption('');
      setDestinationTag('');
      setImageUrl('');
      setShowImageField(false);
    } catch (err) {
      setPostError('Failed to create post. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id !== postId) return post;
        const alreadyLiked = post.likes.some((id) => id && id.toString() === user.id);
        return {
          ...post,
          likes: alreadyLiked
            ? post.likes.filter((id) => id && id.toString() !== user.id)
            : [...post.likes, user.id],
        };
      }),
    );
    try {
      await likePost(postId);
    } catch (err) {
      fetchPosts();
    }
  };

  return (
    <Layout>
      <section className="w-full px-4 sm:px-8 lg:px-12 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold text-ink-900">Travel feed</h1>
            <p className="text-ink-500 text-sm mt-1">Moments and tips from fellow travelers.</p>
          </div>

          {/* Composer */}
          <div className="card p-5 mb-6">
            <div className="flex items-start gap-3">
              <Avatar name={user?.name} src={user?.profilePicture} size="sm" />
              <div className="flex-1 space-y-3">
                <textarea
                  placeholder="Share a travel moment, tip, or memory…"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  className="w-full border border-cream-300 rounded-xl px-3 py-2 text-sm text-ink-900 placeholder-ink-400 resize-none focus:outline-none focus:ring-2 focus:ring-forest-500"
                />

                <input
                  type="text"
                  placeholder="📍 Destination tag (e.g. Rome, Italy)"
                  value={destinationTag}
                  onChange={(e) => setDestinationTag(e.target.value)}
                  className="w-full border border-cream-300 rounded-xl px-3 py-2 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
                />

                {showImageField && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="Paste an image URL (Unsplash, Imgur, etc.)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full border border-cream-300 rounded-xl px-3 py-2 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
                    />
                    {imageUrl && (
                      <div className="rounded-xl overflow-hidden border border-cream-300 bg-cream-100">
                        <img
                          src={imageUrl}
                          alt="preview"
                          className="w-full max-h-72 object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <p className="text-[11px] text-ink-500 leading-snug">
                      Paste a direct link to an image (e.g. from Unsplash, Imgur, or any public host). The image is fetched directly from that URL — we don't upload or store the file.
                    </p>
                  </div>
                )}

                {postError && <p className="text-coral-600 text-sm">{postError}</p>}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowImageField((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-forest-700"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                    </svg>
                    {showImageField ? 'Remove image' : 'Add image (URL)'}
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={submitting}
                    className="btn-primary px-5 py-2"
                  >
                    {submitting ? 'Posting…' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          {loadingFeed ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-cream-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-cream-200 rounded w-1/4" />
                      <div className="h-2 bg-cream-200 rounded w-1/6" />
                    </div>
                  </div>
                  <div className="h-3 bg-cream-200 rounded w-full mb-2" />
                  <div className="h-3 bg-cream-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-coral-600 text-sm">{error}</p>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">✈️</p>
              <p className="text-ink-500">No posts yet. Be the first to share!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const isLiked = post.likes.some((id) => id && id.toString() === user.id);
                const isOwner = user && post.userId._id.toString() === user.id;
                return (
                  <article key={post._id} className="card overflow-hidden">
                    <div className="p-5 pb-3 flex items-center justify-between gap-3">
                      <button
                        onClick={() => navigate(`/profile/${post.userId._id}`)}
                        className="flex items-center gap-3 group"
                      >
                        <Avatar
                          name={post.userId?.name}
                          src={post.userId?.profilePicture}
                          size="sm"
                        />
                        <div className="text-left">
                          <p className="font-semibold text-ink-900 text-sm group-hover:text-forest-700 transition">
                            {isOwner ? 'You' : post.userId?.name}
                          </p>
                          <p className="text-xs text-ink-500">{formatTimeAgo(post.createdAt)}</p>
                        </div>
                      </button>
                      {post.destinationTag && (
                        <span className="text-xs font-medium text-forest-700 bg-forest-50 border border-forest-100 px-2.5 py-1 rounded-full">
                          📍 {post.destinationTag}
                        </span>
                      )}
                    </div>

                    {post.caption && (
                      <p className="px-5 pb-3 text-ink-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                        {post.caption}
                      </p>
                    )}

                    {post.imageUrl && (
                      <div className="bg-cream-100 border-y border-cream-200">
                        <img
                          src={post.imageUrl}
                          alt=""
                          className="w-full max-h-[480px] object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    <div className="px-5 py-3 flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`inline-flex items-center gap-1.5 text-sm font-medium transition ${isLiked ? 'text-coral-600' : 'text-ink-600 hover:text-coral-500'}`}
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
