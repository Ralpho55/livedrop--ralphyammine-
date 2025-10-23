// apps/storefront/src/assistant/engine.ts
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";

/**
 * Send a user query to the backend Assistant API.
 */
export async function getAssistantResponse(message: string) {
  try {
    const { data } = await axios.post(`${API_BASE}/api/assistant`, {
      query: message,
    });

    // Normalize backend response for the SupportPanel
    return {
      response: data.text ?? data.reply ?? "No response available.",
      intent: data.intent ?? "unknown",
      citations: data.citations ?? [],
      success: true,
    };
  } catch (err: any) {
    console.error("Assistant API error:", err.message);
    return {
      response: "I'm sorry — something went wrong reaching the assistant.",
      intent: "error",
      success: false,
    };
  }
}
