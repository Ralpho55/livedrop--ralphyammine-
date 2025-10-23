import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Give enough time but still short
jest.setTimeout(20000);

// ---------------------
// Mock Schema + Model
// ---------------------
const OrderSchema = new mongoose.Schema({
  customerId: String,
  items: [
    { productId: String, name: String, price: Number, quantity: Number },
  ],
  total: Number,
  status: String,
  createdAt: Date,
  updatedAt: Date,
});
const Order = mongoose.model("Order", OrderSchema);

// ---------------------
// Express Mock API
// ---------------------
const app = express();
app.use(express.json());
const STATUS_FLOW = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

// Create order
app.post("/api/orders", async (req, res) => {
  const { customerId, items } = req.body;
  if (!customerId || !items?.length)
    return res.status(400).json({ error: "Missing data" });

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const order = await Order.create({
    customerId,
    items,
    total,
    status: "PENDING",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  res.status(201).json(order);
});

// Get order
app.get("/api/orders/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

// SSE mock (instant close in tests)
app.get("/api/orders/:id/stream", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  if (process.env.NODE_ENV === "test") {
    // Emit all statuses instantly, then end
    for (const status of STATUS_FLOW) {
      order.status = status;
      await order.save();
      res.write(`data: ${JSON.stringify({ status })}\n\n`);
    }
    res.end();
    return;
  }

  // Realistic async mode (never used during Jest)
  let idx = 0;
  const interval = setInterval(async () => {
    if (idx >= STATUS_FLOW.length) {
      clearInterval(interval);
      res.end();
    } else {
      const status = STATUS_FLOW[idx++];
      order.status = status;
      await order.save();
      res.write(`data: ${JSON.stringify({ status })}\n\n`);
    }
  }, 300);
});

// ---------------------
// Test Suite
// ---------------------
describe("🧩 Purchase Flow Integration Test (Final)", () => {
  let mongoServer, server;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    server = app.listen(0);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
    if (server) server.close();
    jest.clearAllTimers();
  });

  test("should create order, fetch it, and stream until DELIVERED", async () => {
    // 1️⃣ Create
    const payload = {
      customerId: "cust-123",
      items: [
        { productId: "prod-1", name: "Laptop", price: 1000, quantity: 1 },
        { productId: "prod-2", name: "Mouse", price: 50, quantity: 2 },
      ],
    };
    const createRes = await request(app).post("/api/orders").send(payload);
    expect(createRes.status).toBe(201);
    const id = createRes.body._id;

    // 2️⃣ Get
    const getRes = await request(app).get(`/api/orders/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.total).toBe(1100);

    // 3️⃣ Stream (instant in test mode)
    const res = await request(app)
      .get(`/api/orders/${id}/stream`)
      .set("Accept", "text/event-stream");

    const chunks = res.text
      .split("\n\n")
      .filter((l) => l.startsWith("data:"))
      .map((l) => JSON.parse(l.replace("data: ", "")));

    const statuses = chunks.map((c) => c.status);
    expect(statuses).toEqual(
      expect.arrayContaining(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"])
    );

    const finalOrder = await Order.findById(id);
    expect(finalOrder.status).toBe("DELIVERED");
  });
});
