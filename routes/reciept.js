const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");

router.get("/receipt/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // render EJS file
    res.render("receipt", { order, layout: false });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading receipt");
  }
});


module.exports = router;
