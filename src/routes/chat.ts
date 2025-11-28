// import express from "express";
// import { ChatSession } from "../models/ChatSession";   // ✅ correct import
// import {
//   createChatSession,
//   getChatSession,
//   sendMessage,
//   getChatHistory,
// } from "../controllers/chat";
// import { auth } from "../middleware/auth";

// const router = express.Router();

// // Apply auth middleware to all routes
// router.use(auth);

// // 🔥 Add GET /chat/sessions
// router.get("/sessions", async (req: any, res) => {
//   try {
//     const userId = req.user.id;

//     const sessions = await ChatSession.find({ userId }).sort({
//       updatedAt: -1,
//     });

//     return res.json({
//       success: true,
//       sessions,
//     });
//   } catch (err) {
//     console.error("Error fetching sessions:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch chat sessions",
//     });
//   }
// });

// // Create a new chat session
// router.post("/sessions", createChatSession);

// // Get a specific chat session
// router.get("/sessions/:sessionId", getChatSession);

// // Send a message
// router.post("/sessions/:sessionId/messages", sendMessage);

// // Get chat history
// router.get("/sessions/:sessionId/history", getChatHistory);

// export default router;

import express from "express";
import {
  createChatSession,
  getChatSession,
  sendMessage,
  getChatHistory,
} from "../controllers/chat";
import { auth } from "../middleware/auth";

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Create a new chat session
router.post("/sessions", createChatSession);

// Get a specific chat session
router.get("/sessions/:sessionId", getChatSession);

// Send a message in a chat session
router.post("/sessions/:sessionId/messages", sendMessage);

// Get chat history for a session
router.get("/sessions/:sessionId/history", getChatHistory);

export default router;

// let response = pm.response.json()
// pm.globals.set("access_token", response.access_token)