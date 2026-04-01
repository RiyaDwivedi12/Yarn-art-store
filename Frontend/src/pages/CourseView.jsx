import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API } from "../api";
import { UserContext } from "../context/UserContext";
import { FaHeart, FaRegHeart, FaPaperPlane, FaUserCircle, FaTrashAlt, FaLock, FaCheckCircle, FaTimes } from "react-icons/fa";
import { useNotification } from "../context/NotificationContext";

export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { notify } = useNotification();
  const [course, setCourse] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(6);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
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
                   setIsEnrolled(true);
                   setIsUnlocked(true);
                }
             });
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id, user]);

  const trackEnrollment = async (userId, courseId, paymentId = null, duration = null) => {
    try {
      const res = await API.post("/course/enroll", { 
        userId, 
        courseId, 
        paymentId, 
        duration: duration || course.duration 
      });
      if (res.data.enrollment) {
        setIsEnrolled(true);
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
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      notify("Failed to delete comment.", "error");
    }
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

    // Fallback: just append the input as is
    return `https://www.youtube.com/embed/${input.split('/').pop().split('?')[0]}`;
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "100px", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div className="spinner" style={{ margin: "50px auto" }}></div>
      <p>Loading course content...</p>
    </div>
  );

  if (!course) return (
    <div style={{ textAlign: "center", padding: "100px", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <h2>Course not found</h2>
      <button onClick={() => navigate("/learn")}>Back to Courses</button>
    </div>
  );

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", fontFamily: "'Inter', sans-serif", position: "relative" }}>
      <Navbar />
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ background: "white", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.1)", marginBottom: "40px" }}>
          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            {!isUnlocked ? (
               <div style={{ position: "absolute", top:0, left:0, width:"100%", height:"100%", background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 5, color: "white", textAlign: "center", padding: "20px" }}>
                  <FaLock size={50} style={{ marginBottom: "20px", color: "#f43397" }} />
                  <h2 style={{ margin: "0 0 10px" }}>Premium Course Locked</h2>
                  <p style={{ maxWidth: "400px", margin: "0 0 25px", opacity: 0.8 }}>This is an expert-led course. Unlock all lessons and exclusive patterns for a one-time fee.</p>
                  <button onClick={handleUnlock} style={{ background: "#f43397", color: "white", border: "none", padding: "15px 40px", borderRadius: "30px", fontWeight: "800", fontSize: "16px", cursor: "pointer", boxShadow: "0 10px 20px rgba(244, 51, 151, 0.3)" }}>Unlock for ₹{course.price}</button>
               </div>
            ) : null}
            
            {showPaymentModal && (
               <div style={{ position: "fixed", top:0, left:0, width:"100%", height:"100%", background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
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

            <iframe src={getEmbedUrl(course.playlistId)} title={course.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", filter: isUnlocked ? "none" : "blur(10px)" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
          </div>
          
          <div style={{ padding: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
              <div style={{ flex: "1", minWidth: "300px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ background: course.type === "free" ? "#e8f5e9" : "#fff0f6", color: course.type === "free" ? "#2e7d32" : "#f43397", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>{course.type}</span>
                  <span style={{ color: "#666", fontSize: "14px" }}>• {course.category}</span>
                </div>
                <h1 style={{ margin: "0 0 15px", fontSize: "32px", fontWeight: "800", color: "#1a1a1a" }}>{course.title}</h1>
                <p style={{ color: "#4a4a4a", lineHeight: "1.8", fontSize: "16px", margin: 0 }}>{course.description}</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <button onClick={handleLike} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "30px", border: isLiked ? "none" : "1px solid #ddd", background: isLiked ? "#f43397" : "white", color: isLiked ? "white" : "#333", fontWeight: "700", cursor: "pointer", transition: "all 0.3s ease", boxShadow: isLiked ? "0 4px 15px rgba(244, 51, 151, 0.3)" : "none" }}>
                  {isLiked ? <FaHeart /> : <FaRegHeart />}
                  {likesCount} {likesCount === 1 ? "Like" : "Likes"}
                </button>
                <div style={{ color: "#666", fontSize: "14px", fontWeight: "500" }}>{isEnrolled ? "✓ Enrolled" : "Not Enrolled"}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "40px", alignItems: "start" }}>
          <div style={{ background: "white", borderRadius: "24px", padding: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 25px", fontSize: "22px", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>Discussion ({comments.length})</h3>
            <form onSubmit={handleComment} style={{ display: "flex", gap: "15px", marginBottom: "40px" }}>
              <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#f43397", fontSize: "24px" }}><FaUserCircle /></div>
              <div style={{ flex: 1, position: "relative" }}>
                <textarea placeholder="Share your thoughts or ask a question..." value={newComment} onChange={(e) => setNewComment(e.target.value)} style={{ width: "100%", padding: "15px 50px 15px 15px", borderRadius: "12px", border: "1px solid #eee", background: "#fbfbfb", minHeight: "80px", outline: "none", fontFamily: "inherit", resize: "none", boxSizing: "border-box", fontSize: "15px" }}></textarea>
                <button type="submit" style={{ position: "absolute", right: "15px", bottom: "15px", background: "#f43397", color: "white", border: "none", width: "35px", height: "35px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }}><FaPaperPlane size={14} /></button>
              </div>
            </form>
            <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>No comments yet. Be the first to start the conversation!</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} style={{ display: "flex", gap: "15px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#fdf2f7", display: "flex", alignItems: "center", justifyContent: "center", color: "#f43397" }}><FaUserCircle size={28} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontWeight: "700", fontSize: "15px", color: "#333" }}>{comment.userId?.email?.split('@')[0] || "Anonymous Master"}</span>
                          <span style={{ color: "#999", fontSize: "12px" }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        {(user?.role === 'admin' || user?._id === (comment.userId?._id || comment.userId)) && (
                           <FaTrashAlt onClick={() => handleDeleteComment(comment._id)} style={{ color: "#ff4d4d", cursor: "pointer", fontSize: "14px" }} title="Delete comment" />
                        )}
                      </div>
                      <p style={{ margin: 0, color: "#555", lineHeight: "1.5", fontSize: "15px" }}>{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ background: "white", borderRadius: "24px", padding: "25px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
             <h4 style={{ margin: "0 0 15px", color: "#888", fontSize: "14px", textTransform: "uppercase" }}>Meet Your Instructor</h4>
             <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", border: "2px solid #f43397" }}>
                  <img src="/src/assets/admin_dp.png" alt="Instructor" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.src = "https://i.pravatar.cc/100?u=instructor"; }} />
                </div>
                <div>
                  <div style={{ fontWeight: "800", color: "#333" }}>{course?.author || "Yarn Artist"}</div>
                  <div style={{ fontSize: "13px", color: "#f43397" }}>Artist & Educator</div>
                </div>
             </div>
             <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6", marginBottom: "25px" }}>Learn from years of craftsmanship experience. All tutorials are designed to be clear and easy to follow.</p>
             <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "20px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}><span style={{ color: "#888" }}>Difficulty</span><span style={{ color: "#333", fontWeight: "600" }}>All Levels</span></div>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}><span style={{ color: "#888" }}>Language</span><span style={{ color: "#333", fontWeight: "600" }}>English / Hindi</span></div>
               <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}><span style={{ color: "#888" }}>Total Lessons</span><span style={{ color: "#333", fontWeight: "600" }}>Multiple Videos</span></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
