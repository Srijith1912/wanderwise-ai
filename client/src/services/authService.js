// client/src/services/authService.js

import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const register = async (name, email, password) => {
  const response = await API.post("/auth/register", { name, email, password });
  return { token: response.data.token, user: response.data.user };
};

export const login = async (email, password) => {
  const response = await API.post("/auth/login", { email, password });
  return { token: response.data.token, user: response.data.user };
};

export const getCurrentUser = async (token) => {
  const response = await API.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.user;
};

export const updateProfile = async (updates) => {
  const response = await API.put("/auth/profile", updates);
  return response.data.user;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await API.put("/auth/password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const changeEmail = async (currentPassword, newEmail) => {
  const response = await API.put("/auth/email", { currentPassword, newEmail });
  return response.data;
};

export default API;
