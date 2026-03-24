import axios from "axios";

const API_URL = "http://localhost:5000/api/trips";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const generateTrip = async (formData) => {
  const response = await axios.post(`${API_URL}/generate`, formData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const saveTrip = async (tripData) => {
  const response = await axios.post(`${API_URL}/save`, tripData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getTrips = async () => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteTripById = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
