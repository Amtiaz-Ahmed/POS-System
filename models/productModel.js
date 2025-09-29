const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  available: { type: Boolean, default: true },
  image: { type: String } // URL ya file path
}, {
  timestamps: true // createdAt & updatedAt auto
});

// Indexes for better search performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model("Product", productSchema);
