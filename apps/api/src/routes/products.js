import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Products endpoint ready" });
});

export default router;
