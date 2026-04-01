const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null, // null for lifetime or according to purchased duration
  },
  status: {
    type: String,
    enum: ["active", "completed", "expired"],
    default: "active",
  },
  amount: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: "INR",
  },
  paymentId: {
    type: String, // If paid
    default: null,
  },
}, { timestamps: true });

// To ensure a user can't enroll in the same course multiple times?
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
