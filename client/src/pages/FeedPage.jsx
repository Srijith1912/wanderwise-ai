import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createPost, getPosts, likePost } from '../services/postService';

export default function FeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState('');
  const [destinationTag, setDestinationTag] = useState('');
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

    try {
      setSubmitting(true);
      setPostError('');
      const newPost = await createPost(caption, destinationTag);
      // Prepend new post to top of feed
      setPosts((prev) => [newPost, ...prev]);
      setCaption('');
      setDestinationTag('');
    } catch (err) {
      setPostError('Failed to create post. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
  // Optimistic update — flip UI immediately
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id !== postId) return post;

        const alreadyLiked = post.likes.some(
          (id) => id && id.toString() === user.id
        );
        return {
          ...post,
          likes: alreadyLiked
            ? post.likes.filter((id) => id && id.toString() !== user.id)
            : [...post.likes, user.id],
        };
      })
    );

    try {
      await likePost(postId);
    } catch (err) {
      // Only re-fetch if server call actually fails
      fetchPosts();
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Navigation */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <button onClick={() => navigate('/dashboard')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Dashboard
        </button>
        <button onClick={() => navigate('/trips')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}>
          My Trips
        </button>
        <button onClick={() => navigate(`/profile/${user?.id}`)}
          style={{ padding: '8px 16px', cursor: 'pointer' }}>
          My Profile
        </button>
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
        Travel Feed
      </h1>

      {/* Create Post */}
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
          Share a travel moment
        </h2>
        <textarea
          placeholder="What's on your travel mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical', boxSizing: 'border-box' }}
        />
        <input
          type="text"
          placeholder="Destination tag (e.g. Rome, Italy)"
          value={destinationTag}
          onChange={(e) => setDestinationTag(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
        {postError && (
          <p style={{ color: 'red', fontSize: '14px', marginBottom: '8px' }}>{postError}</p>
        )}
        <button
          onClick={handleCreatePost}
          disabled={submitting}
          style={{ padding: '8px 20px', cursor: submitting ? 'not-allowed' : 'pointer' }}
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>

      {/* Feed */}
      {loadingFeed ? (
        <p>Loading feed...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : posts.length === 0 ? (
        <p style={{ color: '#888' }}>No posts yet. Be the first to share!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => {
            const isLiked = post.likes.some((id) => id && id.toString() === user.id);
            const isOwner = user && post.userId._id.toString() === user.id;

            return (
              <div key={post._id}
                style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>

                {/* Post Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span
                    onClick={() => navigate(`/profile/${post.userId._id}`)}
                    style={{ fontWeight: '600', cursor: 'pointer', color: '#2563eb' }}
                  >
                    {isOwner ? 'You' : post.userId.name}
                  </span>
                  {post.destinationTag && (
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                      📍 {post.destinationTag}
                    </span>
                  )}
                </div>

                {/* Caption */}
                <p style={{ marginBottom: '12px', lineHeight: '1.5' }}>{post.caption}</p>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleLike(post._id)}
                    style={{ cursor: 'pointer', fontSize: '18px', background: 'none', border: 'none', padding: 0 }}
                  >
                    {isLiked ? '❤️' : '🤍'}
                  </button>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}