import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPostsByUser } from '../services/postService';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';

const isProbablyImageUrl = (url) =>
  /^https?:\/\//i.test(url) &&
  (/\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url) ||
    /(unsplash|imgur|cloudinary|googleusercontent|pexels|pixabay|images\.|cdn\.|media\.)/i.test(url));

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit-profile drawer
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [savedFlash, setSavedFlash] = useState('');

  const isOwnProfile = user && user.id === userId;

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const data = await getPostsByUser(userId);
        if (active) setPosts(data);
      } catch (err) {
        if (active) setError('Failed to load profile.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchUserPosts();
    return () => {
      active = false;
    };
  }, [userId]);

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center text-ink-500">Loading…</div>
      </Layout>
    );
  }

  const profileName = isOwnProfile ? user.name : posts[0]?.userId?.name || 'Traveler';
  const profilePic = isOwnProfile
    ? user.profilePicture
    : posts[0]?.userId?.profilePicture;

  const handleSaveProfile = async () => {
    if (profilePicture && !isProbablyImageUrl(profilePicture)) {
      setProfileError("That doesn't look like an image URL — paste a direct link to an image.");
      return;
    }
    setSavingProfile(true);
    setProfileError('');
    const result = await updateProfile({ name, bio, profilePicture });
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
        <div className="max-w-3xl mx-auto">

          {/* Header card */}
          <div className="card p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <Avatar name={profileName} src={profilePic} size="xl" ring />
              <div className="flex-1">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">{profileName}</h1>
                {isOwnProfile && (
                  <p className="text-ink-500 text-sm mt-1">{user.email}</p>
                )}
                {(isOwnProfile ? user.bio : posts[0]?.userId?.bio) && (
                  <p className="mt-3 text-ink-700 text-sm leading-relaxed max-w-prose">
                    {isOwnProfile ? user.bio : posts[0]?.userId?.bio}
                  </p>
                )}
                <p className="mt-3 text-ink-500 text-sm">
                  <span className="font-semibold text-ink-900">{posts.length}</span>{' '}
                  {posts.length === 1 ? 'post' : 'posts'}
                </p>
              </div>
              {isOwnProfile && (
                <div className="flex flex-col gap-2 sm:items-end">
                  <button onClick={() => setEditing((v) => !v)} className="btn-secondary px-4 py-2 text-sm">
                    {editing ? 'Cancel' : 'Edit profile'}
                  </button>
                  {savedFlash && (
                    <p className="text-forest-700 text-xs font-medium">{savedFlash}</p>
                  )}
                </div>
              )}
            </div>

            {editing && isOwnProfile && (
              <div className="mt-6 pt-6 border-t border-cream-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">Display name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">Profile picture URL</label>
                    <input
                      type="url"
                      value={profilePicture}
                      onChange={(e) => setProfilePicture(e.target.value)}
                      placeholder="https://…"
                      className="input-field"
                    />
                  </div>
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

                {profilePicture && (
                  <div className="flex items-center gap-3">
                    <Avatar name={name} src={profilePicture} size="md" />
                    <p className="text-xs text-ink-500">Preview</p>
                  </div>
                )}

                <p className="text-[11px] text-ink-500 leading-snug">
                  Paste a direct link to an image (Unsplash, Imgur, etc.). The image is fetched directly from that URL — we don't upload or store it.
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

          {/* Posts */}
          <h2 className="font-display text-xl font-bold text-ink-900 mb-4">
            {isOwnProfile ? 'Your posts' : 'Posts'}
          </h2>

          {loading ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map((post) => (
                <article key={post._id} className="card overflow-hidden">
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
          )}
        </div>
      </section>
    </Layout>
  );
}
