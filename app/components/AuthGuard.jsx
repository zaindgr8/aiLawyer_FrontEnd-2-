"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const { setShowLoginModal } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // If not loading and no user, show login modal
    if (!loading && !user && mounted) {
      setShowLoginModal(true);
    }
  }, [loading, user, setShowLoginModal, mounted]);

  // Don't render anything server-side or before mounting
  if (!mounted) return null;

  // Show login screen if user is not authenticated
  if (!user && !loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mb-6 shadow-lg">
          <i className="fas fa-lock text-white text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Authentication Required
        </h2>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          Please log in or create an account to access the legal assistant.
        </p>
        <button
          onClick={() => setShowLoginModal(true)}
          className="px-6 py-3 rounded-lg gradient-bg text-white font-medium hover:opacity-90 transition shadow-md flex items-center"
        >
          <i className="fas fa-sign-in-alt mr-2"></i>
          Login or Sign Up
        </button>
      </div>
    );
  }

  // Render children if authenticated
  return children;
}
