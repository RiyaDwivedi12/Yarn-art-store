const router = require("express").Router();
const Order = require("../models/Order");

const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

router.post("/", async (req, res) => {
  try {
    const order = await Order.create(req.body);
    
    // Attempt to send email
    try {
      const user = await User.findById(req.body.userId);
      if (user && user.email) {
        let itemsHtml = req.body.items.map(i => `<li>${i.name || 'Item'} - ₹${i.price}</li>`).join('');
        const message = `Thank you for your order! Your total is ₹${req.body.total}.`;
        const htmlMessage = `
          <h2>Order Confirmation</h2>
          <p>Thank you for shopping at Yarn Art Store!</p>
          <p><strong>Order Total:</strong> ₹${req.body.total}</p>
          <h3>Items:</h3>
          <ul>${itemsHtml}</ul>
          <p>Your order ID is: ${order._id}</p>
        `;
        
        await sendEmail({
          email: user.email,
          subject: "Your Yarn Art Store Order Confirmation 🧶",
          message,
          htmlMessage
        });
      }
    } catch (emailErr) {
      console.error("Order email failed to send", emailErr);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:userId", async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId });
  res.json(orders);
});

module.exports = router;