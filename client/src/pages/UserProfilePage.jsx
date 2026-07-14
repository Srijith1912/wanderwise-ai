import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPostsByUser, getSavedPosts, likePost, toggleSavePost } from '../services/postService';
import { getTrips } from '../services/tripService';
import { getUserProfile, toggleFollow, getFollowers, getFollowing } from '../services/userService';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import SmartImage from '../components/SmartImage';
import PostCard from '../components/PostCard';
import ImageUpload from '../components/ImageUpload';

const TRAVEL_INTEREST_OPTIONS = [
  'Food', 'Culture', 'Nature', 'Adventure', 'History', 'Shopping', 'Nightlife', 'Art', 'Beaches', 'Mountains', 'Cities',
];

const QuickAction = ({ icon, label, onClick, accent }) => (
  <button
    onClick={onClick}
    className="card p-4 hover:shadow-hover transition flex items-center gap-3 text-left"
  >
    <span className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center shrink-0`}>
      {icon}
    </span>
    <span className="font-semibold text-ink-900 text-sm">{label}</span>
  </button>
);

// Modal listing followers / following.
function FollowListModal({ title, users, loading, onClose, onNavigate }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/40 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200">
          <h3 className="font-display font-bold text-ink-900">{title}</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto p-2">
          {loading ? (
            <p className="text-sm text-ink-500 p-4 text-center">Loading…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-ink-500 p-6 text-center">No one here yet.</p>
          ) : (
            users.map((u) => (
              <button
                key={u._id}
                onClick={() => { onNavigate(u._id); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cream-100 transition text-left"
              >
                <Avatar name={u.name} src={u.profilePicture} size="sm" />
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900 text-sm truncate">{u.name}</p>
                  {u.homeCountry && <p className="text-xs text-ink-500 truncate">{u.homeCountry}</p>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedLoaded, setSavedLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followBusy, setFollowBusy] = useState(false);

  // Follow list modal
  const [followModal, setFollowModal] = useState(null); // 'followers' | 'following' | null
  const [followList, setFollowList] = useState([]);
  const [followListLoading, setFollowListLoading] = useState(false);

  // Edit-profile state
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [homeCountry, setHomeCountry] = useState('');
  const [travelInterests, setTravelInterests] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [savedFlash, setSavedFlash] = useState('');

  const [tab, setTab] = useState(searchParams.get('tab') || 'posts');

  const isOwnProfile = user && user.id === userId;

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setProfilePicture(user.profilePicture || '');
      setHomeCountry(user.homeCountry || '');
      setTravelInterests(user.travelInterests || []);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [profileData, postsData] = await Promise.all([
          getUserProfile(userId),
          getPostsByUser(userId),
        ]);
        if (!active) return;
        setProfile(profileData);
        setPosts(postsData);

        if (profileData.isSelf) {
          try {
            const tripsRaw = await getTrips();
            const tripList = Array.isArray(tripsRaw) ? tripsRaw : tripsRaw.trips || [];
            if (active) setTrips(tripList);
          } catch {
            if (active) setTrips([]);
          }
        }
      } catch (err) {
        if (active) setError('Failed to load profile.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [userId]);

  // Lazy-load saved posts the first time the Saved tab is opened (own profile).
  useEffect(() => {
    if (tab === 'saved' && isOwnProfile && !savedLoaded) {
      getSavedPosts()
        .then((p) => setSavedPosts(p || []))
        .catch(() => setSavedPosts([]))
        .finally(() => setSavedLoaded(true));
    }
  }, [tab, isOwnProfile, savedLoaded]);

  const switchTab = (id) => {
    setTab(id);
    setSearchParams(id === 'posts' ? {} : { tab: id }, { replace: true });
  };

  const handleFollow = async () => {
    if (followBusy || !profile) return;
    setFollowBusy(true);
    const wasFollowing = profile.isFollowing;
    setProfile((p) => ({
      ...p,
      isFollowing: !wasFollowing,
      followerCount: p.followerCount + (wasFollowing ? -1 : 1),
    }));
    try {
      await toggleFollow(userId);
    } catch {
      // revert
      setProfile((p) => ({
        ...p,
        isFollowing: wasFollowing,
        followerCount: p.followerCount + (wasFollowing ? 1 : -1),
      }));
    } finally {
      setFollowBusy(false);
    }
  };

  const openFollowList = async (kind) => {
    setFollowModal(kind);
    setFollowListLoading(true);
    try {
      const list = kind === 'followers' ? await getFollowers(userId) : await getFollowing(userId);
      setFollowList(list || []);
    } catch {
      setFollowList([]);
    } finally {
      setFollowListLoading(false);
    }
  };

  const toggleInterest = (interest) => {
    setTravelInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError('');
    const result = await updateProfile({ name, bio, profilePicture, homeCountry, travelInterests });
    setSavingProfile(false);
    if (result.success) {
      setEditing(false);
      setSavedFlash('Profile updated.');
      setTimeout(() => setSavedFlash(''), 2500);
      // Reflect edits in the header immediately.
      setProfile((p) => p && { ...p, name, bio, profilePicture, homeCountry, travelInterests });
    } else {
      setProfileError(result.error || 'Failed to update profile.');
    }
  };

  // Handlers for PostCard used in the Saved tab.
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

  const handleLikeSaved = async (postId) => {
    setSavedPosts((prev) => applyLike(prev, postId));
    try { await likePost(postId); } catch { /* ignore */ }
  };

  const handleUnsave = async (postId) => {
    setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
    try { await toggleSavePost(postId); } catch { /* ignore */ }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center text-ink-500">Loading…</div>
      </Layout>
    );
  }

  const profileName = profile?.name || 'Traveler';
  const profilePic = profile?.profilePicture;
  const profileBio = profile?.bio;
  const profileLocation = profile?.homeCountry;
  const profileInterests = profile?.travelInterests || [];

  return (
    <Layout>
      <section className="w-full px-4 sm:px-8 lg:px-12 py-10">
        <div className="max-w-5xl mx-auto">

          {/* Header card — big avatar beside identity, no cover */}
          <div className="card overflow-hidden mb-6">
            <div className="px-6 sm:px-8 py-6 sm:py-8">
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 sm:items-start">
                <Avatar name={profileName} src={profilePic} size="2xl" className="ring-4 ring-cream-200 shadow-card shrink-0 mx-auto sm:mx-0" />
                <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
                {isOwnProfile ? (
                  <>
                    <button onClick={() => setEditing((v) => !v)} className="btn-secondary text-sm px-4 py-2">
                      {editing ? 'Close editor' : 'Edit profile'}
                    </button>
                    <button onClick={() => navigate('/settings')} className="btn-ghost text-sm">⚙ Settings</button>
                    {savedFlash && <p className="text-forest-700 text-xs font-medium ml-2">{savedFlash}</p>}
                  </>
                ) : profile ? (
                  <button
                    onClick={handleFollow}
                    disabled={followBusy}
                    className={`text-sm px-5 py-2 rounded-xl font-medium transition disabled:opacity-60 ${
                      profile.isFollowing
                        ? 'bg-cream-200 text-ink-700 hover:bg-cream-300'
                        : 'btn-primary'
                    }`}
                  >
                    {profile.isFollowing ? 'Following ✓' : '+ Follow'}
                  </button>
                ) : null}
              </div>

              <div>
                <h1 className="font-display text-3xl font-bold text-ink-900">{profileName}</h1>

                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-ink-500">
                  {profileLocation && (
                    <span className="inline-flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="10" r="3" />
                        <path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8z" />
                      </svg>
                      {profileLocation}
                    </span>
                  )}
                  {profileInterests.length > 0 && (
                    <span className="inline-flex flex-wrap gap-1.5">
                      {profileInterests.slice(0, 5).map((i) => (
                        <span key={i} className="text-xs bg-blossom-50 text-blossom-700 border border-blossom-100 px-2.5 py-0.5 rounded-full font-medium">{i}</span>
                      ))}
                    </span>
                  )}
                </div>

                {profileBio && <p className="mt-4 text-ink-700 leading-relaxed max-w-2xl">{profileBio}</p>}

                {/* Stats */}
                <div className="mt-5 flex flex-wrap gap-6">
                  <div>
                    <p className="font-display text-2xl font-bold text-ink-900">{posts.length}</p>
                    <p className="text-xs text-ink-500 uppercase tracking-wider">Posts</p>
                  </div>
                  <button onClick={() => openFollowList('followers')} className="text-left hover:opacity-70 transition">
                    <p className="font-display text-2xl font-bold text-ink-900">{profile?.followerCount ?? 0}</p>
                    <p className="text-xs text-ink-500 uppercase tracking-wider">Followers</p>
                  </button>
                  <button onClick={() => openFollowList('following')} className="text-left hover:opacity-70 transition">
                    <p className="font-display text-2xl font-bold text-ink-900">{profile?.followingCount ?? 0}</p>
                    <p className="text-xs text-ink-500 uppercase tracking-wider">Following</p>
                  </button>
                  {isOwnProfile && (
                    <div>
                      <p className="font-display text-2xl font-bold text-ink-900">{trips.length}</p>
                      <p className="text-xs text-ink-500 uppercase tracking-wider">Trips</p>
                    </div>
                  )}
                </div>
              </div>
                </div>
              </div>

              {/* Edit panel */}
              {editing && isOwnProfile && (
                <div className="mt-6 pt-6 border-t border-cream-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">Display name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">Location</label>
                      <input
                        type="text"
                        value={homeCountry}
                        onChange={(e) => setHomeCountry(e.target.value)}
                        placeholder="e.g. Bengaluru, India"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">Profile picture</label>
                    <ImageUpload value={profilePicture} onChange={setProfilePicture} aspect="square" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">Bio</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell other travelers about yourself…"
                      className="input-field resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">Travel interests</label>
                    <div className="flex flex-wrap gap-1.5">
                      {TRAVEL_INTEREST_OPTIONS.map((interest) => {
                        const active = travelInterests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                              active
                                ? 'bg-blossom-500 text-white border-blossom-500'
                                : 'bg-white text-ink-700 border-cream-300 hover:border-blossom-300'
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {profileError && <p className="text-coral-600 text-sm">{profileError}</p>}

                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditing(false)} className="btn-ghost text-sm">Cancel</button>
                    <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary px-5 py-2 text-sm">
                      {savingProfile ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions — own profile only */}
          {isOwnProfile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <QuickAction
                onClick={() => navigate('/planner')}
                accent="bg-forest-50 text-forest-700"
                icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7l-6 2-3-3-2 1 2 3-3 1-2-2-1 1 2 2-2 5 1 1 5-2 2 2 1-1-2-2 1-3 3 2 1-2-3-3 2-6z"/></svg>}
                label="Plan a trip"
              />
              <QuickAction
                onClick={() => navigate('/trips')}
                accent="bg-terracotta-50 text-terracotta-700"
                icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4"/></svg>}
                label="My trips"
              />
              <QuickAction
                onClick={() => navigate('/feed')}
                accent="bg-coral-50 text-coral-700"
                icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>}
                label="Travel feed"
              />
              <QuickAction
                onClick={() => navigate('/')}
                accent="bg-cream-200 text-ink-700"
                icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20"/></svg>}
                label="Explore"
              />
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-cream-300 mb-6 flex gap-1">
            <button
              onClick={() => switchTab('posts')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                tab === 'posts' ? 'border-forest-600 text-forest-700' : 'border-transparent text-ink-500 hover:text-ink-800'
              }`}
            >
              Posts ({posts.length})
            </button>
            {isOwnProfile && (
              <>
                <button
                  onClick={() => switchTab('trips')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                    tab === 'trips' ? 'border-forest-600 text-forest-700' : 'border-transparent text-ink-500 hover:text-ink-800'
                  }`}
                >
                  Trips ({trips.length})
                </button>
                <button
                  onClick={() => switchTab('saved')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                    tab === 'saved' ? 'border-forest-600 text-forest-700' : 'border-transparent text-ink-500 hover:text-ink-800'
                  }`}
                >
                  🔖 Saved{savedLoaded ? ` (${savedPosts.length})` : ''}
                </button>
              </>
            )}
          </div>

          {/* Posts tab */}
          {tab === 'posts' && (
            loading ? (
              <p className="text-ink-500 text-sm">Loading posts…</p>
            ) : error ? (
              <p className="text-coral-600 text-sm">{error}</p>
            ) : posts.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="text-4xl mb-3">📝</p>
                <p className="text-ink-500">
                  {isOwnProfile ? "You haven't posted anything yet." : 'No posts yet.'}
                </p>
                {isOwnProfile && (
                  <button onClick={() => navigate('/feed')} className="btn-primary mt-4 px-5 py-2 text-sm">
                    Share your first post
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <article key={post._id} className="card overflow-hidden hover:shadow-hover transition">
                    {post.imageUrl && (
                      <div className="bg-cream-100">
                        <img
                          src={post.imageUrl}
                          alt=""
                          className="w-full h-44 object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      {post.destinationTag && (
                        <p className="text-xs text-forest-700 bg-forest-50 inline-block px-2 py-0.5 rounded-full border border-forest-100 mb-2">
                          📍 {post.destinationTag}
                        </p>
                      )}
                      <p className="text-sm text-ink-800 leading-relaxed line-clamp-4">{post.caption}</p>
                      <div className="flex items-center justify-between text-xs text-ink-500 mt-3 pt-3 border-t border-cream-200">
                        <span>❤ {post.likes.length} · 💬 {post.comments?.length || 0}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          )}

          {/* Trips tab — own profile */}
          {tab === 'trips' && isOwnProfile && (
            loading ? (
              <p className="text-ink-500 text-sm">Loading trips…</p>
            ) : trips.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="text-4xl mb-3">🧳</p>
                <p className="text-ink-500 mb-4">No saved trips yet.</p>
                <button onClick={() => navigate('/planner')} className="btn-primary px-5 py-2 text-sm">
                  Plan your first trip
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trips.map((trip) => (
                  <button
                    key={trip._id}
                    onClick={() => navigate(`/trips/${trip._id}`)}
                    className="card overflow-hidden text-left hover:shadow-hover transition flex flex-col"
                  >
                    <div className="relative h-32 overflow-hidden">
                      <SmartImage query={trip.destination} alt={trip.destination} size={600} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-night/55 to-transparent" />
                    </div>
                    <div className="p-4">
                      <p className="font-display font-bold text-ink-900 mb-1 truncate">{trip.title || trip.destination}</p>
                      <p className="text-sm text-ink-500 mb-3 truncate">{trip.destination}</p>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <span className="bg-forest-50 text-forest-700 border border-forest-100 px-2.5 py-1 rounded-full">{trip.duration} days</span>
                        <span className="bg-terracotta-50 text-terracotta-700 border border-terracotta-100 px-2.5 py-1 rounded-full">{trip.budget}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}

          {/* Saved tab — own profile */}
          {tab === 'saved' && isOwnProfile && (
            !savedLoaded ? (
              <p className="text-ink-500 text-sm">Loading saved posts…</p>
            ) : savedPosts.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="text-4xl mb-3">🔖</p>
                <p className="text-ink-500 mb-4">No saved posts yet. Tap the bookmark on any post to save it here.</p>
                <button onClick={() => navigate('/feed')} className="btn-primary px-5 py-2 text-sm">
                  Browse the feed
                </button>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-4">
                {savedPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    user={user}
                    onLike={handleLikeSaved}
                    saved={true}
                    onToggleSave={handleUnsave}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </section>

      {followModal && (
        <FollowListModal
          title={followModal === 'followers' ? 'Followers' : 'Following'}
          users={followList}
          loading={followListLoading}
          onClose={() => setFollowModal(null)}
          onNavigate={(id) => navigate(`/profile/${id}`)}
        />
      )}
    </Layout>
  );
}
