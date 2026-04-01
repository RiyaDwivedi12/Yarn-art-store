const mongoose = require("mongoose");
const Order = require("./backend/models/Order");
const Enrollment = require("./backend/models/Enrollment");
require("dotenv").config({ path: "./backend/.env" });

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yarnstore");
        console.log("Connected to DB");

        const orders = await Order.find();
        console.log(`Found ${orders.length} orders`);
        if (orders.length > 0) {
            console.log("First order total:", orders[0].total);
            console.log("First order type:", typeof orders[0].total);
            const total = orders.reduce((acc, o) => acc + (o.total || 0), 0);
            console.log("Calculated Total Revenue:", total);
        }

        const enrollments = await Enrollment.find();
        console.log(`Found ${enrollments.length} enrollments`);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkDB();
