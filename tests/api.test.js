import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";

let app;
let server;
let mongoServer;

// ✅ Apply mocks before loading the server
jest.unstable_mockModule("../apps/api/src/db.js", () => ({
  connectDB: async () => console.log("🔹 Mocked DB connection for tests"),
}));

jest.unstable_mockModule("../apps/api/src/models/Product.js", () => ({
  default: {
    find: jest.fn().mockResolvedValue([
      { _id: "mock1", name: "Test Product", price: 99.99, category: "Test" },
    ]),
  },
}));

jest.unstable_mockModule("../apps/api/src/models/Order.js", () => ({
  default: {
    create: jest.fn().mockResolvedValue({
      _id: "mockOrder",
      customerId: "cust1",
      items: [{ name: "Test Product", price: 99.99, quantity: 2 }],
      total: 199.98,
      status: "PENDING",
    }),
  },
}));

jest.unstable_mockModule("../apps/api/src/models/Customer.js", () => ({
  default: {
    findOne: jest.fn().mockResolvedValue({
      _id: "cust1",
      name: "Test Customer",
      email: "test@example.com",
    }),
  },
}));

describe("🚀 API Endpoint Tests", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB Memory Server");

    // ✅ Import app after mocks
    await jest.isolateModulesAsync(async () => {
      const serverModule = await import("../apps/api/src/server.js");
      app = serverModule.default;
    });

    server = app.listen(0);
    console.log("✅ Express server started");
  });

  afterAll(async () => {
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

  // === Tests ===
  describe("GET /api/products", () => {
    test("should return 200 and an array of products", async () => {
      const response = await request(app).get("/api/products").expect(200);
      expect(response.headers["content-type"]).toMatch(/application\/json/);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      console.log(`✅ GET /api/products - Found ${response.body.length} products`);
    });
  });

  describe("POST /api/orders", () => {
    test("should create order with valid payload and return 201", async () => {
      const response = await request(app)
        .post("/api/orders")
        .send({
          customerId: "cust1",
          items: [
            { productId: "mock1", name: "Test Product", price: 99.99, quantity: 2 },
          ],
        })
        .expect(201);

      expect(response.headers["content-type"]).toMatch(/application\/json/);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.status).toBe("PENDING");
      console.log(`✅ POST /api/orders - Created order ${response.body._id}`);
    });

    test("should return 400 with invalid payload", async () => {
      const response = await request(app)
        .post("/api/orders")
        .send({ customerId: "", items: [] })
        .expect(400);
      expect(response.headers["content-type"]).toMatch(/application\/json/);
      expect(response.body).toHaveProperty("error");
      console.log(`✅ POST /api/orders - Invalid payload rejected`);
    });
  });

  describe("GET /api/analytics/metrics", () => {
    test("should return 200 and analytics object", async () => {
      const response = await request(app)
        .get("/api/analytics/metrics")
        .expect(200);

      expect(response.headers["content-type"]).toMatch(/application\/json/);
      expect(typeof response.body).toBe("object");
      expect(response.body).toHaveProperty("totalRevenue");
      expect(response.body).toHaveProperty("totalOrders");
      expect(response.body).toHaveProperty("averageOrderValue");
      console.log(
        `✅ GET /api/analytics/metrics - Revenue: ${response.body.totalRevenue}`
      );
    });
  });

  describe("Invalid Endpoints", () => {
    test("should return 404 for unknown endpoint", async () => {
      const response = await request(app).get("/api/unknown").expect(404);
      expect(response.headers["content-type"]).toMatch(/application\/json/);
      expect(response.body).toHaveProperty("error");
      console.log(`✅ GET /api/unknown - 404 error handled properly`);
    });
  });

  describe("Content-Type Headers", () => {
    test("all responses should have application/json content-type", async () => {
      const endpoints = [
        { method: "get", path: "/api/products" },
        {
          method: "post",
          path: "/api/orders",
          data: { customerId: "", items: [] },
        },
        { method: "get", path: "/api/analytics/metrics" },
        { method: "get", path: "/api/unknown" },
      ];

      for (const endpoint of endpoints) {
        const req = request(app)[endpoint.method](endpoint.path);
        if (endpoint.data) req.send(endpoint.data);
        const response = await req;
        expect(response.headers["content-type"]).toMatch(/application\/json/);
      }
      console.log("✅ All endpoints return application/json content-type");
    });
  });
});
