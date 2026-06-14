import axios from "axios";

import { triggerSessionExpired } from "./sessionExpired";

// Token/auth error codes returned by the server (server/src/shared/exceptions/root.ts)
const AUTH_ERROR_CODES = ["POS-1006", "POS-6043", "POS-1000"];
const AUTH_ERROR_MESSAGES = ["MISSING_TOKEN", "TOKEN_EXPIRED", "UNAUTHORIZED"];

// Detect an expired/missing token so we can prompt re-login — but ignore the
// auth endpoints themselves (a wrong password on /login is not a dead session).
const isSessionExpiredError = (error: any): boolean => {
  if (error?.response?.status !== 401) return false;

  const url: string = error?.config?.url || "";
  if (url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh")) {
    return false;
  }

  const data = error?.response?.data;

  return (
    AUTH_ERROR_CODES.includes(data?.errorCode) ||
    AUTH_ERROR_MESSAGES.includes(data?.message)
  );
};

// Define API base URLs with Auto-Host Detection (For Mobile/Local Network access)
const getBaseUrl = (envUrl: string, defaultPort: string) => {
  let url = envUrl || `http://localhost:${defaultPort}`;

  if (typeof window !== "undefined" && url.includes("localhost")) {
    url = url.replace("localhost", window.location.hostname);
  }

  return url;
};

export const API_BASE_URL = getBaseUrl(
  import.meta.env.VITE_API_BASE_URL,
  "8080",
);


// Shared interceptors
const addAuthToken = (config: any) => {
  const token: any = localStorage.getItem("authPOS");
  const _token = JSON.parse(token);

  if (_token) {
    config.headers.Authorization = `Bearer ${_token.accessToken}`;
  }

  return config;
};

const handleResponseError = (error: any) => {
  // Expired/missing token on any page → raise the global re-login popup.
  if (isSessionExpiredError(error)) {
    triggerSessionExpired();
  }

  if (error.response) {
    switch (error.response.status) {
      case 401:
        console.error("Unauthorized access");
        break;
      case 403:
        console.error("Forbidden access");
        break;
      case 404:
        console.error("Resource not found");
        break;
      case 500:
        console.error("Internal server error");
        break;
      default:
        console.error("An error occurred:", error.response.data);
    }
  } else if (error.request) {
    console.error("Network error - no response received");
  } else {
    console.error("Error:", error.message);
  }

  return Promise.reject(error);
};

// Main axios instance (production API for all other services)
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(addAuthToken, (error) =>
  Promise.reject(error),
);
axiosInstance.interceptors.response.use(
  (response) => response,
  handleResponseError,
);


