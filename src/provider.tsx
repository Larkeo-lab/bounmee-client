import React, { createContext, useContext, useState, useEffect } from "react";
import { socket } from "@/config/socket";
import { toast } from "react-hot-toast";
import { I18nProvider } from "@react-aria/i18n";
import { HeroUIProvider } from "@heroui/react";
import { useHref, useNavigate } from "react-router-dom";
import { AuthProvider } from "./routes/AuthContext";
import { Toaster } from "react-hot-toast";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stockQty: number;
  status: string;
}

interface CartContextType {
  cart: CartItem[];
  carts: { [tableId: string]: CartItem[] };
  addToCart: (product: any) => void;
  removeFromCart: (id: string, status: string) => void;
  updateQuantity: (id: string, status: string, delta: number) => void;
  setQuantity: (id: string, status: string, value: string) => void;
  updateStatus: (uniqueIds: string[], status: string) => void;
  clearCart: () => void;
  subtotal: number;
  activeTableId: string | null;
  setActiveTableId: (id: string | null) => void;
  dismissedCarts: { [tableId: string]: { [itemId: string]: number } };
  dismissTable: (tableId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  // 1. Initial Load: Try to get carts from localStorage
  const [carts, setCarts] = useState<{ [tableId: string]: CartItem[] }>(() => {
    try {
      const saved = localStorage.getItem("pos_carts");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  // 2. Auto-save carts to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("pos_carts", JSON.stringify(carts));
  }, [carts]);

  // Handle dismissed table orders (seen status)
  const [dismissedCarts, setDismissedCarts] = useState<{
    [tableId: string]: { [itemId: string]: number };
  }>({});

  useEffect(() => {
    localStorage.setItem("pos_dismissed_carts", JSON.stringify(dismissedCarts));
  }, [dismissedCarts]);

  // If a cart is cleared, reset its dismissal item to ensure new guests are shown
  useEffect(() => {
    const hasEmptyCartsToClear = Object.entries(carts).some(
      ([tableId, items]) =>
        (!items || items.length === 0) && dismissedCarts[tableId] !== undefined,
    );

    if (hasEmptyCartsToClear) {
      setDismissedCarts((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.entries(carts).forEach(([tableId, items]) => {
          if ((!items || items.length === 0) && next[tableId] !== undefined) {
            delete next[tableId];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [carts]);

  const dismissTable = (tableId: string) => {
    // Save snapshot of current pending items: { itemId: quantity }
    const snapshot: { [itemId: string]: number } = {};
    carts[tableId]
      ?.filter((i) => i.status === "PENDING")
      ?.forEach((item) => {
        snapshot[item.id] = (snapshot[item.id] || 0) + item.quantity;
      });
    setDismissedCarts((prev) => ({ ...prev, [tableId]: snapshot }));
  };

  // Initialize Socket on POS side
  useEffect(() => {
    const setupSocket = () => {
      try {
        const authData = localStorage.getItem("authPOS");
        if (authData) {
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

            const handleCustomerOrder = ({
              tableId,
              tableName,
              itemCount,
              items,
            }: {
              tableId: string;
              tableName?: string;
              itemCount?: number;
              items: any[];
            }) => {
              console.log("📩 CUSTOMER_ORDER received:", { tableId, items });

              setCarts((prev) => {
                const tableCart = prev[tableId] || [];
                const newCart = [...tableCart];

                items.forEach((newItem: any) => {
                  const status = newItem.status || "PENDING";
                  const existing = newCart.find(
                    (i) => i.id === newItem.id && i.status === status,
                  );
                  if (existing) {
                    existing.quantity =
                      Number(existing.quantity) + Number(newItem.quantity);
                  } else {
                    newCart.push({
                      id: newItem.id,
                      name: newItem.name,
                      price: Number(newItem.price),
                      image: newItem.image || null,
                      quantity: Number(newItem.quantity),
                      stockQty: newItem.stockQty || 999,
                      status: status,
                    });
                  }
                });

                // Play notification sound for POS for NEW items
                const audio = new Audio("/assets/void/notification.mp3");
                audio
                  .play()
                  .catch((e) =>
                    console.log("Audio play blocked by browser:", e),
                  );

                // Proactively broadcast after customer submission
                if (socket.connected) {
                  socket.emit("SYNC_TABLE_CART", {
                    storeId: currentStoreId,
                    tableId,
                    cart: newCart,
                  });
                }

                return { ...prev, [tableId]: newCart };
              });

              const displayTable = tableName
                ? `ໂຕ໊ະ ${tableName}`
                : "ໂຕ໊ະຍັງບໍ່ລະບຸ";
              const displayItems = itemCount
                ? `${itemCount} ລາຍການ`
                : "ບາງລາຍການ";
              toast.success(`📱 ${displayTable}: ມີອໍເດີໃໝ່ ${displayItems}!`);
            };

            const handleCustomerUpdateQty = ({
              tableId,
              index,
              delta,
            }: {
              tableId: string;
              index: number;
              delta: number;
            }) => {
              setCarts((prev) => {
                const tableCart = prev[tableId] || [];
                const newCart = [...tableCart];

                // Note: Customer update by index is risky if list changes,
                // but let's keep it for compatibility or fix it to ID+Status later.
                if (
                  newCart[index] &&
                  (newCart[index].status === "PENDING" ||
                    !newCart[index].status)
                ) {
                  const newQty = Math.max(
                    0,
                    (newCart[index].quantity || 0) + delta,
                  );
                  if (newQty === 0) {
                    newCart.splice(index, 1);
                  } else {
                    newCart[index] = { ...newCart[index], quantity: newQty };
                  }

                  if (socket.connected) {
                    socket.emit("SYNC_TABLE_CART", {
                      storeId: currentStoreId,
                      tableId,
                      cart: newCart,
                    });
                  }
                }
                return { ...prev, [tableId]: newCart };
              });
            };

            socket.on("CUSTOMER_ORDER", handleCustomerOrder);
            socket.on("CUSTOMER_UPDATE_QTY", handleCustomerUpdateQty);

            return () => {
              socket.off("connect", joinRoom);
              socket.off("CUSTOMER_ORDER", handleCustomerOrder);
              socket.off("CUSTOMER_UPDATE_QTY", handleCustomerUpdateQty);
            };
          }
        }
      } catch (e) {
        console.error("Socket setup err:", e);
      }
    };

    const cleanup = setupSocket();
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, []);

  // POS Broadcast: เมื่อ Cart ของโต๊ะที่เลือกมีการเปลี่ยนแปลง ให้ Sync ส่งไปให้ Server
  useEffect(() => {
    if (activeTableId && activeTableId !== "default") {
      try {
        const authData = localStorage.getItem("authPOS");
        if (authData) {
          const authDataJson = JSON.parse(authData);
          const storeId =
            authDataJson?.user?.store?.id || authDataJson?.user?.storeId;

          if (storeId && socket.connected) {
            socket.emit("SYNC_TABLE_CART", {
              storeId,
              tableId: activeTableId,
              cart: carts[activeTableId] || [],
            });
          }
        }
      } catch (e) {
        console.error("Cart sync error:", e);
      }
    }
  }, [carts, activeTableId]);

  const currentCartId = activeTableId || "default";
  const cart = carts[currentCartId] || [];

  const updateCurrentCart = (updater: (prev: CartItem[]) => CartItem[]) => {
    setCarts((prev) => ({
      ...prev,
      [currentCartId]: updater(prev[currentCartId] || []),
    }));
  };

  const addToCart = (product: any) => {
    const status = product.status || "PENDING";
    updateCurrentCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.status === status,
      );
      if (existing) {
        if (
          product.stockQty !== undefined &&
          existing.quantity + 1 > product.stockQty
        ) {
          toast.error(
            `ສິນຄ້າ "${product.name}" ມີໃນສາງພຽງ ${product.stockQty} ລາຍການ`,
          );
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id && item.status === status
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
          status: status,
        },
      ];
    });
  };

  const removeFromCart = (id: string, status: string) => {
    updateCurrentCart((prev) =>
      prev.filter((item) => !(item.id === id && item.status === status)),
    );
  };

  const updateQuantity = (id: string, status: string, delta: number) => {
    updateCurrentCart((prev) =>
      prev.map((item) => {
        if (item.id === id && item.status === status) {
          const newQty = item.quantity + delta;
          if (item.stockQty !== undefined && newQty > item.stockQty) {
            toast.error(
              `ສິນຄ້າ "${item.name}" ມີໃນສາງພຽງ ${item.stockQty} ລາຍການ`,
            );
            return item;
          }
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      }),
    );
  };

  const setQuantity = (id: string, status: string, value: string) => {
    if (value === "") {
      updateCurrentCart((prev) =>
        prev.map((item) =>
          item.id === id && item.status === status
            ? { ...item, quantity: 0 }
            : item,
        ),
      );
      return;
    }
    const newQty = parseInt(value);
    if (isNaN(newQty)) return;
    updateCurrentCart((prev) =>
      prev.map((item) => {
        if (item.id === id && item.status === status) {
          if (item.stockQty !== undefined && newQty > item.stockQty) {
            toast.error(
              `ສິນຄ້າ "${item.name}" ມີໃນສາງພຽງ ${item.stockQty} ລາຍການ`,
            );
            return { ...item, quantity: item.stockQty };
          }
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      }),
    );
  };

  const updateStatus = (uniqueIds: string[], status: string) => {
    updateCurrentCart((prev) => {
      // 1. Update statuses
      const updatedCart = prev.map((item) => {
        const uId = `${item.id}-${item.status}`;
        return uniqueIds.includes(uId) ? { ...item, status } : item;
      });

      // 2. Merge items with same id and status
      const mergedCart: CartItem[] = [];
      updatedCart.forEach((item) => {
        const existing = mergedCart.find(
          (m) => m.id === item.id && m.status === item.status,
        );
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          mergedCart.push({ ...item });
        }
      });
      return mergedCart;
    });
  };

  const clearCart = () => updateCurrentCart(() => []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <I18nProvider locale="en-GB">
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        <AuthProvider>
          <CartContext.Provider
            value={{
              cart,
              carts,
              addToCart,
              removeFromCart,
              updateQuantity,
              setQuantity,
              updateStatus,
              clearCart,
              subtotal,
              activeTableId,
              setActiveTableId,
              dismissedCarts,
              dismissTable,
            }}
          >
            {children}
            <Toaster position="top-right" />
          </CartContext.Provider>
        </AuthProvider>
      </HeroUIProvider>
    </I18nProvider>
  );
};
