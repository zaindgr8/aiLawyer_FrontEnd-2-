"use client";

import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export default function TopicsSection() {
  const {
    language,
    country,
    sendMessage,
    isClient,
    recentChats,
    isLoadingChats,
    switchChat,
    startNewChat,
    user,
    setShowLoginModal,
    loadRecentChats,
  } = useAppContext();
  const [topics, setTopics] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const topicsContainerRef = useRef(null);

  // Safe client-side only mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mounted) return; // Skip on server or before mounting
    if (country) {
      loadTopics();
    }
  }, [country, language, isClient, mounted]);

  // Check if topics need scroll indicator
  useEffect(() => {
    if (!isClient || !mounted) return; // Skip on server or before mounting
    if (topicsContainerRef.current) {
      const checkScrollable = () => {
        const { scrollHeight, clientHeight } = topicsContainerRef.current;
        setShowScrollIndicator(scrollHeight > clientHeight);
      };

      // Check initially and on resize
      checkScrollable();
      window.addEventListener("resize", checkScrollable);

      return () => window.removeEventListener("resize", checkScrollable);
    }
  }, [topics, isClient, mounted]);

  // Check if device is mobile
  useEffect(() => {
    if (!isClient || !mounted) return;

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    checkIfMobile();

    // Listen for resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [isClient, mounted]);

  // Add console log to debug user state
  useEffect(() => {
    if (isClient && mounted) {
      console.log("TopicsSection - User auth state:", {
        isLoggedIn: !!user,
        userId: user?.uid,
        email: user?.email,
        recentChatsCount: recentChats?.length || 0,
      });
    }
  }, [user, isClient, mounted, recentChats]);

  const loadTopics = () => {
    const topicsData = {
      oman: [
        {
          icon: "file-contract",
          title: "Employment Contract",
          titleAr: "عقد العمل",
          description: "Questions about employment contracts in Oman",
          descriptionAr: "أسئلة حول عقود العمل في عمان",
        },
        {
          icon: "passport",
          title: "Residency Law",
          titleAr: "قانون الإقامة",
          description: "Information about residency and visas in Oman",
          descriptionAr: "معلومات حول الإقامة والتأشيرات في عمان",
        },
        {
          icon: "car",
          title: "Traffic Rules",
          titleAr: "قواعد المرور",
          description: "Traffic laws and violations in Oman",
          descriptionAr: "قوانين المرور والمخالفات في عمان",
        },
        {
          icon: "home",
          title: "Property Law",
          titleAr: "قانون الملكية",
          description: "Buying and selling property in Oman",
          descriptionAr: "شراء وبيع العقارات في عمان",
        },
        {
          icon: "handshake",
          title: "Business Law",
          titleAr: "قانون الأعمال",
          description: "Starting and running a business in Oman",
          descriptionAr: "بدء وإدارة الأعمال في عمان",
        },
        {
          icon: "users",
          title: "Family Law",
          titleAr: "قانون الأسرة",
          description: "Marriage, divorce, and family matters in Oman",
          descriptionAr: "الزواج والطلاق والأمور الأسرية في عمان",
        },
      ],
      saudi: [
        {
          icon: "id-card",
          title: "Iqama & Sponsorship",
          titleAr: "الإقامة والكفالة",
          description: "Questions about iqama and sponsorship in Saudi Arabia",
          descriptionAr: "أسئلة حول الإقامة والكفالة في السعودية",
        },
        {
          icon: "car-crash",
          title: "Traffic Violations",
          titleAr: "مخالفات المرور",
          description: "Traffic laws and fines in Saudi Arabia",
          descriptionAr: "قوانين المرور والغرامات في السعودية",
        },
        {
          icon: "users",
          title: "Family Visa",
          titleAr: "تأشيرة العائلة",
          description: "Family visa and dependents in Saudi Arabia",
          descriptionAr: "تأشيرة العائلة والمعالين في السعودية",
        },
        {
          icon: "file-contract",
          title: "Labor Law",
          titleAr: "قانون العمل",
          description: "Employment rights and regulations in Saudi Arabia",
          descriptionAr: "حقوق العمل واللوائح في السعودية",
        },
        {
          icon: "landmark",
          title: "Commercial Law",
          titleAr: "القانون التجاري",
          description:
            "Business regulations and commercial law in Saudi Arabia",
          descriptionAr: "اللوائح التجارية والقانون التجاري في السعودية",
        },
        {
          icon: "home",
          title: "Real Estate Law",
          titleAr: "قانون العقارات",
          description: "Property ownership and rental laws in Saudi Arabia",
          descriptionAr: "ملكية العقارات وقوانين الإيجار في السعودية",
        },
      ],
      uae: [
        {
          icon: "briefcase",
          title: "Labour Law",
          titleAr: "قانون العمل",
          description: "Employment rights and regulations in UAE",
          descriptionAr: "حقوق العمل واللوائح في الإمارات",
        },
        {
          icon: "passport",
          title: "Overstay Fines",
          titleAr: "غرامات التأشيرة",
          description: "Visa overstay penalties and regulations in UAE",
          descriptionAr: "غرامات التأشيرة واللوائح في الإمارات",
        },
        {
          icon: "home",
          title: "Tenancy Rights",
          titleAr: "حقوق المستأجر",
          description: "Rental laws and tenant rights in UAE",
          descriptionAr: "قوانين الإيجار وحقوق المستأجر في الإمارات",
        },
        {
          icon: "hand-holding-usd",
          title: "Banking Law",
          titleAr: "القانون المصرفي",
          description: "Banking regulations and financial laws in UAE",
          descriptionAr: "اللوائح المصرفية والقوانين المالية في الإمارات",
        },
        {
          icon: "user-shield",
          title: "Cyber Law",
          titleAr: "القانون الإلكتروني",
          description: "Digital rights and cybercrime laws in UAE",
          descriptionAr:
            "الحقوق الرقمية وقوانين الجرائم الإلكترونية في الإمارات",
        },
        {
          icon: "balance-scale",
          title: "Commercial Law",
          titleAr: "القانون التجاري",
          description: "Business regulations and commercial disputes in UAE",
          descriptionAr: "اللوائح التجارية والنزاعات التجارية في الإمارات",
        },
      ],
    };

    setTopics(topicsData[country] || []);
  };

  const handleTopicClick = (topic) => {
    const topicTitle = language === "arabic" ? topic.titleAr : topic.title;
    sendMessage(`I want to know about ${topicTitle}`);
  };

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        type: "spring",
        stiffness: 150,
      },
    }),
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      borderLeftColor: "var(--primary-color)",
      transition: { type: "spring", stiffness: 300 },
    },
    tap: { scale: 0.97 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const scrollIndicatorVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: [0.3, 0.8, 0.3],
      y: [0, 5, 0],
      transition: {
        repeat: Infinity,
        duration: 2,
      },
    },
  };

  return (
    <section className={`lg:w-1/3 flex flex-col ${isMobile ? "pb-16" : ""}`}>
      {/* Topics/Chats Header */}
      <div className="flex justify-between items-center mb-6">
        <h2
          className={`${
            isMobile ? "text-xl lg:text-2xl" : "text-2xl"
          } font-bold text-gray-800`}
        >
          {language === "arabic"
            ? isMobile
              ? "محادثات قانونية مقترحة"
              : "موضوعات قانونية مقترحة"
            : isMobile
            ? "Suggested Legal Chats"
            : "Suggested Legal Topics"}
        </h2>
        <motion.button
          className={`${
            isMobile ? "text-xs lg:text-sm" : "text-sm"
          } flex items-center px-3 py-1.5 rounded-full hover:bg-gray-100 transition`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadTopics}
          style={{ color: "var(--primary-color)" }}
        >
          <i className="fas fa-sync-alt mr-1.5"></i>
          <span>{language === "arabic" ? "تحديث" : "Refresh"}</span>
        </motion.button>
      </div>

      {/* Topics/Chats grid */}
      <div
        ref={topicsContainerRef}
        className="overflow-y-auto pr-2 space-y-4 mb-6"
        style={{
          maxHeight: isMobile ? "calc(100vh - 350px)" : "calc(100vh - 300px)",
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {topics.map((topic, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleTopicClick(topic)}
              className="card bg-white rounded-xl p-4 cursor-pointer transform transition-all border-l-4 border-transparent hover:border-l-[color:var(--primary-color)]"
            >
              <div className="flex items-start">
                <div
                  className={`${
                    isMobile ? "w-10 h-10 lg:w-12 lg:h-12" : "w-12 h-12"
                  } rounded-full flex items-center justify-center ${
                    isMobile ? "mr-2 lg:mr-3" : "mr-3"
                  } shadow-md`}
                  style={{
                    backgroundColor: "var(--primary-color)",
                    opacity: "0.9",
                  }}
                >
                  <i
                    className={`fas fa-${topic.icon} text-white ${
                      isMobile ? "text-base lg:text-lg" : "text-lg"
                    }`}
                  ></i>
                </div>
                <div>
                  <h4
                    className={`font-bold text-gray-800 ${
                      isMobile ? "text-base lg:text-lg" : "text-lg"
                    }`}
                  >
                    {language === "arabic" ? topic.titleAr : topic.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {language === "arabic"
                      ? topic.descriptionAr
                      : topic.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Recent Conversations - Hide on very small screens to save space */}
      <motion.div
        className={`bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-6 ${
          isMobile ? "hidden sm:block" : "block"
        }`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: "var(--primary-color)", opacity: "0.8" }}
          >
            <i className="fas fa-history text-white"></i>
          </div>
          <h3 className="font-bold text-gray-800 text-lg">
            {language === "arabic"
              ? "المحادثات الأخيرة"
              : "Recent Conversations"}
          </h3>

          <motion.button
            className="ml-auto text-xs flex items-center px-2 py-1 rounded-full hover:bg-gray-100 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              startNewChat();
            }}
            style={{ color: "var(--primary-color)" }}
          >
            <i className="fas fa-plus mr-1"></i>
            <span>{language === "arabic" ? "جديد" : "New"}</span>
          </motion.button>
        </div>

        <div className="space-y-3">
          {isLoadingChats ? (
            // Loading state
            <div className="flex justify-center py-4">
              <div className="typing-indicator">
                <div className="animate-typing-dot typing-dot"></div>
                <div className="animate-typing-dot typing-dot"></div>
                <div className="animate-typing-dot typing-dot"></div>
              </div>
            </div>
          ) : user && recentChats && recentChats.length > 0 ? (
            // Show user's recent chats (only if user is logged in)
            <>
              {console.log(
                "Rendering user chats. User:",
                user?.email,
                "Chats:",
                recentChats
              )}
              {recentChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  className="flex items-center p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition"
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  onClick={() => {
                    switchChat(chat.id);
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      opacity: "0.6",
                    }}
                  >
                    <i className="fas fa-comment text-white text-sm"></i>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {chat.title}
                    </span>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500 truncate">
                        {chat.lastMessageSender === "user" ? "You: " : "AI: "}
                        {chat.lastMessage}
                      </span>
                    )}
                  </div>
                  {chat.lastMessageTimestamp && (
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-1">
                      {new Date(
                        chat.lastMessageTimestamp.seconds * 1000
                      ).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </motion.div>
              ))}
            </>
          ) : user ? (
            // User logged in but no chats - DEFINITELY LOGGED IN
            <>
              {console.log(
                "DEFINITELY LOGGED IN but no chats. User:",
                user.email || user.uid
              )}
              <div className="py-3 text-center text-gray-500">
                <p className="text-sm">
                  {language === "arabic"
                    ? "لا توجد محادثات سابقة"
                    : "No previous conversations"}
                </p>
                <button
                  className="mt-2 text-sm text-blue-600 hover:underline focus:outline-none"
                  onClick={() => {
                    startNewChat();
                    // Create a test message to start the chat
                    sendMessage("Hello, I need legal advice");
                  }}
                >
                  {language === "arabic"
                    ? "بدء محادثة جديدة"
                    : "Start a new conversation"}
                </button>
              </div>
            </>
          ) : (
            // User not logged in - show login prompt
            <>
              {console.log(
                "NOT LOGGED IN according to component state. user value:",
                user
              )}
              <div className="py-3 text-center text-gray-500">
                <p className="text-sm">
                  {language === "arabic"
                    ? "قم بتسجيل الدخول لعرض محادثاتك"
                    : "Sign in to view your conversations"}
                </p>
                <button
                  className="mt-2 text-sm text-blue-600 hover:underline focus:outline-none"
                  onClick={() => {
                    setShowLoginModal(true);
                  }}
                >
                  {language === "arabic" ? "تسجيل الدخول" : "Sign in"}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* For debugging - Add a test button */}
      {user && (
        <div className="mt-4 bg-gray-100 p-3 rounded-lg border border-gray-200">
          <p className="text-sm mb-2 font-semibold">
            {language === "arabic" ? "أدوات التصحيح:" : "Debug Tools:"}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
              onClick={() => {
                console.log("Creating test chat...");
                startNewChat();
                setTimeout(() => {
                  sendMessage(
                    language === "arabic"
                      ? "هذه رسالة اختبار لتصحيح تخزين المحادثة"
                      : "This is a test message to debug chat storage"
                  );
                }, 500);
              }}
            >
              {language === "arabic"
                ? "إنشاء محادثة اختبار"
                : "Create Test Chat"}
            </button>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded text-xs"
              onClick={() => {
                console.log("Refreshing chats...");
                loadRecentChats();
              }}
            >
              {language === "arabic" ? "تحديث المحادثات" : "Refresh Chats"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
