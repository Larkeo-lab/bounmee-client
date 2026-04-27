import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "react-hot-toast";

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

interface CartState {
  carts: { [tableId: string]: CartItem[] };
  activeTableId: string | null;
  dismissedCarts: { [tableId: string]: { [itemId: string]: number } };
  isConnected: boolean;
  rtt: number | null;
}

interface CartActions {
  addToCart: (product: any) => void;
  removeFromCart: (id: string, status: string, note?: string) => void;
  updateQuantity: (
    id: string,
    status: string,
    delta: number,
    note?: string,
  ) => void;
  setQuantity: (
    id: string,
    status: string,
    value: string,
    note?: string,
  ) => void;
  updateStatus: (uniqueIds: string[], status: string, tableId?: string) => void;
  updateItemNote: (
    id: string,
    status: string,
    oldNote: string | undefined,
    newNote: string,
  ) => void;
  clearTableCart: (tableId: string) => void;
  setActiveTableId: (id: string | null) => void;
  setTableCart: (tableId: string, cart: CartItem[], isOverwrite?: boolean) => void;
  dismissTable: (tableId: string) => void;
  setConnectivity: (isConnected: boolean, rtt: number | null) => void;
  mergeCarts: (local: CartItem[], incoming: any[]) => CartItem[];
}

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // --- State ---
      carts: {},
      activeTableId: null,
      dismissedCarts: {},
      isConnected: false,
      rtt: null,

      // --- Actions ---
      setConnectivity: (isConnected, rtt) => set({ isConnected, rtt }),

      setActiveTableId: (id) => set({ activeTableId: id }),

      mergeCarts: (local: CartItem[], incoming: any[]): CartItem[] => {
        const mergedMap = new Map<string, CartItem>();
        const allItems = [
          ...local,
          ...(incoming || []).map((i) => ({
            ...i,
            status: (i.status || "PENDING").toUpperCase(),
            timestamp: i.timestamp ? Number(i.timestamp) : Date.now(),
          })),
        ];

        const statusPriority: Record<string, number> = {
          CANCEL: 0,
          PENDING: 1,
          COOKING: 2,
          SERVED: 3,
        };

        for (const item of allItems) {
          const key = `${item.id}-${(item.note || "").trim()}`.toUpperCase();
          const existing = mergedMap.get(key);

          if (!existing) {
            mergedMap.set(key, { ...item });
            continue;
          }

          const existingPriority = statusPriority[existing.status] || 0;
          const currentPriority = statusPriority[item.status] || 0;

          if (currentPriority > existingPriority) {
            mergedMap.set(key, { ...item });
          } else if (currentPriority === existingPriority) {
            if ((item.timestamp || 0) > (existing.timestamp || 0)) {
              mergedMap.set(key, { ...item });
            }
          }
        }

        return Array.from(mergedMap.values());
      },

      addToCart: (product: any) => {
        const { activeTableId, carts } = get();
        const currentTableId = activeTableId || "default";
        const currentCart = carts[currentTableId] || [];

        const status = (product.status || "PENDING").toUpperCase();
        const note = (product.note || "").trim();

        const existingIndex = currentCart.findIndex(
          (i) =>
            i.id === product.id &&
            i.status === status &&
            (i.note || "").trim() === note,
        );

        let nextCart = [...currentCart];

        if (existingIndex > -1) {
          const totalInCart = currentCart
            .filter((i) => i.id === product.id && i.status !== "CANCEL")
            .reduce((s, i) => s + i.quantity, 0);

          if (
            product.stockQty !== undefined &&
            totalInCart + 1 > product.stockQty
          ) {
            toast.error(
              `ສິນຄ້າ "${product.name}" ມີໃນສາງພຽງ ${product.stockQty} ລາຍການ`,
            );

            return;
          }

          nextCart[existingIndex] = {
            ...nextCart[existingIndex],
            quantity: nextCart[existingIndex].quantity + 1,
          };
        } else {
          if (product.stockQty <= 0) {
            toast.error(`ສິນຄ້າ "${product.name}" ຫມົດแล้ว!`);

            return;
          }

          nextCart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image || null,
            quantity: 1,
            stockQty: product.stockQty,
            status,
            timestamp: Date.now(),
            note: note || undefined,
          });
        }

        set({ carts: { ...carts, [currentTableId]: nextCart } });
      },

      removeFromCart: (id, status, note) => {
        const { activeTableId, carts } = get();
        const currentTableId = activeTableId || "default";
        const currentCart = carts[currentTableId] || [];

        const nextCart = currentCart.filter(
          (i) =>
            !(
              i.id === id &&
              i.status === status &&
              (i.note || "") === (note || "")
            ),
        );

        set({ carts: { ...carts, [currentTableId]: nextCart } });
      },

      updateQuantity: (id, status, delta, note) => {
        const { activeTableId, carts } = get();
        const currentTableId = activeTableId || "default";
        const currentCart = carts[currentTableId] || [];

        const nextCart = currentCart.map((item) => {
          if (
            item.id === id &&
            item.status === status &&
            (item.note || "") === (note || "")
          ) {
            const newQty = Math.max(1, item.quantity + delta);

            if (
              delta > 0 &&
              item.stockQty !== undefined &&
              newQty > item.stockQty
            ) {
              toast.error(
                `ສິນຄ້າ "${item.name}" ມີໃນສະຕັອກພຽງ ${item.stockQty} รายการ`,
              );

              return item;
            }

            return { ...item, quantity: newQty };
          }

          return item;
        });

        set({ carts: { ...carts, [currentTableId]: nextCart } });
      },

      setQuantity: (id, status, value, note) => {
        const { activeTableId, carts } = get();
        const currentTableId = activeTableId || "default";
        const currentCart = carts[currentTableId] || [];

        const newQty = value === "" ? 0 : parseInt(value);

        if (isNaN(newQty)) return;

        const nextCart = currentCart.map((item) => {
          if (
            item.id === id &&
            item.status === status &&
            (item.note || "") === (note || "")
          ) {
            if (item.stockQty !== undefined && newQty > item.stockQty) {
              toast.error(
                `ສິນค้า "${item.name}" มีในสต็อกเพียง ${item.stockQty} รายการ`,
              );

              return { ...item, quantity: item.stockQty };
            }

            return { ...item, quantity: Math.max(0, newQty) };
          }

          return item;
        });

        set({ carts: { ...carts, [currentTableId]: nextCart } });
      },

      updateStatus: (uniqueIds, status, tableId) => {
        const { activeTableId, carts } = get();
        const targetStatus = status.toUpperCase();
        const targetTableId = tableId || activeTableId || "default";
        const targetCart = carts[targetTableId] || [];

        const normalizedIds = uniqueIds.map((id) => id.toUpperCase());

        const updatedCart = targetCart.map((item) => {
          const key =
            `${item.id}-${item.status.toUpperCase()}-${(item.note || "").trim()}`.toUpperCase();

          if (normalizedIds.includes(key)) {
            return {
              ...item,
              status: targetStatus,
              timestamp: Date.now(),
            };
          }

          return item;
        });

        const mergedMap = new Map<string, CartItem>();

        updatedCart.forEach((item) => {
          const key =
            `${item.id}-${item.status}-${(item.note || "").trim()}`.toUpperCase();
          const existing = mergedMap.get(key);

          if (existing) existing.quantity += item.quantity;
          else mergedMap.set(key, { ...item });
        });

        set({
          carts: {
            ...carts,
            [targetTableId]: Array.from(mergedMap.values()),
          },
        });
      },

      updateItemNote: (id, status, oldNote, newNote) => {
        const { activeTableId, carts } = get();
        const currentTableId = activeTableId || "default";
        const currentCart = carts[currentTableId] || [];

        const normalizedOldNote = (oldNote || "").trim();
        const normalizedNewNote = newNote.trim();

        const itemIndex = currentCart.findIndex(
          (i) =>
            i.id === id &&
            i.status === status &&
            (i.note || "").trim() === normalizedOldNote,
        );

        if (itemIndex === -1) return;

        const nextCart = [...currentCart];
        const targetItem = {
          ...nextCart[itemIndex],
          note: normalizedNewNote || undefined,
          timestamp: Date.now(),
        };

        const existingIndex = nextCart.findIndex(
          (i, idx) =>
            idx !== itemIndex &&
            i.id === id &&
            i.status === status &&
            (i.note || "").trim() === normalizedNewNote,
        );

        if (existingIndex !== -1) {
          nextCart[existingIndex] = {
            ...nextCart[existingIndex],
            quantity: nextCart[existingIndex].quantity + targetItem.quantity,
            timestamp: Date.now(),
          };
          nextCart.splice(itemIndex, 1);
        } else {
          nextCart[itemIndex] = targetItem;
        }

        set({ carts: { ...carts, [currentTableId]: nextCart } });
      },

      clearTableCart: (tableId) => {
        const { carts } = get();
        const nextCarts = { ...carts };

        delete nextCarts[tableId];
        set({ carts: nextCarts });
      },

      setTableCart: (tableId, cartData, isOverwrite = false) => {
        const { carts, mergeCarts } = get();
        const localCart = carts[tableId] || [];
        const mergedCart = isOverwrite
          ? cartData
          : mergeCarts(localCart, cartData);

        if (JSON.stringify(localCart) === JSON.stringify(mergedCart)) return;

        set({ carts: { ...carts, [tableId]: mergedCart } });
      },

      dismissTable: (tableId) => {
        const { carts, dismissedCarts } = get();
        const snapshot: { [itemId: string]: number } = {};

        (carts[tableId] || [])
          .filter((i) => i.status === "PENDING")
          .forEach((i) => {
            snapshot[i.id] = (snapshot[i.id] || 0) + i.quantity;
          });

        set({ dismissedCarts: { ...dismissedCarts, [tableId]: snapshot } });
      },
    }),
    {
      name: "pos-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        carts: state.carts,
        dismissedCarts: state.dismissedCarts,
      }),
    },
  ),
);
