import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { API } from "../api";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPlayCircle } from "react-icons/fa";

export default function Learn() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
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

  // Filter courses based on search query and category chip
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === "All" ||
      course.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from backend data
  const dynamicCategories = ["All", ...new Set(courses.map((c) => c.category).filter(Boolean))];

  const formatRelativeDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: "#0f0f0f" }}>
      <Navbar />

      {/* YOUTUBE-STYLE SEARCH HEADER */}
      <div style={{
        background: "#ffffff",
        borderBottom: "1px solid #e5e5e5",
        padding: "20px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "15px",
        position: "sticky",
        top: "60px", // assuming Navbar is 60px high
        zIndex: 10,
      }}>
        <div style={{ display: "flex", width: "100%", maxWidth: "600px", position: "relative" }}>
          <input
            type="text"
            placeholder="Search courses, instructors, or craft styles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 50px 12px 20px",
              fontSize: "15px",
              borderRadius: "40px",
              border: "1px solid #cccccc",
              outline: "none",
              background: "#f8f8f8",
              color: "#0f0f0f",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
              transition: "border-color 0.2s, background-color 0.2s"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#f43397";
              e.target.style.backgroundColor = "#ffffff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#cccccc";
              e.target.style.backgroundColor = "#f8f8f8";
            }}
          />
          <button style={{
            position: "absolute",
            right: "5px",
            top: "5px",
            bottom: "5px",
            width: "50px",
            border: "none",
            background: "transparent",
            color: "#606060",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <FaSearch size={16} />
          </button>
        </div>

        {/* CATEGORY CHIPS */}
        <div style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          width: "100%",
          maxWidth: "1000px",
          padding: "5px 0",
          scrollbarWidth: "none", // Firefox
          WebkitOverflowScrolling: "touch",
        }} className="category-scroll-container">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? "#0f0f0f" : "#f2f2f2",
                color: selectedCategory === cat ? "#ffffff" : "#0f0f0f",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== cat) e.target.style.background = "#e5e5e5";
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== cat) e.target.style.background = "#f2f2f2";
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* VIDEO GRID CONTAINER */}
      <div style={{ padding: "30px 40px", maxWidth: "1500px", margin: "0 auto" }}>
        
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
            <div className="spinner" style={{ border: "4px solid rgba(0, 0, 0, 0.1)", width: "36px", height: "36px", borderRadius: "50%", borderLeftColor: "#f43397", animation: "spin 1s linear infinite" }}></div>
            <p style={{ marginTop: "15px", color: "#606060", fontSize: "14px" }}>Loading recommended courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <h3 style={{ fontSize: "20px", color: "#0f0f0f", margin: "0 0 10px" }}>No courses found</h3>
            <p style={{ color: "#606060" }}>Try checking your spelling or adjusting your filters.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            columnGap: "16px",
            rowGap: "40px",
          }}>
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                onClick={() => navigate(`/course/${course._id}`)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  transition: "opacity 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {/* 16:9 Thumbnail Container */}
                <div style={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "56.25%", // 16:9 ratio
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "#f0f0f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}>
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease"
                    }}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/600x400/f43397/ffffff?text=Course+Thumbnail";
                    }}
                  />

                  {/* Play icon overlay on hover */}
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.2s"
                  }}
                  className="play-overlay"
                  onMouseEnter={(e) => e.target.style.opacity = 1}
                  onMouseLeave={(e) => e.target.style.opacity = 0}
                  >
                    <FaPlayCircle size={45} color="white" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }} />
                  </div>

                  {/* Duration Overlay */}
                  <div style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    background: "rgba(0, 0, 0, 0.8)",
                    color: "white",
                    padding: "3px 6px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.5px"
                  }}>
                    {course.duration || 6} Months
                  </div>

                  {/* Free / Premium Badge */}
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    background: course.type === "free" ? "#10b981" : "#f43397",
                    color: "white",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textTransform: "uppercase"
                  }}>
                    {course.type === "free" ? "Free" : `Premium`}
                  </div>
                </div>

                {/* Metadata Row */}
                <div style={{ display: "flex", gap: "12px", padding: "0 4px" }}>
                  {/* Channel/Creator Avatar */}
                  <div style={{ flexShrink: 0 }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #f43397, #ff9eb5)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "14px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                    }}>
                      {course.author ? course.author.charAt(0).toUpperCase() : "Y"}
                    </div>
                  </div>

                  {/* Video Text Metadata */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexGrow: 1 }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: "600",
                      lineHeight: "1.4",
                      color: "#0f0f0f",
                      display: "-webkit-box",
                      WebkitLineClamp: "2",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {course.title}
                    </h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", fontSize: "13px", color: "#606060" }}>
                      <span style={{ fontWeight: "500" }}>{course.author || "Yarn Art Store"}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <span>{course.views || 0} views</span>
                        <span>•</span>
                        <span>{formatRelativeDate(course.createdAt)}</span>
                      </div>
                      {course.type !== "free" && (
                        <span style={{ color: "#f43397", fontWeight: "600", marginTop: "2px" }}>₹{course.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple style injected for spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .category-scroll-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
