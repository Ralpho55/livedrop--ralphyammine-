// /apps/api/src/sse/order-status.js
import Order from "../models/Order.js";

// Assignment-mandated order flow
const STATUS_FLOW = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

// Helper: random delay generator
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function orderStatusStream(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });

    res.write(`data: ${JSON.stringify({
      status: order.status,
      updatedAt: order.updatedAt,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // If already delivered, stop now
    if (order.status === "DELIVERED") return res.end();

    let currentIndex = STATUS_FLOW.indexOf(order.status);
    if (currentIndex === -1) currentIndex = 0;

    const advanceStatus = async () => {
      currentIndex++;
      if (currentIndex >= STATUS_FLOW.length) {
        res.write("event: close\ndata: Stream closed\n\n");
        return res.end();
      }

      const newStatus = STATUS_FLOW[currentIndex];
      const now = new Date();

      order.status = newStatus;
      order.updatedAt = now;
      await order.save();

      res.write(`event: status-update\ndata: ${JSON.stringify({
        status: newStatus,
        updatedAt: now,
        timestamp: now.toISOString()
      })}\n\n`);

      // Close stream after DELIVERED
      if (newStatus === "DELIVERED") {
        setTimeout(() => res.end(), 2000);
      } else {
        const nextDelay =
          newStatus === "PROCESSING"
            ? randomDelay(5000, 7000)
            : randomDelay(3000, 5000);
        setTimeout(advanceStatus, nextDelay);
      }
    };

    setTimeout(advanceStatus, randomDelay(3000, 5000));

    req.on("close", () => res.end());
  } catch (err) {
    console.error("Error in orderStatusStream:", err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
}
