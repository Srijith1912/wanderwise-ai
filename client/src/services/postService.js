import axios from "axios";

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/posts`
  : "/api/posts";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const createPost = async (caption, destinationTag, imageUrl = "") => {
  const { data } = await axios.post(
    BASE,
    { caption, destinationTag, imageUrl },
    { headers: getAuthHeader() },
  );
  return data.post;
};

export const getPosts = async () => {
  const { data } = await axios.get(BASE, {
    headers: getAuthHeader(),
  });
  return data.posts;
};

// `archived: true` is only honoured for your own posts (server-enforced).
export const getPostsByUser = async (userId, { archived = false } = {}) => {
  const { data } = await axios.get(`${BASE}/user/${userId}`, {
    params: archived ? { archived: "true" } : undefined,
    headers: getAuthHeader(),
  });
  return data.posts;
};

export const editPost = async (postId, { caption, imageUrl, destinationTag }) => {
  const { data } = await axios.patch(
    `${BASE}/${postId}`,
    { caption, imageUrl, destinationTag },
    { headers: getAuthHeader() },
  );
  return data.post;
};

export const deletePost = async (postId) => {
  const { data } = await axios.delete(`${BASE}/${postId}`, {
    headers: getAuthHeader(),
  });
  return data;
};

export const toggleArchivePost = async (postId) => {
  const { data } = await axios.post(
    `${BASE}/${postId}/archive`,
    {},
    { headers: getAuthHeader() },
  );
  return data;
};

export const likePost = async (postId) => {
  const { data } = await axios.post(
    `${BASE}/${postId}/like`,
    {},
    { headers: getAuthHeader() },
  );
  return data;
};

export const addComment = async (postId, text) => {
  const { data } = await axios.post(
    `${BASE}/${postId}/comment`,
    { text },
    { headers: getAuthHeader() },
  );
  return data.comment;
};

export const getComments = async (postId) => {
  const { data } = await axios.get(`${BASE}/${postId}/comments`, {
    headers: getAuthHeader(),
  });
  return data.comments;
};

export const deleteComment = async (postId, commentId) => {
  const { data } = await axios.delete(
    `${BASE}/${postId}/comment/${commentId}`,
    { headers: getAuthHeader() },
  );
  return data;
};

export const toggleCommentLike = async (postId, commentId) => {
  const { data } = await axios.post(
    `${BASE}/${postId}/comment/${commentId}/like`,
    {},
    { headers: getAuthHeader() },
  );
  return data;
};

export const toggleSavePost = async (postId) => {
  const { data } = await axios.post(
    `${BASE}/${postId}/save`,
    {},
    { headers: getAuthHeader() },
  );
  return data;
};

export const getSavedPosts = async () => {
  const { data } = await axios.get(`${BASE}/saved/me`, {
    headers: getAuthHeader(),
  });
  return data.posts;
};
