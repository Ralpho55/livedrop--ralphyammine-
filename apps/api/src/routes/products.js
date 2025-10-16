import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// GET / - get products with query params
router.get("/", async (req, res) => {
  try {
    const { search, tag, sort, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    // Build sort object
    let sortObj = {};
    if (sort) {
      if (sort === 'price-asc') sortObj = { price: 1 };
      else if (sort === 'price-desc') sortObj = { price: -1 };
      else if (sort === 'name') sortObj = { name: 1 };
      else if (sort === 'newest') sortObj = { _id: -1 };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /:id - get single product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error finding product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST / - create new product
router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, tags, imageUrl, stock } = req.body;
    
    // Basic validation
    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }
    
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }
    
    const product = new Product({
      name,
      description,
      price,
      category,
      tags: tags || [],
      imageUrl,
      stock: stock || 0
    });
    
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
