import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createPost, getPosts, likePost } from '../services/postService';
import { getDestinations } from '../services/exploreService';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';

const isProbablyImageUrl = (url) =>
  /^https?:\/\//i.test(url) &&
  (/\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url) ||
    /(unsplash|imgur|cloudinary|googleusercontent|pexels|pixabay|images\.|cdn\.|media\.)/i.test(url));

const formatTimeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const formatCount = (n) => {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
};

const FILTER_TABS = [
  { id: 'latest', label: 'Latest', icon: '✨' },
  { id: 'trending', label: 'Trending', icon: '🔥' },
  { id: 'following', label: 'Following', icon: '👥', disabled: true, soon: true },
];

const TRAVEL_TIPS = [
  "Book your flights on Tuesdays — historically the cheapest day.",
  "Always carry a small power bank when sightseeing all day.",
  "Download offline maps for the city you're visiting.",
  "Learn 3 phrases in the local language — locals will love you.",
  "Pack one extra outfit you don't plan to wear. Trust me.",
];

export default function FeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [trendingDests, setTrendingDests] = useState([]);
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [caption, setCaption] = useState('');
  const [destinationTag, setDestinationTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [postError, setPostError] = useState('');
  const [tab, setTab] = useState('latest');
  const [popping, setPopping] = useState(null);

  const dailyTip = useMemo(() => TRAVEL_TIPS[Math.floor(Date.now() / 86400000) % TRAVEL_TIPS.length], []);

  useEffect(() => {
    fetchPosts();
    getDestinations().then((d) => setTrendingDests((d || []).slice(0, 5))).catch(() => {});
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

  const sortedPosts = useMemo(() => {
    if (tab === 'trending') {
      return [...posts].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    }
    return posts;
  }, [posts, tab]);

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
      setComposerExpanded(false);
    } catch (err) {
      setPostError('Failed to create post. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    setPopping(postId);
    setTimeout(() => setPopping(null), 350);
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

  const myPostsCount = posts.filter((p) => p.userId?._id?.toString() === user?.id).length;
  const myTotalLikes = posts.reduce((s, p) => {
    if (p.userId?._id?.toString() === user?.id) return s + (p.likes?.length || 0);
    return s;
  }, 0);

  return (
    <Layout>
      <section className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-6">

          {/* Left rail — desktop only */}
          <aside className="hidden lg:block space-y-5">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={user?.name} src={user?.profilePicture} size="md" />
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900 truncate">{user?.name}</p>
                  <p className="text-xs text-ink-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="text-center bg-cream-100 rounded-xl p-3">
                  <p className="font-display text-xl font-bold text-ink-900">{myPostsCount}</p>
                  <p className="text-[10px] uppercase text-ink-500 tracking-wider">Posts</p>
                </div>
                <div className="text-center bg-cream-100 rounded-xl p-3">
                  <p className="font-display text-xl font-bold text-coral-600">{myTotalLikes}</p>
                  <p className="text-[10px] uppercase text-ink-500 tracking-wider">Likes</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/profile/${user.id}`)}
                className="mt-4 w-full text-sm font-medium text-forest-700 hover:text-forest-800"
              >
                View my profile →
              </button>
            </div>

            <div className="card p-5">
              <p className="text-xs uppercase tracking-wider text-ink-400 font-semibold mb-3">Quick actions</p>
              <button
                onClick={() => navigate('/planner')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cream-100 transition text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7l-6 2-3-3-2 1 2 3-3 1-2-2-1 1 2 2-2 5 1 1 5-2 2 2 1-1-2-2 1-3 3 2 1-2-3-3 2-6z"/></svg>
                </span>
                <span className="text-sm font-medium text-ink-800">Plan a trip</span>
              </button>
              <button
                onClick={() => navigate('/trips')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cream-100 transition text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-terracotta-50 text-terracotta-700 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4"/></svg>
                </span>
                <span className="text-sm font-medium text-ink-800">My trips</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cream-100 transition text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-cream-200 text-ink-700 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20"/></svg>
                </span>
                <span className="text-sm font-medium text-ink-800">Explore</span>
              </button>
            </div>
          </aside>

          {/* Center column — feed */}
          <div className="min-w-0">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-display text-3xl font-bold text-ink-900">Travel feed</h1>
                <p className="text-ink-500 text-sm">Moments from travelers around the world.</p>
              </div>
            </div>

            {/* Filter pills */}
            <div className="bg-white border border-cream-300 rounded-2xl p-1 flex gap-1 mb-5 overflow-x-auto">
              {FILTER_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => !t.disabled && setTab(t.id)}
                  disabled={t.disabled}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                    tab === t.id && !t.disabled
                      ? 'bg-forest-600 text-white shadow-soft'
                      : t.disabled
                      ? 'text-ink-400 cursor-not-allowed'
                      : 'text-ink-700 hover:bg-cream-100'
                  }`}
                  title={t.disabled ? 'Coming soon' : ''}
                >
                  <span>{t.icon}</span>
                  {t.label}
                  {t.soon && <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded-full bg-cream-200 text-ink-500">soon</span>}
                </button>
              ))}
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
                    onFocus={() => setComposerExpanded(true)}
                    rows={composerExpanded ? 3 : 1}
                    className="w-full border border-cream-300 rounded-xl px-3 py-2 text-sm text-ink-900 placeholder-ink-400 resize-none focus:outline-none focus:ring-2 focus:ring-forest-500 transition-all"
                  />

                  {composerExpanded && (
                    <>
                      <input
                        type="text"
                        placeholder="📍 Destination tag (e.g. Rome, Italy)"
                        value={destinationTag}
                        onChange={(e) => setDestinationTag(e.target.value)}
                        className="w-full border border-cream-300 rounded-xl px-3 py-2 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
                      />

                      <input
                        type="url"
                        placeholder="🖼  Paste an image URL (Unsplash, Imgur, etc.)"
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

                      {postError && <p className="text-coral-600 text-sm">{postError}</p>}

                      <div className="flex items-center justify-between pt-1">
                        <p className="text-[11px] text-ink-500">Post visible to everyone in the feed.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setComposerExpanded(false);
                              setCaption('');
                              setDestinationTag('');
                              setImageUrl('');
                              setPostError('');
                            }}
                            className="btn-ghost text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreatePost}
                            disabled={submitting}
                            className="btn-primary px-5 py-2 text-sm"
                          >
                            {submitting ? 'Posting…' : 'Post'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
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
                    <div className="h-3 bg-cream-200 rounded w-3/4 mb-3" />
                    <div className="h-48 bg-cream-200 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="card p-8 text-center">
                <p className="text-coral-600 text-sm">{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-5xl mb-3">✈️</p>
                <h3 className="font-display text-xl font-bold text-ink-900 mb-1">It's quiet here.</h3>
                <p className="text-ink-500 text-sm mb-4">Be the first to share a travel moment.</p>
                <button onClick={() => setComposerExpanded(true)} className="btn-primary px-5 py-2 text-sm">
                  Write a post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPosts.map((post) => {
                  const isLiked = post.likes.some((id) => id && id.toString() === user.id);
                  const isOwner = user && post.userId._id.toString() === user.id;
                  const popping_ = popping === post._id;
                  return (
                    <article key={post._id} className="card overflow-hidden hover:shadow-hover transition">

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
                            <p className="text-xs text-ink-500">{formatTimeAgo(post.createdAt)} ago</p>
                          </div>
                        </button>
                        {post.destinationTag && (
                          <button
                            onClick={() => navigate(`/?tag=${encodeURIComponent(post.destinationTag)}`)}
                            className="text-xs font-medium text-forest-700 bg-forest-50 hover:bg-forest-100 border border-forest-100 px-2.5 py-1 rounded-full transition shrink-0"
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
                          onClick={() => handleLike(post._id)}
                          className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition ${
                            isLiked ? 'text-coral-600' : 'text-ink-600 hover:text-coral-500 hover:bg-coral-50'
                          }`}
                        >
                          <span className={`relative inline-block ${popping_ ? 'animate-[pulse_0.35s_ease-out]' : ''}`}>
                            <svg
                              viewBox="0 0 24 24"
                              className={`w-5 h-5 transition-transform ${popping_ ? 'scale-125' : 'scale-100'}`}
                              fill={isLiked ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </span>
                          <span className="text-sm font-medium">{formatCount(post.likes.length)}</span>
                        </button>

                        <button
                          disabled
                          title="Comments coming soon"
                          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-ink-400 cursor-not-allowed"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                          </svg>
                          <span className="text-sm">Comment</span>
                        </button>

                        <button
                          onClick={() => navigator.clipboard?.writeText(window.location.origin + `/feed#${post._id}`)}
                          title="Copy link"
                          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-ink-600 hover:text-forest-700 hover:bg-forest-50 transition"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                          </svg>
                          <span className="text-sm">Share</span>
                        </button>

                        <span className="ml-auto text-xs text-ink-400">
                          {post.likes.length === 1 ? '1 like' : `${formatCount(post.likes.length)} likes`}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right rail — desktop only */}
          <aside className="hidden lg:block space-y-5">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wider text-ink-400 font-semibold">Trending destinations</p>
                <span className="text-[10px] text-coral-600">🔥</span>
              </div>
              {trendingDests.length === 0 ? (
                <p className="text-xs text-ink-400">Loading…</p>
              ) : (
                <div className="space-y-2.5">
                  {trendingDests.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => navigate('/')}
                      className="w-full flex items-center gap-3 group"
                    >
                      <img
                        src={d.imageUrl}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div className="text-left min-w-0">
                        <p className="text-sm font-semibold text-ink-900 truncate group-hover:text-forest-700 transition">{d.name}</p>
                        <p className="text-[11px] text-ink-500 truncate">{d.country}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5 bg-gradient-to-br from-terracotta-500 to-terracotta-600 border-0 text-white">
              <p className="text-xs uppercase tracking-wider text-white/80 font-semibold mb-2">Travel tip of the day</p>
              <p className="text-sm leading-relaxed">{dailyTip}</p>
            </div>

            <div className="card p-5">
              <p className="text-xs uppercase tracking-wider text-ink-400 font-semibold mb-3">Coming soon</p>
              <ul className="space-y-2 text-sm text-ink-600">
                <li className="flex items-center gap-2">
                  <span className="text-forest-700">•</span> Comments on posts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-forest-700">•</span> Follow other travelers
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-forest-700">•</span> Save posts for later
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
