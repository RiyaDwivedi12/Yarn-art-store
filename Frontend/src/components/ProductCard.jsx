import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useNotification } from "../context/NotificationContext";
import Rating from "./Rating";
import { BASE_URL } from "../api";

function ProductCard({ id, name, price, image }) {
  const navigate = useNavigate();

  const { cartItems, addToCart } = useContext(CartContext); // ✅ FIX
  const { notify } = useNotification();

  const handleAddToCart = () => {
    addToCart({ id, name, price, image, quantity: 1 });
    notify("Product added to cart", "success");
  };

  const buyNow = () => {
    addToCart({ id, name, price, image, quantity: 1 });
    navigate("/cart");
  };

  return (
    <div
      style={{
        border: "1px solid #eee",
        padding: "15px",
        borderRadius: "12px",
        textAlign: "center",
        width: "100%",
        maxWidth: "280px",
        background: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "0.3s",
        WebkitTransition: "0.3s",
        boxSizing: "border-box",
      }}
    >
      <img
        src={image?.startsWith('http') ? image : `${BASE_URL}${image}`}
        alt={name}
        style={{ width: "100%", height: "180px", objectFit: "contain", cursor: "pointer", backgroundColor: "#f9f9f9", borderRadius: "8px" }}
        onClick={() => navigate(`/product/${id}`)}
      />

      <h3>{name}</h3>
      <Rating value={4} />
      <p>₹{price}</p>

      <button onClick={handleAddToCart}>
        Add to Cart
      </button>

      <button
        onClick={buyNow}
        style={{ background: "orange", color: "white", border: "none" }}
      >
        Buy Now
      </button>
    </div>
  );
}

export default ProductCard;