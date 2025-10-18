import express from "express";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import { orderStatusStream } from "../sse/order-status.js";

const router = express.Router();

// POST / - create new order
router.post("/", async (req, res) => {
  try {
    const { customerId, items } = req.body;
    
    // Basic validation
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Customer ID and items array are required" });
    }
    
    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    // Validate items and calculate total
    let total = 0;
    const validatedItems = [];
    
    for (const item of items) {
      if (!item.productId || !item.name || !item.price || !item.quantity) {
        return res.status(400).json({ error: "Each item must have productId, name, price, and quantity" });
      }
      
      // Verify product exists
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
      }
      
      if (typeof item.price !== 'number' || item.price < 0) {
        return res.status(400).json({ error: "Item price must be a positive number" });
      }
      
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        return res.status(400).json({ error: "Item quantity must be at least 1" });
      }
      
      total += item.price * item.quantity;
      validatedItems.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      });
    }
    
    const order = new Order({
      customerId,
      items: validatedItems,
      total: Number(total.toFixed(2)),
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /:id - get specific order by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error finding order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET / - get orders with optional customerId filter
router.get("/", async (req, res) => {
  try {
    const { customerId } = req.query;
    
    let query = {};
    if (customerId) {
      query.customerId = customerId;
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/stream", orderStatusStream);

export default router;
