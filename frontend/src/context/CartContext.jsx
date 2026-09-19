import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    if (!user || user.role !== "buyer") {
      setCartCount(0);
      return;
    }
    try {
      const { data } = await api.get("/cart");
      const count = (data.cart?.items || []).reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }, [user]);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  return <CartContext.Provider value={{ cartCount, refreshCartCount }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
