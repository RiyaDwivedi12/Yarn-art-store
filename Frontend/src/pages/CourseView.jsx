import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API } from "../api";
import { UserContext } from "../context/UserContext";
import { 
  FaHeart, FaRegHeart, FaTrashAlt, FaLock, FaCheckCircle, FaTimes, 
  FaShare, FaCheck, FaShoppingBag, FaArrowLeft 
} from "react-icons/fa";
import { useNotification } from "../context/NotificationContext";

export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { notify } = useNotification();
  
  const [course, setCourse] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(6);
  const [isPaying, setIsPaying] = useState(false);
  
  // Custom interactive features
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [commentFocus, setCommentFocus] = useState(false);
  
  // Comment replies features
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedThreads, setExpandedThreads] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    
    // Fetch Course & Comments
    API.get(`/course/${id}`)
      .then((res) => {
        const data = res.data;
        setCourse(data.course);
        setComments(data.comments);
        setLikesCount(data.course.likes?.length || 0);
        setIsLiked(data.course.likes?.includes(user?._id));
        setLoading(false);
        
        if (data.course.type === "free") {
          setIsUnlocked(true);
          if (user?._id) trackEnrollment(user._id, data.course._id);
        } else if (user?._id) {
           API.get(`/course/status/${user._id}/${data.course._id}`)
             .then(statusRes => {
                if (statusRes.data.isEnrolled) {
                   setIsUnlocked(true);
                }
             });
        }

        // Now fetch other courses & products for sidebar recommendations
        fetchRecommendations(data.course.category);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const fetchRecommendations = async (category) => {
    try {
      // Fetch all courses
      const courseRes = await API.get("/course");
      setAllCourses(courseRes.data.filter(c => c._id !== id)); // exclude current course

      // Fetch all products/supplies
      const productRes = await API.get("/product");
      // Filter products to show matches based on course category
      const matchedProducts = productRes.data.filter(p => 
        p.category?.toLowerCase().includes(category?.toLowerCase()) || 
        category?.toLowerCase().includes(p.category?.toLowerCase())
      );
      // Fallback: show first 4 products if no direct match
      setSupplies(matchedProducts.length > 0 ? matchedProducts.slice(0, 4) : productRes.data.slice(0, 4));
    } catch (err) {
      console.error("Failed to load sidebar content", err);
    }
  };

  const trackEnrollment = async (userId, courseId, paymentId = null, duration = null) => {
    try {
      const res = await API.post("/course/enroll", { 
        userId, 
        courseId, 
        paymentId, 
        duration: duration || course.duration 
      });
      if (res.data.enrollment) {
        setIsUnlocked(true);
      }
    } catch (err) {
      console.error("Enrollment tracking failed", err);
    }
  };

  const handleLike = async () => {
    if (!user) return navigate("/login");
    try {
      const res = await API.post("/course/like", { userId: user._id, courseId: course._id });
      setLikesCount(res.data.likes);
      setIsLiked(res.data.isLiked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!newComment.trim()) return;
    try {
      const res = await API.post("/course/comment", { 
        userId: user._id, 
        courseId: course._id, 
        content: newComment 
      });
      setComments([res.data, ...comments]);
      setNewComment("");
      setCommentFocus(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await API.delete(`/course/comment/${commentId}`, {
        data: { userId: user._id, isAdmin: user.role === 'admin' }
      });
      // Delete the comment and all its replies from state
      setComments(comments.filter(c => c._id !== commentId && c.parentId !== commentId));
    } catch (err) {
      notify("Failed to delete comment.", "error");
    }
  };

  const handleReplySubmit = async (parentId, text, callback) => {
    if (!user) return navigate("/login");
    if (!text.trim()) return;
    try {
      const res = await API.post("/course/comment", { 
        userId: user._id, 
        courseId: course._id, 
        content: text,
        parentId: parentId
      });
      setComments([...comments, res.data]);
      if (callback) callback();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleThread = (commentId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleUnlock = () => {
    if (!user) return navigate("/login");
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setIsPaying(true);
    setTimeout(async () => {
      const mockPaymentId = "course_pay_" + Math.random().toString(36).substring(7);
      await trackEnrollment(user._id, course._id, mockPaymentId, selectedDuration);
      setShowPaymentModal(false);
      setIsPaying(false);
      notify("✨ Subscription Successful! Welcome to the course!", "success");
    }, 1500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    notify("📋 Link copied to clipboard!", "success");
  };

  const getEmbedUrl = (rawInput) => {
    if (!rawInput) return "";
    const input = rawInput.trim();
    
    // Check if it's a playlist URL or just a list ID
    if (input.includes('list=')) {
        const match = input.match(/[&?]list=([^&]+)/i);
        if (match && match[1]) return `https://www.youtube.com/embed/videoseries?list=${match[1]}`;
    }
    if (input.startsWith('PL') && input.length > 10) {
        return `https://www.youtube.com/embed/videoseries?list=${input}`;
    }

    // Try to extract a video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/;
    const match = input.match(regExp);
    let videoId = (match && match[2].length === 11) ? match[2] : null;

    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }

    // If it's exactly 11 characters, assume it's just the video ID
    if (input.length === 11) {
        return `https://www.youtube.com/embed/${input}`;
    }

    // Fallback
    return `https://www.youtube.com/embed/${input.split('/').pop().split('?')[0]}`;
  };

  const formatRelativeDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "100px", fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <Navbar />
      <div className="spinner" style={{ border: "4px solid rgba(0, 0, 0, 0.1)", width: "36px", height: "36px", borderRadius: "50%", borderLeftColor: "#f43397", animation: "spin 1s linear infinite", margin: "50px auto" }}></div>
      <p style={{ color: "#606060" }}>Loading course content...</p>
    </div>
  );

  if (!course) return (
    <div style={{ textAlign: "center", padding: "100px", fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <Navbar />
      <h2 style={{ color: "#0f0f0f" }}>Course not found</h2>
      <button 
        onClick={() => navigate("/learn")}
        style={{ background: "#f43397", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginTop: "15px" }}
      >
        Back to Courses
      </button>
    </div>
  );

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: "#0f0f0f" }}>
      <Navbar />
      
      {/* MAIN TWO-COLUMN CONTAINER */}
      <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "24px 24px 40px", boxSizing: "border-box" }}>
        
        {/* Back Link */}
        <div 
          onClick={() => navigate("/learn")} 
          style={{ display: "flex", alignItems: "center", gap: "8px", color: "#606060", cursor: "pointer", fontSize: "14px", fontWeight: "600", marginBottom: "16px", width: "fit-content" }}
          className="back-button"
        >
          <FaArrowLeft /> Back to Course Library
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
          
          {/* LEFT COLUMN: Player, Info, Comments (65% width on large screens) */}
          <div style={{ flex: "1 1 65%", minWidth: "320px", display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* 16:9 Video Box with Cinema Style */}
            <div style={{ 
              position: "relative", 
              width: "100%", 
              paddingTop: "56.25%", // 16:9 aspect ratio
              borderRadius: "16px", 
              overflow: "hidden", 
              background: "#000000",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
            }}>
              {/* Premium Lock Overlay */}
              {!isUnlocked ? (
                 <div style={{ 
                   position: "absolute", 
                   top: 0, left: 0, width: "100%", height: "100%", 
                   background: "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.95))", 
                   display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", 
                   zIndex: 5, color: "white", textAlign: "center", padding: "20px", boxSizing: "border-box" 
                 }}>
                    <div style={{
                      width: "64px", height: "64px", borderRadius: "50%", background: "rgba(244, 51, 151, 0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#f43397", marginBottom: "16px"
                    }}>
                      <FaLock size={28} />
                    </div>
                    <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: "700" }}>Premium Course Locked</h2>
                    <p style={{ maxWidth: "420px", margin: "0 0 20px", opacity: 0.8, fontSize: "14px", lineHeight: "1.5" }}>
                      This is an expert-led premium course. Unlock lifetime access to all lessons and exclusive patterns.
                    </p>
                    <button 
                      onClick={handleUnlock} 
                      style={{ 
                        background: "#f43397", color: "white", border: "none", 
                        padding: "12px 30px", borderRadius: "24px", fontWeight: "700", 
                        fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 15px rgba(244, 51, 151, 0.4)",
                        transition: "transform 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.transform = "scale(1.03)"}
                      onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                    >
                      Unlock for ₹{course.price}
                    </button>
                 </div>
              ) : null}
              
              <iframe 
                src={getEmbedUrl(course.playlistId)} 
                title={course.title} 
                style={{ 
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%", 
                  border: "none", filter: isUnlocked ? "none" : "blur(10px)" 
                }} 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>

            {/* Video Title */}
            <h1 style={{ fontSize: "20px", fontWeight: "700", margin: "12px 0 8px", color: "#0f0f0f", lineHeight: "1.4" }}>
              {course.title}
            </h1>

            {/* YouTube Channel & Meta Panel */}
            <div style={{ 
              display: "flex", justifyContent: "space-between", alignItems: "center", 
              flexWrap: "wrap", gap: "16px", paddingBottom: "16px", borderBottom: "1px solid #e5e5e5" 
            }}>
              
              {/* Left Side: Channel / Instructor info */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #f43397, #ff9eb5)", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: "bold", fontSize: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  {course.author ? course.author.charAt(0).toUpperCase() : "Y"}
                </div>
                
                <div>
                  <div style={{ fontWeight: "700", color: "#0f0f0f", fontSize: "15px" }}>{course.author || "Yarn Art Store"}</div>
                  <div style={{ fontSize: "12px", color: "#606060" }}>Creator & Educator</div>
                </div>

                <button 
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  style={{
                    background: isSubscribed ? "#f2f2f2" : "#0f0f0f",
                    color: isSubscribed ? "#0f0f0f" : "#ffffff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "18px",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginLeft: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "background-color 0.2s"
                  }}
                >
                  {isSubscribed ? <><FaCheck /> Subscribed</> : "Subscribe"}
                </button>
              </div>

              {/* Right Side: Like, Share Actions (YouTube styled pill buttons) */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Like Button */}
                <button 
                  onClick={handleLike} 
                  style={{ 
                    display: "flex", alignItems: "center", gap: "8px", 
                    padding: "8px 16px", borderRadius: "18px", 
                    border: "none", background: isLiked ? "#f43397" : "#f2f2f2", 
                    color: isLiked ? "white" : "#0f0f0f", fontWeight: "600", 
                    fontSize: "14px", cursor: "pointer", transition: "background-color 0.2s" 
                  }}
                  onMouseEnter={(e) => { if(!isLiked) e.target.style.background = "#e5e5e5"; }}
                  onMouseLeave={(e) => { if(!isLiked) e.target.style.background = "#f2f2f2"; }}
                >
                  {isLiked ? <FaHeart /> : <FaRegHeart />}
                  <span>{likesCount} likes</span>
                </button>

                {/* Share Button */}
                <button 
                  onClick={handleShare}
                  style={{ 
                    display: "flex", alignItems: "center", gap: "8px", 
                    padding: "8px 16px", borderRadius: "18px", 
                    border: "none", background: "#f2f2f2", 
                    color: "#0f0f0f", fontWeight: "600", 
                    fontSize: "14px", cursor: "pointer", transition: "background-color 0.2s" 
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#e5e5e5"}
                  onMouseLeave={(e) => e.target.style.background = "#f2f2f2"}
                >
                  <FaShare /> Share
                </button>

                {/* Enrollment status pill */}
                {isUnlocked && (
                  <div style={{ 
                    background: "#e8f5e9", color: "#2e7d32", padding: "8px 16px", 
                    borderRadius: "18px", fontSize: "13px", fontWeight: "700" 
                  }}>
                    ✓ Enrolled
                  </div>
                )}
              </div>
            </div>

            {/* YouTube Collapsible Description Box */}
            <div 
              style={{ 
                background: "#f2f2f2", 
                borderRadius: "12px", 
                padding: "12px 16px", 
                fontSize: "14px", 
                lineHeight: "1.5",
                color: "#0f0f0f",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e8e8e8"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f2f2f2"}
            >
              <div style={{ fontWeight: "700", marginBottom: "8px", color: "#0f0f0f" }}>
                {course.views || 0} views • {formatRelativeDate(course.createdAt)} • {course.category}
              </div>
              
              <div style={{ 
                whiteSpace: "pre-line",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: isDescriptionExpanded ? "unset" : "2",
                WebkitBoxOrient: "vertical",
                color: "#333333"
              }}>
                {course.description}
                
                {isDescriptionExpanded && (
                  <div style={{ borderTop: "1px solid #ddd", marginTop: "12px", paddingTop: "12px", color: "#606060", fontSize: "13px" }}>
                    <div style={{ display: "flex", gap: "20px", marginBottom: "4px" }}>
                      <strong>Difficulty:</strong> All Levels (Beginner Friendly)
                    </div>
                    <div style={{ display: "flex", gap: "20px", marginBottom: "4px" }}>
                      <strong>Languages:</strong> English / Hindi
                    </div>
                    <div style={{ display: "flex", gap: "20px" }}>
                      <strong>Duration:</strong> {course.duration || 6} Months Access
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ fontWeight: "600", marginTop: "8px", fontSize: "13px", color: "#0f0f0f" }}>
                {isDescriptionExpanded ? "Show less" : "...more"}
              </div>
            </div>

            {/* COMMENTS SECTION (YouTube styled) */}
            <div style={{ marginTop: "10px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 20px" }}>
                {comments.length} Comments
              </h3>

              {/* YouTube Style Add Comment */}
              <form onSubmit={handleComment} style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: "#000000", color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "bold", fontSize: "16px"
                  }}>
                    {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </div>
                </div>

                <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onFocus={() => setCommentFocus(true)}
                    style={{
                      border: "none",
                      borderBottom: "1px solid #cccccc",
                      padding: "8px 0",
                      fontSize: "14px",
                      outline: "none",
                      background: "transparent",
                      width: "100%",
                      transition: "border-color 0.2s"
                    }}
                  />
                  {commentFocus && (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", animation: "fadeIn 0.2s" }}>
                      <button 
                        type="button" 
                        onClick={() => { setNewComment(""); setCommentFocus(false); }}
                        style={{ background: "transparent", border: "none", padding: "8px 16px", fontSize: "14px", fontWeight: "600", cursor: "pointer", borderRadius: "18px" }}
                        onMouseEnter={(e) => e.target.style.background = "#f2f2f2"}
                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={!newComment.trim()}
                        style={{ 
                          background: newComment.trim() ? "#0f0f0f" : "#cccccc", 
                          color: "white", 
                          border: "none", 
                          padding: "8px 16px", 
                          fontSize: "14px", 
                          fontWeight: "600", 
                          borderRadius: "18px", 
                          cursor: newComment.trim() ? "pointer" : "not-allowed" 
                        }}
                      >
                        Comment
                      </button>
                    </div>
                  )}
                </div>
              </form>

              {/* Comments List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {comments.filter(c => !c.parentId).length === 0 ? (
                  <div style={{ textAlign: "center", color: "#606060", padding: "30px", fontSize: "14px" }}>
                    No comments yet. Be the first to start the conversation!
                  </div>
                ) : (
                  comments.filter(c => !c.parentId).map((comment) => {
                    const replies = comments.filter(r => r.parentId === comment._id)
                                            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    const isThreadExpanded = !!expandedThreads[comment._id];

                    return (
                      <div key={comment._id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "12px" }}>
                          {/* Avatar */}
                          <div style={{ flexShrink: 0 }}>
                            <div style={{
                              width: "40px", height: "40px", borderRadius: "50%",
                              background: "#e0e0e0", color: "#606060",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: "bold", fontSize: "15px"
                            }}>
                              {comment.userId?.email ? comment.userId.email.charAt(0).toUpperCase() : "A"}
                            </div>
                          </div>

                          {/* Content */}
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontWeight: "700", fontSize: "13px", color: "#0f0f0f" }}>
                                  @{comment.userId?.email ? comment.userId.email.split('@')[0] : "anonymous"}
                                </span>
                                <span style={{ color: "#606060", fontSize: "11px" }}>
                                  {formatRelativeDate(comment.createdAt)}
                                </span>
                              </div>
                              {(user?.role === 'admin' || user?._id === (comment.userId?._id || comment.userId)) && (
                                 <FaTrashAlt 
                                   onClick={() => handleDeleteComment(comment._id)} 
                                   style={{ color: "#ff4d4d", cursor: "pointer", fontSize: "13px" }} 
                                   title="Delete comment" 
                                 />
                              )}
                            </div>
                            <p style={{ margin: "0 0 8px 0", color: "#0f0f0f", lineHeight: "1.5", fontSize: "14px" }}>
                              {comment.content}
                            </p>

                            {/* Reply Action Button */}
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <button 
                                onClick={() => {
                                  setActiveReplyId(activeReplyId === comment._id ? null : comment._id);
                                  setReplyText("");
                                }}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  padding: "4px 8px",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  color: "#606060",
                                  cursor: "pointer",
                                  borderRadius: "12px",
                                  transition: "background-color 0.2s"
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#f2f2f2"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                              >
                                Reply
                              </button>
                            </div>

                            {/* Inline Reply Input Box */}
                            {activeReplyId === comment._id && (
                              <div style={{ display: "flex", gap: "10px", marginTop: "12px", animation: "fadeIn 0.2s" }}>
                                <div style={{ flexShrink: 0 }}>
                                  <div style={{
                                    width: "32px", height: "32px", borderRadius: "50%",
                                    background: "#000000", color: "white",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: "bold", fontSize: "13px"
                                  }}>
                                    {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                                  </div>
                                </div>
                                <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                                  <input
                                    type="text"
                                    placeholder="Reply to this comment..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    style={{
                                      border: "none",
                                      borderBottom: "1px solid #cccccc",
                                      padding: "6px 0",
                                      fontSize: "13px",
                                      outline: "none",
                                      background: "transparent",
                                      width: "100%"
                                    }}
                                  />
                                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                    <button 
                                      type="button" 
                                      onClick={() => setActiveReplyId(null)}
                                      style={{ background: "transparent", border: "none", padding: "6px 12px", fontSize: "13px", fontWeight: "600", cursor: "pointer", borderRadius: "14px" }}
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      type="button" 
                                      disabled={!replyText.trim()}
                                      onClick={() => handleReplySubmit(comment._id, replyText, () => { setActiveReplyId(null); setReplyText(""); })}
                                      style={{ 
                                        background: replyText.trim() ? "#0f0f0f" : "#cccccc", 
                                        color: "white", 
                                        border: "none", 
                                        padding: "6px 12px", 
                                        fontSize: "13px", 
                                        fontWeight: "600", 
                                        borderRadius: "14px", 
                                        cursor: replyText.trim() ? "pointer" : "not-allowed" 
                                      }}
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Toggle Replies (Collapsible dropdown) */}
                            {replies.length > 0 && (
                              <div style={{ marginTop: "8px" }}>
                                <button
                                  onClick={() => toggleThread(comment._id)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#065fd4",
                                    fontWeight: "bold",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = "#def1ff"}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                                >
                                  {isThreadExpanded ? `▲ Hide ${replies.length} replies` : `▼ View ${replies.length} replies`}
                                </button>

                                {/* Nested Indented Replies List */}
                                {isThreadExpanded && (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px", paddingLeft: "16px", borderLeft: "2px solid #f2f2f2" }}>
                                    {replies.map((reply) => (
                                      <div key={reply._id} style={{ display: "flex", gap: "10px" }}>
                                        {/* Reply Avatar */}
                                        <div style={{ flexShrink: 0 }}>
                                          <div style={{
                                            width: "32px", height: "32px", borderRadius: "50%",
                                            background: "#e8e8e8", color: "#606060",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontWeight: "bold", fontSize: "13px"
                                          }}>
                                            {reply.userId?.email ? reply.userId.email.charAt(0).toUpperCase() : "R"}
                                          </div>
                                        </div>
                                        {/* Reply Content */}
                                        <div style={{ flexGrow: 1 }}>
                                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                              <span style={{ fontWeight: "700", fontSize: "12px", color: "#0f0f0f" }}>
                                                @{reply.userId?.email ? reply.userId.email.split('@')[0] : "anonymous"}
                                              </span>
                                              <span style={{ color: "#606060", fontSize: "10px" }}>
                                                {formatRelativeDate(reply.createdAt)}
                                              </span>
                                            </div>
                                            {(user?.role === 'admin' || user?._id === (reply.userId?._id || reply.userId)) && (
                                               <FaTrashAlt 
                                                 onClick={() => handleDeleteComment(reply._id)} 
                                                 style={{ color: "#ff4d4d", cursor: "pointer", fontSize: "12px" }} 
                                                 title="Delete reply" 
                                               />
                                            )}
                                          </div>
                                          <p style={{ margin: 0, color: "#0f0f0f", lineHeight: "1.4", fontSize: "13px" }}>
                                            {reply.content}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (Recommended Courses & Supplies) */}
          <div style={{ flex: "1 1 30%", minWidth: "300px", display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {/* SIDEBAR BLOCK 1: RECOMMENDED COURSES */}
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #eee", padding: "20px", boxSizing: "border-box" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 16px", borderBottom: "1px solid #f0f0f0", paddingBottom: "10px" }}>
                Up Next / Recommended
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {allCourses.length === 0 ? (
                  <p style={{ color: "#606060", fontSize: "13px", textAlign: "center" }}>No other courses available.</p>
                ) : (
                  allCourses.map((c) => (
                    <div 
                      key={c._id}
                      onClick={() => navigate(`/course/${c._id}`)}
                      style={{ 
                        display: "flex", 
                        gap: "10px", 
                        cursor: "pointer",
                        transition: "opacity 0.2s" 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                    >
                      {/* Compact Thumbnail */}
                      <div style={{ 
                        width: "120px", 
                        height: "68px", 
                        borderRadius: "8px", 
                        overflow: "hidden", 
                        flexShrink: 0, 
                        background: "#eee" 
                      }}>
                        <img 
                          src={c.thumbnail} 
                          alt={c.title} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          onError={(e) => { e.target.src = "https://placehold.co/120x68/f43397/ffffff?text=Yarn"; }}
                        />
                      </div>
                      
                      {/* Compact details */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <h4 style={{ 
                          margin: 0, 
                          fontSize: "13px", 
                          fontWeight: "600", 
                          lineHeight: "1.3",
                          color: "#0f0f0f",
                          display: "-webkit-box",
                          WebkitLineClamp: "2",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {c.title}
                        </h4>
                        <span style={{ fontSize: "11px", color: "#606060" }}>{c.author || "Yarn Art Store"}</span>
                        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                          <span style={{ 
                            fontSize: "10px", 
                            background: c.type === "free" ? "#e8f5e9" : "#fff0f6", 
                            color: c.type === "free" ? "#2e7d32" : "#f43397",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: "700",
                            textTransform: "uppercase"
                          }}>
                            {c.type}
                          </span>
                          {c.type !== "free" && (
                            <span style={{ fontSize: "11px", fontWeight: "700", color: "#0f0f0f" }}>₹{c.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SIDEBAR BLOCK 2: E-COMMERCE SUPPLIES INTEGRATION */}
            <div style={{ 
              background: "linear-gradient(to bottom, #ffffff, #fffdfd)", 
              borderRadius: "16px", 
              border: "1px solid #fdeef5", 
              padding: "20px", 
              boxSizing: "border-box",
              boxShadow: "0 4px 15px rgba(244, 51, 151, 0.03)"
            }}>
              <h3 style={{ 
                fontSize: "16px", 
                fontWeight: "700", 
                margin: "0 0 16px", 
                color: "#f43397",
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                borderBottom: "1px solid #fdf2f7", 
                paddingBottom: "10px" 
              }}>
                <FaShoppingBag size={14} /> Get Supplies For This Course
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {supplies.map((product) => (
                  <div 
                    key={product._id}
                    onClick={() => navigate("/supplies")}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "10px", 
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "10px",
                      transition: "background-color 0.2s" 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fff5f8"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    {/* Supply Thumbnail */}
                    <div style={{ 
                      width: "60px", 
                      height: "60px", 
                      borderRadius: "8px", 
                      overflow: "hidden", 
                      flexShrink: 0, 
                      background: "#eee",
                      border: "1px solid #eee"
                    }}>
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.src = "https://placehold.co/600x400/f43397/ffffff?text=Supplies"; }}
                      />
                    </div>
                    
                    {/* Supply Details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", flexGrow: 1 }}>
                      <h4 style={{ 
                        margin: 0, 
                        fontSize: "12px", 
                        fontWeight: "600", 
                        color: "#0f0f0f",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "160px"
                      }}>
                        {product.name}
                      </h4>
                      <span style={{ fontSize: "11px", color: "#606060" }}>{product.category}</span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#f43397" }}>₹{product.price}</span>
                    </div>

                    {/* View shop button */}
                    <span style={{ 
                      fontSize: "11px", 
                      fontWeight: "700", 
                      color: "#f43397", 
                      background: "#fff0f6", 
                      padding: "4px 8px", 
                      borderRadius: "6px" 
                    }}>
                      View
                    </span>
                  </div>
                ))}

                <button 
                  onClick={() => navigate("/supplies")}
                  style={{
                    background: "transparent",
                    color: "#f43397",
                    border: "1px solid #f43397",
                    borderRadius: "10px",
                    padding: "10px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    marginTop: "8px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { e.target.style.background = "#f43397"; e.target.style.color = "white"; }}
                  onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#f43397"; }}
                >
                  Visit Craft Supplies Shop
                </button>
              </div>
            </div>
            
          </div>
        </div>

        {/* PAYMENT MODAL (RETAINED FROM ORIGINAL IMPLEMENTATION) */}
        {showPaymentModal && (
           <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
              <div style={{ background: "white", borderRadius: "20px", width: "100%", maxWidth: "450px", padding: "35px", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.3)", animation: "slideUp 0.3s ease" }}>
                <FaTimes onClick={() => setShowPaymentModal(false)} style={{ position: "absolute", top: "20px", right: "20px", cursor: "pointer", color: "#999" }} />
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                   <div style={{ width: "70px", height: "70px", background: "#FDE9F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px", color: "#f43397" }}><FaCheckCircle size={35} /></div>
                   <h2 style={{ margin: 0, color: "#333" }}>Join Course</h2>
                   <p style={{ color: "#777", margin: "5px 0" }}>Unlock premium lessons & patterns</p>
                </div>
                <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "20px", marginBottom: "25px" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}><span style={{ color: "#666" }}>Course:</span><span style={{ fontWeight: "700", color: "#333" }}>{course.title}</span></div>
                   <label style={{ display: "block", marginBottom: "10px", color: "#666", fontSize: "14px" }}>Select Subscription Plan:</label>
                   <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[ { m: 1, p: course.price * 0.4 }, { m: 3, p: course.price * 0.75 }, { m: 6, p: course.price } ].map(plan => (
                         <div key={plan.m} onClick={() => setSelectedDuration(plan.m)} style={{ border: selectedDuration === plan.m ? "2px solid #f43397" : "1px solid #ddd", background: selectedDuration === plan.m ? "#FDE9F2" : "white", padding: "12px 15px", borderRadius: "10px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: "600" }}>{plan.m} {plan.m === 1 ? "Month" : "Months"} Access</span>
                            <span style={{ fontWeight: "800", color: "#f43397" }}>₹ {Math.round(plan.p)}</span>
                         </div>
                      ))}
                   </div>
                </div>
                <button onClick={processPayment} disabled={isPaying} style={{ width: "100%", background: "#f43397", color: "white", border: "none", padding: "16px", borderRadius: "12px", fontWeight: "800", fontSize: "16px", cursor: isPaying ? "not-allowed" : "pointer", opacity: isPaying ? 0.7 : 1 }}>
                  {isPaying ? "Processing Secure Payment..." : `Pay Now • Enjoy Content`}
                </button>
                <p style={{ textAlign: "center", fontSize: "12px", color: "#999", marginTop: "15px" }}>🔒 Secured with Razorpay Encryption</p>
              </div>
           </div>
        )}

      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .back-button:hover {
          color: #f43397 !important;
        }
      `}</style>
    </div>
  );
}
