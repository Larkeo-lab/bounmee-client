import axios from "axios"

// Define API base URLs with Auto-Host Detection (For Mobile/Local Network access)
const getBaseUrl = (envUrl: string, defaultPort: string) => {
    let url = envUrl || `http://localhost:${defaultPort}`;
    if (typeof window !== "undefined" && url.includes("localhost")) {
        url = url.replace("localhost", window.location.hostname);
    }
    return url;
};

export const API_BASE_URL = getBaseUrl(import.meta.env.VITE_API_BASE_URL, "8080");
export const WORKFLOW_API_BASE_URL = getBaseUrl(import.meta.env.VITE_WORKFLOW_API_BASE_URL, "8080");

// Shared interceptors
const addAuthToken = (config: any) => {
    const token: any = localStorage.getItem('authPOS')
    const _token = JSON.parse(token)
    if (_token) {
        config.headers.Authorization = `Bearer ${_token.accessToken}`
    }
    return config
}

const handleResponseError = (error: any) => {
    if (error.response) {
        switch (error.response.status) {
            case 401:
                console.error("Unauthorized access")
                break
            case 403:
                console.error("Forbidden access")
                break
            case 404:
                console.error("Resource not found")
                break
            case 500:
                console.error("Internal server error")
                break
            default:
                console.error("An error occurred:", error.response.data)
        }
    } else if (error.request) {
        console.error("Network error - no response received")
    } else {
        console.error("Error:", error.message)
    }
    return Promise.reject(error)
}

// Main axios instance (production API for all other services)
export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
})

axiosInstance.interceptors.request.use(addAuthToken, (error) => Promise.reject(error))
axiosInstance.interceptors.response.use((response) => response, handleResponseError)

// Workflow & Service axios instance (localhost)
export const workflowAxiosInstance = axios.create({
    baseURL: WORKFLOW_API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
})

workflowAxiosInstance.interceptors.request.use(addAuthToken, (error) => Promise.reject(error))
workflowAxiosInstance.interceptors.response.use((response) => response, handleResponseError)