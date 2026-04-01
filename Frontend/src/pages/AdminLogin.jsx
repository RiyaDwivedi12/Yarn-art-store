import { useState, useEffect, useContext } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { notify } = useNotification();

  useEffect(() => {
    window.scrollTo(0, 0);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === "admin") navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const res = await API.post("/auth/admin-login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err.response?.data);
      notify(err.response?.data?.message || "Admin authentication failed. Please check credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      WebkitMinHeight: "-webkit-fill-available",
      display: "flex",
      fontFamily: "'Inter', sans-serif",
      background: "#0d1117",
      color: "white"
    }}>
      <div style={{
        flex: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "20px"
      }}>
        
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#161b22",
            padding: "50px 40px",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
            boxSizing: "border-box",
            border: "1px solid #30363d"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "32px", color: "#f0f6fc", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span>🛡️</span> Admin Portal
            </h2>
            <p style={{ color: "#8b949e", fontSize: "15px", margin: 0 }}>
              Yarn Art Store Management
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold", color: "#c9d1d9" }}>ADMIN EMAIL</label>
              <input
                type="email"
                placeholder="Admin Email"
                required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{
                  width: "100%", padding: "15px", borderRadius: "8px", border: "1px solid #30363d",
                  outline: "none", boxSizing: "border-box", fontSize: "15px", background: "#0d1117", color: "white", transition: "border 0.2s"
                }}
                onFocus={(e) => e.target.style.border = "1px solid #58a6ff"}
                onBlur={(e) => e.target.style.border = "1px solid #30363d"}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold", color: "#c9d1d9" }}>PASSWORD</label>
              <input
                type="password"
                placeholder="Admin Password"
                required
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{
                  width: "100%", padding: "15px", borderRadius: "8px", border: "1px solid #30363d",
                  outline: "none", boxSizing: "border-box", fontSize: "15px", background: "#0d1117", color: "white", transition: "border 0.2s"
                }}
                onFocus={(e) => e.target.style.border = "1px solid #58a6ff"}
                onBlur={(e) => e.target.style.border = "1px solid #30363d"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "16px", background: loading ? "#1f6feb" : "#238636",
                color: "white", border: "none", borderRadius: "8px", fontSize: "16px",
                fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer",
                marginTop: "10px", transition: "all 0.2s"
              }}
              onMouseOver={(e) => { if (!loading) e.target.style.background = "#2ea043" }}
              onMouseOut={(e) => { if (!loading) e.target.style.background = "#238636" }}
            >
              {loading ? "Authenticating..." : "Login to Dashboard"}
            </button>

          </div>
          <div style={{ marginTop: "30px", textAlign: "center", fontSize: "14px", color: "#8b949e" }}>
            <span 
              onClick={() => navigate("/")} 
              style={{ color: "#58a6ff", cursor: "pointer", borderBottom: "1px solid transparent", transition: "border 0.2s" }}
              onMouseOver={(e) => e.target.style.borderBottom = "1px solid #58a6ff"}
              onMouseOut={(e) => e.target.style.borderBottom = "1px solid transparent"}
            >
              ← Back to Main Website
            </span>
          </div>

        </form>
      </div>
    </div>
  );
}
