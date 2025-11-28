// const express = require("express")
// import {Request,Response} from "express";
// import {serve} from "inngest/express";
// import { inngest } from "./inngest/client";
// import {functions as inngestFunctions} from "./inngest/functions";
// import {logger} from "./utils/logger";
// import { connectDB } from "./utils/db";
// import dotenv from "dotenv";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import authRoutes from "./routes/auth";
// import { errorHandler } from "./middleware/errorHandler";
// import chatRouter from "./routes/chat";
// import moodRouter from "./routes/mood";
// import activityRouter from "./routes/activity";
// import chatRoutes from "./routes/chat";

// // app.use("/chat", chatRoutes);


// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(helmet());
// app.use(morgan("dev"));

// app.use(express.json());

// app.use("/api/inngest",serve({client:inngest,functions:inngestFunctions}));

// //routes
// app.use("/auth",authRoutes);
// app.use("/chat",chatRouter);
// app.use('/api/mood',moodRouter);
// app.use("/api/activity",activityRouter);

// app.use(errorHandler);
// // app.get("/",(req : Request ,res :Response )=>{
// //     res.send("Hello World!")
// // });
// // app.get("/api/chat",(req : Request ,res :Response )=>{
// //     res.send("Hii, how may i help you today?")
// // });
// // app.listen(PORT,()=>{
// //     console.log(`Server is running on port ${PORT}`);
// // });

// const startServer=async()=>{
//     try{
//         await connectDB();
//         const PORT =process.env.PORT || 3001;
//         app.listen(PORT,()=>{
//             logger.info(`Server is running on port${PORT}`);
//             logger.info(
//                 `Inngest endpoint available at http://localhost:${PORT}/api/inngest`
//             );
//         });
//     } catch(error){
//         logger.error("Failed to start server:", error);
//         process.exit(1);
//     }
// };

// startServer();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { serve } from "inngest/express";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import authRouter from "./routes/auth";
import chatRouter from "./routes/chat";
import moodRouter from "./routes/mood";
import activityRouter from "./routes/activity";
import { connectDB } from "./utils/db";
import { inngest } from "./inngest/client";
import { functions as inngestFunctions } from "./inngest/functions";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // HTTP request logger

// Set up Inngest endpoint
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: inngestFunctions })
);
// OnaF6EGHhgYY9OPv

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/api/mood", moodRouter);
app.use("/api/activity", activityRouter);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then start the server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(
        `Inngest endpoint available at http://localhost:${PORT}/api/inngest`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();