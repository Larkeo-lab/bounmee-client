import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  useAuthService,
  useRegisterCitizenService,
  useRefreshTokenService,
} from "@/services/auth/useAuth";
import { AuthData } from "@/types";
import i18n from "@/config/i18n";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (userData: any) => Promise<AuthData>;
  registerCitizen: (userData: any) => Promise<any>;
  updateAuthState: (data: AuthData) => void;
  logout: () => void;
  loading: boolean;
  isTokenExpired: () => boolean;
}

// Helper function to decode JWT token
export const decodeJWT = (token: string): any | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);

    return null;
  }
};

// Helper function to check if token is expired
export const checkTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);

  if (!decoded || !decoded.exp) {
    return true;
  }
  const currentTime = Math.floor(Date.now() / 1000);

  return decoded.exp < currentTime;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState(true);

  const updateAuthState = useCallback((data: AuthData) => {
    setUser(data);
    setIsAuthenticated(true);
    let lang = data.user?.language?.toLowerCase();
    if (lang === "la") lang = "lo";
    if (lang) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem("authPOS", JSON.stringify(data));
  }, []);

  const isTokenExpired = useCallback((): boolean => {
    try {
      const userDataStr = localStorage.getItem("authPOS");

      if (!userDataStr) return true;
      const userData = JSON.parse(userDataStr);

      if (!userData?.accessToken) return true;

      return checkTokenExpired(userData.accessToken);
    } catch (error) {
      console.error("Token check failed:", error);

      return true;
    }
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userDataStr = localStorage.getItem("authPOS");

        if (userDataStr) {
          const userData = JSON.parse(userDataStr);

          if (
            userData?.accessToken &&
            !checkTokenExpired(userData.accessToken)
          ) {
            setUser(userData);
            setIsAuthenticated(true);
            let lang = userData.user?.language?.toLowerCase();

            if (lang === "la") lang = "lo";
            if (lang) {
              i18n.changeLanguage(lang);
            }
          } else {
            localStorage.removeItem("authPOS");
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("authPOS");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const refreshAuthToken = useCallback(async () => {
    try {
      const userDataStr = localStorage.getItem("authPOS");

      if (!userDataStr) return;
      const userData = JSON.parse(userDataStr);

      if (!userData?.refreshToken) return;

      const response = await useRefreshTokenService({
        refreshToken: userData.refreshToken,
      });

      if (response?.accessToken) {
        const newData = {
          ...userData,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken || userData.refreshToken,
        };

        setUser(newData);
        localStorage.setItem("authPOS", JSON.stringify(newData));
        console.log("Token refreshed successfully");
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, we might want to logout, but let's be careful
      // logout();
    }
  }, []);

  // Periodic token refresh check
  useEffect(() => {
    if (!isAuthenticated || !user?.accessToken) return;

    // Check every 1 minute
    const interval = setInterval(() => {
      const decoded = decodeJWT(user.accessToken);

      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = decoded.exp - currentTime;

        // If less than 5 minutes left, refresh
        if (timeUntilExpiry < 300) {
          console.log("Token near expiry, refreshing...");
          refreshAuthToken();
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.accessToken, refreshAuthToken]);

  const login = async (userData: { identifier: string; password: string }) => {
    const response: any = await useAuthService(userData);

    if (response?.status === false) {
      throw new Error(response.message || "Login failed");
    }
    setUser(response?.data);
    setIsAuthenticated(true);
    let lang = response?.data?.user?.language?.toLowerCase();

    if (lang === "la") lang = "lo";
    if (lang) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem("authPOS", JSON.stringify(response?.data));

    return response?.data;
  };


  const registerCitizen = async (userData: any) => {
    const response: any = await useRegisterCitizenService(userData);

    if (response?.status === false) {
      throw new Error(response.message || "Registration failed");
    }

    return response?.data;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const value = {
    isAuthenticated,
    user,
    login,
    registerCitizen,
    updateAuthState,
    logout,
    loading,
    isTokenExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
