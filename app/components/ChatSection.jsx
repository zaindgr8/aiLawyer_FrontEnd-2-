"use client";

import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatSection() {
  const {
    messages,
    sendMessage,
    isTyping,
    getWelcomeMessage,
    country,
    language,
    isClient,
    user,
    activeChatId,
    startNewChat,
  } = useAppContext();
  const [newMessage, setNewMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showScrollIcon, setShowScrollIcon] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (!isClient || !mounted) return;

    // Check if browser supports speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      // Set language based on the UI language selection
      recognitionRef.current.lang = language === "arabic" ? "ar-SA" : "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        // Update both the speech text and the message input field
        setSpeechText(transcript);
        setNewMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        // Stop listening when recognition ends
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);

        // Show error message for unsupported browsers
        if (event.error === "not-allowed") {
          alert("Please allow microphone access to use voice input.");
        }
      };
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping recognition
        }
      }
    };
  }, [isClient, mounted, language]);

  // Update language when the UI language changes
  useEffect(() => {
    if (!isClient || !mounted || !recognitionRef.current) return;

    // Set speech recognition language based on UI language
    recognitionRef.current.lang = language === "arabic" ? "ar-SA" : "en-US";

    console.log(
      `Speech recognition language set to: ${recognitionRef.current.lang}`
    );
  }, [language, isClient, mounted]);

  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      console.warn("Speech recognition not supported");
      alert("Voice input is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);

      // Submit the message if there's content
      if (newMessage.trim()) {
        sendMessage(newMessage);
        setNewMessage("");
        setSpeechText("");
      }
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      // Don't clear the input when starting to listen
      // This allows the user to type and then continue with voice
    }
  };

  // Format AI message content with improved styling and structure
  const formatAIMessage = (content) => {
    // Split content into paragraphs
    const paragraphs = content.split("\n\n");

    return paragraphs.map((paragraph, pIndex) => {
      // Handle code blocks
      if (paragraph.trim().startsWith("```")) {
        const codeContent = paragraph
          .replace(/```([\w]*)\n/, "")
          .replace(/```$/, "");
        return (
          <pre key={`code-${pIndex}`} className="ai-code-block">
            <code>{codeContent}</code>
          </pre>
        );
      }

      // Check if this is a bullet point list
      else if (
        paragraph.trim().startsWith("• ") ||
        paragraph.trim().startsWith("- ")
      ) {
        const listItems = paragraph
          .split(/\n- |\n• /)
          .map((item) => item.replace(/^[•-] /, "").trim())
          .filter(Boolean);

        return (
          <ul key={`list-${pIndex}`} className="ai-list my-3 pl-5">
            {listItems.map((item, i) => (
              <li
                key={`item-${pIndex}-${i}`}
                className="ai-list-item flex mb-2"
              >
                <span className="bullet-point mr-2 text-[var(--primary-color)]">
                  •
                </span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: processTextFormatting(item),
                  }}
                ></span>
              </li>
            ))}
          </ul>
        );
      }

      // Check if this is a numbered list (starts with 1. 2. etc)
      else if (/^\d+\.\s/.test(paragraph.trim())) {
        const listItems = paragraph.split(/\n\d+\.\s/).filter(Boolean);
        // If there's only one item but it starts with a number, it might not be a list
        if (listItems.length > 1 || /^\d+\.\s/.test(paragraph.trim())) {
          return (
            <ol
              key={`numbered-list-${pIndex}`}
              className="ai-numbered-list my-3 pl-5 list-decimal"
            >
              {listItems.map((item, i) => (
                <li
                  key={`num-item-${pIndex}-${i}`}
                  className="ai-numbered-list-item mb-2 pl-2"
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: processTextFormatting(item.trim()),
                    }}
                  ></span>
                </li>
              ))}
            </ol>
          );
        }
      }

      // Check if this is a heading (starts with # or ##)
      else if (
        paragraph.trim().startsWith("# ") ||
        paragraph.trim().startsWith("## ")
      ) {
        const headingText = paragraph.replace(/^#+\s/, "");
        const isMainHeading = paragraph.trim().startsWith("# ");

        return (
          <h3
            key={`heading-${pIndex}`}
            className={`ai-heading ${
              isMainHeading ? "text-lg font-bold" : "text-base font-semibold"
            } text-gray-800 mt-4 mb-2`}
          >
            {headingText}
          </h3>
        );
      }

      // Regular paragraph with stronger styling and text formatting
      return (
        <p
          key={`p-${pIndex}`}
          className="ai-paragraph mb-3 text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processTextFormatting(paragraph) }}
        />
      );
    });
  };

  // Process text formatting including links, bold, italic, etc.
  const processTextFormatting = (text) => {
    let processed = text;

    // Basic markdown links [text](url)
    processed = processed.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="ai-link">$1</a>'
    );

    // Plain URLs
    processed = processed.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="ai-link">$1</a>'
    );

    // Bold text with **
    processed = processed.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // Italic text with *
    processed = processed.replace(
      /(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g,
      "<em>$1</em>"
    );

    // Inline code with `
    processed = processed.replace(/`([^`]+)`/g, "<code>$1</code>");

    return processed;
  };

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

  // Safe client-side only mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!isClient || !mounted) return; // Skip on server or before mounting
    scrollToBottom();
  }, [messages, isClient, mounted]);

  // Check if chat needs scroll indicator
  useEffect(() => {
    if (!isClient || !mounted) return; // Skip on server or before mounting
    if (chatContainerRef.current) {
      const checkScrollable = () => {
        const { scrollHeight, clientHeight, scrollTop } =
          chatContainerRef.current;
        // Show scroll icon if not at bottom and has enough content
        setShowScrollIcon(
          scrollHeight > clientHeight &&
            scrollHeight - scrollTop - clientHeight > 100
        );
      };

      checkScrollable();

      // Listen for scroll events to hide icon when at bottom
      const onScroll = () => {
        const { scrollHeight, clientHeight, scrollTop } =
          chatContainerRef.current;
        const atBottom = scrollHeight - scrollTop - clientHeight < 50;
        setShowScrollIcon(!atBottom);
      };

      const container = chatContainerRef.current;
      container.addEventListener("scroll", onScroll);

      return () => {
        if (container) {
          container.removeEventListener("scroll", onScroll);
        }
      };
    }
  }, [messages, isClient, mounted]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollToBottom = () => {
    scrollToBottom();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <section
      className={`lg:w-2/3 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 flex flex-col ${
        isMobile ? "h-[85vh]" : "h-[80vh]"
      }`}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">
            {language === "arabic" ? "المساعد القانوني" : "Legal Assistant"}
          </h2>
          <p className="text-sm opacity-90 flex items-center mt-1">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
            {country
              ? language === "arabic"
                ? "جاهز للإجابة على استفساراتك القانونية"
                : "Ready to answer your legal queries"
              : language === "arabic"
              ? "يرجى اختيار بلدك أولاً"
              : "Please select your country first"}
          </p>
        </div>
        {user && (
          <motion.button
            className="bg-white bg-opacity-20 hover:bg-opacity-30 transition px-3 py-1.5 rounded-lg text-white text-sm flex items-center"
            onClick={() => {
              startNewChat();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-plus mr-1.5"></i>
            {language === "arabic" ? "محادثة جديدة" : "New Chat"}
          </motion.button>
        )}
      </div>

      {/* Chat Messages Area - Scrollable */}
      <div
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto ${
          isMobile ? "p-3 md:p-6" : "p-6"
        } chat-scroll relative bg-white`}
      >
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="h-full flex flex-col items-center justify-center text-center px-4"
          >
            <div className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center mb-6 animate-float shadow-xl">
              <i className="fas fa-balance-scale text-white text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {language === "arabic"
                ? "مرحبًا بك في المساعد القانوني الذكي"
                : "Welcome to Legal AI Assistant"}
            </h3>
            <p className="text-gray-600 max-w-md text-lg">
              {getWelcomeMessage()}
            </p>

            {activeChatId && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                <p>
                  <i className="fas fa-info-circle mr-1"></i>
                  {language === "arabic"
                    ? "أنت الآن في محادثة محفوظة"
                    : "You are now in a saved conversation"}
                </p>
              </div>
            )}

            {/* Add a language indicator */}
            <div className="mt-4 p-2 bg-gray-50 text-gray-500 rounded-lg text-xs flex items-center justify-center">
              <i className="fas fa-language mr-1"></i>
              <span>
                {language === "arabic"
                  ? "اللغة الحالية: العربية"
                  : "Current language: English"}
              </span>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center"
                onClick={() =>
                  sendMessage(
                    language === "arabic"
                      ? "ما هي حقوقي القانونية؟"
                      : "What are my legal rights?"
                  )
                }
              >
                <i className="fas fa-question-circle mr-2 text-[var(--primary-color)]"></i>
                <span>
                  {language === "arabic"
                    ? "ما هي حقوقي القانونية؟"
                    : "What are my legal rights?"}
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center"
                onClick={() =>
                  sendMessage(
                    language === "arabic"
                      ? "كيف يمكنك مساعدتي؟"
                      : "How can you help me?"
                  )
                }
              >
                <i className="fas fa-robot mr-2 text-[var(--primary-color)]"></i>
                <span>
                  {language === "arabic"
                    ? "كيف يمكنك مساعدتي؟"
                    : "How can you help me?"}
                </span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: index === messages.length - 1 ? 0 : 0,
                  }}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`chat-bubble ${
                      msg.sender === "user" ? "user-bubble" : "bot-bubble"
                    } max-w-3xl`}
                  >
                    <div className="flex items-center mb-2">
                      {msg.sender === "user" ? (
                        <>
                          <span className="text-xs opacity-70 mr-2">You</span>
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <i className="fas fa-user text-[var(--primary-color)] text-xs"></i>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center mr-2">
                            <i className="fas fa-robot text-white text-xs"></i>
                          </div>
                          <span className="text-xs opacity-70">
                            Legal Assistant
                          </span>
                        </>
                      )}
                    </div>

                    {msg.sender === "user" ? (
                      <p>{msg.content}</p>
                    ) : (
                      <div className="ai-message-content">
                        {formatAIMessage(msg.content)}
                      </div>
                    )}

                    <div className="mt-2 flex justify-end">
                      <span className="text-xs opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="typing-indicator">
                  <div className="animate-typing-dot typing-dot"></div>
                  <div className="animate-typing-dot typing-dot"></div>
                  <div className="animate-typing-dot typing-dot"></div>
                  {language === "arabic" && (
                    <span className="text-xs text-gray-500 mr-2">
                      جاري الكتابة...
                    </span>
                  )}
                  {language === "english" && (
                    <span className="text-xs text-gray-500 ml-2">
                      Typing...
                    </span>
                  )}
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollIcon && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleScrollToBottom}
            className={`absolute ${
              isMobile ? "bottom-20" : "bottom-24"
            } right-6 p-3 rounded-full shadow-lg z-10 text-white`}
            style={{ backgroundColor: "var(--primary-color)" }}
          >
            <i className="fas fa-arrow-down"></i>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Message Input - Fixed at bottom */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex gap-3 relative">
          {/* Desktop microphone button */}
          <div
            className={`${
              isMobile ? "hidden md:flex" : "flex"
            } items-center px-2 text-gray-500`}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-full hover:bg-gray-100 ${
                isListening ? "bg-red-100 text-red-500 voice-active" : ""
              }`}
              type="button"
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              <i
                className={`fas ${
                  isListening ? "fa-microphone-slash" : "fa-microphone"
                }`}
              ></i>
            </motion.button>
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                language === "arabic"
                  ? isListening
                    ? "جاري الاستماع..."
                    : "اكتب سؤالك القانوني هنا..."
                  : isListening
                  ? "Listening to your voice..."
                  : "Type your legal question here..."
              }
              className={`w-full py-3 px-4 rounded-full border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 shadow-inner ${
                isListening ? "border-red-300 listening-input" : ""
              }`}
              style={{
                focusRing: "var(--primary-color)",
                caretColor: "var(--primary-color)",
              }}
              disabled={!country}
            />

            {/* Mobile microphone button (inside the input) */}
            {isMobile && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`md:hidden absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                  isListening ? "text-red-500 voice-active" : "text-gray-400"
                }`}
                type="button"
                onClick={toggleListening}
              >
                <i
                  className={`fas ${
                    isListening ? "fa-microphone-slash" : "fa-microphone"
                  }`}
                ></i>
              </motion.button>
            )}

            {isListening && (
              <div
                className={`absolute ${
                  isMobile ? "right-12" : "right-4"
                } top-1/2 transform -translate-y-1/2 flex items-center space-x-1`}
              >
                <div className="w-1 bg-red-400 rounded-full sound-wave-1"></div>
                <div className="w-1 bg-red-500 rounded-full sound-wave-2"></div>
                <div className="w-1 bg-red-600 rounded-full sound-wave-3"></div>
                <div className="w-1 bg-red-500 rounded-full sound-wave-4"></div>
                <div className="w-1 bg-red-400 rounded-full sound-wave-5"></div>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className={`${
              isMobile ? "p-3 md:py-3 md:px-6" : "py-3 px-6"
            } rounded-full gradient-bg text-white font-medium shadow-md hover:shadow-lg`}
            disabled={!newMessage.trim() || !country}
          >
            <i className="fas fa-paper-plane"></i>
          </motion.button>
        </form>
      </div>
    </section>
  );
}
