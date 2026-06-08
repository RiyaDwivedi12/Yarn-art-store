import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useNotification } from "../context/NotificationContext";
import { API } from "../api";
import {
  FaUser,
  FaShoppingCart,
  FaMicrophone,
  FaHeart,
} from "react-icons/fa";


export default function Navbar() {
  const navigate = useNavigate();
  const { cartItems, wishlistItems, searchQuery, setSearchQuery } = useContext(CartContext);
  const { notify } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // 🎤 Voice Search (Cross-browser VERSION)
  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      notify("Voice search not supported in this browser", "error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setSearchQuery(text);
      if (window.location.pathname !== "/") {
        navigate("/");
      }
    };

    recognition.onerror = () => {
      notify("Voice recognition error. Try again.", "error");
    };
  };

  const handleMobileNav = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <div className="navbar-container">
        {/* LOGO & LINKS */}
        <div className="navbar-logo-links">
          <h2
            onClick={() => navigate("/")}
            style={{ color: "#ff3f6c", cursor: "pointer", margin: 0 }}
          >
            YarnArt
          </h2>
          <span 
            onClick={() => navigate("/learn")}
            className="navbar-nav-link"
          >
            🎓 Learn Crafting
          </span>
          <span 
            onClick={() => navigate("/supplies")}
            className="navbar-nav-link"
          >
            ✂️ DIY Supplies
          </span>
        </div>

        {/* SEARCH */}
        <div className="navbar-search-wrapper">
          <input
            id="searchInput"
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (window.location.pathname !== "/") {
                navigate("/");
              }
            }}
            style={{
              width: "100%",
              padding: "10px 40px 10px 15px",
              borderRadius: "25px",
              border: "1px solid #ddd",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {/* 🎤 MIC */}
          <FaMicrophone
            onClick={startVoice}
            style={{
              position: "absolute",
              right: "15px",
              top: "10px",
              cursor: "pointer",
              color: "#666",
            }}
          />
        </div>

        {/* RIGHT SIDE ICONS */}
        <div className="navbar-right-icons">
          
          {/* ❤️ WISHLIST */}
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => navigate("/wishlist")}>
            <FaHeart style={{ color: "#ff3f6c" }} />
            <span
              style={{
                position: "absolute",
                top: "-8px",
                right: "-10px",
                background: "red",
                color: "white",
                borderRadius: "50%",
                fontSize: "11px",
                padding: "2px 6px",
                minWidth: "auto",
                minHeight: "auto",
                lineHeight: "normal",
              }}
            >
              {wishlistItems?.length || 0}
            </span>
          </div>

          {/* 👤 PROFILE */}
          <FaUser
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer", minWidth: "auto", minHeight: "auto" }}
          />

          {/* 🛒 CART WITH BADGE */}
          <div
            onClick={() => navigate("/cart")}
            style={{ position: "relative", cursor: "pointer" }}
          >
            <FaShoppingCart />
           <span
              style={{
                position: "absolute",
                top: "-8px",
                right: "-10px",
                background: "red",
                color: "white",
                borderRadius: "50%",
                fontSize: "11px",
                padding: "2px 6px",
                minWidth: "auto",
                minHeight: "auto",
                lineHeight: "normal",
              }}
            >
              {cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0}
            </span>
          </div>

          {/* HAMBURGER BUTTON (mobile only, hidden on desktop via CSS) */}
          <button 
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      <div 
        className={`mobile-nav-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        style={{ display: mobileMenuOpen ? 'block' : 'none' }}
      />
      <div 
        className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`}
        ref={menuRef}
      >
        {/* Profile / App Header */}
        <div style={{ 
          background: "linear-gradient(135deg, #f43397, #ff527b)", 
          padding: "30px 20px 20px", 
          paddingTop: "max(30px, env(safe-area-inset-top))",
          color: "white",
          position: "relative",
          flexShrink: 0
        }}>
          <button 
            className="mobile-nav-close" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: "absolute", top: "max(15px, env(safe-area-inset-top))", right: "15px" }}
          >
            ✕
          </button>
          
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "10px" }}>
            <div style={{ width: "55px", height: "55px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "#f43397" }}>
              <FaUser />
            </div>
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "18px", fontWeight: "bold" }}>Welcome to YarnArt</h3>
              <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>Discover premium crafts</p>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: "10px 0" }}>
          <div className="mobile-nav-item" onClick={() => handleMobileNav("/")}>
            <div><span style={{ width: "35px", display: "inline-block", fontSize: "20px", verticalAlign: "middle" }}>🏠</span> Home</div>
            <span style={{ color: "#ccc" }}>›</span>
          </div>
          <div className="mobile-nav-item" onClick={() => handleMobileNav("/learn")}>
            <div><span style={{ width: "35px", display: "inline-block", fontSize: "20px", verticalAlign: "middle" }}>🎓</span> Learn Crafting</div>
            <span style={{ color: "#ccc" }}>›</span>
          </div>
          <div className="mobile-nav-item" onClick={() => handleMobileNav("/supplies")}>
            <div><span style={{ width: "35px", display: "inline-block", fontSize: "20px", verticalAlign: "middle" }}>✂️</span> DIY Supplies</div>
            <span style={{ color: "#ccc" }}>›</span>
          </div>
          
          <div style={{ height: "1px", background: "#f5f5f5", margin: "15px 0" }}></div>
          
          <div className="mobile-nav-item" onClick={() => handleMobileNav("/wishlist")}>
            <div><span style={{ width: "35px", display: "inline-block", fontSize: "20px", verticalAlign: "middle" }}>❤️</span> Wishlist</div>
            {wishlistItems?.length > 0 ? (
              <span style={{ background: "#ff3f6c", color: "white", padding: "2px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>{wishlistItems.length}</span>
            ) : <span style={{ color: "#ccc" }}>›</span>}
          </div>
          <div className="mobile-nav-item" onClick={() => handleMobileNav("/cart")}>
            <div><span style={{ width: "35px", display: "inline-block", fontSize: "20px", verticalAlign: "middle" }}>🛒</span> Cart</div>
            {cartItems?.length > 0 ? (
              <span style={{ background: "#ff3f6c", color: "white", padding: "2px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            ) : <span style={{ color: "#ccc" }}>›</span>}
          </div>
          <div className="mobile-nav-item" onClick={() => handleMobileNav("/profile")}>
            <div><span style={{ width: "35px", display: "inline-block", fontSize: "20px", verticalAlign: "middle" }}>👤</span> My Profile</div>
            <span style={{ color: "#ccc" }}>›</span>
          </div>
        </div>
        
        {/* Bottom App Footer */}
        <div style={{ padding: "15px", textAlign: "center", borderTop: "1px solid #f0f0f0", fontSize: "12px", color: "#aaa", paddingBottom: "max(15px, env(safe-area-inset-bottom))" }}>
          YarnArt Mobile App v1.0
        </div>
      </div>
    </>
  );
}