import { connectDB } from "./db.js";
import { handleAssistantQuery } from "./assistant/engine.js";

async function testAssistant() {
  try {
    console.log("[testAssistant] Starting assistant tests...");
    
    // Connect to database
    await connectDB();
    console.log("[testAssistant] Connected to MongoDB");

    // Test queries for all citation categories
    const testQueries = [
      "How do I return an item?", // policy_question - Policy citations
      "What is your shipping policy?", // policy_question - Shipping citations
      "How do you handle warranties?", // policy_question - Warranty citations
      "What is your privacy policy?", // policy_question - Privacy citations
      "How secure is my payment information?", // policy_question - Security citations
      "What are your payment methods?", // policy_question - Payment citations
      "How do I track my orders?", // policy_question - Orders citations
      "How can I contact support?", // policy_question - Support citations
      "Find me a laptop", // product_search
      "Hello there!", // chitchat
      "Where is my order 68f3f1ae7342c0c3da294bd9?" // order_status
    ];

    for (const query of testQueries) {
      console.log(`\n[testAssistant] Testing: "${query}"`);
      console.log("=" * 50);
      
      const startTime = Date.now();
      const result = await handleAssistantQuery(query);
      const responseTime = Date.now() - startTime;
      
      console.log(`Intent: ${result.intent}`);
      console.log(`Response: ${result.text}`);
      console.log(`Citations: ${result.citations.join(', ') || 'None'}`);
      console.log(`Functions Called: ${result.functionsCalled.join(', ') || 'None'}`);
      console.log(`Response Time: ${responseTime}ms`);
      console.log(`Success: ${result.success}`);
      
      if (result.error) {
        console.log(`Error: ${result.error}`);
      }
    }

  } catch (error) {
    console.error("[testAssistant] Error:", error);
  } finally {
    process.exit(0);
  }
}

testAssistant();
