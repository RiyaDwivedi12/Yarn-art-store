import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { useNotification } from "../context/NotificationContext";
import { API } from "../api";

function Checkout() {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    landmark: "",
    phone: "",
    paymentMethod: "COD"
  });

  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user ? (user._id || user.id) : "guest";
    const saved = localStorage.getItem(`savedAddress_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
        setUseSavedAddress(true);
      } catch(e) {}
    }
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return notify("Your cart is empty!", "error");

    setPlacingOrder(true);
    await finalizeOrder("CASH_ON_DELIVERY");
  };

  const finalizeOrder = async (paymentId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user ? (user._id || user.id) : "guest";
      localStorage.setItem(`savedAddress_${userId}`, JSON.stringify({
        name: formData.name,
        address: formData.address,
        landmark: formData.landmark,
        phone: formData.phone
      }));

      const orderData = {
        userId: user._id,
        items: cartItems,
        total: totalAmount,
        paymentId,
        shippingAddress: `${formData.name}, ${formData.address}, ${formData.landmark}, Ph: ${formData.phone}`
      };

      await API.post("/order", orderData);

      clearCart();
      notify("Order Placed Successfully! 🎉 Welcome to the Yarn Art family!", "success");
      setTimeout(() => navigate("/profile"), 2000);

    } catch (error) {
      console.error(error);
      notify("Failed to place order. Please try again.", "error");
      setPlacingOrder(false);
    }
  };



  return (
    <div style={{ background: "#f9f9f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      
      <div className="responsive-flex-row" style={{ maxWidth: "1000px", margin: "40px auto", display: "flex", gap: "30px", flexWrap: "wrap", padding: "0 20px" }}>
        
        <div className="checkout-left" style={{ flex: "1 1 100%", minWidth: "280px", background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <h2 style={{ marginBottom: "5px", color: "#333" }}>Delivery Details</h2>
          <p style={{ color: "#777", marginBottom: "20px" }}>Where should we send your yarn art?</p>

          <form onSubmit={handlePlaceOrder} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {useSavedAddress ? (
              <div style={{ background: "#fdfdfd", border: "1px solid #eee", padding: "20px", borderRadius: "8px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontWeight: "bold", color: "#333", fontSize: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{color: "#f43397"}}>📍</span> Default Address
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setUseSavedAddress(false)}
                    style={{ background: "transparent", color: "#f43397", border: "1px solid #f43397", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    Change Address
                  </button>
                </div>
                <div style={{ color: "#555", fontSize: "15px", lineHeight: "1.5" }}>
                  <p style={{ margin: "0 0 4px", color: "#222", fontWeight: "bold" }}>{formData.name}</p>
                  <p style={{ margin: "0 0 4px" }}>{formData.address}</p>
                  {formData.landmark && <p style={{ margin: "0 0 4px" }}>Landmark: {formData.landmark}</p>}
                  <p style={{ margin: "0", fontWeight: "bold" }}>Phone: {formData.phone}</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", padding: "20px", background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: "8px" }}>
                <input required name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" style={{ padding: "14px", border: "1px solid #ddd", borderRadius: "8px", outline: "none", fontSize: "15px", background: "white" }} />
                <textarea required name="address" value={formData.address} onChange={handleInputChange} placeholder="Complete Delivery Address" rows="3" style={{ padding: "14px", border: "1px solid #ddd", borderRadius: "8px", outline: "none", resize: "none", fontSize: "15px", background: "white" }} />
                <input name="landmark" value={formData.landmark} onChange={handleInputChange} placeholder="Landmark (Optional)" style={{ padding: "14px", border: "1px solid #ddd", borderRadius: "8px", outline: "none", fontSize: "15px", background: "white" }} />
                <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="Phone Number" style={{ padding: "14px", border: "1px solid #ddd", borderRadius: "8px", outline: "none", fontSize: "15px", background: "white" }} />
              </div>
            )}

            <div style={{ borderTop: "1px solid #eee", paddingTop: "20px" }}>
              <h3 style={{ margin: "0 0 15px", fontSize: "18px", color: "#333" }}>Payment Method</h3>
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <label style={{ flex: "1", minWidth: "200px", border: "2px solid #f43397", background: "#FDE9F2", padding: "16px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                  <input type="radio" name="paymentMethod" value="COD" checked={true} readOnly style={{ accentColor: "#f43397", width: "18px", height: "18px" }}/>
                  <span>
                    <strong style={{ display: "block", color: "#333", fontSize: "15px" }}>Cash on Delivery</strong>
                    <span style={{ color: "#777", fontSize: "12px" }}>Pay when your order arrives</span>
                  </span>
                </label>
              </div>
            </div>

            <button disabled={placingOrder || cartItems.length === 0} type="submit" style={{ marginTop: "10px", padding: "18px", background: placingOrder ? "#f08fb7" : "#f43397", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: placingOrder ? "not-allowed" : "pointer" }}>
              {placingOrder ? "Placing Order..." : `Place Order • ₹${totalAmount}`}
            </button>
          </form>
        </div>

        <div className="checkout-right" style={{ flex: "1 1 300px", minWidth: "280px", background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", height: "fit-content" }}>
          <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>Order Summary</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#555" }}>
            <span>Items ({totalItems}):</span>
            <span>₹{totalAmount}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#555" }}>
            <span>Delivery Fee:</span>
            <span style={{ color: "green" }}>FREE</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "20px 0 10px", paddingTop: "15px", borderTop: "1px solid #eee", fontWeight: "bold", fontSize: "18px" }}>
            <span>Order Total:</span>
            <span style={{ color: "#b12704" }}>₹{totalAmount}</span>
          </div>
          <p style={{ fontSize: "12px", color: "#888", marginTop: "20px", textAlign: "center" }}>Safe and secure payments. 100% Authentic products.</p>
        </div>
      </div>
    </div>
  );
}

export default Checkout;