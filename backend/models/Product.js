const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  category: String,
  deliveryCharges: { type: Number, default: 0 },
  videoUrl: { type: String, default: "" }
});

module.exports = mongoose.model("Product", productSchema);