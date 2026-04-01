import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { BASE_URL } from "../api";

function Cart() {
  const { cartItems, removeFromCart, increaseQty, decreaseQty } = useContext(CartContext);
  const navigate = useNavigate();

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div style={{ background: "#f9f9f9", minHeight: "100vh", WebkitMinHeight: "-webkit-fill-available", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      
      <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
        <h2 style={{ marginBottom: "25px", color: "#333", fontSize: "28px" }}>Shopping Cart</h2>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>🛒</div>
            <h3 style={{ color: "#333", marginBottom: "15px" }}>Your cart is empty!</h3>
            <p style={{ color: "#777", marginBottom: "25px" }}>Looks like you haven't added anything to your cart yet.</p>
            <button
              onClick={() => navigate("/")}
              style={{ padding: "12px 30px", background: "#f43397", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", transition: "background 0.2s" }}
              onMouseOver={(e) => e.target.style.background = "#d1227c"}
              onMouseOut={(e) => e.target.style.background = "#f43397"}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "30px", flexDirection: "row", flexWrap: "wrap" }}>

            {/* LEFT SIDE - ITEMS */}
            <div style={{ flex: "1 1 600px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {cartItems.map((item) => {
                const itemId = item._id || item.id;
                const originalPrice = Math.floor(item.price * 1.4); // 40% mockup markup
                return (
                  <div
                    key={itemId}
                    style={{ display: "flex", gap: "20px", background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", alignItems: "flex-start", border: "1px solid #f0f0f0" }}
                  >
                    <img
                      src={item.image?.startsWith('http') ? item.image : `${BASE_URL}${item.image}`}
                      alt={item.name}
                      style={{ width: "120px", height: "120px", objectFit: "contain", borderRadius: "8px", backgroundColor: "#f9f9f9", padding: "10px", border: "1px solid #eee", boxSizing: "border-box", flexShrink: 0 }}
                    />

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      <h3 style={{ margin: "0", color: "#333", fontSize: "18px" }}>{item.name}</h3>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: "bold", fontSize: "20px", color: "#333" }}>₹{item.price}</span>
                        <span style={{ textDecoration: "line-through", color: "#999", fontSize: "14px" }}>₹{originalPrice}</span>
                        <span style={{ color: "#038d63", fontWeight: "bold", fontSize: "14px" }}>28% off</span>
                      </div>

                      <span style={{ color: "#888", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
                        ✅ In Stock
                      </span>

                      {/* ACTIONS */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", flexWrap: "wrap", gap: "15px" }}>
                        
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "6px", overflow: "hidden" }}>
                          <button
                            onClick={() => decreaseQty(itemId)}
                            style={{ padding: "8px 15px", background: "#fafafa", border: "none", cursor: "pointer", fontSize: "16px", color: "#555" }}
                          >−</button>
                          <span style={{ padding: "8px 20px", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd", fontWeight: "bold", background: "#fff" }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQty(itemId)}
                            style={{ padding: "8px 15px", background: "#fafafa", border: "none", cursor: "pointer", fontSize: "16px", color: "#555" }}
                          >+</button>
                        </div>

                        <button
                          onClick={() => removeFromCart(itemId)}
                          style={{ background: "transparent", color: "#f43397", border: "none", fontWeight: "bold", cursor: "pointer", padding: "8px", fontSize: "14px", transition: "color 0.2s" }}
                          onMouseOver={(e) => e.target.style.color = "#d1227c"}
                          onMouseOut={(e) => e.target.style.color = "#f43397"}
                        >
                          REMOVE
                        </button>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT SIDE - SUMMARY */}
            <div style={{ flex: "1 1 350px" }}>
              <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", position: "sticky", top: "100px", border: "1px solid #f0f0f0" }}>
                <h3 style={{ margin: "0 0 20px", borderBottom: "1px solid #eee", paddingBottom: "15px", color: "#333" }}>
                  Price Details
                </h3>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", color: "#555" }}>
                  <span>Price ({totalItems} items)</span>
                  <span>₹{Math.floor(totalAmount * 1.4)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", color: "#555" }}>
                  <span>Discount</span>
                  <span style={{ color: "#038d63" }}>− ₹{Math.floor(totalAmount * 1.4) - totalAmount}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", color: "#555" }}>
                  <span>Delivery Charges</span>
                  <span style={{ color: "#038d63" }}>FREE</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", margin: "25px 0 20px", paddingTop: "20px", borderTop: "1px dashed #ddd", fontWeight: "bold", fontSize: "20px", color: "#333" }}>
                  <span>Total Amount</span>
                  <span>₹{totalAmount}</span>
                </div>

                <p style={{ color: "#038d63", fontSize: "14px", fontWeight: "bold", marginBottom: "25px" }}>
                  You will save ₹{Math.floor(totalAmount * 1.4) - totalAmount} on this order
                </p>

                <button
                  onClick={() => navigate("/checkout")}
                  style={{ width: "100%", padding: "16px", background: "#f43397", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", transition: "background 0.2s" }}
                  onMouseOver={(e) => e.target.style.background = "#d1227c"}
                  onMouseOut={(e) => e.target.style.background = "#f43397"}
                >
                  Proceed to Checkout
                </button>
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "20px", color: "#888", fontSize: "12px" }}>
                  <span>🛡️ Safe and Secure Payments. Easy returns.</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;