import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import axios from "axios";
import { fileURLToPath } from "url";

import functionRegistry from "./function-registry.js";
import { classifyIntent } from "./intent-classifier.js";
import { groundQuery, formatPoliciesForPrompt, validateCitations } from "./grounding.js";

/**
 * Assistant Engine — full architecture with intent routing, grounding, and validation
 */
export default class AssistantEngine {
  constructor() {
    this.config = this.loadConfig();
    this.functionCallLimit = 2;
    this.responseTimeLimit = 5000; // 5 seconds
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
        "../../../../docs/ground-truth.json"
      );

      if (fs.existsSync(jsonPath)) {
        const jsonContent = fs.readFileSync(jsonPath, "utf8");
        const knowledgeBase = JSON.parse(jsonContent);
        
        // Ensure it's an array
        if (Array.isArray(knowledgeBase)) {
          config.knowledgeBase = knowledgeBase;
          console.log(`[AssistantEngine] Loaded ${knowledgeBase.length} knowledge base entries`);
        } else {
          console.warn("[AssistantEngine] Knowledge base is not an array, skipping grounding.");
          config.knowledgeBase = [];
        }
      } else {
        console.warn("[AssistantEngine] No ground-truth.json found, skipping grounding.");
        config.knowledgeBase = [];
      }
    } catch (err) {
      console.error("[AssistantEngine] Error loading ground-truth.json:", err.message);
      config.knowledgeBase = [];
    }

    return config;
  }

  /**
   * Build comprehensive prompt with grounding and function results
   */
  buildPrompt(intent, query, groundedPolicies = "", functionResults = {}) {
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

    // Add grounded policies for policy questions
    if (groundedPolicies && groundedPolicies !== "No specific policies found for this query.") {
      prompt += `${groundedPolicies}\n`;
    }

    // Add function results
    if (functionResults.orderData) {
      prompt += `Order Information:\n${JSON.stringify(functionResults.orderData, null, 2)}\n\n`;
    }
    if (functionResults.productResults) {
      prompt += `Product Search Results:\n${JSON.stringify(functionResults.productResults, null, 2)}\n\n`;
    }
    if (functionResults.customerOrders) {
      prompt += `Customer Orders:\n${JSON.stringify(functionResults.customerOrders, null, 2)}\n\n`;
    }

    if (style.example) prompt += `Example response: ${style.example}\n\n`;
    prompt += `Follow these rules:\n- ${(
      this.config.prompts?.behavior_rules || []
    ).join("\n- ")}\n\n`;
    
    prompt += "Please provide a helpful, accurate response based on the available information.";
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
   * Execute function with timeout and call limit enforcement
   */
  async executeFunction(name, params, functionsCalled) {
    if (functionsCalled.length >= this.functionCallLimit) {
      console.warn(`[AssistantEngine] Function call limit (${this.functionCallLimit}) reached`);
      return null;
    }

    try {
      const result = await functionRegistry.execute(name, params);
      functionsCalled.push(name);
      return result;
    } catch (error) {
      console.error(`[AssistantEngine] Function ${name} failed:`, error.message);
      return null;
    }
  }

  /**
   * Main assistant handler with full architecture
   */
  async handleAssistantQuery(query) {
    const startTime = Date.now();
    let functionsCalled = [];
    let citations = [];

    try {
      // 1. Classify intent
      const intent = classifyIntent(query);
      console.log(`[AssistantEngine] Intent: ${intent}`);

      // 2. Ground policy answers for policy_question intent
      let groundedPolicies = "";
      if (intent === "policy_question") {
        const groundingResult = groundQuery(query, this.config.knowledgeBase);
        groundedPolicies = formatPoliciesForPrompt(groundingResult);
        console.log(`[AssistantEngine] Grounded ${groundingResult.matchedPolicies.length} policies`);
      }

      // 3. Execute functions based on intent (with limits)
      let functionResults = {};
      if (intent === "order_status") {
        // Try to extract order ID from query
        const orderIdMatch = query.match(/order[:\s#]*([a-f0-9]{24})/i);
        if (orderIdMatch) {
          const result = await this.executeFunction("getOrderStatus", 
            { orderId: orderIdMatch[1] }, functionsCalled);
          if (result) functionResults.orderData = result;
        }
      } else if (intent === "product_search") {
        const result = await this.executeFunction("searchProducts", 
          { query, limit: 5 }, functionsCalled);
        if (result) functionResults.productResults = result;
      } else if (intent === "complaint") {
        // Try to get customer orders if email mentioned
        const emailMatch = query.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (emailMatch) {
          const result = await this.executeFunction("getCustomerOrders", 
            { email: emailMatch[1] }, functionsCalled);
          if (result) functionResults.customerOrders = result;
        }
      }

      // 4. Build comprehensive prompt
      const prompt = this.buildPrompt(intent, query, groundedPolicies, functionResults);

      // 5. Call LLM with timeout
      const llmPromise = this.callLLM(prompt);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Response timeout')), this.responseTimeLimit)
      );

      const responseText = await Promise.race([llmPromise, timeoutPromise]);

      // 6. Validate citations
      const citationValidation = validateCitations(responseText, this.config.knowledgeBase);
      citations = citationValidation.validCitations;

      // 7. Check response time
      const responseTime = Date.now() - startTime;
      if (responseTime > this.responseTimeLimit) {
        console.warn(`[AssistantEngine] Response time exceeded: ${responseTime}ms`);
      }

      return {
        text: responseText,
        intent,
        citations,
        functionsCalled,
        responseTime,
        success: true
      };

    } catch (error) {
      console.error("[AssistantEngine] Error:", error.message);
      return {
        text: "I apologize, but I'm having trouble processing your request right now.",
        intent: "off_topic",
        citations: [],
        functionsCalled,
        responseTime: Date.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }
}

// Singleton export for server.js
const assistant = new AssistantEngine();
export async function handleAssistantQuery(query) {
  return await assistant.handleAssistantQuery(query);
}
