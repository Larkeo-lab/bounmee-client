import React, { useEffect } from "react";
import { I18nProvider } from "@react-aria/i18n";
import { HeroUIProvider } from "@heroui/react";
import { useHref, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./routes/AuthContext";
import { useCartStore, CartItem } from "./store/useCartStore";
import { useCartSync } from "./hooks/useCartSync";
import { useWifiConnect } from "./hooks/wifiConnect";
import { ChatProvider } from "./contexts/ChatContext";

export type { CartItem };

export const useCart = () => {
  const store = useCartStore();

  const currentCartId = store.activeTableId || "default";
  const cart = store.carts[currentCartId] || [];

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Derived Statistics
  const kitchenCount = Object.values(store.carts).reduce((acc, items) => {
    return acc + items.filter((i) => i.status === "COOKING").length;
  }, 0);

  const orderingCount = Object.entries(store.carts).reduce(
    (acc, [tableId, items]) => {
      if (tableId === "default") return acc;
      const pendingItems = items.filter((i) => i.status === "PENDING");
      const snapshot = store.dismissedCarts[tableId];

      if (!snapshot) return acc + (pendingItems.length > 0 ? 1 : 0);
      const hasNew = pendingItems.some(
        (i) => i.quantity > (snapshot[i.id] || 0),
      );

      return acc + (hasNew ? 1 : 0);
    },
    0,
  );

  return {
    ...store,
    cart,
    subtotal,
    orderingCount,
    kitchenCount,
    clearCart: () => store.clearTableCart(currentCartId),
  };
};

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  // 1. Connectivity (Bridged to Zustand)
  const { isConnected, rtt } = useWifiConnect();
  const setConnectivity = useCartStore((s) => s.setConnectivity);

  useEffect(() => {
    setConnectivity(isConnected, rtt);
  }, [isConnected, rtt, setConnectivity]);

  // 2. Initialize Sync (Hook now uses Zustand internally)
  useCartSync();

  return (
    <I18nProvider locale="en-GB">
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        <AuthProvider>
          <ChatProvider>
            {children}
            <Toaster position="top-right" />
          </ChatProvider>
        </AuthProvider>
      </HeroUIProvider>
    </I18nProvider>
  );
};
