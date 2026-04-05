import axios from "axios";

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/trips`
  : "/api/trips";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const generateTrip = async (formData) => {
  const response = await axios.post(`${BASE}/generate`, formData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const saveTrip = async (tripData) => {
  const response = await axios.post(`${BASE}/save`, tripData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getTrips = async () => {
  const response = await axios.get(BASE, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteTripById = async (id) => {
  const response = await axios.delete(`${BASE}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getTripById = async (id) => {
  const response = await axios.get(`${BASE}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateTrip = async (id, title) => {
  const response = await axios.put(
    `${BASE}/${id}`,
    { title },
    { headers: getAuthHeader() },
  );
  return response.data;
};
