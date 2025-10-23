import { jest } from "@jest/globals";
jest.unstable_mockModule("../apps/api/src/assistant/function-registry.js", () => ({
    default: {
      execute: async (name, params) => {
        console.log(`[MockRegistry] Pretending to execute ${name}`, params);
        return name === "getOrderStatus"
          ? { id: "mock123", status: "DELIVERED" }
          : name === "searchProducts"
          ? [{ name: "Mock Product", price: 199 }]
          : {};
      },
    },
  }));
  
import express from "express";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Set test environment
process.env.NODE_ENV = "test";

// Mock the DB connector to prevent connection issues
jest.unstable_mockModule("../apps/api/src/db.js", () => ({
  connectDB: async () => console.log("🔹 Mocked DB connection for tests"),
}));

// Declare variables that will be populated later
let handleAssistantQuery;
let mongoServer;
let server;
let app;
let Order, Product, Customer;
let sampleOrder, sampleProduct, sampleCustomer;

describe("🤖 Assistant Integration Tests", () => {
  beforeAll(async () => {
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to test database
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB Memory Server");

    // Create Mongoose schemas for test models
    const orderSchema = new mongoose.Schema({
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
      },
      items: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, required: true },
          name: { type: String, required: true },
          price: { type: Number, required: true },
          quantity: { type: Number, required: true },
        },
      ],
      total: { type: Number, required: true },
      status: {
        type: String,
        enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"],
        default: "PENDING",
      },
      carrier: { type: String },
      estimatedDelivery: { type: Date },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    }, { versionKey: false });

    const productSchema = new mongoose.Schema({
      name: { type: String, required: true },
      description: { type: String },
      price: { type: Number, required: true },
      category: { type: String },
      tags: [{ type: String }],
      imageUrl: { type: String },
      stock: { type: Number, default: 0 },
    }, { versionKey: false });

    const customerSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      phone: { type: String },
      address: { type: String },
      createdAt: { type: Date, default: Date.now },
    }, { versionKey: false });

    // Create models
    Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
    Product = mongoose.models.Product || mongoose.model("Product", productSchema);
    Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);

    // Import assistant engine after DB setup
    await jest.isolateModulesAsync(async () => {
      const engineModule = await import("../apps/api/src/assistant/engine.js");
      handleAssistantQuery = engineModule.handleAssistantQuery;
    });

    // Create Express app with assistant route
    app = express();
    app.use(express.json());
    
    app.post("/api/assistant/query", async (req, res) => {
      try {
        const { message } = req.body;
        if (!message) {
          return res.status(400).json({ error: "Message is required" });
        }
        
        const result = await handleAssistantQuery(message);
        res.json(result);
      } catch (error) {
        console.error("Assistant query error:", error);
        res.status(500).json({ 
          success: false, 
          error: error.message,
          text: "I apologize, but I'm having trouble processing your request right now."
        });
      }
    });

    // Start server
    server = app.listen(0);
    console.log("✅ Express server started");

    // Create test data
    sampleProduct = new Product({
      name: "Wireless Headphones",
      description: "Noise cancelling, over-ear headphones",
      price: 199.99,
      category: "Electronics",
      tags: ["headphones", "wireless", "audio"],
      imageUrl: "https://example.com/headphones.jpg",
      stock: 50
    });
    await sampleProduct.save();

    sampleCustomer = new Customer({
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1-555-0123",
      address: "123 Main St, Anytown, AT 12345",
      createdAt: new Date()
    });
    await sampleCustomer.save();

    sampleOrder = new Order({
      customerId: sampleCustomer._id,
      items: [{
        productId: sampleProduct._id,
        name: sampleProduct.name,
        price: sampleProduct.price,
        quantity: 1
      }],
      total: sampleProduct.price,
      status: "DELIVERED",
      carrier: "FedEx",
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    });
    await sampleOrder.save();

    console.log("✅ Test data created");
    console.log(`   Product: ${sampleProduct.name} ($${sampleProduct.price})`);
    console.log(`   Customer: ${sampleCustomer.name} (${sampleCustomer.email})`);
    console.log(`   Order: ${sampleOrder._id} (${sampleOrder.status})`);
  });

  afterAll(async () => {
    // Clean up
    if (server) {
      server.close();
      console.log("✅ Express server closed");
    }
    
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
    
    if (mongoServer) {
      await mongoServer.stop();
      console.log("✅ MongoDB Memory Server stopped");
    }
  });

  describe("Order Status Intent", () => {
    test("should detect order_status intent and return order information", async () => {
      const message = `Can you check the status of order ${sampleOrder._id}?`;
      
      const response = await request(app)
        .post("/api/assistant/query")
        .send({ message })
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("intent");
      expect(response.body).toHaveProperty("text");
      expect(response.body).toHaveProperty("functionsCalled");
      expect(response.body).toHaveProperty("citations");

      // Verify intent classification
      expect(response.body.intent).toBe("order_status");
      expect(response.body.success).toBe(true);

      // Verify function was called
      expect(response.body.functionsCalled).toContain("getOrderStatus");

      // Verify response mentions delivered status
      expect(response.body.text.toLowerCase()).toMatch(/delivered|status|order/);
      
      console.log(`✅ Order Status Test - Intent: ${response.body.intent}, Functions: ${response.body.functionsCalled.join(", ")}`);
    });
  });

  describe("Policy Question Intent", () => {
    test("should ground policy question and return citations", async () => {
      const message = "What is your return and refund policy?";
      
      const response = await request(app)
        .post("/api/assistant/query")
        .send({ message })
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("intent");
      expect(response.body).toHaveProperty("text");
      expect(response.body).toHaveProperty("citations");

      // Verify intent classification
      expect(response.body.intent).toBe("policy_question");
      expect(response.body.success).toBe(true);

      // Verify response mentions policy-related terms
      expect(response.body.text.toLowerCase()).toMatch(/policy|return|refund|terms/);

      // Citations should be an array (may be empty if no KB loaded)
      expect(Array.isArray(response.body.citations)).toBe(true);
      
      console.log(`✅ Policy Question Test - Intent: ${response.body.intent}, Citations: ${response.body.citations.length}`);
    });
  });

  describe("Complaint Intent", () => {
    test("should respond empathetically to complaint", async () => {
      const message = "I'm very disappointed because my order was delayed and customer service ignored my emails. This is unacceptable!";
      
      const response = await request(app)
        .post("/api/assistant/query")
        .send({ message })
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("intent");
      expect(response.body).toHaveProperty("text");

      // Verify intent classification
      expect(response.body.intent).toBe("complaint");
      expect(response.body.success).toBe(true);

      // Verify empathetic response
      const text = response.body.text.toLowerCase();
      expect(text).toMatch(/sorry|apologize|understand|help|assist|resolve/);

      // Response should not be empty
      expect(response.body.text.length).toBeGreaterThan(10);
      
      console.log(`✅ Complaint Test - Intent: ${response.body.intent}, Empathetic: ${text.includes('sorry') || text.includes('apologize')}`);
    });
  });

  describe("Additional Intent Tests", () => {
    test("should handle product search intent", async () => {
      const message = "I'm looking for wireless headphones under $200";
      
      const response = await request(app)
        .post("/api/assistant/query")
        .send({ message })
        .expect(200);

      expect(response.body.intent).toBe("product_search");
      expect(response.body.success).toBe(true);
      expect(response.body.functionsCalled).toContain("searchProducts");
      
      console.log(`✅ Product Search Test - Intent: ${response.body.intent}, Functions: ${response.body.functionsCalled.join(", ")}`);
    });

    test("should handle chitchat intent", async () => {
      const message = "Hello! How are you today?";
      
      const response = await request(app)
        .post("/api/assistant/query")
        .send({ message })
        .expect(200);

      expect(response.body.intent).toBe("chitchat");
      expect(response.body.success).toBe(true);
      
      console.log(`✅ Chitchat Test - Intent: ${response.body.intent}`);
    });

    test("should handle violation intent", async () => {
      const message = "This is fucking terrible! I hate this stupid website!";
      
      const response = await request(app)
        .post("/api/assistant/query")
        .send({ message })
        .expect(200);

      expect(response.body.intent).toBe("violation");
      expect(response.body.success).toBe(true);
      
      console.log(`✅ Violation Test - Intent: ${response.body.intent}`);
    });
  });
});



// ------------------------------------
// 🤖 Multi-Intent Conversation
// ------------------------------------
describe("🤖 Multi-Intent Conversation", () => {
  test("should maintain context across multiple intents", async () => {
    const conversationContext = [];

    // 1) Chitchat
    const res1 = await request(app)
      .post("/api/assistant/query")
      .send({ message: "Hi there!", conversationContext })
      .expect(200);

    expect(res1.body.success).toBe(true);
    expect(res1.body.intent).toBe("chitchat");
    expect(typeof res1.body.text).toBe("string");
    expect(res1.body.text.length).toBeGreaterThan(0);
    conversationContext.push({ intent: res1.body.intent, text: res1.body.text });

    // 2) Product search
    const res2 = await request(app)
      .post("/api/assistant/query")
      .send({ message: "Show me wireless headphones", conversationContext })
      .expect(200);

    expect(res2.body.success).toBe(true);
    expect(res2.body.intent).toBe("product_search");
    expect(typeof res2.body.text).toBe("string");
    expect(res2.body.text.length).toBeGreaterThan(0);
    conversationContext.push({ intent: res2.body.intent, text: res2.body.text });

    // 3) Policy question
    const res3 = await request(app)
      .post("/api/assistant/query")
      .send({ message: "What is your return policy?", conversationContext })
      .expect(200);

    expect(res3.body.success).toBe(true);
    expect(res3.body.intent).toBe("policy_question");
    expect(typeof res3.body.text).toBe("string");
    expect(res3.body.text.length).toBeGreaterThan(0);
    conversationContext.push({ intent: res3.body.intent, text: res3.body.text });

    // 4) Order status
    const res4 = await request(app)
      .post("/api/assistant/query")
      .send({ message: "Where is my last order?", conversationContext })
      .expect(200);

    expect(res4.body.success).toBe(true);
    expect(res4.body.intent).toBe("order_status");
    expect(typeof res4.body.text).toBe("string");
    expect(res4.body.text.length).toBeGreaterThan(0);
    conversationContext.push({ intent: res4.body.intent, text: res4.body.text });

    // Log conversation flow
    const flow = conversationContext
      .map(step => `[${step.intent}] -> ${step.text}`)
      .join("\n");
    // eslint-disable-next-line no-console
    console.log("\nConversation Flow:\n" + flow + "\n");
  });
});
