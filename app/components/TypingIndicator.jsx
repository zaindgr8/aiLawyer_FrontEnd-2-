import React from "react";
import { motion } from "framer-motion";

const TypingIndicator = () => {
  return (
    <div className="chat-bubble bot-bubble flex items-center">
      <div className="typing-indicator">
        <motion.div
          className="typing-dot"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 1, 0.3],
            y: [0, -4, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        />
        <motion.div
          className="typing-dot"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 1, 0.3],
            y: [0, -4, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
            times: [0, 0.5, 1],
          }}
        />
        <motion.div
          className="typing-dot"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 1, 0.3],
            y: [0, -4, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6,
            times: [0, 0.5, 1],
          }}
        />
      </div>
    </div>
  );
};

export default TypingIndicator;
