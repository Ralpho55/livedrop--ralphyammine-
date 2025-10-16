import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

router.get("/daily-revenue", async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: "from and to query parameters are required (YYYY-MM-DD format)" });
    }
    
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }
    
    if (fromDate > toDate) {
      return res.status(400).json({ error: "from date must be before to date" });
    }
    
    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: fromDate,
            $lte: new Date(toDate.getTime() + 24 * 60 * 60 * 1000 - 1) 
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: { $round: ["$revenue", 2] },
          orderCount: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ];
    
    const results = await Order.aggregate(pipeline);
    const orderedResults = results.map(r => ({
      date: r.date,
      revenue: r.revenue,
      orderCount: r.orderCount
    }));
    
    res.json(orderedResults);
  } catch (error) {
    console.error("Error fetching daily revenue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard-metrics", async (req, res) => {
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
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
