import mongoose from "mongoose";
import { connectDB } from "./db.js";
import functionRegistry from "./assistant/function-registry.js";
import Order from "./models/Order.js";
import Customer from "./models/Customer.js";

async function run() {
  try {
    await connectDB();
    console.log("[testRegistry] Connected to MongoDB");

    // 1) getOrderStatus: pick an existing orderId
    const anyOrder = await Order.findOne({});
    if (!anyOrder) {
      console.warn("[testRegistry] No orders found in DB. Seed data first.");
    } else {
      const orderId = anyOrder._id.toString();
      const orderRes = await functionRegistry.execute("getOrderStatus", { orderId });
      console.log("[testRegistry] getOrderStatus response:\n", JSON.stringify(orderRes, null, 2));
    }

    // 2) searchProducts: query "Laptop"
    const productsRes = await functionRegistry.execute("searchProducts", {
      query: "Laptop",
      limit: 5
    });
    console.log("[testRegistry] searchProducts response:\n", JSON.stringify(productsRes, null, 2));

    // 3) getCustomerOrders: pick a known customer by email (first in DB)
    const anyCustomer = await Customer.findOne({});
    if (!anyCustomer) {
      console.warn("[testRegistry] No customers found in DB. Seed data first.");
    } else {
      const email = anyCustomer.email;
      const custOrdersRes = await functionRegistry.execute("getCustomerOrders", { email });
      console.log("[testRegistry] getCustomerOrders response:\n", JSON.stringify(custOrdersRes, null, 2));
    }
  } catch (err) {
    console.error("[testRegistry] Error:", err);
  } finally {
    try { await mongoose.disconnect(); } catch {}
    process.exit(0);
  }
}

run();


