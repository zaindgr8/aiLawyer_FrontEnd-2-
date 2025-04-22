import { db } from "./config";
import {
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  limit,
  serverTimestamp,
} from "firebase/firestore";

// Collection references
const CHATS_COLLECTION = "chats";
const MESSAGES_COLLECTION = "messages";

/**
 * Tests access to Firebase collections
 * @param {string} userId - User ID to test with
 * @returns {Promise<object>} - Results of the tests
 */
export const testFirebaseAccess = async (userId) => {
  try {
    console.log("Testing Firebase Firestore access...");

    // Try accessing the chats collection
    const q = query(
      collection(db, CHATS_COLLECTION),
      where("userId", "==", userId),
      limit(1)
    );

    const result = await getDocs(q);
    console.log(
      `Chats collection access test: ${result !== null ? "SUCCESS" : "FAILED"}`
    );

    return {
      success: true,
      chatsAccess: result !== null,
    };
  } catch (error) {
    console.error("Firebase access test failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Creates a new chat in Firestore
 * @param {string} userId - The ID of the user creating the chat
 * @param {string} title - Title for the chat (optional, defaults to first message)
 * @param {string} country - The country context of the chat
 * @param {string} language - The language preference (english or arabic)
 * @returns {Promise<string>} - The chat document ID
 */
export const createChat = async (
  userId,
  title = null,
  country = null,
  language = "english"
) => {
  try {
    const chatRef = await addDoc(collection(db, CHATS_COLLECTION), {
      userId,
      title:
        title || (language === "arabic" ? "محادثة جديدة" : "New conversation"),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      country,
      language,
      messageCount: 0,
    });

    return chatRef.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

/**
 * Adds a new message to a chat
 * @param {string} chatId - The ID of the chat
 * @param {string} content - Message content
 * @param {string} sender - Message sender ('user' or 'bot')
 * @returns {Promise<string>} - The message document ID
 */
export const addMessage = async (chatId, content, sender) => {
  try {
    // Add the message
    const messageRef = await addDoc(
      collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION),
      {
        content,
        sender,
        timestamp: serverTimestamp(),
        read: true,
      }
    );

    // Update the chat with the latest message preview and update timestamp
    // This is used for the chat list display
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    const chatDocSnap = await getDoc(chatRef);

    if (chatDocSnap.exists()) {
      const chatData = chatDocSnap.data();

      // If this is the first message and we don't have a real title yet,
      // use the first user message as the title
      if (chatData.title === "New conversation" && sender === "user") {
        await updateChatTitle(chatId, content);
      }

      // Update message count
      await updateChat(chatId, {
        lastMessage: content.substring(0, 100), // Store a preview of the message
        lastMessageSender: sender,
        lastMessageTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messageCount: (chatData.messageCount || 0) + 1,
      });
    }

    return messageRef.id;
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
};

/**
 * Updates a chat document with new data
 * @param {string} chatId - The ID of the chat to update
 * @param {Object} data - The data to update
 * @returns {Promise<void>}
 */
export const updateChat = async (chatId, data) => {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error("Error updating chat:", error);
    throw error;
  }
};

/**
 * Updates the title of a chat
 * @param {string} chatId - The ID of the chat
 * @param {string} title - The new title
 * @returns {Promise<void>}
 */
export const updateChatTitle = async (chatId, title) => {
  try {
    // Use only first 50 characters of message as title if needed
    const shortenedTitle =
      title.length > 50 ? `${title.substring(0, 47)}...` : title;

    await updateChat(chatId, { title: shortenedTitle });
  } catch (error) {
    console.error("Error updating chat title:", error);
    throw error;
  }
};

/**
 * Gets all chats for a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Array of chat documents
 */
export const getUserChats = async (userId) => {
  try {
    const q = query(
      collection(db, CHATS_COLLECTION),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting user chats:", error);
    throw error;
  }
};

/**
 * Gets the most recent chats for a user, limited to a specific count
 * @param {string} userId - The ID of the user
 * @param {number} limitCount - Maximum number of chats to retrieve
 * @returns {Promise<Array>} - Array of chat documents
 */
export const getRecentChats = async (userId, limitCount = 5) => {
  try {
    console.log(`Getting recent chats for user ${userId}`);

    // Create the query
    const q = query(
      collection(db, CHATS_COLLECTION),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
      limit(limitCount)
    );

    // Execute the query
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} chats`);

    // Map documents to objects with serializable dates
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();

      // Convert Firestore Timestamps to serializable objects
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
        updatedAt: data.updatedAt
          ? data.updatedAt.toDate().toISOString()
          : new Date().toISOString(),
        lastMessageTimestamp: data.lastMessageTimestamp
          ? {
              seconds: data.lastMessageTimestamp.seconds,
              nanoseconds: data.lastMessageTimestamp.nanoseconds,
            }
          : null,
      };
    });
  } catch (error) {
    console.error("Error getting recent chats:", error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

/**
 * Gets all messages for a specific chat
 * @param {string} chatId - The ID of the chat
 * @returns {Promise<Array>} - Array of message documents
 */
export const getChatMessages = async (chatId) => {
  try {
    const q = query(
      collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION),
      orderBy("timestamp", "asc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting chat messages:", error);
    throw error;
  }
};

/**
 * Gets a single chat by ID
 * @param {string} chatId - The ID of the chat
 * @returns {Promise<Object|null>} - Chat document or null if not found
 */
export const getChat = async (chatId) => {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      return {
        id: chatSnap.id,
        ...chatSnap.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting chat:", error);
    throw error;
  }
};
