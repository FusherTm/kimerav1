import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((cfg) => {
  try {
    const t = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
  } catch {}
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error("API ERROR:", status, data);
    }
    return Promise.reject(err);
  }
);

export default api;
export { api };

