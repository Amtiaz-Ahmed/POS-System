const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      qty: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
      image: { type: String }
    }
  ],
  orderNumber: { type: Number, required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["pending", "delivered", "cancelled"], default: "pending" },
}, {
  timestamps: true // createdAt & updatedAt auto
});

module.exports = mongoose.model("Order", orderSchema);
