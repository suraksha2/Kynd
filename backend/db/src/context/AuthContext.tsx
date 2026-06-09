"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user is logged in on mount
    try {
      if (typeof window !== "undefined") {
        const auth = localStorage.getItem("adminAuth");
        if (auth) {
          const parsedAuth = JSON.parse(auth);
          setIsAuthenticated(true);
          setUser(parsedAuth);
        }
      }
    } catch (error) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminAuth");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user has admin role
        if (data.role !== "admin") {
          return false;
        }

        const userData: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        };

        setIsAuthenticated(true);
        setUser(userData);
        if (typeof window !== "undefined") {
          localStorage.setItem("adminAuth", JSON.stringify(userData));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminAuth");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
