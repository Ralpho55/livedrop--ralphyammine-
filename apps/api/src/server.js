import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_, res) => res.json({ status: "ok" }));

// Import routes (empty for now)
import customers from "./routes/customers.js";
import products from "./routes/products.js";
import orders from "./routes/orders.js";
import analytics from "./routes/analytics.js";
import dashboard from "./routes/dashboard.js";
import { handleAssistantQuery } from "./assistant/engine.js";

app.post("/api/assistant", async (req, res) => {
  try {
    const result = await handleAssistantQuery(req.body.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use("/api/customers", customers);
app.use("/api/products", products);
app.use("/api/orders", orders);
app.use("/api/analytics", analytics);
app.use("/api/dashboard", dashboard);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
