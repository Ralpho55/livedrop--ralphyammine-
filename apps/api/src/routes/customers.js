import express from "express";
import Customer from "../models/Customer.js";

const router = express.Router();

// GET / - find customer by email query param
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: "Email query parameter is required" });
    }

    const customer = await Customer.findOne({ email });
    
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    console.error("Error finding customer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /:id - find customer by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    console.error("Error finding customer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
