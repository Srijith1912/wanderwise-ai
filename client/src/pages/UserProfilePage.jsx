import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPostsByUser } from '../services/postService';
import { getTrips } from '../services/tripService';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import SmartImage from '../components/SmartImage';

const TRAVEL_INTEREST_OPTIONS = [
  'Food', 'Culture', 'Nature', 'Adventure', 'History', 'Shopping', 'Nightlife', 'Art', 'Beaches', 'Mountains', 'Cities',
];

const isProbablyImageUrl = (url) =>
  /^https?:\/\//i.test(url) &&
  (/\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url) ||
    /(unsplash|imgur|i\.ibb\.co|ibb\.co|postimg|flickr|staticflickr|cloudinary|googleusercontent|pexels|pixabay|images\.|cdn\.|media\.)/i.test(url));

const IMAGE_URL_HINT =
  "That doesn't look like a direct image link. Make sure the URL ends in .jpg, .png, .gif, or .webp — on imgbb, right-click the image and pick 'Copy image address'.";

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

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  const [imageLoadStatus, setImageLoadStatus] = useState('idle'); // 'idle' | 'loading' | 'ok' | 'failed'

  // Tabs
  const [tab, setTab] = useState('posts');

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

  // Live-test the profile picture URL — debounced. The pattern check (isProbablyImageUrl)
  // catches obvious junk; this catches "looks like an image URL but actually returns a 404 or HTML".
  useEffect(() => {
    if (!profilePicture) {
      setImageLoadStatus('idle');
      return;
    }
    if (!isProbablyImageUrl(profilePicture)) {
      setImageLoadStatus('failed');
      return;
    }
    setImageLoadStatus('loading');
    const timer = setTimeout(() => {
      const probe = new Image();
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        setImageLoadStatus(ok ? 'ok' : 'failed');
      };
      probe.onload = () => finish(true);
      probe.onerror = () => finish(false);
      probe.src = profilePicture;
      // Safety timeout in case the host hangs
      setTimeout(() => finish(false), 8000);
    }, 400);
    return () => clearTimeout(timer);
  }, [profilePicture]);

  useEffect(() => {
    let active = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const postsData = await getPostsByUser(userId);
        if (active) setPosts(postsData);

        if (isOwnProfile) {
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
    fetch();
    return () => {
      active = false;
    };
  }, [userId, isOwnProfile]);

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center text-ink-500">Loading…</div>
      </Layout>
    );
  }

  const profileName = isOwnProfile ? user.name : posts[0]?.userId?.name || 'Traveler';
  const profilePic = isOwnProfile ? user.profilePicture : posts[0]?.userId?.profilePicture;
  const profileBio = isOwnProfile ? user.bio : posts[0]?.userId?.bio;
  const profileLocation = isOwnProfile ? user.homeCountry : posts[0]?.userId?.homeCountry;

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);

  const toggleInterest = (interest) => {
    setTravelInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  };

  const handleSaveProfile = async () => {
    if (profilePicture && !isProbablyImageUrl(profilePicture)) {
      setProfileError(IMAGE_URL_HINT);
      return;
    }
    if (profilePicture && imageLoadStatus === 'failed') {
      setProfileError(
        "We couldn't load that image. On Imgur, right-click the image itself and pick 'Copy image address' (the URL should start with i.imgur.com and end in .jpg or .png).",
      );
      return;
    }
    setSavingProfile(true);
    setProfileError('');
    const result = await updateProfile({
      name,
      bio,
      profilePicture,
      homeCountry,
      travelInterests,
    });
    setSavingProfile(false);
    if (result.success) {
      setEditing(false);
      setSavedFlash('Profile updated.');
      setTimeout(() => setSavedFlash(''), 2500);
    } else {
      setProfileError(result.error || 'Failed to update profile.');
    }
  };

  return (
    <Layout>
      <section className="w-full px-4 sm:px-8 lg:px-12 py-10">
        <div className="max-w-5xl mx-auto">

          {/* Cover + header card */}
          <div className="card overflow-hidden mb-6">
            <div className="h-32 sm:h-40 bg-gradient-to-r from-forest-600 via-forest-700 to-terracotta-600 relative">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
            </div>

            {/* Avatar floats over the cover; buttons + content sit below it */}
            <div className="relative z-10 px-6 sm:px-8 -mt-14 sm:-mt-16">
              <Avatar name={profileName} src={profilePic} size="xl" className="ring-4 ring-white shadow-card" />
            </div>

            <div className="px-6 sm:px-8 pb-6 pt-4">
              {isOwnProfile && (
                <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
                  <button onClick={() => setEditing((v) => !v)} className="btn-secondary text-sm px-4 py-2">
                    {editing ? 'Close editor' : 'Edit profile'}
                  </button>
                  <button onClick={() => navigate('/settings')} className="btn-ghost text-sm">
                    ⚙ Settings
                  </button>
                  {savedFlash && <p className="text-forest-700 text-xs font-medium ml-2">{savedFlash}</p>}
                </div>
              )}

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
                  {(isOwnProfile ? user.travelInterests : posts[0]?.userId?.travelInterests)?.length > 0 && (
                    <span className="inline-flex flex-wrap gap-1.5">
                      {(isOwnProfile ? user.travelInterests : posts[0]?.userId?.travelInterests || []).slice(0, 5).map((i) => (
                        <span key={i} className="text-xs bg-cream-200 text-ink-700 px-2 py-0.5 rounded-full">{i}</span>
                      ))}
                    </span>
                  )}
                </div>

                {profileBio && (
                  <p className="mt-4 text-ink-700 leading-relaxed max-w-2xl">{profileBio}</p>
                )}

                {/* Stats */}
                <div className="mt-5 grid grid-cols-3 gap-4 max-w-md">
                  <div>
                    <p className="font-display text-2xl font-bold text-ink-900">{posts.length}</p>
                    <p className="text-xs text-ink-500 uppercase tracking-wider">Posts</p>
                  </div>
                  {isOwnProfile && (
                    <div>
                      <p className="font-display text-2xl font-bold text-ink-900">{trips.length}</p>
                      <p className="text-xs text-ink-500 uppercase tracking-wider">Trips</p>
                    </div>
                  )}
                  <div>
                    <p className="font-display text-2xl font-bold text-ink-900">{totalLikes}</p>
                    <p className="text-xs text-ink-500 uppercase tracking-wider">Likes</p>
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
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">Profile picture URL</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="url"
                        value={profilePicture}
                        onChange={(e) => setProfilePicture(e.target.value)}
                        placeholder="https://… (Unsplash, Imgur, etc.)"
                        className="input-field flex-1"
                      />
                      <Avatar name={name} src={profilePicture} size="md" />
                    </div>
                    {profilePicture && (
                      <p className={`mt-1.5 text-xs ${
                        imageLoadStatus === 'ok' ? 'text-forest-700'
                          : imageLoadStatus === 'failed' ? 'text-coral-600'
                          : 'text-ink-500'
                      }`}>
                        {imageLoadStatus === 'loading' && 'Checking image…'}
                        {imageLoadStatus === 'ok' && '✓ Image loads correctly.'}
                        {imageLoadStatus === 'failed' && (
                          <>
                            That URL didn't return an image. On Imgur use <strong>Copy image address</strong> from the image itself — it should look like <code>https://i.imgur.com/xxxx.jpg</code>.
                          </>
                        )}
                      </p>
                    )}
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
                                ? 'bg-terracotta-500 text-white border-terracotta-500'
                                : 'bg-white text-ink-700 border-cream-300 hover:border-terracotta-400'
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[11px] text-ink-500">
                    Profile pictures are loaded directly from the URL you paste. We don't upload or store the image.
                  </p>

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
              onClick={() => setTab('posts')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                tab === 'posts'
                  ? 'border-forest-600 text-forest-700'
                  : 'border-transparent text-ink-500 hover:text-ink-800'
              }`}
            >
              Posts ({posts.length})
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setTab('trips')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                  tab === 'trips'
                    ? 'border-forest-600 text-forest-700'
                    : 'border-transparent text-ink-500 hover:text-ink-800'
                }`}
              >
                Trips ({trips.length})
              </button>
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
                        <span>❤ {post.likes.length}</span>
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
                      <SmartImage
                        query={trip.destination}
                        alt={trip.destination}
                        size={600}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/55 to-transparent" />
                    </div>
                    <div className="p-4">
                      <p className="font-display font-bold text-ink-900 mb-1 truncate">{trip.title || trip.destination}</p>
                      <p className="text-sm text-ink-500 mb-3 truncate">{trip.destination}</p>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <span className="bg-forest-50 text-forest-700 border border-forest-100 px-2.5 py-1 rounded-full">
                          {trip.duration} days
                        </span>
                        <span className="bg-terracotta-50 text-terracotta-700 border border-terracotta-100 px-2.5 py-1 rounded-full">
                          {trip.budget}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </Layout>
  );
}
