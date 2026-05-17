/**
 * Provider — ໂຄງສ້າງຫຼັກຂອງແອັບ ແລະ Hook ສຳລັບລະບົບໂຕະອາຫານ
 *
 * useCart() — ໃຊ້ສຳລັບ: Table, Kitchen, Ordering, Navbar, Sidebar
 * ⚠️ ບໍ່ໃຊ້ສຳລັບ Cafe ແລະ General → ໃຫ້ໃຊ້ useCafeCart() ແລະ useGeneralCart() ແທນ
 */
import React, { useEffect } from "react";
import { I18nProvider } from "@react-aria/i18n";
import { HeroUIProvider } from "@heroui/react";
import { useHref, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./routes/AuthContext";
import { useCartStore, CartItem } from "./store/useCartStore";
import { useTableCartSync } from "./hooks/useTableCartSync";
import { useWifiConnect } from "./hooks/wifiConnect";
import { ChatProvider } from "./contexts/ChatContext";

export type { CartItem };

const EMPTY_ARRAY: CartItem[] = [];

/**
 * useCart — Hook ສຳລັບລະບົບໂຕະອາຫານ (Table/Kitchen/Ordering)
 *
 * ໃຊ້ activeTableId ໂດຍກົງ (ບໍ່ມີ Prefix)
 * ຂໍ້ມູນຖືກ Sync ກັບ Server ຜ່ານ Socket.io
 */
export const useCart = () => {
  const store = useCartStore();

  // ໃຊ້ activeTableId ໂດຍກົງ (ສຳລັບລະບົບໂຕະອາຫານ)
  const currentCartId = store.activeTableId || "default";
  const cart = store.carts[currentCartId] || EMPTY_ARRAY;

  // ຄິດໄລ່ຍອດລວມ
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ຄິດໄລ່ສະຖິຕິ (ສຳລັບ Kitchen ແລະ Ordering badges)
  // ນັບສະເພາະ carts ທີ່ເປັນໂຕະອາຫານ (ບໍ່ມີ ":" ໃນ ID)
  const tableCarts = Object.fromEntries(
    Object.entries(store.carts).filter(([id]) => !id.includes(":")),
  );

  const kitchenCount = Object.values(tableCarts).reduce((acc, items) => {
    return acc + items.filter((i) => i.status === "COOKING").length;
  }, 0);

  const orderingCount = Object.entries(tableCarts).reduce(
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
    allCarts: tableCarts,
    activeCartId: currentCartId,
    switchCart: store.setActiveTableId,
    removeCart: store.removeCart,
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
  useTableCartSync();

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
