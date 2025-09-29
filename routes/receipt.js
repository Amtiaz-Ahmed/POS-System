const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/orderModel");

router.get("/receipt/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid order ID");
    }

    // ✅ Fetch order with product details
    const order = await Order.findById(id).populate("items.productId");

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // ✅ Render EJS file (layout disabled for printing purpose)
    res.render("receipt", { order, layout: false });
  } catch (err) {
    console.error("❌ Error loading receipt:", err);
    next(err);
  }
});

module.exports = router;
