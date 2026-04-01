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
        <button className="mobile-nav-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
        <div style={{ clear: 'both', paddingTop: '20px' }}>
          <h3 style={{ color: "#ff3f6c", margin: "0 0 20px 10px", fontSize: "22px" }}>YarnArt</h3>
          
          <div className="mobile-nav-item" onClick={() => handleMobileNav("/")}>
            🏠 Home
          </div>
          <div className="mobile-nav-item" onClick={() => handleMobileNav("/learn")}>
            🎓 Learn Crafting
          </div>
          <div className="mobile-nav-item" onClick={() => handleMobileNav("/supplies")}>
            ✂️ DIY Supplies
          </div>
          <div className="mobile-nav-item" onClick={() => handleMobileNav("/wishlist")}>
            ❤️ Wishlist ({wishlistItems?.length || 0})
          </div>
          <div className="mobile-nav-item" onClick={() => handleMobileNav("/cart")}>
            🛒 Cart ({cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0})
          </div>
          <div className="mobile-nav-item" onClick={() => handleMobileNav("/profile")}>
            👤 My Profile
          </div>
        </div>
      </div>
    </>
  );
}