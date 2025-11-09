const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/pos_system", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected...");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1); // app band ho jaye agar DB connect na ho
  }
}

// Events for debugging
mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected to DB");
});
mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose disconnected");
});

module.exports = connectDB;
