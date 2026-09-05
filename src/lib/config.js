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

// The API is inconsistent about which key carries the human-readable reason:
// the auth/plan middleware and many controllers send { error }, others send
// { message }. Reading only `message` is why a 403 surfaced as axios's opaque
// "Request failed with status code 403" instead of the real cause.
// Returns undefined when neither key holds text, so the existing
// `|| "Something went wrong"` tails at the call sites still apply.
const asText = (v) => (typeof v === "string" && v.trim() ? v : undefined);

export const extractApiError = (err) => {
  const data = err?.response?.data;
  if (!data) return undefined;
  return asText(data.error) ?? asText(data.message);
};

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

// Same idea for station-wide 403s: the dashboard fires several requests in
// parallel and every one of them fails, so only announce the reason once.
let forbiddenHandled = false;

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

    // A 403 from the auth/plan gate carries a flag saying WHY access was
    // refused. These are station-wide conditions rather than per-request
    // failures, so surface them once here instead of letting every card
    // render the raw axios string.
    if (status === 403 && !forbiddenHandled && typeof window !== "undefined") {
      const data = error?.response?.data || {};
      const notice = data.planExpired
        ? "Your subscription has expired. Use the Upgrade button to renew and restore access."
        : data.suspended
        ? "Your station account is suspended or no longer active. Please contact FuelDesk support."
        : data.emergencyMode
        ? "The station is under emergency lockdown. Contact your manager."
        : null;

      if (notice) {
        forbiddenHandled = true;
        toast.error(notice, { duration: 6000, id: "access-forbidden" });
        // Let it announce again on a later burst, once this one has passed.
        setTimeout(() => {
          forbiddenHandled = false;
        }, 5000);
      }
    }

    return Promise.reject(error);
  }
);