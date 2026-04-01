import React, { createContext, useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext";

export const CartContext = createContext();

const CartProviderInner = ({ userId, children }) => {
  const getInitialCart = () => JSON.parse(localStorage.getItem(`yarn_cart_${userId}`)) || [];
  const getInitialWishlist = () => JSON.parse(localStorage.getItem(`yarn_wishlist_${userId}`)) || [];

  const [cartItems, setCartItems] = useState(getInitialCart);
  const [wishlistItems, setWishlistItems] = useState(getInitialWishlist);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`yarn_cart_${userId}`, JSON.stringify(cartItems));
  }, [cartItems, userId]);

  useEffect(() => {
    localStorage.setItem(`yarn_wishlist_${userId}`, JSON.stringify(wishlistItems));
  }, [wishlistItems, userId]);


  const getId = (item) => item._id || item.id;

  // ✅ ADD TO CART
  const addToCart = (product) => {
    const productId = getId(product);
    setCartItems((prev) => {
      const existing = prev.find((item) => getId(item) === productId);

      if (existing) {
        return prev.map((item) =>
          getId(item) === productId
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: product.quantity || 1 }];
      }
    });
  };

  // ✅ REMOVE
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => getId(item) !== id));
  };

  // ✅ INCREASE
  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        getId(item) === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // ✅ DECREASE
  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          getId(item) === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // ✅ ADD TO WISHLIST
  const addToWishlist = (product) => {
    const productId = getId(product);
    setWishlistItems((prev) => {
      const existing = prev.find((item) => getId(item) === productId);
      if (existing) return prev;
      return [...prev, product];
    });
  };

  // ✅ REMOVE FROM WISHLIST
  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => prev.filter((item) => getId(item) !== id));
  };

  // ✅ CLEAR CART (Use when order completes)
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(`yarn_cart_${userId}`);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        searchQuery,
        setSearchQuery,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const CartProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const userId = user ? (user._id || user.id) : "guest";

  return (
    <CartProviderInner key={userId} userId={userId}>
      {children}
    </CartProviderInner>
  );
};