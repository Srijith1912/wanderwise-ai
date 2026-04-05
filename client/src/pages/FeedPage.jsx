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

  useEffect(() => { fetchPosts(); }, []);

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
      })
    );
    try {
      await likePost(postId);
    } catch (err) {
      fetchPosts();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Travel Feed</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
              Dashboard
            </button>
            <button onClick={() => navigate('/trips')}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
              My Trips
            </button>
            <button onClick={() => navigate(`/profile/${user?.id}`)}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
              Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Create Post */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Share a travel moment</h2>
          <textarea
            placeholder="What's on your travel mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
          <input
            type="text"
            placeholder="Destination tag (e.g. Rome, Italy)"
            value={destinationTag}
            onChange={(e) => setDestinationTag(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />
          {postError && <p className="text-red-500 text-sm mb-2">{postError}</p>}
          <button
            onClick={handleCreatePost}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </div>

        {/* Feed */}
        {loadingFeed ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">✈️</p>
            <p className="text-gray-500">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const isLiked = post.likes.some((id) => id && id.toString() === user.id);
              const isOwner = user && post.userId._id.toString() === user.id;

              return (
                <div key={post._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      onClick={() => navigate(`/profile/${post.userId._id}`)}
                      className="font-semibold text-blue-600 cursor-pointer hover:underline text-sm"
                    >
                      {isOwner ? 'You' : post.userId.name}
                    </span>
                    {post.destinationTag && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        📍 {post.destinationTag}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{post.caption}</p>
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
                    <button
                      onClick={() => handleLike(post._id)}
                      className="text-xl leading-none bg-none border-none cursor-pointer"
                    >
                      {isLiked ? '❤️' : '🤍'}
                    </button>
                    <span className="text-sm text-gray-500">
                      {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}