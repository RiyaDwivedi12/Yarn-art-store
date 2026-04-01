const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Comment = require("../models/Comment");

// ✅ Get ALL Courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Single Course with its Details
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Fetch comments for this course
    const comments = await Comment.find({ courseId: req.params.id })
      .populate("userId", "email") // Populate user email from the User model (assuming User schema has email)
      .sort({ createdAt: -1 });

    res.json({ course, comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Enroll a user into a course (track enrollment)
router.post("/enroll", async (req, res) => {
  const { userId, courseId, paymentId, duration } = req.body; // duration in months
  if (!userId || !courseId) return res.status(400).json({ error: "UserID and CourseID are required" });

  try {
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Calculate expiry
    let expiresAt = null;
    if (course.type === "paid" || duration) {
       const months = duration || course.duration || 6;
       const date = new Date();
       date.setMonth(date.getMonth() + months);
       expiresAt = date;
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({ userId, courseId });
    if (existing) {
       // Update enrollment if re-purchasing or renewing
       if (paymentId) {
          existing.paymentId = paymentId;
          existing.expiresAt = expiresAt;
          existing.status = "active";
          await existing.save();
          return res.json({ message: "Enrollment updated", enrollment: existing });
       }
       return res.json({ message: "Already enrolled", enrollment: existing });
    }

    // Create new enrollment
    const newEnrollment = new Enrollment({ userId, courseId, paymentId, expiresAt });
    await newEnrollment.save();

    res.status(201).json({ message: "Enrollment successful", enrollment: newEnrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get User's Courses (with expiry check)
router.get("/user/:userId", async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.params.userId }).populate("courseId");
    // Filter out expired ones? Or let the frontend handle it
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Check enrollment status
router.get("/status/:userId/:courseId", async (req, res) => {
  const { userId, courseId } = req.params;
  try {
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) return res.json({ isEnrolled: false });

    // Check if expired
    if (enrollment.expiresAt && new Date() > new Date(enrollment.expiresAt)) {
       enrollment.status = "expired";
       await enrollment.save();
       return res.json({ isEnrolled: false, message: "Subscription expired" });
    }

    res.json({ isEnrolled: true, enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Like/Unlike a Course
router.post("/like", async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const index = course.likes.indexOf(userId);
    if (index === -1) {
      course.likes.push(userId); // Like
    } else {
      course.likes.splice(index, 1); // Unlike
    }

    await course.save();
    res.json({ likes: course.likes.length, isLiked: index === -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add a Comment
router.post("/comment", async (req, res) => {
  const { userId, courseId, content } = req.body;
  if (!content) return res.status(400).json({ error: "Comment content is required" });

  try {
    const newComment = new Comment({ userId, courseId, content });
    await newComment.save();
    
    // Return the new comment populated with user info
    const populated = await Comment.findById(newComment._id).populate("userId", "email");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin: Get Course Analytics (Enrollment counts and Views)
router.get("/stats/admin", async (req, res) => {
  try {
    const courses = await Course.find();
    const stats = await Promise.all(courses.map(async (c) => {
       const enrollmentCount = await Enrollment.countDocuments({ courseId: c._id });
       return {
         ...c.toObject(),
         enrollmentCount
       };
    }));
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/", async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json({ message: "Course added successfully", course: newCourse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin: Update a Course
router.put("/:id", async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Course updated successfully", course: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin: Delete a Course
router.delete("/:id", async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    // Optional: Delete associated comments and enrollments
    await Comment.deleteMany({ courseId: req.params.id });
    await Enrollment.deleteMany({ courseId: req.params.id });
    res.json({ message: "Course and related data deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete a Comment (Admin or Owner)
router.delete("/comment/:id", async (req, res) => {
  const { userId, isAdmin } = req.body; // In a real app, use auth middleware to get this
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Allow if admin OR if the user is the owner of the comment
    if (isAdmin || comment.userId.toString() === userId) {
      await Comment.findByIdAndDelete(req.params.id);
      return res.json({ message: "Comment deleted successfully" });
    } else {
      return res.status(403).json({ error: "Unauthorized to delete this comment" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
