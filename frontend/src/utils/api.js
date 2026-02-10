import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* ================= AUTH ================= */
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getProfile: () => api.get("/auth/me"),
  uploadResume: (formData) =>
    api.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

/* ================= JOBS ================= */
export const jobsAPI = {
  getJobs: (params) => api.get("/jobs", { params }),
  getBestMatches: () => api.get("/jobs/best-matches"),
  getStats: () => api.get("/jobs/stats"),
};

/* ================= APPLICATIONS ================= */
export const applicationsAPI = {
  create: (data) => api.post("/applications", data),
  getAll: () => api.get("/applications"),
  update: (id, data) => api.put(`/applications/${id}`, data),
};

/* ================= AI (🔥 THIS WAS MISSING) ================= */
export const aiAPI = {
  chat: (message, currentFilters) =>
    api.post("/ai/chat", { message, currentFilters }),
  getSuggestions: () => api.get("/ai/suggestions"),
};

export default api;
