const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");

// Show only pending orders
router.get("/", async (req, res, next) => {
  try {
    const orders = await Order.find({ status: "pending" })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.render("order", { orders });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    next(err);
  }
});

// Update order status
router.post("/update/:id", async (req, res, next) => {
  try {
    const { status } = req.body;

    console.log("Updating order:", req.params.id, "to status:", status);

    // ✅ Allowed statuses
    const validStatuses = ["pending", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).send("Invalid status value");
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // updated document return karega
    );

    if (!updatedOrder) {
      return res.status(404).send("Order not found");
    }

    res.redirect("/order"); // sirf pending orders dubara load honge
  } catch (err) {
    console.error("❌ Error updating order:", err);
    next(err);
  }
});

module.exports = router;
