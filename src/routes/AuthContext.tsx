import { useAuthService } from "@/services/auth/useAuth";
import { AuthData } from "@/types";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import i18n from "@/config/i18n";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (userData: any) => Promise<void>;
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
    return true; // Consider invalid tokens as expired
  }
  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to check if current token is expired
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
    // Check if user is already authenticated (e.g., from localStorage, token validation)
    const checkAuthStatus = async () => {
      try {
        const userDataStr = localStorage.getItem("authPOS");

        if (userDataStr) {
          // Parse stored user data
          const userData = JSON.parse(userDataStr);

          // Check if accessToken exists and is not expired
          if (
            userData?.accessToken &&
            !checkTokenExpired(userData.accessToken)
          ) {
            setUser(userData);
            setIsAuthenticated(true);
            
            // Apply User's Language
            let lang = userData.user?.language?.toLowerCase();
            if (lang === 'la') lang = 'lo';
            if (lang) {
              i18n.changeLanguage(lang);
            }
          } else {
            // Token expired or invalid, clear storage
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

  const login = async (userData: { userName: string; password: string }) => {
    const response: any = await useAuthService(userData);

    if (response?.status === false) {
      throw new Error(response.message || "Login failed");
    }

    setUser(response?.data);
    setIsAuthenticated(true);

    // Apply User's Language
    let lang = response?.data?.user?.language?.toLowerCase();
    if (lang === 'la') lang = 'lo';
    if (lang) {
      i18n.changeLanguage(lang);
    }

    // Store token and user data in localStorage
    localStorage.setItem("authPOS", JSON.stringify(response?.data));
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
    logout,
    loading,
    isTokenExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
