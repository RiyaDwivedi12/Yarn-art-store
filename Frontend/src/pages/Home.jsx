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
          <div style={{ background: "white", borderRadius: "12px", padding: "15px", border: "1px solid #f0f0f0", position: "sticky", top: "90px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
            <h3 style={{ margin: "0 0 15px", borderBottom: "1px solid #f0f0f0", paddingBottom: "10px", fontSize: "16px", color: "#333", textTransform: "uppercase" }}>Categories</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {categories.map((cat) => (
                <p
                  key={cat.name}
                  onClick={() => {
                    if (cat.name === "All") {
                      setSearchParams({});
                    } else {
                      setSearchParams({ category: cat.name });
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    padding: "10px 12px",
                    margin: "0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    background: selectedCategory === cat.name ? "#FDE9F2" : "transparent",
                    color: selectedCategory === cat.name ? "#f43397" : "#555",
                    fontWeight: selectedCategory === cat.name ? "bold" : "500",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => {
                    if (selectedCategory !== cat.name) {
                      e.target.style.background = "#fafafa";
                      e.target.style.color = "#333";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedCategory !== cat.name) {
                      e.target.style.background = "transparent";
                      e.target.style.color = "#555";
                    }
                  }}
                >
                  <span style={{marginRight: "8px", fontSize: "16px"}}>{cat.icon}</span> 
                  {cat.name}
                </p>
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
                  style={{
                    border: "1px solid #eaeaec",
                    borderRadius: "8px",
                    padding: "15px",
                    background: "#fff",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    WebkitTransition: "box-shadow 0.2s, transform 0.2s",
                    display: "flex",
                    flexDirection: "column"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src={p.image?.startsWith("http") ? p.image : `${BASE_URL}${p.image}`}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: "220px",
                        objectFit: "contain",
                        borderRadius: "8px",
                        backgroundColor: "#f9f9f9",
                        padding: "10px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <h4 style={{ margin: "15px 0 5px", fontSize: "16px", color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.name}
                  </h4>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "5px 0" }}>
                    <span style={{ fontWeight: "bold", fontSize: "22px", color: "#333" }}>₹{p.price}</span>
                    <span style={{ textDecoration: "line-through", color: "#999", fontSize: "14px" }}>₹{originalPrice}</span>
                    <span style={{ color: "#038d63", fontWeight: "bold", fontSize: "14px" }}>28% off</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", margin: "5px 0 10px" }}>
                    <span style={{ background: "#23bb75", color: "white", padding: "3px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                      4.2 ⭐
                    </span>
                    <span style={{ color: "#888", fontSize: "12px", marginLeft: "8px" }}>(123 Reviews)</span>
                  </div>

                  <div style={{ marginTop: "auto" }}>
                    <span style={{ 
                      background: "#f4f4f4", color: "#333", fontSize: "12px", 
                      padding: "4px 8px", borderRadius: "15px", display: "inline-block",
                      marginBottom: "10px", fontWeight: "bold"
                    }}>
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