import axios from "axios";

export const getDestinations = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.continent) params.append("continent", filters.continent);
  if (filters.budget) params.append("budget", filters.budget);
  if (filters.vibe) params.append("vibe", filters.vibe);

  const res = await axios.get(`/api/explore?${params.toString()}`);
  return res.data.destinations;
};
