/**
 * CartContext — global cart state for Terradom Marketplace
 * Wraps marketplaceApi.cart with React state and provides badge count.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { marketplaceApi } from "@/lib/marketplace.api";
import type { Cart } from "@/lib/marketplace.types";
import { toast } from "sonner";

interface CartContextValue {
  cart: Cart;
  loading: boolean;
  addItem: (productId: string, quantity: number, productName?: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const EMPTY_CART: Cart = { items: [], itemCount: 0, subtotal: 0, total: 0 };

const CartContext = createContext<CartContextValue>({
  cart: EMPTY_CART,
  loading: false,
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  refresh: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const c = await marketplaceApi.cart.get();
      setCart(c);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      refresh();
    }
  }, [refresh]);

  const addItem = useCallback(async (productId: string, quantity: number, productName?: string) => {
    setLoading(true);
    try {
      const updated = await marketplaceApi.cart.addItem(productId, quantity);
      setCart(updated);
      toast.success(`${productName ?? "Товар"} добавлен в корзину`, {
        action: { label: "Корзина", onClick: () => window.location.assign("/cart") },
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка добавления в корзину");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    try {
      const updated = await marketplaceApi.cart.updateItem(itemId, quantity);
      setCart(updated);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка обновления корзины");
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const updated = await marketplaceApi.cart.removeItem(itemId);
      setCart(updated);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка удаления из корзины");
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await marketplaceApi.cart.clear();
      setCart(EMPTY_CART);
    } catch {
      // ignore
    }
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, clearCart, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
