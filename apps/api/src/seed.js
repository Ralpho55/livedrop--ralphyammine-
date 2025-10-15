import mongoose from "mongoose";
import dotenv from "dotenv";

import Customer from "./models/Customer.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

dotenv.config();

async function connect() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set in environment");
  }
  await mongoose.connect(mongoUri);
}

function buildCustomers() {
  return [
    { name: "Test User", email: "test.user@example.com", phone: "+1-555-0000", address: "123 Test Lane, Testville, TX", createdAt: new Date() },
    { name: "Alice Johnson", email: "alice.j@example.com", phone: "+1-555-1001", address: "45 Maple St, Denver, CO", createdAt: new Date() },
    { name: "Bob Smith", email: "bob.smith@example.com", phone: "+1-555-1002", address: "89 Oak Ave, Portland, OR", createdAt: new Date() },
    { name: "Carol Lee", email: "carol.lee@example.com", phone: "+1-555-1003", address: "12 Pine Rd, Seattle, WA", createdAt: new Date() },
    { name: "David Nguyen", email: "david.n@example.com", phone: "+1-555-1004", address: "901 Market St, San Francisco, CA", createdAt: new Date() },
    { name: "Emma Davis", email: "emma.d@example.com", phone: "+1-555-1005", address: "77 Broadway, New York, NY", createdAt: new Date() },
    { name: "Frank Miller", email: "frank.m@example.com", phone: "+1-555-1006", address: "5 Lake Shore Dr, Chicago, IL", createdAt: new Date() },
    { name: "Grace Kim", email: "grace.k@example.com", phone: "+1-555-1007", address: "300 Sunset Blvd, Los Angeles, CA", createdAt: new Date() },
    { name: "Henry Wilson", email: "henry.w@example.com", phone: "+1-555-1008", address: "210 River Rd, Austin, TX", createdAt: new Date() },
    { name: "Ivy Chen", email: "ivy.chen@example.com", phone: "+1-555-1009", address: "88 King St, Boston, MA", createdAt: new Date() },
    { name: "Jack Thompson", email: "jack.t@example.com", phone: "+1-555-1010", address: "400 Elm St, Raleigh, NC", createdAt: new Date() },
    { name: "Karen Patel", email: "karen.p@example.com", phone: "+1-555-1011", address: "16 Cedar Ave, Phoenix, AZ", createdAt: new Date() }
  ];
}

function buildProducts() {
  return [
    { name: "Wireless Mouse", description: "Ergonomic 2.4G mouse", price: 19.99, category: "Electronics", tags: ["peripherals", "wireless"], imageUrl: "https://pics.example.com/mouse.jpg", stock: 120 },
    { name: "Mechanical Keyboard", description: "RGB backlit, blue switches", price: 89.99, category: "Electronics", tags: ["keyboard", "mechanical"], imageUrl: "https://pics.example.com/keyboard.jpg", stock: 60 },
    { name: "1080p Webcam", description: "Full HD with noise-cancel mic", price: 49.99, category: "Electronics", tags: ["webcam"], imageUrl: "https://pics.example.com/webcam.jpg", stock: 80 },
    { name: "USB-C Hub", description: "7-in-1 with HDMI", price: 34.99, category: "Accessories", tags: ["hub", "usb-c"], imageUrl: "https://pics.example.com/hub.jpg", stock: 150 },
    { name: "Noise-Cancel Headphones", description: "Over-ear, 30h battery", price: 129.99, category: "Audio", tags: ["headphones", "noise-cancel"], imageUrl: "https://pics.example.com/headphones.jpg", stock: 45 },
    { name: "Smartwatch", description: "Fitness tracking, GPS", price: 149.99, category: "Wearables", tags: ["watch", "fitness"], imageUrl: "https://pics.example.com/smartwatch.jpg", stock: 70 },
    { name: "Running Shoes", description: "Lightweight road runners", price: 69.99, category: "Apparel", tags: ["shoes", "running"], imageUrl: "https://pics.example.com/shoes.jpg", stock: 90 },
    { name: "Hoodie", description: "Fleece, unisex", price: 39.99, category: "Apparel", tags: ["hoodie"], imageUrl: "https://pics.example.com/hoodie.jpg", stock: 110 },
    { name: "Water Bottle", description: "Insulated stainless steel", price: 24.99, category: "Outdoors", tags: ["bottle", "insulated"], imageUrl: "https://pics.example.com/bottle.jpg", stock: 140 },
    { name: "Camping Tent", description: "2-person ultralight", price: 199.99, category: "Outdoors", tags: ["camping", "tent"], imageUrl: "https://pics.example.com/tent.jpg", stock: 20 },
    { name: "Gaming Chair", description: "Reclining lumbar support", price: 229.99, category: "Furniture", tags: ["chair", "gaming"], imageUrl: "https://pics.example.com/chair.jpg", stock: 25 },
    { name: "Desk Lamp", description: "LED with dimmer", price: 29.99, category: "Home", tags: ["lamp", "led"], imageUrl: "https://pics.example.com/lamp.jpg", stock: 130 },
    { name: "Cookware Set", description: "Non-stick 10 piece", price: 159.99, category: "Kitchen", tags: ["cookware"], imageUrl: "https://pics.example.com/cookware.jpg", stock: 35 },
    { name: "Chef Knife", description: "8-inch stainless steel", price: 54.99, category: "Kitchen", tags: ["knife"], imageUrl: "https://pics.example.com/knife.jpg", stock: 75 },
    { name: "Bluetooth Speaker", description: "Waterproof portable", price: 59.99, category: "Audio", tags: ["speaker", "bluetooth"], imageUrl: "https://pics.example.com/speaker.jpg", stock: 85 },
    { name: "Tablet 10\"", description: "64GB, Wi‑Fi", price: 249.99, category: "Electronics", tags: ["tablet"], imageUrl: "https://pics.example.com/tablet.jpg", stock: 30 },
    { name: "Laptop Stand", description: "Aluminum adjustable", price: 27.99, category: "Accessories", tags: ["stand", "laptop"], imageUrl: "https://pics.example.com/stand.jpg", stock: 100 },
    { name: "4K Monitor", description: "27-inch IPS", price: 399.99, category: "Electronics", tags: ["monitor", "4k"], imageUrl: "https://pics.example.com/monitor.jpg", stock: 18 },
    { name: "Electric Kettle", description: "1.7L fast boil", price: 34.99, category: "Kitchen", tags: ["kettle"], imageUrl: "https://pics.example.com/kettle.jpg", stock: 60 },
    { name: "Yoga Mat", description: "Non-slip 6mm", price: 22.99, category: "Fitness", tags: ["yoga", "mat"], imageUrl: "https://pics.example.com/yoga.jpg", stock: 95 },
    { name: "Dumbbell Set", description: "Adjustable 40lb", price: 89.99, category: "Fitness", tags: ["dumbbell"], imageUrl: "https://pics.example.com/dumbbell.jpg", stock: 40 },
    { name: "Electric Scooter", description: "20-mile range", price: 499.99, category: "Outdoors", tags: ["scooter"], imageUrl: "https://pics.example.com/scooter.jpg", stock: 10 },
    { name: "Phone Charger", description: "20W USB-C", price: 14.99, category: "Electronics", tags: ["charger"], imageUrl: "https://pics.example.com/charger.jpg", stock: 200 },
    { name: "Backpack", description: "30L travel pack", price: 59.99, category: "Travel", tags: ["backpack"], imageUrl: "https://pics.example.com/backpack.jpg", stock: 70 },
    { name: "Sunglasses", description: "Polarized UV400", price: 25.0, category: "Accessories", tags: ["sunglasses"], imageUrl: "https://pics.example.com/sunglasses.jpg", stock: 90 }
  ];
}

function pickRandom(array, count) {
  const copy = [...array];
  const result = [];
  while (result.length < count && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  await connect();

  await Order.deleteMany({});
  await Product.deleteMany({});
  await Customer.deleteMany({});

  const customers = await Customer.insertMany(buildCustomers());
  const products = await Product.insertMany(buildProducts());

  const testUser = customers.find(c => c.email === "test.user@example.com");

  const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

  const orders = [];

  // ensure test user has 2-3 orders
  const testUserOrderCount = randomInt(2, 3);
  for (let i = 0; i < testUserOrderCount; i++) {
    const numItems = randomInt(1, 4);
    const chosenProducts = pickRandom(products, numItems);
    const items = chosenProducts.map(p => ({
      productId: p._id,
      name: p.name,
      price: p.price,
      quantity: randomInt(1, 3)
    }));
    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const createdAt = new Date(Date.now() - randomInt(0, 14) * 24 * 60 * 60 * 1000);
    orders.push({
      customerId: testUser._id,
      items,
      total: Number(total.toFixed(2)),
      status: statuses[randomInt(0, statuses.length - 1)],
      carrier: ["UPS", "FedEx", "USPS", "DHL"][randomInt(0, 3)],
      estimatedDelivery: new Date(createdAt.getTime() + randomInt(2, 7) * 24 * 60 * 60 * 1000),
      createdAt,
      updatedAt: createdAt
    });
  }

  // remaining orders from various customers
  const remainingOrders = randomInt(12, 17); // to make total ~15–20
  for (let i = 0; i < remainingOrders; i++) {
    const customer = customers[randomInt(0, customers.length - 1)];
    const numItems = randomInt(1, 5);
    const chosenProducts = pickRandom(products, numItems);
    const items = chosenProducts.map(p => ({
      productId: p._id,
      name: p.name,
      price: p.price,
      quantity: randomInt(1, 3)
    }));
    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const createdAt = new Date(Date.now() - randomInt(0, 21) * 24 * 60 * 60 * 1000);
    orders.push({
      customerId: customer._id,
      items,
      total: Number(total.toFixed(2)),
      status: statuses[randomInt(0, statuses.length - 1)],
      carrier: ["UPS", "FedEx", "USPS", "DHL"][randomInt(0, 3)],
      estimatedDelivery: new Date(createdAt.getTime() + randomInt(2, 10) * 24 * 60 * 60 * 1000),
      createdAt,
      updatedAt: createdAt
    });
  }

  await Order.insertMany(orders);
}

async function main() {
  try {
    await seed();
    console.log("Database seeded successfully");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

main();


