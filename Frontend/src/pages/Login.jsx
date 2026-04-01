import { useState, useEffect, useContext } from "react";
import { API, BASE_URL } from "../api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { notify } = useNotification();

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0,0);
    const user = localStorage.getItem("user");
    if (user) navigate("/");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      let res;
      if (isRegistering) {
        res = await API.post("/auth/register", form);
        // After register, automatically log them in
        res = await API.post("/auth/login", form);
      } else {
         try {
           res = await API.post("/auth/login", form);
         } catch (loginErr) {
           // Seamless Demo fail-safe mechanism: auto register test accounts if they don't exist yet!
           if (loginErr.response?.data?.message === "User not found") {
              notify("Account not found. Automatically creating a secure demo account for you! 🚀", "success");
              await API.post("/auth/register", form);
              res = await API.post("/auth/login", form);
           } else {
             throw loginErr;
           }
         }
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      navigate("/"); 
    } catch (err) {
      console.error(err.response?.data);
      notify(err.response?.data?.message || "Authentication failed. Please check your credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      WebkitMinHeight: "-webkit-fill-available",
      display: "flex", 
      fontFamily: "'Inter', sans-serif" 
    }}>
      
      {/* LEFT IMAGE PANEL */}
      <div style={{
        flex: "1",
        background: `url('${BASE_URL}/images/login-bg.jpg') center/cover no-repeat`,
        WebkitBackgroundSize: "cover",
        display: "none",
      }} className="desktop-only-bg">
        {/* Inline CSS hack for mobile responsiveness without external stylesheet */}
        <style>
          {`
            @media (min-width: 800px) {
              .desktop-only-bg {
                display: flex !important;
              }
            }
          `}
        </style>
        {/* Dark elegant overlay */}
        <div style={{ width: "100%", height: "100%", background: "rgba(244, 51, 151, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <h1 style={{ position: "relative", zIndex: 1, color: "white", fontSize: "56px", textShadow: "0 4px 15px rgba(0,0,0,0.3)", textAlign: "center", margin: "0 20px" }}>
            Premium Handmade<br/>Yarn Art
          </h1>
          <p style={{ color: "white", fontSize: "18px", marginTop: "15px", fontWeight: "500", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>India's top destination for crochet & decor.</p>
        </div>
      </div>

      {/* RIGHT AUTH PANEL */}
      <div style={{
        flex: "1",
        background: "#FDE9F2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        
        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            padding: "50px 40px",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 10px 40px rgba(244, 51, 151, 0.15)",
            boxSizing: "border-box",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "32px", color: "#333", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span>🌸</span> Yarn Art
            </h2>
            <p style={{ color: "#777", fontSize: "15px", margin: 0 }}>
              {isRegistering ? "Create your new account" : "Welcome back! Login to continue."}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold", color: "#555" }}>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="test@gmail.com"
                required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{
                  width: "100%", padding: "15px", borderRadius: "8px", border: "1px solid #ddd", 
                  outline: "none", boxSizing: "border-box", fontSize: "15px", background: "#fbfbfb", transition: "border 0.2s"
                }}
                onFocus={(e) => e.target.style.border = "1px solid #f43397"}
                onBlur={(e) => e.target.style.border = "1px solid #ddd"}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "#555" }}>PASSWORD</label>
                <span 
                  onClick={() => navigate("/forgot-password")}
                  style={{ color: "#f43397", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                >
                  Forgot Password?
                </span>
              </div>
              <input
                type="password"
                placeholder="Enter password"
                required
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{
                  width: "100%", padding: "15px", borderRadius: "8px", border: "1px solid #ddd", 
                  outline: "none", boxSizing: "border-box", fontSize: "15px", background: "#fbfbfb", transition: "border 0.2s"
                }}
                onFocus={(e) => e.target.style.border = "1px solid #f43397"}
                onBlur={(e) => e.target.style.border = "1px solid #ddd"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "16px", background: loading ? "#f08fb7" : "#f43397", 
                color: "white", border: "none", borderRadius: "8px", fontSize: "16px", 
                fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", 
                marginTop: "10px", transition: "all 0.2s"
              }}
              onMouseOver={(e) => { if(!loading) e.target.style.background = "#d1227c" }}
              onMouseOut={(e) => { if(!loading) e.target.style.background = "#f43397" }}
            >
              {loading ? "Authenticating..." : (isRegistering ? "Create Account" : "Secure Login")}
            </button>

          </div>

          <div style={{ marginTop: "30px", textAlign: "center", fontSize: "14px", color: "#666" }}>
            {isRegistering ? "Already have an account? " : "New to Yarn Art? "}
            <span 
              onClick={() => setIsRegistering(!isRegistering)} 
              style={{ color: "#f43397", fontWeight: "bold", cursor: "pointer", borderBottom: "1px solid transparent", transition: "border 0.2s" }}
              onMouseOver={(e) => e.target.style.borderBottom = "1px solid #f43397"}
              onMouseOut={(e) => e.target.style.borderBottom = "1px solid transparent"}
            >
              {isRegistering ? "Login Here" : "Sign Up"}
            </span>

            <div style={{ marginTop: "15px" }}>
              <span 
                onClick={() => navigate("/admin/login")} 
                style={{ color: "#333", fontSize: "13px", fontWeight: "bold", cursor: "pointer", borderBottom: "1px solid transparent", transition: "border 0.2s" }}
                onMouseOver={(e) => e.target.style.borderBottom = "1px solid #333"}
                onMouseOut={(e) => e.target.style.borderBottom = "1px solid transparent"}
              >
                Access Admin Portal
              </span>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}