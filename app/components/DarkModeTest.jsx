"use client";

import { useAppContext } from "../context/AppContext";
import { useEffect, useState } from "react";

export default function DarkModeTest() {
  const { darkMode, toggleDarkMode, isClient } = useAppContext();
  const [mounted, setMounted] = useState(false);

  // Safe client-side only mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mounted) return;
    console.log("DarkModeTest component, current darkMode:", darkMode);
  }, [darkMode, isClient, mounted]);

  // Don't render anything during SSR or before mounting
  if (!isClient || !mounted) return null;

  return (
    <div className="fixed top-2 right-2 p-4 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <p className="mb-2 text-gray-800 dark:text-gray-200">
        Dark mode is: <strong>{darkMode ? "ON" : "OFF"}</strong>
      </p>
      <button
        onClick={() => {
          console.log("Test toggle button clicked, current:", darkMode);
          toggleDarkMode();
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Toggle from test
      </button>
    </div>
  );
}
