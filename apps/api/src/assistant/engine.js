import fs from 'fs';
import axios from 'axios';
import path from 'path';
import yaml from 'js-yaml';
import { classifyIntent } from './intent-classifier.js';
import FunctionRegistry from './function-registry.js';

class AssistantEngine {
  constructor() {
    this.functionRegistry = new FunctionRegistry();
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      // Load YAML config
      const yamlPath = path.join(process.cwd(), 'docs', 'prompting', 'assistant-prompts.yml');
      const yamlContent = fs.readFileSync(yamlPath, 'utf8');
      const yamlConfig = yaml.load(yamlContent);

      // Load JSON config
      const jsonPath = path.join(process.cwd(), 'docs', 'prompting', 'ground-truth.json');
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      const jsonConfig = JSON.parse(jsonContent);

      return {
        prompts: yamlConfig,
        groundTruth: jsonConfig
      };
    } catch (error) {
      console.error('Error loading config:', error);
      return {
        prompts: {},
        groundTruth: {}
      };
    }
  }

  async handleAssistantQuery(query) {
    try {
      // Classify the intent
      const intent = classifyIntent(query);
      
      // Get function schemas for this intent
      const availableFunctions = this.getFunctionsForIntent(intent);
      
      // Build context and prompt
      const context = await this.buildContext(query, intent, availableFunctions);
      const prompt = this.buildPrompt(query, intent, context);
      
      // Call LLM API
      const response = await this.callLLM(prompt, availableFunctions);
      
      return {
        success: true,
        intent,
        response: response.message || response,
        functions: availableFunctions.length > 0 ? availableFunctions : undefined
      };
    } catch (error) {
      console.error('Error handling assistant query:', error);
      return {
        success: false,
        error: 'Failed to process query',
        intent: 'off_topic'
      };
    }
  }

  getFunctionsForIntent(intent) {
    const functionSchemas = this.functionRegistry.getAllSchemas();
    const intentFunctionMap = {
      'order_status': ['getOrderStatus', 'getCustomerOrders'],
      'product_search': ['searchProducts'],
      'policy_question': ['searchProducts'], // Could search for policy-related products
      'complaint': ['getCustomerOrders', 'getOrderStatus'],
      'chitchat': [],
      'off_topic': [],
      'violation': []
    };

    const functionNames = intentFunctionMap[intent] || [];
    return functionNames.map(name => ({
      name,
      schema: functionSchemas[name]
    })).filter(fn => fn.schema);
  }

  async buildContext(query, intent, availableFunctions) {
    let context = {
      intent,
      query,
      timestamp: new Date().toISOString()
    };

    // Execute relevant functions based on intent
    if (intent === 'order_status') {
      // Try to extract order ID or email from query
      const orderIdMatch = query.match(/order[:\s#]*([a-f0-9]{24})/i);
      const emailMatch = query.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      
      if (orderIdMatch) {
        try {
          const result = await this.functionRegistry.execute('getOrderStatus', {
            orderId: orderIdMatch[1]
          });
          context.orderData = result;
        } catch (error) {
          console.error('Error fetching order status:', error);
        }
      } else if (emailMatch) {
        try {
          const result = await this.functionRegistry.execute('getCustomerOrders', {
            email: emailMatch[1]
          });
          context.customerOrders = result;
        } catch (error) {
          console.error('Error fetching customer orders:', error);
        }
      }
    } else if (intent === 'product_search') {
      // Extract search terms
      const searchTerms = query.replace(/find|search|looking for|need|want/gi, '').trim();
      if (searchTerms) {
        try {
          const result = await this.functionRegistry.execute('searchProducts', {
            query: searchTerms,
            limit: 5
          });
          context.productResults = result;
        } catch (error) {
          console.error('Error searching products:', error);
        }
      }
    }

    return context;
  }

  buildPrompt(query, intent, context) {
    const basePrompt = this.config.prompts?.base || "You are a helpful e-commerce assistant.";
    const intentPrompts = this.config.prompts?.intents || {};
    const intentPrompt = intentPrompts[intent] || `Handle this ${intent} query.`;
    
    let prompt = `${basePrompt}\n\n${intentPrompt}\n\nUser Query: ${query}\n\n`;
    
    // Add context data
    if (context.orderData) {
      prompt += `Order Information:\n${JSON.stringify(context.orderData, null, 2)}\n\n`;
    }
    
    if (context.customerOrders) {
      prompt += `Customer Orders:\n${JSON.stringify(context.customerOrders, null, 2)}\n\n`;
    }
    
    if (context.productResults) {
      prompt += `Product Search Results:\n${JSON.stringify(context.productResults, null, 2)}\n\n`;
    }

    // Add ground truth examples if available
    if (this.config.groundTruth && this.config.groundTruth[intent]) {
      prompt += `Examples:\n${JSON.stringify(this.config.groundTruth[intent], null, 2)}\n\n`;
    }

    prompt += "Please provide a helpful, accurate response based on the available information.";
    
    return prompt;
  }

  async callLLM(prompt, availableFunctions) {
    const llmUrl = process.env.LLM_GENERATE_URL;
    
    if (!llmUrl) {
      console.warn("[AssistantEngine] No LLM_GENERATE_URL set, returning mock response.");
      return `[Mock LLM] ${prompt}`;
    }

    try {
      const response = await axios.post(llmUrl, {
        prompt,
        max_tokens: 250
      });
      
      return response.data;
    } catch (error) {
      console.error('Error calling LLM API:', error);
      return `[LLM Error]: ${error.message}`;
    }
  }
}

const assistant = new AssistantEngine();

export async function handleAssistantQuery(query) {
  return await assistant.handleAssistantQuery(query);
}

export default assistant;

