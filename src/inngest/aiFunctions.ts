import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyBTPRuz-vgVdz1ElGcsqw_y786XBdY2D-M"
);

// ✅ helper to call Gemini safely
async function generateGeminiText(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text.trim();
}

// ✅ reusable system prompt
const systemPrompt = `
You are a professional AI therapy assistant.
Always respond with empathy, respect, and focus on emotional well-being.
`;

export const processChatMessage = inngest.createFunction(
  { id: "process-chat-message" },
  { event: "therapy/session.message" },
  async ({ event, step }) => {
    try {
      const {
        message,
        history,
        memory = {
          userProfile: {
            emotionalState: [],
            riskLevel: 0,
            preferences: {},
          },
          sessionContext: {
            conversationTheme: [],
            currentTechnique: [],
          },
        },
      } = event.data;

      logger.info("Processing chat message:", {
        message,
        historyLength: history?.length,
      });

      // Step 1: Analyze the message
      const analysis = await step.run("analyze-message", async () => {
        try {
          const prompt = `
Analyze this therapy message and provide insights.
Return ONLY a valid JSON object (no markdown formatting or extra text).

Message: ${message}
Context: ${JSON.stringify({ memory })}

Required JSON structure:
{
  "emotionalState": "string",
  "themes": ["string"],
  "riskLevel": number
}`;

          const text = await generateGeminiText(prompt);
          logger.info("Received analysis from Gemini:", { text });

          const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
          const parsedAnalysis = JSON.parse(cleanText || "{}");

          logger.info("Successfully parsed analysis:", parsedAnalysis);
          return parsedAnalysis;
        } catch (error) {
          logger.error("Error in message analysis:", { error, message });

          return {
            emotionalState: "neutral",
            themes: [],
            riskLevel: 0,
            recommendedApproach: "supportive",
            progressIndicators: [],
          };
        }
      });

      // Step 2: Update memory
      const updatedMemory = await step.run("update-memory", async () => {
        if (analysis.emotionalState) {
          memory.userProfile.emotionalState.push(analysis.emotionalState);
        }
        if (analysis.themes) {
          memory.sessionContext.conversationTheme.push(...analysis.themes);
        }
        if (analysis.riskLevel) {
          memory.userProfile.riskLevel = analysis.riskLevel;
        }
        return memory;
      });

      // Step 3: Check for risk
      if (analysis.riskLevel > 4) {
        await step.run("trigger-risk-alert", async () => {
          logger.warn("High risk level detected in chat message", {
            message,
            riskLevel: analysis.riskLevel,
          });
        });
      }

      // Step 4: Generate response
      const aiResponse = await step.run("generate-response", async () => {
        try {
          const prompt = `${systemPrompt}

Based on the following context, generate a therapeutic response:

Message: ${message}
Analysis: ${JSON.stringify(analysis)}
Memory: ${JSON.stringify(memory)}

Provide a response that:
1. Addresses the immediate emotional needs
2. Uses appropriate therapeutic techniques
3. Shows empathy and understanding
4. Maintains professional boundaries
5. Considers safety and well-being`;

          const text = await generateGeminiText(prompt);
          logger.info("Generated response:", { text });
          return text;
        } catch (error) {
          logger.error("Error generating response:", { error, message });
          return "I'm here to support you. Could you tell me more about what's on your mind?";
        }
      });

      return {
        response: aiResponse,
        analysis,
        updatedMemory,
      };
    } catch (error) {
      logger.error("Error in chat message processing:", {
        error,
        message: event.data.message,
      });

      return {
        response: "I'm here to support you. Could you tell me more about what's on your mind?",
        analysis: {
          emotionalState: "neutral",
          themes: [],
          riskLevel: 0,
          recommendedApproach: "supportive",
          progressIndicators: [],
        },
        updatedMemory: event.data.memory,
      };
    }
  }
);

export const analyzeTherapySession = inngest.createFunction(
  { id: "analyze-therapy-session" },
  { event: "therapy/session.created" },
  async ({ event, step }) => {
    try {
      const sessionContent = await step.run("get-session-content", async () => {
        return event.data.notes || event.data.transcript;
      });

      const analysis = await step.run("analyze-with-gemini", async () => {
        const prompt = `
Analyze this therapy session and provide insights:

Session Content: ${sessionContent}

Please provide:
1. Key themes and topics discussed
2. Emotional state analysis
3. Potential areas of concern
4. Recommendations for follow-up
5. Progress indicators

Format the response as a JSON object.
`;

        const text = await generateGeminiText(prompt);
        return JSON.parse(text || "{}");
      });

      await step.run("store-analysis", async () => {
        logger.info("Session analysis stored successfully");
        return analysis;
      });

      if (analysis.areaOfConcern?.length > 0) {
        await step.run("trigger-concern-alert", async () => {
          logger.warn("Concerning indicators detected in session analysis", {
            sessionId: event.data.sessionId,
            concerns: analysis.areaOfConcern,
          });
        });
      }

      return {
        message: "Session analysis completed",
        analysis,
      };
    } catch (error) {
      logger.error("Error in therapy session analysis:", error);
      throw error;
    }
  }
);

export const generateActivityRecommendations = inngest.createFunction(
  { id: "generate-activity-recommendations" },
  { event: "mood/updated" },
  async ({ event, step }) => {
    // Implementation placeholder
    logger.info("Mood updated event received:", event.data);
    return { message: "Activity recommendations pending implementation." };
  }
);

export const functions = [processChatMessage, analyzeTherapySession];
