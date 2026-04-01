const mongoose = require("mongoose");
const Order = require("./backend/models/Order");
require("dotenv").config({ path: "./backend/.env" });

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yarnstore");
        console.log("Connected to DB");

        const orders = await Order.find().limit(5);
        console.log("Orders found:", JSON.stringify(orders, null, 2));

        const enrollmentCount = await mongoose.connection.db.collection("enrollments").countDocuments();
        console.log("Enrollment count:", enrollmentCount);

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

checkDB();
