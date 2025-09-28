const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      qty: Number,
      price: Number,
      image: { type: String } // 👈 Store image of product at time of order
    }
  ],
   orderNumber: Number,
  totalAmount: Number,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
