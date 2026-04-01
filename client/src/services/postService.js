import axios from "axios";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const createPost = async (caption, destinationTag, imageUrl = "") => {
  const { data } = await axios.post(
    "/api/posts",
    { caption, destinationTag, imageUrl },
    { headers: getAuthHeader() },
  );
  return data.post;
};

export const getPosts = async () => {
  const { data } = await axios.get("/api/posts", {
    headers: getAuthHeader(),
  });
  return data.posts;
};

export const getPostsByUser = async (userId) => {
  const { data } = await axios.get(`/api/posts/user/${userId}`, {
    headers: getAuthHeader(),
  });
  return data.posts;
};

export const likePost = async (postId) => {
  const { data } = await axios.post(
    `/api/posts/${postId}/like`,
    {},
    { headers: getAuthHeader() },
  );
  return data;
};
