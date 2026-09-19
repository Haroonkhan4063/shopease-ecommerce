import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, restore session from localStorage and verify token is still valid
  useEffect(() => {
    const restoreSession = async () => {
      const savedUser = localStorage.getItem("vendorhub_user");
      const token = localStorage.getItem("vendorhub_token");

      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
        try {
          const { data } = await api.get("/auth/me");
          setUser(data.user);
        } catch {
          // token expired/invalid — interceptor already cleared storage
          setUser(null);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("vendorhub_token", data.token);
    localStorage.setItem("vendorhub_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("vendorhub_token", data.token);
    localStorage.setItem("vendorhub_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  // Used after reset-password, which returns a fresh token + user directly
  // (no separate login call needed)
  const setSession = (data) => {
    localStorage.setItem("vendorhub_token", data.token);
    localStorage.setItem("vendorhub_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("vendorhub_token");
    localStorage.removeItem("vendorhub_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
