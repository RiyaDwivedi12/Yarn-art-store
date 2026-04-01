import React, { useState, useEffect, useContext } from "react";
import { API, BASE_URL } from "../api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [usersDetails, setUsersDetails] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'users', 'orders', 'products', 'diySupplies', 'addProduct', 'courses'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { notify } = useNotification();
  const [editModal, setEditModal] = useState({ show: false, product: null, newPrice: "" });
  const [deleteModal, setDeleteModal] = useState({ show: false, product: null, type: 'product' });

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "Crochet Toys", deliveryCharges: "" });
  const [productImage, setProductImage] = useState(null);
  
  // Add Course Form State
  const [newCourse, setNewCourse] = useState({ title: "", description: "", playlistId: "", type: "free", price: 0, category: "General", duration: 6, thumbnail: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [addType, setAddType] = useState("product"); // 'product' or 'course'
  
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    // Check auth
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/admin/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchData();
  }, [navigate]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const fetchData = async () => {
    try {
      const statsRes = await API.get("/admin/dashboard-stats");
      setStats(statsRes.data);

      const usersRes = await API.get("/admin/users-details");
      setUsersDetails(usersRes.data);

      const ordersRes = await API.get("/admin/latest-orders");
      setLatestOrders(ordersRes.data);

      const prodsRes = await API.get("/products");
      setProducts(prodsRes.data);

      const courseRes = await API.get("/course/stats/admin");
      setCourses(courseRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
         localStorage.removeItem("user");
         localStorage.removeItem("token");
         setUser(null);
         navigate("/admin/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/admin/login");
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.playlistId) {
        notify("Please provide course title and playlist ID!", "error");
        return;
    }
    
    setIsAdding(true);
    try {
        const res = await API.post("/course", newCourse);
        notify(res.data.message || "Course added successfully!", "success");
        
        // Reset form & change tab to see it
        setNewCourse({ title: "", description: "", playlistId: "", type: "free", price: 0, category: "General", duration: 6, thumbnail: "" });
        
        // Refresh courses and go to courses tab
        await fetchData();
        setActiveTab("courses");
    } catch (err) {
        console.error(err);
        notify("Failed to add course.", "error");
    } finally {
        setIsAdding(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !productImage) {
        notify("Please provide product name, price, and an image!", "error");
        return;
    }
    
    setIsAdding(true);
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("category", newProduct.category);
    formData.append("deliveryCharges", newProduct.deliveryCharges);
    formData.append("image", productImage);

    try {
        const res = await API.post("/products/add", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        notify(res.data.message || "Product added successfully!", "success");
        
        // Reset form & change tab to see it
        setNewProduct({ name: "", price: "", category: "Crochet Toys", deliveryCharges: "" });
        setProductImage(null);
        e.target.reset();
        
        // Refresh products and go to products tab
        await fetchData();
        setActiveTab("products");
    } catch (err) {
        console.error(err);
        notify("Failed to add product. Please check the network.", "error");
    } finally {
        setIsAdding(false);
    }
  };

  const executeEditPrice = async () => {
      if (!editModal.newPrice || isNaN(editModal.newPrice)) return;
      try {
          await API.put(`/products/${editModal.product._id}/price`, { price: editModal.newPrice });
          notify(`Price updated for ${editModal.product.name}!`, "success");
          fetchData();
      } catch (err) { notify("Failed to update price.", "error"); }
      setEditModal({ show: false, product: null, newPrice: "" });
  };

  const executeDelete = async () => {
      try {
          if (deleteModal.type === 'course') {
            await API.delete(`/course/${deleteModal.product._id}`);
            notify(`Permanently deleted ${deleteModal.product.title}!`, "success");
          } else {
            await API.delete(`/products/${deleteModal.product._id}`);
            notify(`Permanently deleted ${deleteModal.product.name}!`, "success");
          }
          fetchData();
      } catch (err) { notify("Failed to delete item.", "error"); }
      setDeleteModal({ show: false, product: null, type: 'product' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Close sidebar on mobile when navigating
  };

  const SidebarButton = ({ icon, label, tab }) => (
    <button
      onClick={() => handleTabChange(tab)}
      style={{
        width: "100%", padding: "15px 20px", display: "flex", alignItems: "center", gap: "10px",
        background: activeTab === tab ? "rgba(255, 255, 255, 0.1)" : "transparent",
        color: activeTab === tab ? "#fff" : "#8b949e", border: "none", cursor: "pointer",
        textAlign: "left", fontSize: "16px", borderRadius: "8px", transition: "all 0.2s",
        WebkitTransition: "all 0.2s",
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseOver={(e) => { if(activeTab !== tab) e.target.style.background = "rgba(255, 255, 255, 0.05)" }}
      onMouseOut={(e) => { if(activeTab !== tab) e.target.style.background = "transparent" }}
    >
      <span>{icon}</span> {label}
    </button>
  );

  return (
    <div className="admin-layout">
      
      {/* MOBILE HEADER */}
      <div className="admin-mobile-header">
        <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">☰</button>
        <h2 style={{ margin: 0, fontSize: "18px" }}>🛡️ Admin Panel</h2>
        <div style={{ width: "30px" }}></div>
      </div>

      {/* SIDEBAR OVERLAY */}
      <div 
        className={`admin-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h2 style={{ fontSize: "22px", margin: "10px 0 40px", display: "flex", alignItems: "center", gap: "10px", color: "#f0f6fc" }}>
          <span>🛡️</span> Admin Panel
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
          <SidebarButton icon="📊" label="Dashboard" tab="dashboard" />
          <SidebarButton icon="📦" label="Products" tab="products" />
          <SidebarButton icon="✂️" label="DIY Supplies" tab="diySupplies" />
          <SidebarButton icon="👥" label="Users" tab="users" />
          <SidebarButton icon="🎓" label="Learning Videos" tab="courses" />
          <SidebarButton icon="🛒" label="Orders" tab="orders" />
          
          <div style={{ borderTop: "1px solid #30363d", margin: "10px 0" }}></div>
          <SidebarButton icon="➕" label="Add New Item" tab="addProduct" />
        </div>

        <div style={{ borderTop: "1px solid #30363d", paddingTop: "20px", marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={() => { setSidebarOpen(false); navigate("/"); }}
            style={{ width: "100%", padding: "12px", background: "transparent", color: "#58a6ff", border: "1px solid #30363d", borderRadius: "8px", cursor: "pointer" }}
            onMouseOver={(e) => e.target.style.background = "rgba(88, 166, 255, 0.1)"}
            onMouseOut={(e) => e.target.style.background = "transparent"}
          >
            🌐 View Website
          </button>
          <button
            onClick={handleLogout}
            style={{ width: "100%", padding: "12px", background: "#21262d", color: "#f85149", border: "1px solid #30363d", borderRadius: "8px", cursor: "pointer" }}
            onMouseOver={(e) => e.target.style.background = "#30363d"}
            onMouseOut={(e) => e.target.style.background = "#21262d"}
          >
            Logout
          </button>
        </div>
      </div>


      {/* EDIT PRICE MODAL */}
      {editModal.show && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", padding: "20px" }}>
              <div style={{ background: "white", padding: "30px", borderRadius: "16px", width: "400px", maxWidth: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", animation: "popIn 0.3s ease-out", boxSizing: "border-box" }}>
                  <h2 style={{ marginTop: 0, marginBottom: "15px", color: "#111827", fontSize: "22px" }}>Edit Price for {editModal.product?.name}</h2>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>New Price (₹)</label>
                  <input type="number" autoFocus value={editModal.newPrice} onChange={(e) => setEditModal({...editModal, newPrice: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid #e5e7eb", outline: "none", fontSize: "16px", boxSizing: "border-box", marginBottom: "25px" }} />
                  <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <button onClick={() => setEditModal({ show: false, product: null, newPrice: "" })} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #d1d5db", background: "white", fontWeight: "bold", cursor: "pointer", color: "#374151" }}>Cancel</button>
                      <button onClick={executeEditPrice} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#2563eb", color: "white", fontWeight: "bold", cursor: "pointer" }}>Save Price</button>
                  </div>
              </div>
          </div>
      )}

      {/* DELETE WARNING MODAL */}
      {deleteModal.show && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", padding: "20px" }}>
              <div style={{ background: "white", padding: "35px 30px", borderRadius: "16px", width: "400px", maxWidth: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", textAlign: "center", animation: "popIn 0.3s ease-out", boxSizing: "border-box" }}>
                  <div style={{ fontSize: "50px", marginBottom: "15px" }}>🗑️</div>
                  <h2 style={{ marginTop: 0, marginBottom: "10px", color: "#111827", fontSize: "22px" }}>Permanently Delete?</h2>
                  <p style={{ color: "#6b7280", margin: "0 0 25px", lineHeight: "1.5" }}>Are you sure you want to remove <strong>{deleteModal.product?.name || deleteModal.product?.title}</strong>? This action cannot be undone.</p>
                  <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => setDeleteModal({ show: false, product: null })} style={{ width: "120px", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", background: "white", fontWeight: "bold", cursor: "pointer", color: "#374151" }}>Cancel</button>
                      <button onClick={executeDelete} style={{ width: "120px", padding: "12px", borderRadius: "8px", border: "none", background: "#ef4444", color: "white", fontWeight: "bold", cursor: "pointer" }}>Delete Item</button>
                  </div>
              </div>
          </div>
      )}

      {/* MAIN CONTENT */}
      <div className="admin-content">
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
          <h1 style={{ margin: 0, fontSize: "28px", color: "#111827" }}>
            {activeTab === 'dashboard' && "Overview"}
            {activeTab === 'products' && "Product Details"}
            {activeTab === 'diySupplies' && "DIY Supplies Inventory"}
            {activeTab === 'users' && "User Management"}
            {activeTab === 'courses' && "Learning Video Management"}
            {activeTab === 'orders' && "Recent Orders"}
            {activeTab === 'addProduct' && (addType === 'product' ? "Add New Product" : "Add New Learning Video")}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
             <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "#f43397", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px", overflow: "hidden", border: "2px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                <img src="/src/assets/admin_dp.png" alt="Admin" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = 'A'; }} />
             </div>
             <div>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px", color: "#333" }}>Admin Artist</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{user?.email}</p>
             </div>
          </div>
        </div>

        {/* CONTENT - DASHBOARD */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
               {/* Card 1 */}
               <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
                  <p style={{ margin: "0 0 10px", color: "#6b7280", fontSize: "14px", fontWeight: "600" }}>Total Users</p>
                  <h3 style={{ margin: 0, fontSize: "32px", color: "#111827" }}>{stats.totalUsers}</h3>
               </div>
               {/* Card 2 */}
               <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
                  <p style={{ margin: "0 0 10px", color: "#6b7280", fontSize: "14px", fontWeight: "600" }}>Total Orders</p>
                  <h3 style={{ margin: 0, fontSize: "32px", color: "#111827" }}>{stats.totalOrders}</h3>
               </div>
               {/* Card 3 */}
               <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
                  <p style={{ margin: "0 0 10px", color: "#6b7280", fontSize: "14px", fontWeight: "600" }}>Items Ordered</p>
                  <h3 style={{ margin: 0, fontSize: "32px", color: "#111827" }}>{stats.totalItemsOrdered}</h3>
               </div>
               {/* Card 4 */}
               <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
                  <p style={{ margin: "0 0 10px", color: "#6b7280", fontSize: "14px", fontWeight: "600" }}>Monthly Revenue</p>
                  <h3 style={{ margin: 0, fontSize: "32px", color: "#238636" }}>₹ {stats.thisMonthRevenue.toLocaleString()}</h3>
               </div>
            </div>

            <div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "20px" }}>Latest Activity</h3>
              <p style={{ color: "#6b7280" }}>Your store has generated <strong>₹ {stats.totalRevenue.toLocaleString()}</strong> in total revenue across <strong>{stats.totalProducts}</strong> products.</p>
            </div>
          </div>
        )}

        {/* CONTENT - PRODUCTS */}
        {activeTab === 'products' && (
           <>
           <div className="admin-table-wrapper" style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
             <table style={{ width: "100%", borderCollapse: "collapse" }}>
               <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                 <tr>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Image</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Name</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Category</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Price</th>
                   <th style={{ padding: "15px 20px", textAlign: "center", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                  {products.filter(p => p.category !== "DIY Supplies").map((p, i, arr) => (
                    <tr key={p._id} style={{ borderBottom: i !== arr.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                       <td style={{ padding: "10px 20px" }}><img src={p.image?.startsWith("http") ? p.image : `${BASE_URL}${p.image}`} alt={p.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} onError={(e) => e.target.style.display='none'}/></td>
                       <td style={{ padding: "15px 20px", fontWeight: "500" }}>{p.name}</td>
                       <td style={{ padding: "15px 20px" }}>{p.category}</td>
                       <td style={{ padding: "15px 20px", color: "#238636", fontWeight: "bold" }}>₹ {p.price.toLocaleString()}</td>
                       <td style={{ padding: "15px 20px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <button onClick={() => setEditModal({ show: true, product: p, newPrice: p.price })} style={{ background: "#fef08a", color: "#92400e", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", marginRight: "10px", fontWeight: "bold" }}>✏️ Edit</button>

                          <button onClick={() => setDeleteModal({ show: true, product: p })} style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontWeight: "bold" }}>🗑️ Delete</button>
                       </td>
                    </tr>
                  ))}
               </tbody>
              </table>
           </div>
           
           <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button 
                  onClick={() => setActiveTab('addProduct')}
                  style={{ background: "#f43397", color: "white", border: "none", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
              >
                  ➕ Add New Product
              </button>
           </div>
           </>
        )}

        {/* CONTENT - DIY SUPPLIES */}
        {activeTab === 'diySupplies' && (
           <>
           <div className="admin-table-wrapper" style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
             <table style={{ width: "100%", borderCollapse: "collapse" }}>
               <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                 <tr>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Image</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Supply Name</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Price</th>
                   <th style={{ padding: "15px 20px", textAlign: "center", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                  {products.filter(p => p.category === "DIY Supplies").map((p, i, arr) => (
                    <tr key={p._id} style={{ borderBottom: i !== arr.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                       <td style={{ padding: "10px 20px" }}><img src={p.image?.startsWith("http") ? p.image : `${BASE_URL}${p.image}`} alt={p.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} onError={(e) => e.target.style.display='none'}/></td>
                       <td style={{ padding: "15px 20px", fontWeight: "500" }}>{p.name}</td>
                       <td style={{ padding: "15px 20px", color: "#238636", fontWeight: "bold" }}>₹ {p.price.toLocaleString()}</td>
                       <td style={{ padding: "15px 20px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <button onClick={() => setEditModal({ show: true, product: p, newPrice: p.price })} style={{ background: "#fef08a", color: "#92400e", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", marginRight: "10px", fontWeight: "bold" }}>✏️ Edit</button>

                          <button onClick={() => setDeleteModal({ show: true, product: p })} style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontWeight: "bold" }}>🗑️ Delete</button>
                       </td>
                    </tr>
                  ))}
               </tbody>
              </table>
           </div>
           
           <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button 
                  onClick={() => {
                      setActiveTab('addProduct');
                      setNewProduct({...newProduct, category: "DIY Supplies"});
                  }}
                  style={{ background: "#f43397", color: "white", border: "none", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
              >
                  ➕ Add New DIY Supply
              </button>
           </div>
           </>
        )}

        {/* CONTENT - USERS */}
        {activeTab === 'users' && (
           <div className="admin-table-wrapper" style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
             <table style={{ width: "100%", borderCollapse: "collapse" }}>
               <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                 <tr>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>User Email</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Total Orders</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Items Bought</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Total Spent</th>
                 </tr>
               </thead>
               <tbody>
                  {usersDetails.map((u, i) => (
                    <tr key={u._id} style={{ borderBottom: i !== usersDetails.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                       <td style={{ padding: "15px 20px", fontWeight: "500" }}>{u.email}</td>
                       <td style={{ padding: "15px 20px" }}>{u.totalOrders}</td>
                       <td style={{ padding: "15px 20px" }}>{u.totalItemsBought}</td>
                       <td style={{ padding: "15px 20px", color: "#238636", fontWeight: "bold" }}>₹ {u.totalSpent.toLocaleString()}</td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        )}

        {/* CONTENT - ORDERS */}
        {activeTab === 'orders' && (
           <div className="admin-table-wrapper" style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
             <table style={{ width: "100%", borderCollapse: "collapse" }}>
               <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                 <tr>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Order ID</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Customer</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Date</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Amount</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Status</th>
                 </tr>
               </thead>
               <tbody>
                  {latestOrders.map((o, i) => (
                    <tr key={o._id} style={{ borderBottom: i !== latestOrders.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                       <td style={{ padding: "15px 20px", fontFamily: "monospace", color: "#6b7280" }}>{o._id.substring(0,8)}...</td>
                       <td style={{ padding: "15px 20px", fontWeight: "500" }}>{o.userEmail}</td>
                       <td style={{ padding: "15px 20px", color: "#6b7280" }}>
                           {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "N/A"}
                       </td>
                       <td style={{ padding: "15px 20px", fontWeight: "bold" }}>₹ {o.total?.toLocaleString()}</td>
                       <td style={{ padding: "15px 20px" }}>
                           <span style={{ padding: "4px 10px", background: "#def7ec", color: "#03543f", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                               {o.paymentId ? 'Paid' : 'Pending'}
                           </span>
                       </td>
                    </tr>
                  ))}
               </tbody>
              </table>
           </div>
        )}

        {/* CONTENT - COURSES */}
        {activeTab === 'courses' && (
           <>
           <div className="admin-table-wrapper" style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
             <table style={{ width: "100%", borderCollapse: "collapse" }}>
               <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                 <tr>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Thumb</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Title</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Playlist ID</th>
                   <th style={{ padding: "15px 20px", textAlign: "left", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Type</th>
                   <th style={{ padding: "15px 20px", textAlign: "center", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Learners</th>
                   <th style={{ padding: "15px 20px", textAlign: "center", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Views</th>
                   <th style={{ padding: "15px 20px", textAlign: "center", color: "#6b7280", fontSize: "13px", textTransform: "uppercase" }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                  {courses.map((c, i, arr) => (
                    <tr key={c._id} style={{ borderBottom: i !== arr.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                       <td style={{ padding: "10px 20px" }}><img src={c.thumbnail} alt={c.title} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} onError={(e) => e.target.style.display='none'}/></td>
                       <td style={{ padding: "15px 20px", fontWeight: "500" }}>{c.title}</td>
                       <td style={{ padding: "15px 20px", fontFamily: "monospace", fontSize: "12px" }}>{c.playlistId}</td>
                       <td style={{ padding: "15px 20px" }}>
                          <span style={{ padding: "4px 8px", background: c.type === 'free' ? '#dcfce7' : '#fce7f3', color: c.type === 'free' ? '#166534' : '#9d174d', borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
                            {c.type.toUpperCase()}
                          </span>
                       </td>
                       <td style={{ padding: "15px 20px", textAlign: "center", fontWeight: "bold", color: "#f43397" }}>{c.enrollmentCount || 0}</td>
                       <td style={{ padding: "15px 20px", textAlign: "center", color: "#6b7280" }}>👁️ {c.views || 0}</td>
                       <td style={{ padding: "15px 20px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <button onClick={() => { setDeleteModal({ show: true, product: c, type: 'course' }); }} style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontWeight: "bold" }}>🗑️ Delete</button>
                       </td>
                    </tr>
                  ))}
               </tbody>
              </table>
           </div>
           
           <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button 
                  onClick={() => { setActiveTab('addProduct'); setAddType('course'); }}
                  style={{ background: "#f43397", color: "white", border: "none", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
              >
                  ➕ Add New learning Video
              </button>
           </div>
           </>
        )}

        {/* CONTENT - ADD PRODUCT */}
        {activeTab === 'addProduct' && (
           <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", padding: "30px", border: "1px solid #e5e7eb", maxWidth: "800px" }}>
             
             {/* Type Switcher */}
             <div style={{ display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
                <button onClick={() => setAddType('product')} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: addType === 'product' ? "#f43397" : "#f3f4f6", color: addType === 'product' ? "white" : "#4b5563", fontWeight: "bold", cursor: "pointer" }}>Product</button>
                <button onClick={() => setAddType('course')} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: addType === 'course' ? "#f43397" : "#f3f4f6", color: addType === 'course' ? "white" : "#4b5563", fontWeight: "bold", cursor: "pointer" }}>Learning Video</button>
             </div>

             {addType === 'product' ? (
                <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>Product Name *</label>
                    <input type="text" placeholder="e.g. Handmade Crochet Panda" required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "16px" }} />
                  </div>
                  
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 200px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>Price (₹) *</label>
                        <input type="number" placeholder="e.g. 299" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "16px" }} />
                    </div>
                    <div style={{ flex: "1 1 200px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>Delivery Charges (₹)</label>
                        <input type="number" placeholder="e.g. 50 (Optional)" value={newProduct.deliveryCharges} onChange={(e) => setNewProduct({...newProduct, deliveryCharges: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "16px" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>Category</label>
                    <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "16px", background: "white" }}>
                        <option value="Crochet Toys">Crochet Toys</option>
                        <option value="Yarn Flowers">Yarn Flowers</option>
                        <option value="Yarn Bags">Yarn Bags</option>
                        <option value="Keychains">Keychains</option>
                        <option value="Sweaters">Sweaters</option>
                        <option value="Home Decor">Home Decor</option>
                        <option value="DIY Supplies">DIY Supplies</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>Product Image *</label>
                    <div style={{ border: "2px dashed #d1d5db", borderRadius: "8px", padding: "20px", textAlign: "center", background: "#f9fafb" }}>
                      <input type="file" accept="image/*" required onChange={(e) => setProductImage(e.target.files[0])} style={{ width: "100%", cursor: "pointer" }} />
                      {productImage && <p style={{ fontSize: "13px", color: "#238636", marginTop: "10px", fontWeight: "500" }}>Selected: {productImage.name}</p>}
                    </div>
                  </div>

                  <button type="submit" disabled={isAdding} style={{ width: "100%", padding: "14px", background: isAdding ? "#9ca3af" : "#f43397", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: isAdding ? "not-allowed" : "pointer", marginTop: "10px" }}>
                    {isAdding ? "Uploading..." : "Publish Product"}
                  </button>
              </form>
             ) : (
                <form onSubmit={handleAddCourse} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>Course Title *</label>
                    <input type="text" placeholder="e.g. Master Crochet in 7 Days" required value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "16px" }} />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>Description *</label>
                    <textarea placeholder="Tell users what they will learn..." required value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "16px", minHeight: "100px", resize: "none", fontFamily: "inherit" }} />
                  </div>
                  
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 200px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>YouTube Video/Playlist Link or ID *</label>
                        <input type="text" placeholder="e.g. https://youtu.be/... or PLxyz..." required value={newCourse.playlistId} onChange={(e) => setNewCourse({...newCourse, playlistId: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "16px" }} />
                    </div>
                    <div style={{ flex: "1 1 200px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>Category</label>
                        <input type="text" placeholder="e.g. Crochet" value={newCourse.category} onChange={(e) => setNewCourse({...newCourse, category: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "16px" }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 200px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>Type</label>
                        <select value={newCourse.type} onChange={(e) => setNewCourse({...newCourse, type: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "16px", background: "white" }}>
                            <option value="free">Free</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                    {newCourse.type === 'paid' && (
                      <div style={{ flex: "1 1 200px" }}>
                          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>Course Price (₹) *</label>
                          <input type="number" placeholder="e.g. 499" required value={newCourse.price} onChange={(e) => setNewCourse({...newCourse, price: Number(e.target.value)})} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "16px" }} />
                      </div>
                    )}
                    <div style={{ flex: "1 1 200px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>Default Duration (Months)</label>
                        <input type="number" placeholder="e.g. 6" value={newCourse.duration} onChange={(e) => setNewCourse({...newCourse, duration: Number(e.target.value)})} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "16px" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#4b5563" }}>Thumbnail URL</label>
                    <input type="text" placeholder="https://image-url.com/thumb.jpg" value={newCourse.thumbnail} onChange={(e) => setNewCourse({...newCourse, thumbnail: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "16px" }} />
                  </div>

                  <button type="submit" disabled={isAdding} style={{ width: "100%", padding: "14px", background: isAdding ? "#9ca3af" : "#f43397", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: isAdding ? "not-allowed" : "pointer", marginTop: "10px" }}>
                    {isAdding ? "Uploading..." : "Publish Learning Video"}
                  </button>
              </form>
             )}
           </div>
        )}

      </div>
      <style>
          {`
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            .admin-layout { display: flex; min-height: 100vh; background: #f6f8fa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            .admin-sidebar { width: 260px; background: #0d1117; color: #c9d1d9; padding: 20px; display: flex; flex-direction: column; transition: all 0.3s; position: sticky; top: 0; height: 100vh; z-index: 100; box-sizing: border-box; }
            .admin-content { flex: 1; padding: 40px; box-sizing: border-box; min-width: 0; }
            .admin-mobile-header { display: none; background: #0d1117; color: white; padding: 15px 20px; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 200; }
            .admin-mobile-header button { background: transparent; border: none; color: white; font-size: 24px; cursor: pointer; }
            .admin-sidebar-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 150; }
            .admin-table-wrapper { overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch; }
            
            @media (max-width: 1024px) {
                .admin-sidebar { width: 220px; }
            }

            @media (max-width: 768px) {
                .admin-layout { display: block; }
                .admin-sidebar { position: fixed; left: -260px; height: 100vh; }
                .admin-sidebar.open { left: 0; }
                .admin-sidebar-overlay.active { display: block; }
                .admin-mobile-header { display: flex; }
                .admin-content { padding: 20px; }
            }
          `}
      </style>
    </div>
  );
}
