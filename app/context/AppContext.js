"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  createChat,
  addMessage as addMessageToFirestore,
  getChatMessages,
  getRecentChats,
  getChat,
  testFirebaseAccess,
} from "../firebase/chatService";

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [country, setCountry] = useState(null);
  const [language, setLanguage] = useState("english");
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Always true for dark mode
  const [isClient, setIsClient] = useState(false);
  const [threadId, setThreadId] = useState(null); // Store conversation thread ID
  const [activeChatId, setActiveChatId] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [showLoginPromptForChat, setShowLoginPromptForChat] = useState(true);

  // Backend API URL - can be overridden with environment variable
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://ai-lawyer-back-end.vercel.app";

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true);
    // Show country modal only after hydration
    setShowCountryModal(true);
    // Log the API URL for debugging
    console.log("Backend API URL:", API_URL);
  }, []);

  // Check if dark mode is preferred
  useEffect(() => {
    // This will run only in client side
    if (typeof window !== "undefined") {
      console.log("Initializing theme...");

      // Always use dark mode
      setDarkMode(true);

      // Check if country was previously selected
      const savedCountry = localStorage.getItem("selectedCountry");
      const savedLanguage = localStorage.getItem("selectedLanguage");

      if (savedCountry) {
        setCountry(savedCountry);
        setShowCountryModal(false);
      }

      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  // Apply dark mode class
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Always apply dark mode
      document.documentElement.classList.add("dark");

      // Save preference to localStorage
      localStorage.setItem("theme", "dark");
    }
  }, []);

  // Load recent chats when user changes
  useEffect(() => {
    if (user && isClient) {
      // Log user authentication status for debugging
      console.log("AppContext - User authenticated:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isAuthenticated: !!user,
      });

      // First test Firebase access
      const testAccess = async () => {
        try {
          const testResult = await testFirebaseAccess(user.uid);
          console.log("Firebase access test result:", testResult);

          if (testResult.success) {
            await loadRecentChats();
            console.log("Recent chats loaded successfully");
          } else {
            console.error("Failed to access Firebase. Check security rules.");
          }
        } catch (error) {
          console.error("Error testing Firebase access:", error);
        }
      };

      testAccess();
    } else {
      console.log("AppContext - No authenticated user detected");
      setRecentChats([]);
      setActiveChatId(null);
    }
  }, [user, isClient]);

  // Ensure we refresh chats whenever messages change
  useEffect(() => {
    if (user && isClient && messages.length > 0) {
      // Delay refresh to ensure Firestore has time to update
      const timer = setTimeout(() => {
        loadRecentChats();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [messages, user, isClient]);

  // Toggle dark mode function - no longer toggles, always stays in dark mode
  const toggleDarkMode = () => {
    // Function kept for API compatibility, but now does nothing
    console.log("Dark mode toggle attempted, but app is locked to dark mode");
    return;
  };

  // Apply theme classes when country changes
  useEffect(() => {
    if (!isClient) return; // Skip on server

    if (country) {
      document.body.classList.remove("oman-theme", "saudi-theme", "uae-theme");
      document.body.classList.add(`${country}-theme`);
      localStorage.setItem("selectedCountry", country);
    }
  }, [country, isClient]);

  // Apply language direction
  useEffect(() => {
    if (!isClient) return; // Skip on server

    if (language === "arabic") {
      document.body.classList.add("rtl", "arabic-font");
      document.body.classList.remove("ltr", "english-font");
      localStorage.setItem("selectedLanguage", "arabic");
    } else {
      document.body.classList.add("ltr", "english-font");
      document.body.classList.remove("rtl", "arabic-font");
      localStorage.setItem("selectedLanguage", "english");
    }
  }, [language, isClient]);

  // Load recent chats
  const loadRecentChats = async () => {
    if (!user) return;

    try {
      console.log("Loading recent chats for user:", user.uid);
      setIsLoadingChats(true);
      const chats = await getRecentChats(user.uid);
      console.log("Retrieved chats from Firebase:", chats);
      setRecentChats(chats);
    } catch (error) {
      console.error("Error loading recent chats:", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Load chat messages for a specific chat
  const loadChatMessages = async (chatId) => {
    if (!chatId) return;

    try {
      setIsTyping(true);
      const chatMessages = await getChatMessages(chatId);

      // Format messages to match the app's expected format
      const formattedMessages = chatMessages.map((msg) => ({
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp ? msg.timestamp.toDate() : new Date(),
      }));

      setMessages(formattedMessages);
      setActiveChatId(chatId);
    } catch (error) {
      console.error("Error loading chat messages:", error);
    } finally {
      setIsTyping(false);
    }
  };

  // Function to add a message to the chat
  const addMessage = (content, sender) => {
    const newMessage = { content, sender, timestamp: new Date() };
    setMessages((prev) => [...prev, newMessage]);

    // If we have an active chat and user is authenticated, save to Firestore
    if (activeChatId && user) {
      addMessageToFirestore(activeChatId, content, sender).catch((error) =>
        console.error("Error saving message to Firestore:", error)
      );
    }

    return newMessage;
  };

  // Create a new chat or use existing active chat
  const ensureActiveChat = async () => {
    // If we already have an active chat, use it
    if (activeChatId) return activeChatId;

    // If user is not authenticated, don't create a persistent chat
    if (!user) return null;

    try {
      // Create a new chat with language preference
      const chatId = await createChat(user.uid, null, country, language);
      setActiveChatId(chatId);
      // Refresh the recent chats list
      loadRecentChats();
      return chatId;
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    }
  };

  // Switch to a different chat
  const switchChat = async (chatId) => {
    if (chatId === activeChatId) return;

    // Clear current messages
    setMessages([]);

    // Load the selected chat
    await loadChatMessages(chatId);
  };

  // Start a new chat
  const startNewChat = async () => {
    // Clear current messages
    setMessages([]);
    setActiveChatId(null);

    // Only create a new chat when the user sends their first message
  };

  // Function to handle sending a message
  const sendMessage = async (content) => {
    if (!content.trim()) return;

    // Ensure country is selected
    if (!country) {
      addMessage(
        language === "arabic"
          ? "يرجى تحديد بلد أولاً للحصول على معلومات قانونية خاصة بالمنطقة."
          : "Please select a country first to get region-specific legal information.",
        "bot"
      );
      setShowCountryModal(true);
      return;
    }

    // If user is not logged in but we want to encourage login, show login modal
    if (!user && showLoginPromptForChat) {
      setShowLoginModal(true);
      return;
    }

    // Ensure we have an active chat (if user is logged in)
    let chatId = null;
    if (user) {
      chatId = await ensureActiveChat();
    }

    // Add user message to local state
    addMessage(content, "user");

    // Show typing indicator
    setIsTyping(true);

    try {
      console.log(`Attempting to connect to ${API_URL}/api/chat`);

      // Call the backend API with country parameter and language preference
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          country: country, // Send selected country (oman, saudi, uae)
          thread_id: threadId, // Send thread_id if we have one
          language: language, // Send language preference (english or arabic)
          response_language: language, // Explicitly request responses in this language
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status} - ${errorText}`);
        throw new Error(
          `API error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API response received:", data);

      // Save the thread_id for future requests
      if (data.thread_id) {
        setThreadId(data.thread_id);
      }

      // Hide typing indicator and add bot response
      setIsTyping(false);
      addMessage(data.response, "bot");

      // Refresh recent chats after a new message
      if (user) {
        loadRecentChats();
      }
    } catch (error) {
      console.error("Error calling API:", error);
      console.error("Error details:", error.message);
      setIsTyping(false);

      // Provide a more informative error message
      let errorMessage =
        language === "arabic"
          ? `خطأ في الاتصال: ${error.message}.`
          : `Connection error: ${error.message}.`;

      if (error.message === "Failed to fetch") {
        if (language === "arabic") {
          errorMessage +=
            " قد يكون هذا بسبب مشكلة في CORS أو عدم توفر خدمة الخلفية. ";
          errorMessage += "يرجى التأكد من تشغيل الخادم الخلفي في " + API_URL;
        } else {
          errorMessage +=
            " This may be due to a CORS issue or the backend service being unavailable. ";
          errorMessage += "Please ensure the backend is running at " + API_URL;
        }
      }

      addMessage(errorMessage, "bot");
    }
  };

  // Helper functions for country names
  const getCountryName = () => {
    const countryNames = {
      oman: "Oman",
      saudi: "Saudi Arabia",
      uae: "UAE",
    };
    return country ? countryNames[country] : "your country";
  };

  const getCountryNameArabic = () => {
    const countryNamesAr = {
      oman: "عمان",
      saudi: "المملكة العربية السعودية",
      uae: "الإمارات العربية المتحدة",
    };
    return country ? countryNamesAr[country] : "بلدك";
  };

  // Helper function to get welcome message based on country
  const getWelcomeMessage = () => {
    if (!country) {
      return language === "arabic"
        ? "مرحبًا! أنا المساعد القانوني الذكي. كيف يمكنني مساعدتك اليوم؟"
        : "Hello! I am your legal AI assistant. How can I help you today?";
    }

    const welcomeMessages = {
      oman: "Welcome to Oman Legal AI Assistant. How can I help you with Omani law today?",
      saudi:
        "Welcome to Saudi Legal AI Assistant. How can I help you with Saudi law today?",
      uae: "Welcome to UAE Legal AI Assistant. How can I help you with Emirati law today?",
    };

    const welcomeMessagesAr = {
      oman: "مرحبًا بكم في المساعد القانوني الذكي لعمان. كيف يمكنني مساعدتك في القانون العماني اليوم؟",
      saudi:
        "مرحبًا بكم في المساعد القانوني الذكي للسعودية. كيف يمكنني مساعدتك في القانون السعودي اليوم؟",
      uae: "مرحبًا بكم في المساعد القانوني الذكي للإمارات. كيف يمكنني مساعدتك في القانون الإماراتي اليوم؟",
    };

    return language === "arabic"
      ? welcomeMessagesAr[country]
      : welcomeMessages[country];
  };

  return (
    <AppContext.Provider
      value={{
        country,
        setCountry,
        language,
        setLanguage,
        showCountryModal,
        setShowCountryModal,
        showLoginModal,
        setShowLoginModal,
        darkMode,
        setDarkMode,
        toggleDarkMode,
        messages,
        isTyping,
        sendMessage,
        getCountryName,
        getWelcomeMessage,
        getCountryNameArabic,
        isClient,
        recentChats,
        isLoadingChats,
        loadRecentChats,
        switchChat,
        startNewChat,
        activeChatId,
        showLoginPromptForChat,
        setShowLoginPromptForChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
