const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: String,
  items: Array,
  total: Number,
  paymentId: String,
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);