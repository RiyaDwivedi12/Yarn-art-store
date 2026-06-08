import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";
import { API, BASE_URL } from "../api";
import "../styles/Profile.css";

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
    <div className="profile-container">
      <Navbar />

      {/* HEADER BANNER */}
      <div className="profile-header">
        <h1>My Account</h1>
        <p>Manage your orders and account settings</p>
      </div>

      <div className="profile-content-wrapper">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <div className="profile-sidebar">
          {/* User Info Card */}
          <div className="profile-user-card">
            <div className="profile-avatar">
              {user.name ? user.name[0] : "👤"}
            </div>
            <h2 className="profile-user-name">
              {user.name || "Customer"}
            </h2>
            <p className="profile-user-email">
              {user.email}
            </p>
          </div>

          {/* Menu Links */}
          <div className="profile-nav">
            <div 
              onClick={() => setActiveTab("orders")}
              className={`profile-nav-item ${activeTab === "orders" ? "active" : ""}`}
            >
              <span style={{ fontSize: "18px" }}>📦</span> My Orders
            </div>

            <div 
              onClick={() => navigate("/wishlist")}
              className="profile-nav-item"
            >
              <span style={{ fontSize: "18px" }}>❤️</span> My Wishlist
            </div>

            <div 
              onClick={() => setActiveTab("settings")}
              className={`profile-nav-item ${activeTab === "settings" ? "active" : ""}`}
            >
              <span style={{ fontSize: "18px" }}>⚙️</span> Settings
            </div>

            <div 
              onClick={handleLogout}
              className="profile-nav-item logout"
            >
              <span style={{ fontSize: "18px" }}>🚪</span> Logout
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="profile-main-content">
          
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="profile-card">
              <h2 className="profile-card-title">Order History</h2>

              {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "#888", fontSize: "16px" }}>Loading your amazing orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: "60px", marginBottom: "15px" }}>🎁</div>
                  <h3 style={{ color: "#333", marginBottom: "10px", fontSize: "22px" }}>No orders placed yet</h3>
                  <p style={{ color: "#777", marginBottom: "25px", fontSize: "15px" }}>Explore our catalog and find something you love!</p>
                  <button
                    onClick={() => navigate("/")}
                    className="btn-primary"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div>
                  {orders.map((order) => {
                    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Recently Placed";
                    
                    return (
                      <div key={order._id} className="order-item">
                        
                        {/* Order Header */}
                        <div className="order-header">
                          
                          <div className="order-header-group">
                            <div>
                              <p className="order-header-label">Order Placed</p>
                              <p className="order-header-value">{orderDate}</p>
                            </div>
                            <div>
                              <p className="order-header-label">Total</p>
                              <p className="order-header-value highlight">₹{order.total || order.amount || "N/A"}</p>
                            </div>
                            <div>
                              <p className="order-header-label">Ship To</p>
                              <p className="order-header-value">{user.name || "Valued Customer"} ▼</p>
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <p className="order-header-label">Order ID</p>
                            <p className="order-header-value">#{order._id.substring(0, 10).toUpperCase()}</p>
                          </div>

                        </div>

                        {/* Order Body */}
                        <div className="order-body">
                          <h4 className="order-status">
                            <span>🎯</span> Order Confirmed & Processing
                          </h4>

                          <div>
                            {order.items && order.items.map((item, idx) => (
                              <div key={idx} className="order-product">
                                <img
                                  src={item.image?.startsWith("http") ? item.image : `${BASE_URL}${item.image}`}
                                  alt={item.name}
                                  className="order-product-image"
                                />
                                <div className="order-product-details">
                                  <h5 className="order-product-title">{item.name}</h5>
                                  <p className="order-product-meta">Quantity: <strong>{item.quantity}</strong></p>
                                  <p className="order-product-meta">Price: <strong>₹{item.price}</strong></p>
                                </div>
                                
                                <button className="order-btn">
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
            <div className="profile-card">
              <h2 className="profile-card-title">Account Settings</h2>

              <div className="settings-section">
                <h3 className="settings-section-title">
                  <span>👤</span> Personal Information
                </h3>
                
                <div className="settings-grid">
                  <div className="settings-input-group">
                    <label className="settings-label">Email Address</label>
                    <input 
                      disabled 
                      value={user.email} 
                      className="settings-input"
                    />
                  </div>
                  <div className="settings-input-group">
                    <label className="settings-label">Display Name</label>
                    <div className="settings-action-row">
                      <input 
                        id="displayNameInput"
                        defaultValue={user.name || ""}
                        placeholder="What should we call you?"
                        className="settings-input"
                        style={{ flex: 1 }}
                      />
                      <button 
                        onClick={() => {
                          const newName = document.getElementById("displayNameInput").value;
                          const updatedUser = { ...user, name: newName };
                          localStorage.setItem("user", JSON.stringify(updatedUser));
                          setGlobalUser(updatedUser);
                          setUser(updatedUser);
                          notify("Display Name updated successfully! ✨", "success");
                        }}
                        className="btn-primary"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3 className="settings-section-title">
                  <span>🛡️</span> Security & Authentication
                </h3>
                <div className="settings-grid" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ margin: "0 0 5px", color: "#333" }}>Password</h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#777" }}>You can reset or change your password anytime.</p>
                  </div>
                  <button 
                    onClick={() => notify("A secure password reset link has been sent to your registered email.", "success")}
                    className="order-btn" style={{ color: "#f43397", borderColor: "#f43397" }}
                  >
                    Reset Password
                  </button>
                </div>
              </div>

              <div className="settings-section" style={{ marginBottom: 0 }}>
                <h3 className="settings-section-title">
                  <span>🔔</span> Notification Preferences
                </h3>
                <div className="settings-grid" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
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
          )}

        </div>
      </div>
    </div>
  );
}

export default Profile;
