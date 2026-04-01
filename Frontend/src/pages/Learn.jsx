import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function Learn() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/course")
      .then((res) => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ background: "#fcfcfc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* HERO SECTION */}
      <div style={{ 
        background: "linear-gradient(135deg, #f43397, #ff9eb5)", 
        color: "white", 
        padding: "60px 20px", 
        textAlign: "center",
        boxShadow: "inset 0 -50px 50px -50px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px"
      }}>
        <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: "white", padding: "4px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
           <img src="/src/assets/admin_dp.png" alt="Store Logo" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} onError={(e) => { e.target.src = "https://i.pravatar.cc/100?u=yarnart"; }} />
        </div>
        <div>
          <h1 style={{ fontSize: "42px", margin: "0 0 10px", fontWeight: "800" }}>Learn Yarn Crafting</h1>
          <p style={{ fontSize: "18px", maxWidth: "700px", margin: "0 auto", opacity: 0.95, lineHeight: "1.6" }}>
            Master the art of yarn with our professional course library. From absolute basic to advanced patterns, curated by experts.
          </p>
        </div>
      </div>

      <div style={{ padding: "60px 40px", maxWidth: "1300px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <h2 style={{ color: "#2d2d2d", fontSize: "32px", fontWeight: "700", margin: 0 }}>
            Available Courses
          </h2>
          <div style={{ fontSize: "16px", color: "#666" }}>
            Showing {courses.length} high-quality courses
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "100px" }}>
            <div className="spinner"></div>
            <p>Loading your learning journey...</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "30px" 
          }}>
            {courses.map((course) => (
              <div 
                key={course._id} 
                onClick={() => navigate(`/course/${course._id}`)}
                style={{ 
                  background: "white", 
                  borderRadius: "20px", 
                  overflow: "hidden", 
                  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                  position: "relative",
                  border: "1px solid #eee"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.05)";
                }}
              >
                {/* Course Type Badge */}
                <div style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  background: course.type === "free" ? "#4caf50" : "#f43397",
                  color: "white",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  zIndex: 2,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                }}>
                  {course.type.toUpperCase()}
                </div>

                <div style={{ height: "200px", overflow: "hidden" }}>
                  <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                <div style={{ padding: "25px" }}>
                  <div style={{ color: "#f43397", fontSize: "14px", fontWeight: "600", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {course.category}
                  </div>
                  <h3 style={{ margin: "0 0 12px", color: "#2d2d2d", fontSize: "20px", fontWeight: "700", lineHeight: "1.4" }}>
                    {course.title}
                  </h3>
                  <p style={{ color: "#666", fontSize: "15px", margin: "0 0 20px", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.6" }}>
                    {course.description}
                  </p>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0", paddingTop: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       <span style={{ fontSize: "18px", fontWeight: "700", color: "#2d2d2d" }}>
                         {course.type === "free" ? "FREE" : `₹${course.price}`}
                       </span>
                    </div>
                    <button style={{ 
                      background: "transparent", 
                      color: "#f43397", 
                      border: "2px solid #f43397",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#f43397";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.color = "#f43397";
                    }}
                    >
                      View Course
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
