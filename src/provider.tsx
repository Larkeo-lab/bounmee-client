import { createContext, useContext, useState, useEffect } from "react";
import type { NavigateOptions } from "react-router-dom";
import { I18nProvider } from "@react-aria/i18n";
import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/routes";
import { toast, Toaster } from "react-hot-toast";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

// --- Cart Context Types ---
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  stockQty: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, value: string) => void;
  clearCart: () => void;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem("pos_cart_global");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Cart load error", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (cart.length > 0) {
        localStorage.setItem("pos_cart_global", JSON.stringify(cart));
      } else {
        localStorage.removeItem("pos_cart_global");
      }
    }
  }, [cart, isLoaded]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (product.stockQty !== undefined && existing.quantity + 1 > product.stockQty) {
          toast.error(`ສິນຄ້າ "${product.name}" ມີໃນສາງພຽງ ${product.stockQty} ລາຍການ`);
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      if (product.stockQty <= 0) {
        toast.error(`ສິນຄ້າ "${product.name}" ໝົດແລ້ວ!`);
        return prev;
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          stockQty: product.stockQty,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (item.stockQty !== undefined && newQty > item.stockQty) {
            toast.error(`ສິນຄ້າ "${item.name}" ມີໃນສາງພຽງ ${item.stockQty} ລາຍການ`);
            return item;
          }
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      }),
    );
  };

  const setQuantity = (id: string, value: string) => {
    if (value === "") {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: 0 } : item)),
      );
      return;
    }
    const newQty = parseInt(value);
    if (isNaN(newQty)) return;
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.stockQty !== undefined && newQty > item.stockQty) {
            toast.error(`ສິນຄ້າ "${item.name}" ມີໃນສາງພຽງ ${item.stockQty} ລາຍການ`);
            return { ...item, quantity: item.stockQty };
          }
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      }),
    );
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <I18nProvider locale="en-GB">
      <HeroUIProvider navigate={navigate} useHref={useHref} locale="en-GB">
        <AuthProvider>
          <CartContext.Provider
            value={{
              cart,
              addToCart,
              removeFromCart,
              updateQuantity,
              setQuantity,
              clearCart,
              subtotal,
            }}
          >
            {children}
          </CartContext.Provider>
          <Toaster position="top-right" reverseOrder={false} />
        </AuthProvider>
      </HeroUIProvider>
    </I18nProvider>
  );
}
