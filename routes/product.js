const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const multer = require("multer");
const path = require("path");

// --- Multer Config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // images public/uploads folder me save hongi
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage: storage });

// Show all products + form
// router.get("/", async (req, res) => {
//   const products = await Product.find();
//   res.render("product", { products });
// });
let productCache = null;
let lastFetchTime = null;

// Show all products + form
router.get("/", async (req, res) => {
  const now = Date.now();

  // Cache expire after 1 min (example)
  if (!productCache || (now - lastFetchTime > 60000)) {
    productCache = await Product.find();
    lastFetchTime = now;
  }

  res.render("product", { products: productCache });
});


// Add product
router.post("/add", upload.single("image"), async (req, res) => {
  const { name, price, category } = req.body;
  let imagePath = "";
  if (req.file) {
    imagePath = "/uploads/" + req.file.filename; // frontend se access karne ke liye
  }
  await Product.create({ name, price, category, image: imagePath });
  res.redirect("/product");
});

// Update product
router.post("/update/:id", upload.single("image"), async (req, res) => {
  const { name, price, category } = req.body;
  const updateData = { name, price, category };

  if (req.file) {
    updateData.image = "/uploads/" + req.file.filename;
  }

  await Product.findByIdAndUpdate(req.params.id, updateData);
  res.redirect("/product");
});

// Delete product
router.get("/delete/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect("/product");
});

module.exports = router;
