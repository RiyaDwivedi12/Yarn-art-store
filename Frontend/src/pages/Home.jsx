import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { API, BASE_URL } from "../api";

function Home() {
  const { searchQuery } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "All";
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/product")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, []);

  const filteredProducts = products.filter((p) => {
    // Exclude DIY Supplies from Home.js entirely, as they have their own dedicated page
    if (p.category === "DIY Supplies") return false;

    return (
      (selectedCategory === "All" || p.category === selectedCategory) &&
      p.name.toLowerCase().includes((searchQuery || "").toLowerCase())
    );
  });

  const categories = [
    { name: "All", icon: "🌐" },
    { name: "Crochet Toys", icon: "🧸" },
    { name: "Yarn Flowers", icon: "🌸" },
    { name: "Yarn Bags", icon: "👜" },
    { name: "Keychains", icon: "🔑" },
    { name: "Sweaters", icon: "🧥" },
    { name: "Home Decor", icon: "🏠" }
  ];

  return (
    <div style={{ background: "#FDE9F2", minHeight: "100vh", WebkitMinHeight: "-webkit-fill-available", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* Hero Banner Area */}
      <div className="hero-banner">
        <div>
          <h1>Lowest Prices</h1>
          <h2>Best Quality Yarn Art</h2>
          <div className="hero-badges" style={{ display: "flex", gap: "20px", fontSize: "1rem", fontWeight: "bold", flexWrap: "wrap" }}>
            <span style={{ background: "white", color: "black", padding: "8px 15px", borderRadius: "20px" }}>🚚 Free Delivery</span>
            <span style={{ background: "white", color: "black", padding: "8px 15px", borderRadius: "20px" }}>🛡️ 100% Safe</span>
            <span style={{ background: "white", color: "black", padding: "8px 15px", borderRadius: "20px" }}>↩️ Easy Returns</span>
          </div>
        </div>
        <div style={{ fontSize: "5rem", flexShrink: 0, WebkitFlexShrink: 0 }}>🌸</div>
      </div>

      <div className="main-flex-container">
        
        {/* LEFT FILTER SIDEBAR */}
        <div className="sidebar-wrapper">
          <div className="sidebar-inner" style={{ position: "sticky", top: "90px" }}>
            <h3>Categories</h3>
            <div className="category-list">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => {
                    if (cat.name === "All") {
                      setSearchParams({});
                    } else {
                      setSearchParams({ category: cat.name });
                    }
                  }}
                  className={`category-item ${selectedCategory === cat.name ? 'active' : ''}`}
                >
                  <div className="category-icon">{cat.icon}</div> 
                  <span className="category-name">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PRODUCT SECTION */}
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: "20px", color: "#333" }}>Products For You</h2>

          <div className="product-grid">
            {filteredProducts.map((p) => {
              const originalPrice = Math.floor(p.price * 1.4); // Simulate a 40% markup for "original" discount
              return (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="product-card"
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src={p.image?.startsWith("http") ? p.image : `${BASE_URL}${p.image}`}
                      alt={p.name}
                      className="product-image"
                    />
                  </div>

                  <h4 className="product-title">
                    {p.name}
                  </h4>

                  <div className="product-price-row">
                    <span className="product-price">₹{p.price}</span>
                    <span className="product-original-price">₹{originalPrice}</span>
                    <span className="product-discount">28% off</span>
                  </div>

                  <div className="product-rating-row">
                    <span style={{ background: "#23bb75", color: "white", padding: "3px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                      4.2 ⭐
                    </span>
                    <span style={{ color: "#888", fontSize: "12px", marginLeft: "8px" }}>(123 Reviews)</span>
                  </div>

                  <div style={{ marginTop: "auto" }}>
                    <span className="product-delivery-badge">
                      🚚 Free Delivery
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;