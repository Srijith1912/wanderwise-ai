import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createPost, getPosts, likePost, toggleSavePost } from '../services/postService';
import { getFollowingFeed } from '../services/userService';
import { getDestinations } from '../services/exploreService';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import ImageUpload from '../components/ImageUpload';
import { pickOne, FEED_HEADLINES, FEED_SUBTITLES, COMPOSER_PROMPTS, fillName } from '../utils/copy';

const isProbablyImageUrl = (url) =>
  /^https?:\/\//i.test(url) &&
  (/\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url) ||
    /(unsplash|imgur|i\.ibb\.co|ibb\.co|postimg|flickr|staticflickr|cloudinary|googleusercontent|pexels|pixabay|images\.|cdn\.|media\.)/i.test(url));

const IMAGE_URL_HINT =
  "That doesn't look like a direct image link. Make sure the URL ends in .jpg, .png, .gif, or .webp — on imgbb, right-click the image and pick 'Copy image address'.";

const FILTER_TABS = [
  { id: 'latest', label: 'Latest', icon: '✨' },
  { id: 'trending', label: 'Trending', icon: '🔥' },
  { id: 'following', label: 'Following', icon: '👥' },
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
  const location = useLocation();
  const [highlightId, setHighlightId] = useState(null);

  const [posts, setPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [followingLoaded, setFollowingLoaded] = useState(false);
  const [savedIds, setSavedIds] = useState(() => new Set(user?.savedPosts || []));
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

  const dailyTip = useMemo(() => TRAVEL_TIPS[Math.floor(Date.now() / 86400000) % TRAVEL_TIPS.length], []);

  // Rotating editorial copy — new flavor every visit.
  const headline = useMemo(() => pickOne(FEED_HEADLINES), []);
  const subtitle = useMemo(() => pickOne(FEED_SUBTITLES), []);
  const composerPrompt = useMemo(
    () => fillName(pickOne(COMPOSER_PROMPTS), user?.name?.split(' ')[0]),
    [user?.name],
  );

  useEffect(() => {
    fetchPosts();
    getDestinations().then((d) => setTrendingDests((d || []).slice(0, 5))).catch(() => {});
  }, []);

  // Lazy-load the following feed the first time that tab is opened.
  useEffect(() => {
    if (tab === 'following' && !followingLoaded) {
      getFollowingFeed()
        .then((p) => setFollowingPosts(p || []))
        .catch(() => setFollowingPosts([]))
        .finally(() => setFollowingLoaded(true));
    }
  }, [tab, followingLoaded]);

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

  // When arriving via a shared link (/feed#<postId>), jump to that post and flash it.
  useEffect(() => {
    if (loadingFeed) return;
    const id = location.hash?.replace('#', '');
    if (!id) return;
    // Shared posts live in the "Latest" list.
    if (tab !== 'latest') setTab('latest');
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightId(id);
    const t = setTimeout(() => setHighlightId(null), 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingFeed, posts, location.hash]);

  const visiblePosts = useMemo(() => {
    if (tab === 'trending') {
      // Recency-weighted engagement: likes + comments, decayed by post age so
      // fresh popular posts outrank stale all-time winners (HN-style gravity).
      const score = (p) => {
        const ageHours = (Date.now() - new Date(p.createdAt).getTime()) / 3.6e6;
        const engagement = (p.likes?.length || 0) + (p.comments?.length || 0) * 1.5 + 1;
        return engagement / Math.pow(ageHours + 2, 0.6);
      };
      return [...posts].sort((a, b) => score(b) - score(a));
    }
    if (tab === 'following') {
      return followingPosts;
    }
    return posts;
  }, [posts, followingPosts, tab]);

  const handleCreatePost = async () => {
    if (!caption.trim()) {
      setPostError('Caption cannot be empty.');
      return;
    }
    if (imageUrl && !isProbablyImageUrl(imageUrl)) {
      setPostError(IMAGE_URL_HINT);
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

  // Optimistic like — toggles the given post in whichever list it lives in.
  const applyLike = (list, postId) =>
    list.map((post) => {
      if (post._id !== postId) return post;
      const alreadyLiked = post.likes.some((id) => id && id.toString() === user.id);
      return {
        ...post,
        likes: alreadyLiked
          ? post.likes.filter((id) => id && id.toString() !== user.id)
          : [...post.likes, user.id],
      };
    });

  const handleLike = async (postId) => {
    setPosts((prev) => applyLike(prev, postId));
    setFollowingPosts((prev) => applyLike(prev, postId));
    try {
      await likePost(postId);
    } catch (err) {
      fetchPosts();
    }
  };

  const handleToggleSave = async (postId) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
    try {
      await toggleSavePost(postId);
    } catch {
      // Revert on failure
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(postId)) next.delete(postId);
        else next.add(postId);
        return next;
      });
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
                  <p className="font-display text-xl font-bold text-blossom-500">{myTotalLikes}</p>
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
                <h1 className="font-display text-3xl sm:text-[2.1rem] font-semibold text-ink-900 leading-tight">
                  {headline.before}<em className="italic text-blossom-500">{headline.accent}</em>
                </h1>
                <p className="text-ink-500 text-sm mt-1">{subtitle}</p>
              </div>
            </div>

            {/* Filter pills */}
            <div className="bg-white border border-cream-300 rounded-full p-1 flex gap-1 mb-5 overflow-x-auto">
              {FILTER_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                    tab === t.id
                      ? 'bg-forest-600 text-white shadow-soft'
                      : 'text-ink-700 hover:bg-cream-100'
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Composer */}
            <div className="card p-5 mb-6">
              <div className="flex items-start gap-3">
                <Avatar name={user?.name} src={user?.profilePicture} size="sm" />
                <div className="flex-1 space-y-3">
                  <textarea
                    placeholder={composerPrompt}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onFocus={() => setComposerExpanded(true)}
                    rows={composerExpanded ? 3 : 1}
                    className={`w-full border border-cream-300 px-4 py-2.5 text-sm text-ink-900 placeholder-ink-400 resize-none focus:outline-none focus:ring-2 focus:ring-forest-500 transition-all ${
                      composerExpanded ? 'rounded-xl' : 'rounded-full bg-cream-100 hover:bg-cream-200 cursor-text'
                    }`}
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

                      <ImageUpload value={imageUrl} onChange={setImageUrl} />

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
            ) : tab === 'following' && !followingLoaded ? (
              <p className="text-ink-500 text-sm">Loading posts from people you follow…</p>
            ) : visiblePosts.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-5xl mb-3">{tab === 'following' ? '👥' : '✈️'}</p>
                <h3 className="font-display text-xl font-bold text-ink-900 mb-1">
                  {tab === 'following' ? 'Nothing here yet.' : "It's quiet here."}
                </h3>
                <p className="text-ink-500 text-sm mb-4">
                  {tab === 'following'
                    ? 'Follow other travelers to see their posts here.'
                    : 'Be the first to share a travel moment.'}
                </p>
                <button
                  onClick={() => (tab === 'following' ? setTab('latest') : setComposerExpanded(true))}
                  className="btn-primary px-5 py-2 text-sm"
                >
                  {tab === 'following' ? 'Browse latest posts' : 'Write a post'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {visiblePosts.map((post, i) => (
                  <div
                    key={post._id}
                    className="rise-in"
                    style={{ animationDelay: `${Math.min(i, 6) * 70}ms` }}
                  >
                    <PostCard
                      post={post}
                      user={user}
                      onLike={handleLike}
                      saved={savedIds.has(post._id)}
                      onToggleSave={handleToggleSave}
                      highlight={highlightId === post._id}
                    />
                  </div>
                ))}
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

            <div className="card p-5 bg-gradient-to-br from-forest-700 via-terracotta-600 to-blossom-500 border-0 text-white">
              <p className="text-xs uppercase tracking-[0.14em] text-white/80 font-semibold mb-2">Tip of the day</p>
              <p className="text-[15px] leading-relaxed font-display italic">"{dailyTip}"</p>
            </div>

            <div className="card p-5">
              <p className="text-xs uppercase tracking-wider text-ink-400 font-semibold mb-2">Saved posts</p>
              <p className="text-sm text-ink-600 mb-3">Bookmark posts with the 🔖 icon to find them later.</p>
              <button
                onClick={() => navigate(`/profile/${user.id}?tab=saved`)}
                className="w-full text-sm font-medium text-forest-700 hover:text-forest-800 text-left"
              >
                View saved posts →
              </button>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
