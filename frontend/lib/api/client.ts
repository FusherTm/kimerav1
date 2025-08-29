import axios from "axios";

// Resolve API base URL
// Priority: env NEXT_PUBLIC_API_URL -> window hostname (port 8000) -> localhost
const resolvedBaseURL = (() => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) return envUrl;
  if (typeof window !== "undefined") {
    const proto = window.location.protocol || "http:";
    const host = window.location.hostname || "localhost";
    return `${proto}//${host}:8000`;
  }
  return "http://localhost:8000";
})();

const api = axios.create({
  baseURL: resolvedBaseURL,
  // We use Authorization bearer tokens, not cookies; avoid credentialed CORS
  withCredentials: false,
  timeout: 15000,
});

api.interceptors.request.use((cfg) => {
  try {
    const t = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    const org = typeof window !== "undefined" ? localStorage.getItem("org_slug") : null;
    if (org) (cfg.headers as any)["X-Org-Slug"] = org;
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
      if (status === 401) {
        try {
          localStorage.removeItem("access_token");
          // optional: keep org_slug
        } catch {}
        // redirect to login if unauthorized
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
export { api };

