"use client";

import CountryModal from "./components/CountryModal";
import LoginModal from "./components/LoginModal";
import Header from "./components/Header";
import TopicsSection from "./components/TopicsSection";
import ChatSection from "./components/ChatSection";
import AuthGuard from "./components/AuthGuard";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'topics'

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    checkIfMobile();

    // Listen for resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <CountryModal />
      <LoginModal />

      <div id="appContainer" className="max-w-7xl mx-auto">
        <Header />

        <AuthGuard>
          <main className="flex flex-col lg:flex-row gap-8">
            {/* On mobile, conditionally show either Topics or Chat based on activeTab */}
            {isMobile ? (
              <>
                <div className={activeTab === "topics" ? "block" : "hidden"}>
                  <TopicsSection />
                </div>
                <div className={activeTab === "chat" ? "block" : "hidden"}>
                  <ChatSection />
                </div>
              </>
            ) : (
              <>
                <TopicsSection />
                <ChatSection />
              </>
            )}
          </main>

          {/* Mobile Navigation Tabs - Only visible on small screens */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 shadow-lg z-10">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center p-2 rounded-lg ${
                  activeTab === "topics"
                    ? "text-[var(--primary-color)]"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("topics")}
              >
                <i className="fas fa-list-ul text-lg mb-1"></i>
                <span className="text-xs">Recent</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center p-2 rounded-lg ${
                  activeTab === "chat"
                    ? "text-[var(--primary-color)]"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("chat")}
              >
                <i className="fas fa-comments text-lg mb-1"></i>
                <span className="text-xs">Chat</span>
              </motion.button>
            </div>
          )}
        </AuthGuard>
      </div>
    </div>
  );
}
