const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  available: { type: Boolean, default: true },
  image: { type: String } // 👈 New field for product image (URL ya file path)
});

module.exports = mongoose.model("Product", productSchema);
