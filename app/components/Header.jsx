"use client";

import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const {
    country,
    language,
    setLanguage,
    setShowCountryModal,
    setShowLoginModal,
    getCountryName,
    isClient,
  } = useAppContext();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const userMenuRef = useRef(null);

  // Safe client-side only mounting
  useEffect(() => {
    setMounted(true);

    // Close the user menu when clicking outside
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if device is mobile
  useEffect(() => {
    if (!isClient || !mounted) return;

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsSmallMobile(window.innerWidth < 480);
    };

    // Initial check
    checkScreenSize();

    // Listen for resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isClient, mounted]);

  // Don't use client-dependent values until mounted
  const shouldRender = isClient && mounted;

  const toggleLanguage = () => {
    setLanguage(language === "english" ? "arabic" : "english");
  };

  // Get country flag emoji
  const getCountryFlag = () => {
    const flags = {
      oman: "🇴🇲",
      saudi: "🇸🇦",
      uae: "🇦🇪",
    };
    return country ? flags[country] : "🌍";
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { type: "spring", stiffness: 400 } },
    tap: { scale: 0.95 },
  };

  const logoVariants = {
    initial: { rotate: -5, scale: 0.9 },
    animate: {
      rotate: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
      },
    },
    hover: {
      rotate: [0, -5, 5, -3, 3, 0],
      transition: { duration: 0.5 },
    },
  };

  return (
    <header
      className={`flex justify-between items-center ${
        isMobile ? "py-3 px-3" : "py-5 px-6"
      } bg-white shadow-md rounded-xl mb-8 border border-gray-200`}
    >
      <div className="flex items-center">
        <motion.div
          className={`${
            isSmallMobile ? "w-8 h-8" : isMobile ? "w-10 h-10" : "w-14 h-14"
          } rounded-full gradient-bg flex items-center justify-center ${
            isSmallMobile ? "mr-2" : isMobile ? "mr-3" : "mr-4"
          } shadow-lg`}
          variants={logoVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          <i
            className={`fas fa-balance-scale text-white ${
              isSmallMobile ? "text-sm" : isMobile ? "text-base" : "text-2xl"
            }`}
          ></i>
        </motion.div>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${
              isSmallMobile ? "text-base" : isMobile ? "text-lg" : "text-2xl"
            } font-bold text-gray-900 truncate ${
              isSmallMobile ? "max-w-[100px]" : "max-w-[200px]"
            }`}
          >
            {language === "arabic" ? "المساعد القانوني" : "Legal Assistant"}
          </motion.h1>
          {!isSmallMobile && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs font-medium text-gray-700 truncate"
            >
              {language === "arabic" ? "الذكاء الاصطناعي" : "AI Powered"}
            </motion.p>
          )}
        </div>
      </div>

      <div
        className={`flex items-center ${
          isSmallMobile ? "space-x-1" : isMobile ? "space-x-2" : "space-x-4"
        }`}
      >
        {/* Mobile-specific country selector icon */}
        {isMobile && country && (
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCountryModal(true)}
            className={`lg:hidden flex items-center justify-center ${
              isSmallMobile ? "w-8 h-8" : "w-10 h-10"
            } rounded-full bg-gray-100 shadow-sm`}
          >
            <span className={`${isSmallMobile ? "text-base" : "text-lg"}`}>
              {getCountryFlag()}
            </span>
          </motion.div>
        )}

        {country && !isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="hidden md:flex items-center px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition cursor-pointer shadow-sm hover:shadow-md"
            onClick={() => setShowCountryModal(true)}
          >
            <span className="mr-2 text-lg">{getCountryFlag()}</span>
            <span className="text-sm font-semibold text-gray-800">
              {getCountryName()}
            </span>
          </motion.div>
        )}

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={toggleLanguage}
          className={`flex items-center ${
            isSmallMobile
              ? "px-2 py-1"
              : isMobile
              ? "px-2.5 py-1.5"
              : "px-4 py-2"
          } rounded-full bg-gray-100 hover:bg-gray-200 transition shadow-sm hover:shadow-md`}
        >
          <span
            className={`${
              isSmallMobile ? "text-xs" : isMobile ? "text-sm" : "text-base"
            } font-semibold text-gray-800`}
          >
            {language === "arabic" ? "العربية" : "EN"}
          </span>
          {!isSmallMobile && (
            <i
              className={`fas fa-exchange-alt ${
                isMobile ? "ml-1.5" : "ml-2"
              } text-gray-700`}
            ></i>
          )}
        </motion.button>

        {user ? (
          // User is logged in
          <div className="relative" ref={userMenuRef}>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center ${
                isSmallMobile
                  ? "px-2 py-1"
                  : isMobile
                  ? "px-2.5 py-1.5"
                  : "px-4 py-2"
              } rounded-full gradient-bg text-white hover:opacity-90 transition shadow-md hover:shadow-lg`}
            >
              <i className="fas fa-user-circle text-white"></i>
              {!isSmallMobile && (
                <i
                  className={`fas fa-chevron-${
                    showUserMenu ? "up" : "down"
                  } ml-1`}
                ></i>
              )}
            </motion.button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-500">
                    {language === "arabic" ? "مرحباً" : "Signed in as"}
                  </p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.email}
                  </p>
                </div>
                <a
                  href="#profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition flex items-center"
                >
                  <i className="fas fa-id-card mr-2"></i>
                  {language === "arabic" ? "الملف الشخصي" : "Profile"}
                </a>
                <a
                  href="#settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition flex items-center"
                >
                  <i className="fas fa-cog mr-2"></i>
                  {language === "arabic" ? "الإعدادات" : "Settings"}
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition flex items-center"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  {language === "arabic" ? "تسجيل الخروج" : "Sign out"}
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          // User is not logged in
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setShowLoginModal(true)}
            className={`flex items-center ${
              isSmallMobile
                ? "px-2 py-1"
                : isMobile
                ? "px-2.5 py-1.5"
                : "px-4 py-2"
            } rounded-full gradient-bg text-white hover:opacity-90 transition shadow-md hover:shadow-lg`}
          >
            <i className="fas fa-user-circle"></i>
            {!isSmallMobile && !isMobile && (
              <span className="font-semibold ml-2">
                {language === "arabic" ? "تسجيل الدخول" : "Login"}
              </span>
            )}
          </motion.button>
        )}
      </div>
    </header>
  );
}
