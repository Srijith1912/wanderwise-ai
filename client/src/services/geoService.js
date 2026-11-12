import axios from "axios";

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/geo`
  : "/api/geo";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// Coordinates for a trip's named places (looked up + cached server-side).
export const getPins = async (destination, places) => {
  const { data } = await axios.post(
    `${BASE}/pins`,
    { destination, places },
    { headers: getAuthHeader() },
  );
  return data; // { center, bbox, pins: { [place]: { lat, lng, name, source } | null }, incomplete }
};
