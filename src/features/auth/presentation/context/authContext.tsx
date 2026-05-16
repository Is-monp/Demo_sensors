import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

export type AuthContextType = {
  loggedUser: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  validate: (email: string, validationCode: string) => Promise<string | null>;
  getLoggedUser: () => Promise<any | null>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();

  const authRepo = useMemo(() => di.resolve<AuthRepository>(TOKENS.AuthRepo), [di]);

  const [loggedUser, setLoggedUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    authRepo.getCurrentUser()
      .then((user) => {
        setLoggedUser(user);
        setIsLoggedIn(!!user);
      })
      .catch(() => setIsLoggedIn(false))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    clearError();
    try {
      setLoading(true);
      await authRepo.login(email, password);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    clearError();
    try {
      setLoading(true);
      await authRepo.signup(email, password);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    clearError();
    try {
      setLoading(true);
      await authRepo.logout();
      setIsLoggedIn(false);
    } catch (err: any) {
      setError(err?.message ?? "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    clearError();
    try {
      setLoading(true);
      await authRepo.forgotPassword(email);
    } catch (err: any) {
      setError(err?.message ?? "Failed to send password reset link");
    } finally {
      setLoading(false);
    }
  };

  const validate = async (email: string, validationCode: string) => {
    clearError();
    try {
      await authRepo.validate(email, validationCode);
    } catch (err: any) {
      return err?.message ?? "Validation failed";
    }
    return null;
  }

  const getLoggedUser = async () => {
    try {
      return await authRepo.getCurrentUser();
    } catch (err) {
      return null;
    }
  }

  return (
    <AuthContext.Provider value={{ loggedUser, isLoggedIn, loading, error, clearError, login, signup, logout, forgotPassword, validate, getLoggedUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
