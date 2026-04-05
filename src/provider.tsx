import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "react-hot-toast";
import { I18nProvider } from "@react-aria/i18n";
import { HeroUIProvider } from "@heroui/react";
import { useHref, useNavigate } from "react-router-dom";
import { AuthProvider } from "./routes/AuthContext";
import { Toaster } from "react-hot-toast";
import queryClient from "./config/queryClient";
import { useCartSync } from "./hooks/useCartSync";
import { useWifiConnect } from "./hooks/wifiConnect";
import { ChatProvider } from "./contexts/ChatContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stockQty: number;
  status: string;
  timestamp?: number;
  note?: string;
}

interface CartContextType {
  cart: CartItem[];
  carts: { [tableId: string]: CartItem[] };
  addToCart: (product: any) => void;
  removeFromCart: (id: string, status: string, note?: string) => void;
  updateQuantity: (id: string, status: string, delta: number, note?: string) => void;
  setQuantity: (id: string, status: string, value: string, note?: string) => void;
  updateStatus: (uniqueIds: string[], status: string, tableId?: string) => void;
  clearCart: () => void;
  clearTableCart: (tableId: string) => void;
  subtotal: number;
  activeTableId: string | null;
  setActiveTableId: (id: string | null) => void;
  dismissedCarts: { [tableId: string]: { [itemId: string]: number } };
  dismissTable: (tableId: string) => void;
  setTableCart: (tableId: string, cart: CartItem[]) => void;
  orderingCount: number;
  kitchenCount: number;
  isConnected: boolean;
  rtt: number | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  // 1. Core State
  const [carts, setCarts] = useState<{ [tableId: string]: CartItem[] }>(() => {
    try {
      const saved = localStorage.getItem("pos_carts");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [dismissedCarts, setDismissedCarts] = useState<{ [tableId: string]: { [itemId: string]: number } }>(() => {
    try {
      const saved = localStorage.getItem("pos_dismissed_carts");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // 2. Persistence
  useEffect(() => { localStorage.setItem("pos_carts", JSON.stringify(carts)); }, [carts]);
  useEffect(() => { localStorage.setItem("pos_dismissed_carts", JSON.stringify(dismissedCarts)); }, [dismissedCarts]);

  // Handle dismissal clearing
  useEffect(() => {
    const tableIdsToClear = Object.entries(carts)
      .filter(([id, items]) => (!items || items.length === 0) && dismissedCarts[id])
      .map(([id]) => id);

    if (tableIdsToClear.length > 0) {
      setDismissedCarts(prev => {
        const next = { ...prev };
        tableIdsToClear.forEach(id => delete next[id]);
        return next;
      });
    }
  }, [carts]);

  // 3. Merging Logic
  const mergeCarts = useCallback((local: CartItem[], incoming: any[], tableStatus?: string): CartItem[] => {
    const incomingItems: CartItem[] = (incoming || []).map(item => ({
      ...item,
      status: (item.status || "PENDING").toUpperCase(),
    }));

    if (tableStatus === "AVAILABLE") return incomingItems;

    const mergedMap = new Map<string, CartItem>();
    incomingItems.forEach(item => {
      const key = `${item.id}-${item.status}-${(item.note || "").trim()}`.toUpperCase();
      mergedMap.set(key, item);
    });

    (local || []).forEach(localItem => {
      const localStatus = (localItem.status || "").toUpperCase();
      const key = `${localItem.id}-${localStatus}-${(localItem.note || "").trim()}`.toUpperCase();
      
      if (localStatus === "SERVED" && !mergedMap.has(key)) {
        mergedMap.set(key, localItem);
      } else if (localStatus === "PENDING" || localStatus === "COOKING") {
        if (!mergedMap.has(key)) mergedMap.set(key, localItem);
      }
    });

    return Array.from(mergedMap.values());
  }, []);

  // 3. Initialize Connectivity
  const { isConnected, rtt } = useWifiConnect();

  // 4. Initialize Sync
  useCartSync({ carts, setCarts, mergeCarts, isConnected });

  // 5. Cart Actions
  const currentCartId = activeTableId || "default";
  const cart = carts[currentCartId] || [];

  const updateCurrentCart = useCallback((updater: (prev: CartItem[]) => CartItem[]) => {
    setCarts(prev => ({ ...prev, [currentCartId]: updater(prev[currentCartId] || []) }));
  }, [currentCartId]);

  const addToCart = useCallback((product: any) => {
    const status = (product.status || "PENDING").toUpperCase();
    const note = (product.note || "").trim();
    
    updateCurrentCart(prev => {
      const existing = prev.find(i => i.id === product.id && i.status === status && (i.note || "").trim() === note);
      if (existing) {
        const totalInCart = prev.filter(i => i.id === product.id && i.status !== "CANCEL").reduce((s, i) => s + i.quantity, 0);
        if (product.stockQty !== undefined && totalInCart + 1 > product.stockQty) {
          toast.error(`ສິນຄ້າ "${product.name}" ມີໃນສາງພຽງ ${product.stockQty} ລາຍການ`);
          return prev;
        }
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
      }

      if (product.stockQty <= 0) {
        toast.error(`ສິນຄ້າ "${product.name}" ໝົດແລ້ວ!`);
        return prev;
      }

      return [...prev, {
        id: product.id, name: product.name, price: Number(product.price),
        image: product.image || null, quantity: 1, stockQty: product.stockQty,
        status, timestamp: Date.now(), note: note || undefined,
      }];
    });
    queryClient.invalidateQueries({ queryKey: ["tables"] });
  }, [updateCurrentCart]);

  const removeFromCart = useCallback((id: string, status: string, note?: string) => {
    updateCurrentCart(prev => prev.filter(i => !(i.id === id && i.status === status && (i.note || "") === (note || ""))));
    queryClient.invalidateQueries({ queryKey: ["tables"] });
  }, [updateCurrentCart]);

  const updateQuantity = useCallback((id: string, status: string, delta: number, note?: string) => {
    updateCurrentCart(prev => prev.map(item => {
      if (item.id === id && item.status === status && (item.note || "") === (note || "")) {
        const newQty = Math.max(1, item.quantity + delta);
        if (delta > 0 && item.stockQty !== undefined && newQty > item.stockQty) {
          toast.error(`ສິນຄ້າ "${item.name}" ມີໃນສະຕັອກພຽງ ${item.stockQty} ລາຍການ`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
    queryClient.invalidateQueries({ queryKey: ["tables"] });
  }, [updateCurrentCart]);

  const setQuantity = useCallback((id: string, status: string, value: string, note?: string) => {
    const newQty = value === "" ? 0 : parseInt(value);
    if (isNaN(newQty)) return;

    updateCurrentCart(prev => prev.map(item => {
      if (item.id === id && item.status === status && (item.note || "") === (note || "")) {
        if (item.stockQty !== undefined && newQty > item.stockQty) {
          toast.error(`ສິນຄ້າ "${item.name}" ມີໃນສະຕັອກພຽງ ${item.stockQty} ລາຍການ`);
          return { ...item, quantity: item.stockQty };
        }
        return { ...item, quantity: Math.max(0, newQty) };
      }
      return item;
    }));
    queryClient.invalidateQueries({ queryKey: ["tables"] });
  }, [updateCurrentCart]);

  const updateStatus = useCallback((uniqueIds: string[], status: string, tableId?: string) => {
    const targetStatus = status.toUpperCase();
    const targetTableId = tableId || activeTableId || "default";

    setCarts(prev => {
      const targetCart = prev[targetTableId] || [];
      const normalizedIds = uniqueIds.map(id => id.toUpperCase());

      const updatedCart = targetCart.map(item => {
        const key = `${item.id}-${item.status.toUpperCase()}-${(item.note || "").trim()}`.toUpperCase();
        if (normalizedIds.includes(key)) {
          return { ...item, status: targetStatus, timestamp: item.timestamp || Date.now() };
        }
        return item;
      });

      const mergedMap = new Map<string, CartItem>();
      updatedCart.forEach(item => {
        const key = `${item.id}-${item.status}-${(item.note || "").trim()}`.toUpperCase();
        const existing = mergedMap.get(key);
        if (existing) existing.quantity += item.quantity;
        else mergedMap.set(key, { ...item });
      });

      return { ...prev, [targetTableId]: Array.from(mergedMap.values()) };
    });
    queryClient.invalidateQueries({ queryKey: ["tables"] });
  }, [activeTableId]);

  const clearCart = useCallback(() => updateCurrentCart(() => []), [updateCurrentCart]);

  const clearTableCart = useCallback((tableId: string) => {
    setCarts(prev => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });
    queryClient.invalidateQueries({ queryKey: ["tables"] });
  }, []);

  const dismissTable = useCallback((tableId: string) => {
    const snapshot: { [itemId: string]: number } = {};
    (carts[tableId] || []).filter(i => i.status === "PENDING").forEach(i => {
      snapshot[i.id] = (snapshot[i.id] || 0) + i.quantity;
    });
    setDismissedCarts(prev => ({ ...prev, [tableId]: snapshot }));
  }, [carts]);

  const setTableCart = useCallback((tableId: string, cart: CartItem[]) => {
    setCarts(prev => {
      const mergedCart = mergeCarts(prev[tableId] || [], cart);
      if (JSON.stringify(prev[tableId] || []) === JSON.stringify(mergedCart)) return prev;
      return { ...prev, [tableId]: mergedCart };
    });
  }, [mergeCarts]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Derived Statistics
  const kitchenCount = Object.values(carts).reduce((acc, items) => {
    return acc + items.filter(i => i.status === "COOKING").length;
  }, 0);

  const orderingCount = Object.entries(carts).reduce((acc, [tableId, items]) => {
    if (tableId === "default") return acc;
    const pendingItems = items.filter(i => i.status === "PENDING");
    const snapshot = dismissedCarts[tableId];

    if (!snapshot) return acc + (pendingItems.length > 0 ? 1 : 0);
    const hasNew = pendingItems.some(i => i.quantity > (snapshot[i.id] || 0));
    return acc + (hasNew ? 1 : 0);
  }, 0);

  return (
    <I18nProvider locale="en-GB">
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        <AuthProvider>
          <ChatProvider>
            <CartContext.Provider value={{
              cart, carts, addToCart, removeFromCart, updateQuantity, setQuantity,
              updateStatus, clearCart, clearTableCart, subtotal, activeTableId, setActiveTableId,
              dismissedCarts, dismissTable, setTableCart, orderingCount, kitchenCount,
              isConnected, rtt
            }}>
              {children}
              <Toaster position="top-right" />
            </CartContext.Provider>
          </ChatProvider>
        </AuthProvider>
      </HeroUIProvider>
    </I18nProvider>
  );
};
