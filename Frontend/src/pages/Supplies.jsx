import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { API, BASE_URL } from "../api";

export default function Supplies() {
  const [supplies, setSupplies] = useState([]);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/products")
      .then((res) => res.data)
      .then((data) => {
        // Filter out only DIY Supplies exactly as Admin uploaded them!
        const diyItems = data.filter(item => item.category === "DIY Supplies");
        setSupplies(diyItems);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div style={{ background: "#FDE9F2", minHeight: "100vh", WebkitMinHeight: "-webkit-fill-available", fontFamily: "'Inter', sans-serif", paddingBottom: "50px" }}>
      <Navbar />

      <div style={{ background: "white", padding: "40px 20px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
        <h1 style={{ fontSize: "36px", color: "#f43397", margin: "0 0 10px" }}>✂️ DIY Crafting Supplies</h1>
        <p style={{ fontSize: "16px", color: "#555", maxWidth: "600px", margin: "0 auto" }}>
          Explore our premium collection of raw materials. From soft wools to professional crochet hooks and pins, grab exactly what you need to create your own masterpieces!
        </p>
      </div>

      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        
        <div className="product-grid">
          {supplies.map((item) => {
            const originalPrice = item.price ? Math.floor(item.price * 1.4) : item.price;
            return (
            <div
              key={item._id}
              className="product-card"
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(244, 51, 151, 0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              onClick={() => navigate(`/product/${item._id || item.id}`)}
            >
               <img src={item.image?.startsWith("http") ? item.image : `${BASE_URL}${item.image}`} alt={item.name} className="product-image" />
               
               <h3 className="product-title" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginTop: 0 }}>{item.name}</h3>
               <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#777", flex: 1, display: "none" }}>Premium quality raw materials.</p>
               
               <div className="product-price-row">
                  <span className="product-price">₹{item.price}</span>
                  <span className="product-original-price">₹{originalPrice}</span>
                  <span className="product-discount">Save ~28%</span>
               </div>

               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", flexWrap: "wrap", gap: "10px" }}>
                  <div className="product-rating-row" style={{ margin: 0 }}>
                     <span style={{ background: "#23bb75", color: "white", padding: "3px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>4.8 ⭐</span>
                     <span style={{ fontSize: "12px", color: "#888", marginLeft: "5px" }}>(150+)</span>
                  </div>
                  <button 
                     onClick={(e) => {
                         e.stopPropagation();
                         addToCart({ ...item, id: item._id || item.id, quantity: 1 });
                     }}
                     style={{ background: "#f43397", color: "white", border: "none", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s", fontSize: "13px" }} 
                     onMouseOver={(e) => e.currentTarget.style.background = "#d1227c"} 
                     onMouseOut={(e) => e.currentTarget.style.background = "#f43397"}
                  >
                     Add to Cart
                  </button>
               </div>
            </div>
          )})}
        </div>

      </div>
    </div>
  );
}
