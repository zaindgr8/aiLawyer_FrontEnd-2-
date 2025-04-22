"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Register a new user
  const signup = async (email, password, displayName) => {
    setAuthError(null);
    try {
      console.log("Attempting to create user:", { email });
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      return result.user;
    } catch (error) {
      console.error("Signup error:", error.code, error.message);
      setAuthError({ code: error.code, message: error.message });
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    setAuthError(null);
    try {
      console.log("Attempting to log in user:", { email });
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Login error:", error.code, error.message);
      setAuthError({ code: error.code, message: error.message });
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      console.log("Attempting Google sign in");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Google sign-in error:", error.code, error.message);
      setAuthError({ code: error.code, message: error.message });
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      console.log("Attempting password reset for:", { email });
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error.code, error.message);
      setAuthError({ code: error.code, message: error.message });
      throw error;
    }
  };

  // Log out user
  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error.code, error.message);
      setAuthError({ code: error.code, message: error.message });
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up auth state listener");
    let unsubscribe;

    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          console.log(
            "Auth state changed:",
            currentUser ? "User logged in" : "User logged out"
          );
          setUser(currentUser);
          setLoading(false);
        },
        (error) => {
          console.error("Auth state change error:", error);
          setAuthError({ code: error.code, message: error.message });
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error setting up auth state listener:", error);
      setAuthError({
        code: "auth/setup-error",
        message: "Failed to initialize authentication",
      });
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = {
    user,
    signup,
    login,
    logout,
    signInWithGoogle,
    resetPassword,
    loading,
    authError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
