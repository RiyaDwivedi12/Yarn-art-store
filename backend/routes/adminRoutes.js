const router = require("express").Router();
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Get dashboard stats
router.get("/dashboard-stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalProducts = await Product.countDocuments();
    
    // Get all orders
    const orders = await Order.find();
    
    // Calculate total revenue & items ordered
    let totalRevenue = 0;
    let totalItemsOrdered = 0;

    // Calc sales for this month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    let thisMonthRevenue = 0;

    orders.forEach(order => {
      totalRevenue += (order.total || 0);
      
      if (order.items && Array.isArray(order.items)) {
         let orderItemsCount = 0;
         order.items.forEach(item => {
            orderItemsCount += item.quantity || 1;
         });
         totalItemsOrdered += orderItemsCount;
      }

      // Check month
      const orderDate = new Date(order.createdAt || Date.now()); // fallback to Date.now() if no timestamp
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
         thisMonthRevenue += (order.total || 0);
      }
    });

    res.json({
      totalUsers,
      totalProducts,
      totalOrders: orders.length,
      totalRevenue,
      thisMonthRevenue,
      totalItemsOrdered
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User Detail & Orders list
router.get("/users-details", async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
        
        const details = [];
        for (let user of users) {
             const userOrders = await Order.find({ userId: user._id.toString() });
             
             let userTotalSpent = 0;
             let userTotalItems = 0;

             const userOrderHistory = userOrders.map(order => {
                  userTotalSpent += (order.total || 0);
                  
                  let orderItemsCount = 0;
                  if (order.items && Array.isArray(order.items)) {
                       order.items.forEach(item => {
                            orderItemsCount += item.quantity || 1;
                       });
                  }
                  userTotalItems += orderItemsCount;

                  return {
                       orderId: order._id,
                       total: order.total,
                       paymentId: order.paymentId,
                       itemsCount: orderItemsCount,
                       date: order.createdAt
                  };
             });

             details.push({
                 _id: user._id,
                 email: user.email,
                 totalOrders: userOrders.length,
                 totalSpent: userTotalSpent,
                 totalItemsBought: userTotalItems,
                 orderHistory: userOrderHistory
             });
        }

        res.json(details);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Latest Orders
router.get("/latest-orders", async (req, res) => {
   try {
       const orders = await Order.find().sort("-createdAt").limit(50);
       
       const enhancedOrders = [];
       for (let order of orders) {
           const user = await User.findById(order.userId).select('email');
           
           enhancedOrders.push({
               ...order._doc,
               userEmail: user ? user.email : 'Unknown User'
           });
       }

       res.json(enhancedOrders);
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
});

module.exports = router;
