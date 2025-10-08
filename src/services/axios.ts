import { auth } from "@/lib/firebase";
import { useProjectStore } from "@/stores/projectStore";
import axios from "axios";

export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  async (config) => {
    const token = await auth.currentUser?.getIdToken();
    const projectId = useProjectStore.getState().currentProjectId;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["X-Project-Id"] = projectId || "";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // auth.signOut();
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
