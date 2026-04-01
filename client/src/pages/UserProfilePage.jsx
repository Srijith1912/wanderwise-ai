import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPostsByUser } from '../services/postService';

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (!user) return <p>Loading...</p>;
  const isOwnProfile = user.id === userId;

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const data = await getPostsByUser(userId);
        setPosts(data);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Navigation */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <button onClick={() => navigate('/dashboard')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Dashboard
        </button>
        <button onClick={() => navigate('/feed')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Feed
        </button>
      </div>

      {/* Profile Header */}
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '24px', marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '28px' }}>
          ✈️
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
          {isOwnProfile ? user.name : (posts[0]?.userId?.name || 'Traveler')}
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          {isOwnProfile ? user.email : ''}
        </p>
        <p style={{ marginTop: '8px', color: '#374151' }}>
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>
      </div>

      {/* User's Posts */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        {isOwnProfile ? 'Your Posts' : 'Posts'}
      </h2>

      {loading ? (
        <p>Loading profile...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : posts.length === 0 ? (
        <p style={{ color: '#888' }}>
          {isOwnProfile ? "You haven't posted anything yet." : 'No posts yet.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => (
            <div key={post._id}
              style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
              {post.destinationTag && (
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>
                  📍 {post.destinationTag}
                </p>
              )}
              <p style={{ lineHeight: '1.5', marginBottom: '10px' }}>{post.caption}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9ca3af' }}>
                <span>❤️ {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}