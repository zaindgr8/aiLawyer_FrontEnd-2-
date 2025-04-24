"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal, language, isClient } =
    useAppContext();
  const { user, login, signup, signInWithGoogle, resetPassword, authError } =
    useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    rememberMe: false,
  });

  // Safe client-side only mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Set error message if there's an auth error
    if (authError) {
      const errorMsg = authError.message
        .replace("Firebase: ", "")
        .replace(/\(auth.*\)/, "");
      setErrorMsg(errorMsg);
    }
  }, [authError]);

  // Auto-close login modal when user is already logged in
  useEffect(() => {
    // If user is already logged in and modal is shown, close it
    if (user && showLoginModal && mounted) {
      setShowLoginModal(false);
    }
  }, [user, showLoginModal, setShowLoginModal, mounted]);

  // Don't render anything during SSR or before mounting
  if (!isClient || !mounted) return null;

  // Don't render the modal if it's not meant to be shown
  if (!showLoginModal) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      console.log(
        "Form submission started:",
        forgotPassword ? "reset" : isSignUp ? "signup" : "login"
      );

      if (forgotPassword) {
        await resetPassword(formData.email);
        setSuccessMsg("Password reset email sent!");
        setTimeout(() => {
          setForgotPassword(false);
          setSuccessMsg("");
        }, 3000);
        return;
      }

      if (isSignUp) {
        await signup(formData.email, formData.password, formData.displayName);
        setSuccessMsg("Account created successfully!");
        setTimeout(() => setShowLoginModal(false), 1500);
      } else {
        await login(formData.email, formData.password);
        setSuccessMsg("Login successful!");
        setTimeout(() => setShowLoginModal(false), 1500);
      }
    } catch (error) {
      console.error("Authentication UI error:", error);

      // Format error message to be user-friendly
      let message = error.message || "Authentication failed";
      if (
        message.includes("auth/wrong-password") ||
        message.includes("auth/user-not-found")
      ) {
        message = "Invalid email or password";
      } else if (message.includes("auth/email-already-in-use")) {
        message = "Email already in use. Try logging in instead.";
      } else if (message.includes("auth/weak-password")) {
        message = "Password is too weak. Use at least 6 characters.";
      } else if (message.includes("auth/invalid-email")) {
        message = "Invalid email address format.";
      } else if (message.includes("auth/popup-closed-by-user")) {
        message = "Sign-in popup was closed before completion.";
      } else if (message.includes("auth/network-request-failed")) {
        message = "Network error. Check your internet connection.";
      }

      setErrorMsg(message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log("Google sign-in started");
      setErrorMsg("");
      await signInWithGoogle();
      setShowLoginModal(false);
    } catch (error) {
      console.error("Google sign-in UI error:", error);

      let message = error.message || "Google sign-in failed";
      if (message.includes("popup-closed-by-user")) {
        message = "Sign-in popup was closed before completion.";
      } else if (message.includes("network-request-failed")) {
        message = "Network error. Check your internet connection.";
      }

      setErrorMsg(message);
    }
  };

  const closeModal = () => {
    setShowLoginModal(false);
    setErrorMsg("");
    setSuccessMsg("");
    setIsSignUp(false);
    setForgotPassword(false);
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.1,
      },
    },
  };

  const socialButtonVariants = {
    hover: { y: -3, boxShadow: "0 6px 10px rgba(0,0,0,0.15)" },
    tap: { y: 0, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial="hidden"
      animate="visible"
      variants={backdropVariants}
      onClick={closeModal}
    >
      <motion.div
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {forgotPassword
                ? language === "arabic"
                  ? "إعادة تعيين كلمة المرور"
                  : "Reset Password"
                : isSignUp
                ? language === "arabic"
                  ? "إنشاء حساب"
                  : "Create Account"
                : language === "arabic"
                ? "مرحبًا بعودتك"
                : "Welcome Back"}
            </h2>
            <p className="text-sm text-gray-500">
              {forgotPassword
                ? language === "arabic"
                  ? "أدخل البريد الإلكتروني لإعادة التعيين"
                  : "Enter your email to reset"
                : language === "arabic"
                ? "الوصول إلى حساب المساعد القانوني الخاص بك"
                : "Access your legal assistant account"}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
            <p>{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!forgotPassword && isSignUp && (
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {language === "arabic" ? "الاسم" : "Name"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user text-gray-400"></i>
                </div>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] bg-white text-gray-800"
                  placeholder={
                    language === "arabic" ? "اسمك الكامل" : "Your full name"
                  }
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="loginEmail"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {language === "arabic" ? "البريد الإلكتروني" : "Email"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-envelope text-gray-400"></i>
              </div>
              <input
                type="email"
                id="loginEmail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] bg-white text-gray-800"
                placeholder={
                  language === "arabic" ? "بريدك الالكتروني" : "your@email.com"
                }
                required
              />
            </div>
          </div>

          {!forgotPassword && (
            <div>
              <label
                htmlFor="loginPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {language === "arabic" ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="loginPassword"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] bg-white text-gray-800"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`fas fa-${
                      showPassword ? "eye-slash" : "eye"
                    } text-gray-400 hover:text-gray-600`}
                  ></i>
                </button>
              </div>
            </div>
          )}

          {!forgotPassword && !isSignUp && (
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300 rounded"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-700"
                >
                  {language === "arabic" ? "تذكرني" : "Remember me"}
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForgotPassword(true);
                  setIsSignUp(false);
                }}
                className="text-sm hover:underline"
                style={{ color: "var(--primary-color)" }}
              >
                {language === "arabic"
                  ? "نسيت كلمة المرور؟"
                  : "Forgot password?"}
              </button>
            </div>
          )}

          <motion.button
            type="submit"
            className="w-full py-3 rounded-lg gradient-bg text-white font-medium hover:opacity-90 transition mt-4 shadow-md"
            whileHover={{ y: -2, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
            whileTap={{ y: 0, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
          >
            {forgotPassword ? (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                {language === "arabic"
                  ? "إرسال رابط إعادة التعيين"
                  : "Send Reset Link"}
              </>
            ) : isSignUp ? (
              <>
                <i className="fas fa-user-plus mr-2"></i>
                {language === "arabic" ? "إنشاء حساب" : "Create Account"}
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                {language === "arabic" ? "تسجيل الدخول" : "Login"}
              </>
            )}
          </motion.button>

          {!forgotPassword && (
            <>
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500">
                  {language === "arabic" ? "أو" : "or"}
                </span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <motion.button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center justify-center bg-white"
                  variants={socialButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <i className="fab fa-google text-red-500 mr-2"></i>
                  <span className="text-gray-700">
                    {isSignUp
                      ? language === "arabic"
                        ? "التسجيل مع غوغل"
                        : "Sign up with Google"
                      : language === "arabic"
                      ? "تسجيل الدخول مع غوغل"
                      : "Sign in with Google"}
                  </span>
                </motion.button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-gray-600 mt-4">
            {forgotPassword ? (
              <button
                type="button"
                onClick={() => {
                  setForgotPassword(false);
                  setIsSignUp(false);
                }}
                className="text-blue-600 hover:underline"
              >
                {language === "arabic"
                  ? "العودة إلى تسجيل الدخول"
                  : "Back to Login"}
              </button>
            ) : isSignUp ? (
              <>
                {language === "arabic"
                  ? "لديك حساب بالفعل؟"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-600 hover:underline"
                >
                  {language === "arabic" ? "تسجيل الدخول" : "Login"}
                </button>
              </>
            ) : (
              <>
                {language === "arabic"
                  ? "ليس لديك حساب؟"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-600 hover:underline"
                >
                  {language === "arabic" ? "سجل الآن" : "Register now"}
                </button>
              </>
            )}
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
}
