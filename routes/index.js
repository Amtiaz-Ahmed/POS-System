const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

// POS screen
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.render("index", { products });
});

// Create order
router.post("/order", async (req, res) => {
  let { items } = req.body;

  // Agar empty ya undefined hai
  if (!items || items.trim() === "") {
    return res.status(400).send("Items data is missing");
  }

  // Agar string hai to parse karo
  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch (err) {
      console.error("Invalid JSON:", err);
      return res.status(400).send("Invalid items data");
    }
  }

  // Ab items pakka array hai
const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);
const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

// Count today's orders
const countToday = await Order.countDocuments({
  createdAt: { $gte: startOfDay, $lte: endOfDay }
});
const totalAmount = items.reduce((acc, i) => acc + i.price * i.qty, 0);


// Order number = count + 1
const orderNumber = countToday + 1;

const order = new Order({
  items,
  totalAmount,
  orderNumber // ✅ new field
});

await order.save();
res.redirect(`/receipt/${order._id}`);
});


module.exports = router;
