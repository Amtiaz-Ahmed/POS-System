// routes/index.js
const express = require("express");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Counter = require("../models/counterModel");

const router = express.Router();

// POS screen (Products list)
router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("index", { products });
  } catch (err) {
    next(err);
  }
});

// Create order
router.post("/order", async (req, res, next) => {
  try {
    let { items } = req.body;
    if (!items) return res.status(400).send("Items data is missing");
    if (typeof items === "string") items = JSON.parse(items);
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).send("Items must be a non-empty array");

    const totalAmount = items.reduce((acc, i) => acc + i.price * i.qty, 0);
const todayKey = new Date().toISOString().slice(0, 10);

// Atomic daily counter
let counter = await Counter.findOne({ date: todayKey });
if (!counter) {
  // Start from max existing orderNumber today
  const maxOrder = await Order.findOne({
    createdAt: {
      $gte: new Date(todayKey + "T00:00:00.000Z"),
      $lte: new Date(todayKey + "T23:59:59.999Z"),
    },
  }).sort({ orderNumber: -1 });

  const startSeq = maxOrder ? maxOrder.orderNumber : 0;

  counter = await Counter.create({ date: todayKey, seq: startSeq });
}

// Increment atomically
counter = await Counter.findOneAndUpdate(
  { date: todayKey },
  { $inc: { seq: 1 } },
  { new: true }
);

const orderNumber = counter.seq;

    const order = new Order({ items, totalAmount, orderNumber });
    await order.save();
    res.redirect(`/receipt/${order._id}`);
  } catch (err) {
    console.error("❌ Order creation failed:", err);
    next(err);
  }
});

module.exports = router; // ✅ CommonJS export
