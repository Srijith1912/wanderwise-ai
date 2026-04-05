import axios from "axios";

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/explore`
  : "/api/explore";

export const getDestinations = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.continent) params.append("continent", filters.continent);
  if (filters.budget) params.append("budget", filters.budget);
  if (filters.vibe) params.append("vibe", filters.vibe);

  const res = await axios.get(`${BASE}?${params.toString()}`);
  return res.data.destinations;
};
