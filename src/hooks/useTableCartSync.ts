/**
 * useTableCartSync — Hook ສຳລັບ Sync ຂໍ້ມູນກະຕ່າຂອງລະບົບໂຕະອາຫານ (Restaurant) ກັບ Server
 *
 * ⚠️ ໃຊ້ສຳລັບລະບົບໂຕະອາຫານເທົ່ານັ້ນ (Table/Kitchen/Ordering)
 * ບໍ່ກ່ຽວຂ້ອງກັບ Cafe ຫຼື General — ຂໍ້ມູນ Cafe/General ເກັບໃນ localStorage ເທົ່ານັ້ນ
 */
import { useEffect, useRef, useMemo } from "react";
import { toast } from "react-hot-toast";

import { socket } from "@/config/socket";
import queryClient from "@/config/queryClient";
import { useCartStore } from "@/store/useCartStore";

export const useTableCartSync = () => {
  const {
    carts,
    isConnected,
    mergeCarts,
  } = useCartStore();

  const lastSyncRef = useRef<{ [tableId: string]: string }>({});

  // 🎯 ກັ່ນກອງສະເພາະກະຕ່າທີ່ເປັນລະບົບໂຕະ (ບໍ່ມີ ":" ໃນ ID) ເພື່ອໃຊ້ໃນການ Sync
  const tableCarts = useMemo(() => {
    return Object.fromEntries(
      Object.entries(carts).filter(([id]) => !id.includes(":"))
    );
  }, [carts]);

  // 1. Initialize Socket and Listeners
  useEffect(() => {
    const authData = localStorage.getItem("authPOS");
    if (!authData) return;

    let currentStoreId: string | undefined;

    try {
      const authDataJson = JSON.parse(authData);

      currentStoreId =
        authDataJson?.user?.store?.id || authDataJson?.user?.storeId;
    } catch (err) {
      console.error("Socket Init Error:", err);

      return;
    }

    if (!currentStoreId) return;

    if (!socket.connected) {
      socket.connect();
    }

    const joinRoom = () => {
      socket.emit("JOIN:STORE", currentStoreId);
      console.log(`📡 POS Socket JOINED: store-${currentStoreId}`);
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    };

    // Handle Customer Orders
    const handleCustomerOrder = ({ tableId, items }: any) => {
      try {
        const audio = new Audio("/assets/void/notification.mp3");

        audio.play().catch((e) => console.log("Audio play blocked:", e));
      } catch (e) {}

      const currentCarts = useCartStore.getState().carts;
      const tableCart = currentCarts[tableId] || [];
      const mergedCart = mergeCarts(tableCart, items);

      useCartStore.setState((state) => ({
        carts: { ...state.carts, [tableId]: mergedCart },
      }));
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    };

    // Handle Table Updates (Synced across POS)
    const handleTableCartUpdated = (data: {
      tableId: string;
      cart: any[];
      tableStatus?: string;
    }) => {
      const currentCarts = useCartStore.getState().carts;
      const localCart = currentCarts[data.tableId] || [];

      // If table is AVAILABLE, force clear instead of merging
      const isAvailable = data.tableStatus === "AVAILABLE";
      const mergedCart = isAvailable ? [] : mergeCarts(localCart, data.cart);

      const nextJson = JSON.stringify(mergedCart);

      if (JSON.stringify(localCart) === nextJson) return;

      lastSyncRef.current[data.tableId] = nextJson;

      useCartStore.setState((state) => ({
        carts: { ...state.carts, [data.tableId]: mergedCart },
      }));

      queryClient.invalidateQueries({ queryKey: ["tables"] });
    };

    // Handle Customer Update Quantity
    const handleCustomerUpdateQty = ({ tableId, index, delta }: any) => {
      const currentCarts = useCartStore.getState().carts;
      const tableCart = currentCarts[tableId] || [];
      const newCart = [...tableCart];

      if (newCart[index]) {
        newCart[index] = {
          ...newCart[index],
          quantity: Math.max(1, newCart[index].quantity + delta),
        };

        useCartStore.setState((state) => ({
          carts: { ...state.carts, [tableId]: newCart },
        }));
        queryClient.invalidateQueries({ queryKey: ["tables"] });
      }
    };

    socket.on("connect", joinRoom);
    socket.on("reconnect", joinRoom);
    if (socket.connected) joinRoom();

    socket.on("CUSTOMER_ORDER", handleCustomerOrder);
    socket.on("TABLE_CART_UPDATED", handleTableCartUpdated);
    socket.on("CUSTOMER_UPDATE_QTY", handleCustomerUpdateQty);

    return () => {
      // ✅ off เฉพาะ handler ของ hook นี้ (อย่าใช้ socket.off("connect") เปล่าๆ
      //    เพราะจะลบ listener ของ component อื่นที่ใช้ socket ตัวเดียวกัน)
      socket.off("connect", joinRoom);
      socket.off("reconnect", joinRoom);
      socket.off("CUSTOMER_ORDER", handleCustomerOrder);
      socket.off("TABLE_CART_UPDATED", handleTableCartUpdated);
      socket.off("CUSTOMER_UPDATE_QTY", handleCustomerUpdateQty);
    };
  }, [mergeCarts]);

  // 2. Broadcast Local Changes with Acknowledgment
  useEffect(() => {
    // 🛡️ Guard: ຖ້າບໍ່ມີການເຊື່ອມຕໍ່ ຫຼື ບໍ່ມີຂໍ້ມູນໂຕະ ໃຫ້ຢຸດທັນທີ
    if (!isConnected || Object.keys(tableCarts).length === 0) return;

    try {
      const authData = localStorage.getItem("authPOS");
      if (!authData) return;
      const authDataJson = JSON.parse(authData);
      const currentStoreId = authDataJson?.user?.store?.id || authDataJson?.user?.storeId;
      
      if (!currentStoreId || !socket.connected) return;

      Object.entries(tableCarts).forEach(([tableId, items]) => {
        // ⚠️ ຂ້າມ ID ທີ່ບໍ່ແມ່ນ UUID ຂອງໂตะ
        if (tableId === "default" || tableId.startsWith("bill-")) return;
        
        const currentJson = JSON.stringify(items);

        if (lastSyncRef.current[tableId] !== currentJson) {
          const previousJsonSnapshot = lastSyncRef.current[tableId];
          lastSyncRef.current[tableId] = currentJson;

          socket.emit(
            "SYNC_TABLE_CART",
            { storeId: currentStoreId, tableId, cart: items },
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
    } catch (e) {
      console.error("Broadcast Error:", e);
    }
  }, [tableCarts, isConnected]);

  return {};
};
