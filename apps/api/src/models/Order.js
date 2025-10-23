import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Customer" },
    items: { type: [OrderItemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"], default: "PENDING" },
    carrier: { type: String, trim: true },
    estimatedDelivery: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export default mongoose.model("Order", OrderSchema);


