import React, { useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";
import { useNotification } from "../context/NotificationContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMsg(res.data.message || "Email sent successfully");
      notify("Password reset email sent!", "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setMsg(errorMsg);
      notify(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ margin: "0 0 20px", color: "#333", textAlign: "center" }}>Forgot Password</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px", fontSize: "14px" }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#444" }}>Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", outline: "none", fontSize: "16px" }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", padding: "14px", background: loading ? "#ccc" : "#f43397", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {msg && <p style={{ textAlign: "center", marginTop: "20px", color: msg.includes('sent') ? "#28a745" : "#dc3545", fontWeight: "500" }}>{msg}</p>}

        <p style={{ textAlign: "center", marginTop: "25px", fontSize: "14px", color: "#666" }}>
          Remembered your password? <Link to="/login" style={{ color: "#f43397", fontWeight: "600", textDecoration: "none" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
