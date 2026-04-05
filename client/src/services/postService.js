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

export const getPostsByUser = async (userId) => {
  const { data } = await axios.get(`${BASE}/user/${userId}`, {
    headers: getAuthHeader(),
  });
  return data.posts;
};

export const likePost = async (postId) => {
  const { data } = await axios.post(
    `${BASE}/${postId}/like`,
    {},
    { headers: getAuthHeader() },
  );
  return data;
};
