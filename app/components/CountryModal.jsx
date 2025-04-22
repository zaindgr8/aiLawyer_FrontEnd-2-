"use client";

import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function CountryModal() {
  const { showCountryModal, setCountry, setShowCountryModal, isClient } =
    useAppContext();
  const [mounted, setMounted] = useState(false);

  // Safe client-side only mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during SSR or before mounting
  if (!isClient || !mounted) return null;

  // Don't render the modal if it's not meant to be shown
  if (!showCountryModal) return null;

  const handleSelectCountry = (country) => {
    setCountry(country);
    setShowCountryModal(false);
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

  const buttonVariants = {
    hover: {
      scale: 1.02,
      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
      borderColor: "var(--primary-color)",
      transition: { type: "spring", stiffness: 400 },
    },
    tap: { scale: 0.98 },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial="hidden"
      animate="visible"
      variants={backdropVariants}
    >
      <motion.div
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
        variants={modalVariants}
      >
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center animate-float"
            animate={{
              boxShadow: [
                "0 4px 8px rgba(0,0,0,0.1)",
                "0 8px 16px rgba(0,0,0,0.2)",
                "0 4px 8px rgba(0,0,0,0.1)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <i className="fas fa-globe-americas text-white text-3xl"></i>
          </motion.div>
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
            Select Your Country
          </h2>
          <p className="text-gray-600">
            Choose your country to get personalized legal information
          </p>
        </div>

        <div className="space-y-4">
          <motion.button
            onClick={() => handleSelectCountry("oman")}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[var(--primary-color)] transition-all group"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <div className="flex items-center">
              <div
                className="w-12 h-12 rounded-full bg-opacity-10 flex items-center justify-center mr-3 transition"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                <span className="text-2xl">🇴🇲</span>
              </div>
              <div className="text-left">
                <span className="font-medium text-gray-700 block">Oman</span>
                <span className="text-xs text-gray-500">
                  Legal System: Civil Law
                </span>
              </div>
            </div>
            <i className="fas fa-chevron-right text-gray-400 group-hover:text-[var(--primary-color)] transition"></i>
          </motion.button>

          <motion.button
            onClick={() => handleSelectCountry("saudi")}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[var(--primary-color)] transition-all group"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <div className="flex items-center">
              <div
                className="w-12 h-12 rounded-full bg-opacity-10 flex items-center justify-center mr-3 transition"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                <span className="text-2xl">🇸🇦</span>
              </div>
              <div className="text-left">
                <span className="font-medium text-gray-700 block">
                  Saudi Arabia
                </span>
                <span className="text-xs text-gray-500">
                  Legal System: Islamic Law
                </span>
              </div>
            </div>
            <i className="fas fa-chevron-right text-gray-400 group-hover:text-[var(--primary-color)] transition"></i>
          </motion.button>

          <motion.button
            onClick={() => handleSelectCountry("uae")}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[var(--primary-color)] transition-all group"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <div className="flex items-center">
              <div
                className="w-12 h-12 rounded-full bg-opacity-10 flex items-center justify-center mr-3 transition"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                <span className="text-2xl">🇦🇪</span>
              </div>
              <div className="text-left">
                <span className="font-medium text-gray-700 block">
                  United Arab Emirates
                </span>
                <span className="text-xs text-gray-500">
                  Legal System: Mixed
                </span>
              </div>
            </div>
            <i className="fas fa-chevron-right text-gray-400 group-hover:text-[var(--primary-color)] transition"></i>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
