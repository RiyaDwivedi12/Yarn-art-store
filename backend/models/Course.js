const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  playlistId: {
    type: String, // YouTube Playlist ID
  },
  videoId: {
    type: String, // YouTube Single Video ID
  },
  type: {
    type: String,
    enum: ["free", "paid"],
    default: "free",
  },
  price: {
    type: Number,
    default: 0,
  },
  thumbnail: {
    type: String,
    default: "https://placehold.co/600x400/f43397/ffffff?text=Course+Thumbnail",
  },
  author: {
    type: String,
    default: "Yarn Art Store",
  },
  category: {
    type: String,
    default: "General",
  },
  duration: {
    type: Number, // In months
    default: 6,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Course", CourseSchema);
