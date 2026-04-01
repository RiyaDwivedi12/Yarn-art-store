require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

const productRoutes = require("./routes/product");
app.use("/api/products", productRoutes);
app.use("/api/product", productRoutes);
app.use(express.static("public"));

// ✅ MongoDB connection (with error handling)
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yarnstore")
  .then(() => {
    console.log("MongoDB Connected ✅");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("DB Error ❌", err));

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/order", require("./routes/order"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/course", require("./routes/course"));

// ✅ Test route (VERY USEFUL)
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ✅ DB connection test route
app.get("/api/test-db", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ error: "Database not connected" });
  }
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ status: "connected", collections: collections.map(c => c.name) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Export app for Vercel
module.exports = app;
