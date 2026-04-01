const router = require("express").Router();
const Cart = require("../models/Cart");

// ➕ ADD TO CART
router.post("/add", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const existing = await Cart.findOne({ userId, productId });

    if (existing) {
      existing.quantity += 1;
      await existing.save();
    } else {
      await Cart.create({ userId, productId });
    }

    res.json({ message: "Added to cart" });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

// 🔢 GET CART COUNT
router.get("/count/:userId", async (req, res) => {
  try {
    const count = await Cart.countDocuments({
      userId: req.params.userId,
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;