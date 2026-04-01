import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useNotification } from "../context/NotificationContext";
import Navbar from "../components/Navbar";
import { BASE_URL } from "../api";

function Wishlist() {
  const { wishlistItems, removeFromWishlist, addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const { notify } = useNotification();

  return (
    <div style={{ background: "#f9f9f9", minHeight: "100vh", WebkitMinHeight: "-webkit-fill-available", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      
      <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h2 style={{ color: "#333", fontSize: "28px", margin: 0 }}>My Wishlist ❤️</h2>
          <span style={{ fontSize: "16px", color: "#666", fontWeight: "bold" }}>{wishlistItems.length} Items</span>
        </div>

        {wishlistItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>🤍</div>
            <h3 style={{ color: "#333", marginBottom: "15px" }}>Your wishlist is empty!</h3>
            <p style={{ color: "#777", marginBottom: "25px" }}>Save your favorite yarn art pieces here for later.</p>
            <button
              onClick={() => navigate("/")}
              style={{ padding: "12px 30px", background: "#f43397", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", transition: "background 0.2s" }}
              onMouseOver={(e) => e.target.style.background = "#d1227c"}
              onMouseOut={(e) => e.target.style.background = "#f43397"}
            >
              Discover Products
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {wishlistItems.map((item) => {
              const originalPrice = Math.floor(item.price * 1.4); // Simulate standard 40% markup discount styling

              return (
                <div
                  key={item._id || item.id}
                  style={{
                    border: "1px solid #eaeaec",
                    borderRadius: "8px",
                    padding: "15px",
                    background: "#fff",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    WebkitTransition: "box-shadow 0.2s, transform 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative"
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(item._id || item.id);
                    }}
                    title="Remove from Wishlist"
                    style={{
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                      background: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                      zIndex: 10,
                      color: "#888",
                      fontSize: "14px",
                      transition: "color 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.color = "#f43397"}
                    onMouseOut={(e) => e.target.style.color = "#888"}
                  >
                    ✕
                  </button>

                  <div 
                    style={{ position: "relative", cursor: "pointer" }}
                    onClick={() => navigate(`/product/${item._id || item.id}`)}
                  >
                    <img
                      src={item.image?.startsWith("http") ? item.image : `${BASE_URL}${item.image}`}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "220px",
                        objectFit: "contain",
                        borderRadius: "8px",
                        backgroundColor: "#f9f9f9",
                        padding: "10px"
                      }}
                    />
                  </div>

                  <div 
                    style={{ cursor: "pointer", flex: 1, display: "flex", flexDirection: "column" }}
                    onClick={() => navigate(`/product/${item._id || item.id}`)}
                  >
                    <h4 style={{ margin: "15px 0 5px", fontSize: "16px", color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.name}
                    </h4>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "5px 0" }}>
                      <span style={{ fontWeight: "bold", fontSize: "22px", color: "#333" }}>₹{item.price}</span>
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
                        marginBottom: "15px", fontWeight: "bold"
                      }}>
                        🚚 Free Delivery
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addToCart({ ...item, quantity: 1 });
                      removeFromWishlist(item._id || item.id);
                      notify("Successfully moved to Cart! 🛒", "success");
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#fff",
                      color: "#f43397",
                      border: "1px solid #f43397",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#f43397";
                      e.target.style.color = "#fff";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "#fff";
                      e.target.style.color = "#f43397";
                    }}
                  >
                    MOVE TO CART
                  </button>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
