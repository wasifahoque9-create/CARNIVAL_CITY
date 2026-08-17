"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { cartApi } from "@/lib/api";

type CartContextType = {
  cartCount: number;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  refreshCart: async () => {},
});

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartCount, setCartCount] = useState(0);

  async function refreshCart() {
    try {
      const cart = await cartApi.get();
      setCartCount(cart.item_count);
    } catch {
      setCartCount(0);
    }
  }

  useEffect(() => {
    refreshCart();

    // Optional: still listen centrally in case any legacy code
    // dispatches this event instead of calling refreshCart() directly.
    window.addEventListener("cart-updated", refreshCart);

    return () => {
      window.removeEventListener("cart-updated", refreshCart);
    };
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}