import axios from "axios";

const api = axios.create({
  baseURL: "http://3.107.202.217:5000/api",
});

// Attach the JWT token to every outgoing request automatically,
// so individual pages never have to think about it.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
