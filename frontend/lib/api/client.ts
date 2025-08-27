import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL,
  withCredentials: true, // cookie/jwt kullanıyorsan kalsın
  timeout: 15000,
});

export default api;
export { api };
