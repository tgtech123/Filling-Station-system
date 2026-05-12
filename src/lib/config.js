import axios from "axios";
import toast from "react-hot-toast";

export const API_URL =
  process.env.NEXT_PUBLIC_API ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fueldesk-station-server.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Prevent multiple simultaneous 401s from firing multiple redirects
let sessionExpiredHandled = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    // Don't intercept 401s from the login endpoint itself — wrong password is not a session expiry
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/signin");

    if (status === 401 && !isAuthEndpoint && !sessionExpiredHandled) {
      sessionExpiredHandled = true;

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        toast.error("Your session expired, please log in again.", {
          duration: 4000,
          id: "session-expired",
        });

        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);

        // Reset the flag after redirect so future sessions work correctly
        setTimeout(() => {
          sessionExpiredHandled = false;
        }, 5000);
      }
    }

    return Promise.reject(error);
  }
);