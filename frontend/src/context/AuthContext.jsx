import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("kandjou_access_token"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("kandjou_refresh_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on load
    const savedUser = localStorage.getItem("kandjou_user");
    if (savedUser && accessToken) {
      try {
        const u = JSON.parse(savedUser);
        if (!u.role) throw new Error("Session invalide");
        setUser(u);
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axios.post(`${API}/m3/auth/login`, { username, password });
      const { access_token, refresh_token, ...userData } = res.data;
      
      localStorage.setItem("kandjou_access_token", access_token);
      localStorage.setItem("kandjou_refresh_token", refresh_token);
      localStorage.setItem("kandjou_user", JSON.stringify({ ...userData, username }));
      
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      setUser({ ...userData, username });
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.detail || "Erreur de connexion" 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("kandjou_access_token");
    localStorage.removeItem("kandjou_refresh_token");
    localStorage.removeItem("kandjou_user");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const refreshSession = async () => {
    if (!refreshToken) return;
    try {
      const res = await axios.post(`${API}/m3/auth/refresh`, { refresh_token: refreshToken });
      const { access_token } = res.data;
      localStorage.setItem("kandjou_access_token", access_token);
      setAccessToken(access_token);
      return access_token;
    } catch (err) {
      logout();
      return null;
    }
  };

  // Interceptor to handle expired tokens
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await refreshSession();
          if (newToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [refreshToken]);

  const value = {
    user,
    token: accessToken,
    loading,
    login,
    logout,
    refreshSession,
    isAuthenticated: !!accessToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
