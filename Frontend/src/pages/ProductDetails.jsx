import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import QuantitySelector from "../components/QuantitySelector";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { useNotification } from "../context/NotificationContext";
import { API, BASE_URL } from "../api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist: contextAddToWishlist } = useContext(CartContext);
  const { notify } = useNotification();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);

    API.get("/products")
      .then((res) => res.data)
      .then((data) => {
        const found = data.find((p) => p._id === id || p.id === id);
        setProduct(found);

        // Fetch related products (same category, exclude current)
        if (found) {
          const related = data
            .filter((p) => p.category === found.category && (p._id !== id && p.id !== id))
            .slice(0, 5); // Show up to 5 similar products
          setRelatedProducts(related);
        }
      })
      .catch((err) => console.log(err));
  }, [id]);

  if (!product) {
    return (
      <div style={{ background: "#f9f9f9", minHeight: "100vh" }}>
        <Navbar />
        <h2 style={{ textAlign: "center", marginTop: "100px", color: "#666" }}>Loading Product...</h2>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    notify("Added successfully! 🛒", "success");
  };

  const buyNow = () => {
    addToCart({ ...product, quantity });
    navigate("/cart");
  };

  const addToWishlist = () => {
    contextAddToWishlist(product);
    notify("Added to wishlist ❤️", "success");
  };

  const originalPrice = Math.floor(product.price * 1.4); // Simulated discount markup

  return (
    <div style={{ background: "#FDE9F2", minHeight: "100vh", WebkitMinHeight: "-webkit-fill-available", fontFamily: "'Inter', sans-serif", paddingBottom: "40px" }}>
      <Navbar />

      <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 20px" }}>
        
        {/* BREADCRUMBS */}
        <p style={{ color: "#777", fontSize: "14px", marginBottom: "20px", cursor: "pointer" }}>
          Home <span style={{ margin: "0 8px" }}>›</span> {product.category} <span style={{ margin: "0 8px" }}>›</span> <span style={{ color: "#333", fontWeight: "600" }}>{product.name}</span>
        </p>

        <div style={{ display: "flex", gap: "30px", alignItems: "flex-start", flexWrap: "wrap", background: "transparent" }}>
          
          {/* ======== LEFT: IMAGE ======== */}
          <div style={{ 
            flex: "1 1 400px", 
            background: "#fff", 
            padding: "30px", 
            borderRadius: "12px", 
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            border: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <div style={{ width: "100%", maxWidth: "400px" }}>
              <Zoom>
                <img
                  src={product.image?.startsWith('http') ? product.image : `${BASE_URL}${product.image}`}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "400px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                  }}
                />
              </Zoom>
            </div>

            <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "25px" }}>
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  padding: "15px",
                  background: "#fff",
                  color: "#f43397",
                  border: "2px solid #f43397",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.target.style.background = "#f4f4f4" }}
                onMouseOut={(e) => { e.target.style.background = "#fff" }}
              >
                🛒 Add to Cart
              </button>
              
              <button
                onClick={buyNow}
                style={{
                  flex: 1,
                  padding: "15px",
                  background: "#f43397",
                  color: "white",
                  border: "2px solid #f43397",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.target.style.background = "#d1227c"; e.target.style.borderColor = "#d1227c"; }}
                onMouseOut={(e) => { e.target.style.background = "#f43397"; e.target.style.borderColor = "#f43397"; }}
              >
                ⚡ Buy Now
              </button>
            </div>
          </div>


          {/* ======== RIGHT: DETAILS ======== */}
          <div style={{ flex: "2 1 500px", display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* PRICING BLOCK */}
            <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" }}>
              <h1 style={{ margin: "0 0 15px", color: "#333", fontSize: "28px", lineHeight: "1.2" }}>{product.name}</h1>
              
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
                <span style={{ fontWeight: "bold", fontSize: "36px", color: "#333" }}>₹{product.price}</span>
                <span style={{ textDecoration: "line-through", color: "#999", fontSize: "18px" }}>₹{originalPrice}</span>
                <span style={{ color: "#038d63", fontWeight: "bold", fontSize: "18px" }}>28% off</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <span style={{ background: "#23bb75", color: "white", padding: "5px 12px", borderRadius: "15px", fontSize: "14px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                  4.2 ⭐
                </span>
                <span style={{ color: "#777", fontSize: "14px", fontWeight: "500" }}>340 Ratings, 123 Reviews</span>
              </div>

              <div style={{ background: "#f9f9f9", padding: "15px", borderRadius: "8px", border: "1px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span><span style={{ fontSize: "20px" }}>🚚</span> Free Delivery securely to your location.</span>
              </div>
            </div>

            {/* DETAILS BLOCK */}
            <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" }}>
              <h2 style={{ fontSize: "20px", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Product Details</h2>
              <p style={{ color: "#555", fontSize: "15px", lineHeight: "1.6", marginBottom: "20px" }}>
                {product.description || "Authentic handmade yarn art. Perfect for gifts, decor, and unique accessories."}
              </p>

              <div className="split-grid" style={{ fontSize: "15px" }}>
                <div style={{ color: "#888" }}>Category</div>
                <div style={{ fontWeight: "500", color: "#333" }}>{product.category}</div>

                <div style={{ color: "#888" }}>Color</div>
                <div style={{ fontWeight: "500", color: "#333" }}>{product.color || "Handcrafted Mix"}</div>

                <div style={{ color: "#888" }}>Size</div>
                <div style={{ fontWeight: "500", color: "#333" }}>{product.size || "Standard"}</div>

                <div style={{ color: "#888" }}>Material</div>
                <div style={{ fontWeight: "500", color: "#333" }}>{product.material || "Premium Soft Yarn"}</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                <div style={{ color: "#333", fontWeight: "bold" }}>Select Quantity:</div>
                <QuantitySelector onChange={setQuantity} />
              </div>

              <button
                onClick={addToWishlist}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "#fff",
                  color: "#e91e63",
                  border: "1px solid #e91e63",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: "20px",
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => { e.target.style.background = "#fdf0f4" }}
                onMouseOut={(e) => { e.target.style.background = "#fff" }}
              >
                ❤️ Save to Wishlist
              </button>
            </div>

          </div>
        </div>

        {/* ======== SIMILAR PRODUCTS ======== */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: "50px" }}>
            <h2 style={{ fontSize: "24px", color: "#333", marginBottom: "20px" }}>Similar Products you might like</h2>
            
            <div className="product-grid">
              {relatedProducts.map((p) => {
                const rpOrPrice = Math.floor(p.price * 1.4);
                return (
                  <div
                    key={p._id || p.id}
                    onClick={() => navigate(`/product/${p._id || p.id}`)}
                    style={{
                      border: "1px solid #eaeaec",
                      borderRadius: "8px",
                      padding: "15px",
                      background: "#fff",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s, transform 0.2s",
                    WebkitTransition: "box-shadow 0.2s, transform 0.2s",
                      display: "flex",
                      flexDirection: "column"
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
                    <div style={{ position: "relative" }}>
                      <img
                        src={p.image?.startsWith("http") ? p.image : `${BASE_URL}${p.image}`}
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: "180px",
                          objectFit: "contain",
                          borderRadius: "8px",
                          backgroundColor: "#f9f9f9",
                          padding: "10px",
                        }}
                      />
                    </div>
                    <h4 style={{ margin: "15px 0 5px", fontSize: "15px", color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.name}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "5px 0" }}>
                      <span style={{ fontWeight: "bold", fontSize: "20px", color: "#333" }}>₹{p.price}</span>
                      <span style={{ textDecoration: "line-through", color: "#999", fontSize: "13px" }}>₹{rpOrPrice}</span>
                      <span style={{ color: "#038d63", fontWeight: "bold", fontSize: "13px" }}>28% off</span>
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: "10px" }}>
                      <span style={{ background: "#f4f4f4", color: "#333", fontSize: "11px", padding: "4px 8px", borderRadius: "15px", display: "inline-block", fontWeight: "bold" }}>
                        🚚 Free Delivery
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ProductDetails;