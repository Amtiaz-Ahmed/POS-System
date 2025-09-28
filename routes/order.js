const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");

// Show only pending orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({ status: "pending" })
      .populate("items.productId")
      .sort({ createdAt: -1 });
    res.render("order", { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching orders");
  }
});

// Update order status
router.post("/update/:id", async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.redirect("/order"); // jab update hoga, page refresh hoke sirf pending orders dikhayega
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating order status");
  }
});

module.exports = router;
