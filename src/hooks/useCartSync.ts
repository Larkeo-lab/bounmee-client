import { useEffect, useRef } from "react";
import { socket } from "@/config/socket";
import queryClient from "@/config/queryClient";
import { CartItem } from "@/provider";
import { toast } from "react-hot-toast";

interface UseCartSyncProps {
  carts: { [tableId: string]: CartItem[] };
  setCarts: React.Dispatch<
    React.SetStateAction<{ [tableId: string]: CartItem[] }>
  >;
  mergeCarts: (
    local: CartItem[],
    incoming: any[],
    tableStatus?: string,
  ) => CartItem[];
  isConnected: boolean;
}

export const useCartSync = ({
  carts,
  setCarts,
  mergeCarts,
  isConnected,
}: UseCartSyncProps) => {
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
          };

          socket.on("connect", joinRoom);
          if (socket.connected) joinRoom();

          // Handle Customer Orders
          socket.on("CUSTOMER_ORDER", ({ tableId, items }) => {
            try {
              const audio = new Audio("/assets/void/notification.mp3");
              audio.play().catch((e) => console.log("Audio play blocked:", e));
            } catch (e) {}
            setCarts((prev) => {
              const tableCart = prev[tableId] || [];
              const newCart = [...tableCart];

              console.log("items", items);
              items.forEach((newItem: any) => {
                const status = (newItem.status || "PENDING").toUpperCase();
                const note = newItem.note || null;

                const existingIndex = newCart.findIndex(
                  (i) =>
                    i.id === newItem.id &&
                    i.status === status &&
                    (i.note || null) === note,
                );

                if (existingIndex > -1) {
                  newCart[existingIndex] = {
                    ...newCart[existingIndex],
                    quantity:
                      Number(newCart[existingIndex].quantity) +
                      Number(newItem.quantity),
                  };
                } else {
                  newCart.push({
                    ...newItem,
                    id: newItem.id || newItem.productId,
                    status,
                    price: Number(newItem.price),
                    quantity: Number(newItem.quantity),
                    timestamp: newItem.timestamp || Date.now(),
                  });
                }
              });

              return { ...prev, [tableId]: newCart };
            });
          });

          // Handle Table Cart Updates from other devices
          socket.on(
            "TABLE_CART_UPDATED",
            (data: { tableId: string; cart: any[]; tableStatus?: string }) => {
              setCarts((prev) => {
                const localCart = prev[data.tableId] || [];
                const mergedCart = mergeCarts(
                  localCart,
                  data.cart,
                  data.tableStatus,
                );

                const nextJson = JSON.stringify(mergedCart);
                if (JSON.stringify(localCart) === nextJson) return prev;

                lastSyncRef.current[data.tableId] = nextJson;
                return { ...prev, [data.tableId]: mergedCart };
              });
              queryClient.invalidateQueries({ queryKey: ["tables"] });
            },
          );

          // Handle Customer Update Quantity
          socket.on("CUSTOMER_UPDATE_QTY", ({ tableId, index, delta }) => {
            setCarts((prev) => {
              const tableCart = prev[tableId] || [];
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
              }
              return { ...prev, [tableId]: newCart };
            });
          });

          return () => {
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
  }, [setCarts, mergeCarts]);

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
