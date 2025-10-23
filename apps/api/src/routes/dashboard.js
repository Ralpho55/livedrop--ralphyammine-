import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

router.get("/business-metrics", async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$total" }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          totalOrders: 1,
          averageOrderValue: { $round: ["$averageOrderValue", 2] }
        }
      }
    ];
    
    const results = await Order.aggregate(pipeline);
    const metrics = results[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 };
    
    res.json(metrics);
  } catch (error) {
    console.error("Error fetching business metrics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/performance", async (req, res) => {
  try {
    const metrics = {
      latencyMs: Math.floor(Math.random() * 50) + 10, 
      sseConnections: Math.floor(Math.random() * 25) + 5,
      failedRequests: Math.floor(Math.random() * 10)
    };
    
    res.json(metrics);
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/assistant-stats", async (req, res) => {
  try {
    const stats = {
      totalQueries: Math.floor(Math.random() * 1000) + 500, // 500-1500 queries
      topIntents: [
        { intent: "product_search", count: Math.floor(Math.random() * 200) + 100 },
        { intent: "order_status", count: Math.floor(Math.random() * 150) + 50 },
        { intent: "shipping_info", count: Math.floor(Math.random() * 100) + 25 },
        { intent: "return_policy", count: Math.floor(Math.random() * 80) + 20 },
        { intent: "payment_help", count: Math.floor(Math.random() * 60) + 15 }
      ],
      avgResponseTimeMs: Math.floor(Math.random() * 200) + 100 // 100-300ms
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching assistant stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
