import axios from "axios";

// Resolve API base URL
// Browser: use public URL or current host:8002
// SSR (inside container): prefer internal service URL
const resolvedBaseURL = (() => {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  const internalUrl = process.env.API_URL_INTERNAL || process.env.API_URL;

  if (typeof window === "undefined") {
    // SSR
    if (internalUrl && internalUrl.trim()) return internalUrl;
    // Fallback to Docker service name (works from within containers)
    return "http://s_dogus_erp_backend:8002";
  }

  // Browser
  if (publicUrl && publicUrl.trim()) return publicUrl;
  const proto = window.location.protocol || "http:";
  const host = window.location.hostname || "localhost";
  return `${proto}//${host}:8002`;
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

