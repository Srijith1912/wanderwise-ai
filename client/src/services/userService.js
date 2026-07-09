import axios from "axios";

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/users`
  : "/api/users";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const getUserProfile = async (userId) => {
  const { data } = await axios.get(`${BASE}/${userId}`, {
    headers: getAuthHeader(),
  });
  return data.profile;
};

export const toggleFollow = async (userId) => {
  const { data } = await axios.post(
    `${BASE}/${userId}/follow`,
    {},
    { headers: getAuthHeader() },
  );
  return data;
};

export const getFollowers = async (userId) => {
  const { data } = await axios.get(`${BASE}/${userId}/followers`, {
    headers: getAuthHeader(),
  });
  return data.users;
};

export const getFollowing = async (userId) => {
  const { data } = await axios.get(`${BASE}/${userId}/following`, {
    headers: getAuthHeader(),
  });
  return data.users;
};

export const getFollowingFeed = async () => {
  const { data } = await axios.get(`${BASE}/me/feed`, {
    headers: getAuthHeader(),
  });
  return data.posts;
};
