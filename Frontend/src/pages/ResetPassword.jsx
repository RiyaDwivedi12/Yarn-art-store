import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "../api";
import { useNotification } from "../context/NotificationContext";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      notify("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      await API.put(`/auth/reset-password/${token}`, { password });
      notify("Password reset successfully! You can now log in.", "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      notify(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ margin: "0 0 20px", color: "#333", textAlign: "center" }}>Set New Password</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px", fontSize: "14px" }}>
          Please enter your new password below.
        </p>
        
        <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#444" }}>New Password</label>
            <input 
              type="password" 
              placeholder="Enter new password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", outline: "none", fontSize: "16px" }} 
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#444" }}>Confirm New Password</label>
            <input 
              type="password" 
              placeholder="Confirm new password" 
              required 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", outline: "none", fontSize: "16px" }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", padding: "14px", background: loading ? "#ccc" : "#f43397", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "25px", fontSize: "14px", color: "#666" }}>
          <Link to="/login" style={{ color: "#f43397", fontWeight: "600", textDecoration: "none" }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
