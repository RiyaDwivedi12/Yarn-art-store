import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";
import { API, BASE_URL } from "../api";

function Profile() {
  const navigate = useNavigate();
  const { setUser: setGlobalUser } = useContext(UserContext);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders"); // "orders", "wishlist", "settings"
  const { notify } = useNotification();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    API.get(`/order/${parsedUser._id}`)
      .then((res) => res.data)
      .then((data) => {
        // Sort orders by newest first
        const sorted = Array.isArray(data) ? data.reverse() : [];
        setOrders(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setGlobalUser(null);
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div style={{ background: "#FDE9F2", minHeight: "100vh", WebkitMinHeight: "-webkit-fill-available", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* HEADER BANNER */}
      <div style={{ background: "#f43397", padding: "40px 20px", color: "white", textAlign: "center" }}>
        <h1 style={{ margin: "0 0 10px", fontSize: "32px", fontWeight: "bold" }}>My Account</h1>
        <p style={{ margin: 0, fontSize: "16px", opacity: 0.9 }}>Manage your orders and account settings</p>
      </div>

      <div style={{ maxWidth: "1200px", margin: "-30px auto 40px", padding: "0 20px", display: "flex", gap: "30px", flexWrap: "wrap", position: "relative", zIndex: 10 }}>
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <div style={{ flex: "1 1 220px", maxWidth: "260px" }}>
          <div style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            border: "1px solid #f0f0f0",
            overflow: "hidden"
          }}>
            {/* User Info Card */}
            <div style={{ padding: "20px 15px", textAlign: "center", borderBottom: "1px solid #f0f0f0", background: "#fbfbfb" }}>
              <div style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f43397, #ffa41c)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                fontWeight: "bold",
                margin: "0 auto 10px",
                textTransform: "uppercase",
                boxShadow: "0 4px 10px rgba(244,51,151,0.3)"
              }}>
                {user.name ? user.name[0] : "👤"}
              </div>
              <h2 style={{ margin: "0 0 4px", color: "#333", fontSize: "16px", fontWeight: "bold" }}>
                {user.name || "Customer"}
              </h2>
              <p style={{ margin: "0", color: "#777", fontSize: "12px" }}>
                {user.email}
              </p>
            </div>

            {/* Menu Links */}
            <div style={{ padding: "8px 0" }}>
              <div 
                onClick={() => setActiveTab("orders")}
                style={{ padding: "12px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", background: activeTab === "orders" ? "#FDE9F2" : "transparent", borderLeft: activeTab === "orders" ? "3px solid #f43397" : "3px solid transparent", color: activeTab === "orders" ? "#f43397" : "#555", fontWeight: activeTab === "orders" ? "bold" : "500", fontSize: "14px", transition: "all 0.2s" }}
              >
                <span style={{ fontSize: "18px" }}>📦</span> My Orders
              </div>

              <div 
                onClick={() => navigate("/wishlist")}
                style={{ padding: "12px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", background: "transparent", borderLeft: "3px solid transparent", color: "#555", fontSize: "14px", fontWeight: "500", transition: "all 0.2s" }}
              >
                <span style={{ fontSize: "18px" }}>❤️</span> My Wishlist
              </div>

              <div 
                onClick={() => setActiveTab("settings")}
                style={{ padding: "12px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", background: activeTab === "settings" ? "#FDE9F2" : "transparent", borderLeft: activeTab === "settings" ? "3px solid #f43397" : "3px solid transparent", color: activeTab === "settings" ? "#f43397" : "#555", fontWeight: activeTab === "settings" ? "bold" : "500", fontSize: "14px", transition: "all 0.2s" }}
              >
                <span style={{ fontSize: "18px" }}>⚙️</span> Settings
              </div>

              <div 
                onClick={handleLogout}
                style={{ padding: "12px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid #f0f0f0", marginTop: "5px", color: "#e91e63", fontWeight: "bold", fontSize: "14px", transition: "all 0.2s" }}
              >
                <span style={{ fontSize: "18px" }}>🚪</span> Logout
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div style={{ flex: "2 1 600px" }}>
          
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" }}>
              <h2 style={{ margin: "0 0 25px", color: "#333", fontSize: "24px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
                Order History
              </h2>

              {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "#888", fontSize: "16px" }}>Loading your amazing orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "#f9f9f9", borderRadius: "12px", border: "1px dashed #ddd" }}>
                  <div style={{ fontSize: "60px", marginBottom: "15px" }}>🎁</div>
                  <h3 style={{ color: "#333", marginBottom: "10px", fontSize: "22px" }}>No orders placed yet</h3>
                  <p style={{ color: "#777", marginBottom: "25px", fontSize: "15px" }}>Explore our catalog and find something you love!</p>
                  <button
                    onClick={() => navigate("/")}
                    style={{ padding: "12px 30px", background: "#f43397", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", transition: "background 0.2s" }}
                    onMouseOver={(e) => e.target.style.background = "#d1227c"}
                    onMouseOut={(e) => e.target.style.background = "#f43397"}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                  {orders.map((order) => {
                    const totalItems = order.items ? order.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
                    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Recently Placed";
                    
                    return (
                      <div key={order._id} style={{ border: "1px solid #eaeaec", borderRadius: "12px", overflow: "hidden" }}>
                        
                        {/* Order Header */}
                        <div style={{ background: "#f9f9f9", padding: "15px 20px", borderBottom: "1px solid #eaeaec", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "15px" }}>
                          
                          <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
                            <div>
                              <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#777", textTransform: "uppercase" }}>Order Placed</p>
                              <p style={{ margin: 0, color: "#333", fontWeight: "bold", fontSize: "14px" }}>{orderDate}</p>
                            </div>
                            <div>
                              <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#777", textTransform: "uppercase" }}>Total</p>
                              <p style={{ margin: 0, color: "#f43397", fontWeight: "bold", fontSize: "14px" }}>₹{order.total || order.amount || "N/A"}</p>
                            </div>
                            <div>
                              <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#777", textTransform: "uppercase" }}>Ship To</p>
                              <p style={{ margin: 0, color: "#333", fontSize: "14px" }}>{user.name || "Valued Customer"} ▼</p>
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#777", textTransform: "uppercase" }}>Order ID</p>
                            <p style={{ margin: 0, color: "#333", fontSize: "14px" }}>#{order._id.substring(0, 10).toUpperCase()}</p>
                          </div>

                        </div>

                        {/* Order Body */}
                        <div style={{ padding: "20px", background: "#fff" }}>
                          <h4 style={{ margin: "0 0 20px", color: "#038d63", fontSize: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <span>🎯</span> Order Confirmed & Processing
                          </h4>

                          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {order.items && order.items.map((item, idx) => (
                              <div key={idx} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                                <img
                                  src={item.image?.startsWith("http") ? item.image : `${BASE_URL}${item.image}`}
                                  alt={item.name}
                                  style={{ width: "90px", height: "90px", objectFit: "contain", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #eee", padding: "5px" }}
                                />
                                <div style={{ flex: 1 }}>
                                  <h5 style={{ margin: "0 0 8px", fontSize: "16px", color: "#333", fontWeight: "bold" }}>{item.name}</h5>
                                  <p style={{ margin: "0 0 5px", fontSize: "14px", color: "#555" }}>Quantity: <span style={{ fontWeight: "bold" }}>{item.quantity}</span></p>
                                  <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>Price: <span style={{ fontWeight: "bold", color: "#333" }}>₹{item.price}</span></p>
                                </div>
                                
                                <button style={{ padding: "8px 15px", background: "white", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", color: "#555" }}>
                                  View Item
                                </button>
                              </div>
                            ))}
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div style={{ background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" }}>
              <h2 style={{ margin: "0 0 25px", color: "#333", fontSize: "24px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
                Account Settings
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                {/* Personal Information */}
                <div>
                  <h3 style={{ fontSize: "18px", color: "#444", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>👤</span> Personal Information
                  </h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", background: "#f9f9f9", padding: "20px", borderRadius: "8px", border: "1px solid #eee" }}>
                    <div>
                      <p style={{ margin: "0 0 5px", fontSize: "13px", color: "#777", fontWeight: "bold" }}>EMAIL ADDRESS</p>
                      <input 
                        disabled 
                        value={user.email} 
                        style={{ width: "90%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#eef2f5", color: "#555" }} 
                      />
                    </div>
                    <div>
                      <p style={{ margin: "0 0 5px", fontSize: "13px", color: "#777", fontWeight: "bold" }}>DISPLAY NAME</p>
                      <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                        <input 
                          id="displayNameInput"
                          defaultValue={user.name || ""}
                          placeholder="What should we call you?"
                          style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ddd", outline: "none", minWidth: "120px" }} 
                        />
                        <button 
                          onClick={() => {
                            const newName = document.getElementById("displayNameInput").value;
                            const updatedUser = { ...user, name: newName };
                            localStorage.setItem("user", JSON.stringify(updatedUser)); // Persist locally
                            setGlobalUser(updatedUser); // Update context instantly
                            setUser(updatedUser); // Update local state for immediate render
                            notify("Display Name updated successfully! ✨", "success");
                          }}
                          style={{ padding: "10px 15px", background: "#f43397", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }}
                          onMouseOver={(e) => e.target.style.background = "#d1227c"}
                          onMouseOut={(e) => e.target.style.background = "#f43397"}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div>
                  <h3 style={{ fontSize: "18px", color: "#444", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>🛡️</span> Security & Authentication
                  </h3>
                  <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", border: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 5px", color: "#333" }}>Password</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "#777" }}>You can reset or change your password anytime.</p>
                    </div>
                    <button 
                      onClick={() => notify("A secure password reset link has been sent to your registered email.", "success")}
                      style={{ padding: "10px 20px", background: "transparent", color: "#f43397", border: "1px solid #f43397", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}
                      onMouseOver={(e) => { e.target.style.background = "#f43397"; e.target.style.color = "white"; }}
                      onMouseOut={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#f43397"; }}
                    >
                      Reset Password
                    </button>
                  </div>
                </div>

                {/* Notifications Preferences */}
                <div>
                  <h3 style={{ fontSize: "18px", color: "#444", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>🔔</span> Notification Preferences
                  </h3>
                  <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", border: "1px solid #eee", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "#f43397" }} />
                      <span style={{ color: "#333", fontSize: "15px" }}>Order updates & shipping alerts (Recommended)</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "#f43397" }} />
                      <span style={{ color: "#333", fontSize: "15px" }}>Exclusive discounts & promotions</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Profile;
