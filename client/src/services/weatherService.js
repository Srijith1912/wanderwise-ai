import axios from "axios";

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/weather`
  : "/api/weather";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const getWeather = async (city) => {
  const { data } = await axios.get(BASE, {
    params: { city },
    headers: getAuthHeader(),
  });
  return data; // { available, forecast: [...], city, country }
};
