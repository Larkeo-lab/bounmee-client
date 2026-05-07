import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

import { socket } from "@/config/socket";
import queryClient from "@/config/queryClient";
import { useCartStore } from "@/store/useCartStore";

export const useCartSync = () => {
  const {
    carts,
    isConnected,
    mergeCarts,
  } = useCartStore();

  const lastSyncRef = useRef<{ [tableId: string]: string }>({});

  // 1. Initialize Socket and Listeners
  useEffect(() => {
    const setupSocket = () => {
      try {
        const authData = localStorage.getItem("authPOS");
        if (!authData) return;
        const authDataJson = JSON.parse(authData);
        const currentStoreId =
          authDataJson?.user?.store?.id || authDataJson?.user?.storeId;

        if (currentStoreId) {
          if (!socket.connected) {
            socket.connect();
          }

          const joinRoom = () => {
            socket.emit("JOIN:STORE", currentStoreId);
            console.log(`📡 POS Socket JOINED: store-${currentStoreId}`);
            // Force fetch latest tables and carts on reconnect to catch up on missed customer orders
            queryClient.invalidateQueries({ queryKey: ["tables"] });
          };

          socket.on("connect", joinRoom);
          socket.on("reconnect", joinRoom); // Added for extra robustness
          if (socket.connected) joinRoom();

          // Handle Customer Orders
          socket.on("CUSTOMER_ORDER", ({ tableId, items }) => {
            try {
              const audio = new Audio("/assets/void/notification.mp3");
              audio.play().catch((e) => console.log("Audio play blocked:", e));
            } catch (e) {}

            // The store's setTableCart or a custom logic can be used
            // but for CUSTOMER_ORDER we merge into existing
            const currentCarts = useCartStore.getState().carts;
            const tableCart = currentCarts[tableId] || [];
            const mergedCart = mergeCarts(tableCart, items);

            useCartStore.setState((state) => ({
              carts: { ...state.carts, [tableId]: mergedCart },
            }));
          });

          // Handle Table Cart Updates from other devices
          socket.on(
            "TABLE_CART_UPDATED",
            (data: { tableId: string; cart: any[]; tableStatus?: string }) => {
              if (data.tableId === "default") return;

              const currentCarts = useCartStore.getState().carts;
              const localCart = currentCarts[data.tableId] || [];

              // 🔊 Sound Logic: Context-Aware Notifications
              const isKitchenPage = window.location.pathname.includes("/kitchen");
              const isTablePage = window.location.pathname.includes("/table");

              const hasNewCooking = data.cart?.some(
                (newItem) =>
                  newItem.status === "COOKING" &&
                  !localCart.some(
                    (old) =>
                      old.id === newItem.id &&
                      old.status === "COOKING" &&
                      (old.note || "") === (newItem.note || ""),
                  ),
              );

              const hasNewServed = data.cart?.some(
                (newItem) =>
                  newItem.status === "SERVED" &&
                  !localCart.some(
                    (old) =>
                      old.id === newItem.id &&
                      old.status === "SERVED" &&
                      (old.note || "") === (newItem.note || ""),
                  ),
              );

              // Play sound for Kitchen if new items to cook arrive
              // Play sound for POS if items are served by kitchen
              if ((isKitchenPage && hasNewCooking) || (isTablePage && hasNewServed)) {
                try {
                  const audio = new Audio("/assets/void/notification.mp3");
                  audio
                    .play()
                    .catch((e) => console.log("Audio play blocked:", e));
                } catch (e) {}
              }

              // ✨ If table is AVAILABLE, force clear instead of merging
              const isAvailable = data.tableStatus === "AVAILABLE";
              const mergedCart = isAvailable
                ? []
                : mergeCarts(localCart, data.cart);

              const nextJson = JSON.stringify(mergedCart);
              if (JSON.stringify(localCart) === nextJson) return;

              // Update local state without re-triggering sync
              lastSyncRef.current[data.tableId] = nextJson;

              useCartStore.setState((state) => ({
                carts: { ...state.carts, [data.tableId]: mergedCart },
              }));

              queryClient.invalidateQueries({ queryKey: ["tables"] });
            },
          );

          // Handle Customer Update Quantity
          socket.on("CUSTOMER_UPDATE_QTY", ({ tableId, index, delta }) => {
            const currentCarts = useCartStore.getState().carts;
            const tableCart = currentCarts[tableId] || [];
            const newCart = [...tableCart];

            if (
              newCart[index] &&
              (newCart[index].status === "PENDING" || !newCart[index].status)
            ) {
              const newQty = Math.max(
                0,
                (newCart[index].quantity || 0) + delta,
              );

              if (newQty === 0) newCart.splice(index, 1);
              else newCart[index] = { ...newCart[index], quantity: newQty };

              useCartStore.setState((state) => ({
                carts: { ...state.carts, [tableId]: newCart },
              }));
            }
          });

          return () => {
            socket.off("connect", joinRoom);
            socket.off("CUSTOMER_ORDER");
            socket.off("CUSTOMER_UPDATE_QTY");
            socket.off("TABLE_CART_UPDATED");
          };
        }
      } catch (e) {
        console.error("Socket error:", e);
      }
    };

    const cleanup = setupSocket();
    return () => {
      if (cleanup) cleanup();
    };
  }, []); // Store is stable, so we don't need it in deps

  // 2. Broadcast Local Changes with Acknowledgment
  useEffect(() => {
    try {
      const authData = localStorage.getItem("authPOS");
      if (!authData) return;
      const authDataJson = JSON.parse(authData);
      const storeId =
        authDataJson?.user?.store?.id || authDataJson?.user?.storeId;

      if (!storeId || !socket.connected) return;

      Object.entries(carts).forEach(([tableId, items]) => {
        if (tableId === "default") return;
        const currentJson = JSON.stringify(items);

        if (lastSyncRef.current[tableId] !== currentJson) {
          const previousJsonSnapshot = lastSyncRef.current[tableId];
          lastSyncRef.current[tableId] = currentJson;

          socket.emit(
            "SYNC_TABLE_CART",
            { storeId, tableId, cart: items },
            (res: any) => {
              if (!res?.success) {
                console.error("❌ Sync failed for table", tableId, res?.error);
                toast.error(
                  `ສຳຮອງຂໍ້ມູນລົ້ມເຫລວ (Sync Failed): ໂຕະ ${tableId}`,
                );
                lastSyncRef.current[tableId] = previousJsonSnapshot;
              }
            },
          );
        }
      });
    } catch (e) {}
  }, [carts, isConnected]);

  return {};
};
