import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import axios from "axios";
import { fileURLToPath } from "url";

import functionRegistry from "./function-registry.js";
import { classifyIntent } from "./intent-classifier.js";
import { response } from "express";

/**
 * Assistant Engine — integrates identity, function registry, and LLM interface
 */
export default class AssistantEngine {
  constructor() {
    this.config = this.loadConfig();
    console.log(
      "[AssistantEngine] Loaded identity:",
      this.config.prompts?.identity?.name || "Unknown"
    );
  }

  /**
   * Resolve file locations safely relative to engine.js
   */
  resolvePromptsYaml() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // 1) canonical path (repo root /docs/prompts.yaml)
    const rootDocs = path.resolve(__dirname, "../../../../docs/prompts.yaml");
    // 2) fallback (apps/api/docs/prompts.yaml)
    const apiLocalDocs = path.resolve(__dirname, "../../docs/prompts.yaml");

    if (fs.existsSync(rootDocs)) return rootDocs;
    if (fs.existsSync(apiLocalDocs)) return apiLocalDocs;

    console.warn("[AssistantEngine] prompts.yaml not found. Checked:", {
      rootDocs,
      apiLocalDocs,
    });
    return null;
  }

  /**
   * Load configuration files: prompts.yaml + ground-truth.json (optional)
   */
  loadConfig() {
    const config = { prompts: {}, knowledgeBase: {} };

    // --- Load YAML identity/personality config ---
    try {
      const yamlPath = this.resolvePromptsYaml();
      if (yamlPath) {
        const yamlContent = fs.readFileSync(yamlPath, "utf8");
        config.prompts = yaml.load(yamlContent);
      } else {
        console.warn("[AssistantEngine] prompts.yaml could not be located.");
      }
    } catch (err) {
      console.error("[AssistantEngine] Error loading prompts.yaml:", err.message);
    }

    // --- Load knowledge base (optional) ---
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const jsonPath = path.resolve(
        __dirname,
        "../../../../docs/prompting/ground-truth.json"
      );

      if (fs.existsSync(jsonPath)) {
        const jsonContent = fs.readFileSync(jsonPath, "utf8");
        config.knowledgeBase = JSON.parse(jsonContent);
      } else {
        console.warn("[AssistantEngine] No ground-truth.json found, skipping grounding.");
      }
    } catch (err) {
      console.error("[AssistantEngine] Error loading ground-truth.json:", err.message);
    }

    return config;
  }

  /**
   * Build the structured prompt using Ava’s personality and tone per intent
   */
  buildPrompt(intent, query) {
    const baseIdentity = this.config.prompts?.identity?.name || "Ava";
    const role = this.config.prompts?.identity?.role || "E-commerce Assistant";
    const intentStyles = this.config.prompts?.intent_styles || {};

    const style = intentStyles[intent] || {
      tone: "neutral",
      phrasing: "Respond clearly.",
      example: "",
    };

    let prompt = `You are ${baseIdentity}, a ${role}.\nTone: ${style.tone}\n\n`;
    prompt += `User Query: ${query}\n\n`;
    if (style.example) prompt += `Example response: ${style.example}\n\n`;
    prompt += `Follow these rules:\n- ${(
      this.config.prompts?.behavior_rules || []
    ).join("\n- ")}\n\n`;
    return prompt;
  }

  /**
   * Local or external LLM call with mock fallback
   */
  async callLLM(prompt) {
    const llmUrl = process.env.LLM_GENERATE_URL;
    if (!llmUrl) {
      console.warn(
        "[AssistantEngine] No LLM_GENERATE_URL set. Returning mock response."
      );
      return `[Mock LLM Response] ${prompt}`;
    }

    try {
      const response = await axios.post(llmUrl, {
        prompt,
        max_tokens: 250,
      });
      return response.data.text || "No response text received.";
    } catch (err) {
      console.error("LLM API Error:", err.message);
      return `[LLM Error]: ${err.message}`;
    }
  }

  /**
   * Main assistant handler — ties everything together
   */
  async handleAssistantQuery(query) {
    try {
      const intent = classifyIntent(query);
      let responseText = "";
      let functionsCalled = [];

      if (intent === "policy_question") {
        responseText =
          "Let me check our store policy on that. (Grounding coming in Day 10)";
      } else if (intent === "order_status") {
        const order = await functionRegistry.execute("getOrderStatus", {
            orderId: "68f3f1ae7342c0c3da294bd9" // temporary test ID
          });
        responseText = order
          ? `Your order is currently ${order.status}. Expected delivery: ${order.estimatedDelivery}.`
          : "I couldn’t locate your order right now.";
        functionsCalled.push("getOrderStatus");
        //responseText = "Your order is currently in transit. Expected delivery: 2025-10-25.";
      } else if (intent === "product_search") {
        const products = await functionRegistry.execute("searchProducts", {
          query,
          limit: 3,
        });
        responseText = products?.length
          ? `Here are a few matches: ${products
              .map((p) => p.name)
              .slice(0, 2)
              .join(", ")}.`
          : "I didn’t find any matching items.";
        functionsCalled.push("searchProducts");
        //responseText = "Searching for products...";
      } else if (intent === "complaint") {
        responseText =
          "I’m truly sorry for the inconvenience. Let’s fix this right away.";
      } else if (intent === "chitchat") {
        responseText = "Hey there! How can I help you with your order today?";
      } else if (intent === "violation") {
        responseText =
          "Let’s stay respectful — I’m here to assist with your shopping questions.";
      } else {
        responseText =
          "I might not have that information, but I can help with store or order-related questions.";
      }

      const prompt = this.buildPrompt(intent, query);
      const finalResponse = await this.callLLM(prompt + "\n" + responseText);

      return {
        success: true,
        intent,
        response: finalResponse,
        functionsCalled,
      };
    } catch (err) {
      console.error("Error handling assistant query:", err);
      return { success: false, error: err.message };
    }
  }
}

// Singleton export for server.js
const assistant = new AssistantEngine();
export async function handleAssistantQuery(query) {
  return await assistant.handleAssistantQuery(query);
}
