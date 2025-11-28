import { Inngest } from "inngest"; // ✅ import the class

// Create the Inngest client by instantiating the class
export const inngest = new Inngest({
  id: "ai-therapy-agent",
});

// Export an array for all functions
export const functions: any[] = [];
