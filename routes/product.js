const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const multer = require("multer");
const path = require("path");

// --- Multer Config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// ✅ File type filter (only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

// --- Simple In-Memory Cache ---
let productCache = null;
let lastFetchTime = null;

// Show all products + form
router.get("/", async (req, res, next) => {
  try {
    const now = Date.now();
    if (!productCache || now - lastFetchTime > 60000) {
      productCache = await Product.find();
      lastFetchTime = now;
    }
    res.render("product", { products: productCache });
  } catch (err) {
    next(err);
  }
});

// Add product
router.post("/add", upload.single("image"), async (req, res, next) => {
  try {
    const { name, price, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).send("All fields are required");
    }

    let imagePath = "";
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    }

    await Product.create({
      name: name.trim(),
      price: parseFloat(price),
      category: category.trim(),
      image: imagePath,
    });

    // ✅ Invalidate cache after insert
    productCache = null;

    res.redirect("/product");
  } catch (err) {
    next(err);
  }
});

// Update product
router.post("/update/:id", upload.single("image"), async (req, res, next) => {
  try {
    const { name, price, category } = req.body;
    const updateData = {
      name: name?.trim(),
      price: parseFloat(price),
      category: category?.trim(),
    };

    if (req.file) {
      updateData.image = "/uploads/" + req.file.filename;
    }

    await Product.findByIdAndUpdate(req.params.id, updateData);

    // ✅ Invalidate cache after update
    productCache = null;

    res.redirect("/product");
  } catch (err) {
    next(err);
  }
});

// Delete product
router.get("/delete/:id", async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    // ✅ Invalidate cache after delete
    // productCache = null;

    res.redirect("/product");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
