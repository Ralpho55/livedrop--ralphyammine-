import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    imageUrl: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 }
  },
  { versionKey: false }
);

export default mongoose.model("Product", ProductSchema);


