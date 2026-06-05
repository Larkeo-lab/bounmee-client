import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "react-hot-toast";
import i18n from "@/config/i18n";

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
  unitName?: string;
}

interface CartState {
  // ເກັບຂໍ້ມູນກະຕ່າສິນຄ້າແຍກຕາມ ID ຂອງບິນ ຫຼື ໂຕະ
  carts: { [tableId: string]: CartItem[] };
  // ID ຂອງໂຕະທີ່ກຳລັງໃຊ້ງານຢູ່ (ສຳລັບລະບົບໂຕະອາຫານ)
  activeTableId: string | null;
  // ID ຂອງບິນ Cafe ທີ່ກຳລັງໃຊ້ງານ
  activeCafeBillId: string;
  // ID ຂອງບິນ General ທີ່ກຳລັງໃຊ້ງານ
  activeGeneralBillId: string;
  // ເກັບຂໍ້ມູນການປິດແຈ້ງເຕືອນອໍເດີໃໝ່
  dismissedCarts: { [tableId: string]: { [itemId: string]: number } };
  // ສະຖານະການເຊື່ອມຕໍ່ WiFi
  isConnected: boolean;
  // ຄ່າຄວາມຊ້າຂອງເຄືອຂ່າຍ (Ping)
  rtt: number | null;
}

interface CartActions {
  addToCart: (product: any, tableId?: string, skipToast?: boolean) => void;
  removeFromCart: (id: string, status: string, note?: string, tableId?: string) => void;
  updateQuantity: (
    id: string,
    status: string,
    delta: number,
    note?: string,
    tableId?: string,
  ) => void;
  setQuantity: (
    id: string,
    status: string,
    value: string,
    note?: string,
    tableId?: string,
  ) => void;
  updateStatus: (uniqueIds: string[], status: string, tableId?: string) => void;
  updateItemNote: (
    id: string,
    status: string,
    oldNote: string | undefined,
    newNote: string,
    tableId?: string,
  ) => void;
  clearTableCart: (tableId: string) => void;
  setActiveTableId: (id: string | null) => void;
  setActiveCafeBillId: (id: string) => void;
  setActiveGeneralBillId: (id: string) => void;
  setTableCart: (tableId: string, cart: CartItem[], isOverwrite?: boolean) => void;
  dismissTable: (tableId: string) => void;
  setConnectivity: (isConnected: boolean, rtt: number | null) => void;
  mergeCarts: (local: CartItem[], incoming: any[]) => CartItem[];
  createNewBill: (prefix?: string) => void;
  removeCart: (tableId: string) => void;
  resetCart: () => void;
}

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // --- State ---
      carts: {},
      activeTableId: null,
      activeCafeBillId: "CAFE:default",
      activeGeneralBillId: "GENERAL:default",
      dismissedCarts: {},
      isConnected: false,
      rtt: null,

      // --- Actions ---
      // ອັບເດດສະຖານະການເຊື່ອມຕໍ່
      setConnectivity: (isConnected, rtt) => set({ isConnected, rtt }),

      // ກຳນົດ ID ຂອງໂຕະທີ່ກຳລັງໃຊ້ງານ (ສຳລັບລະບົບໂຕະອາຫານເທົ່ານັ້ນ)
      setActiveTableId: (id) => set({ activeTableId: id }),

      // ກຳນົດ ID ຂອງບິນ Cafe ທີ່ກຳລັງໃຊ້ງານ
      setActiveCafeBillId: (id) => set({ activeCafeBillId: id }),

      // ກຳນົດ ID ຂອງບິນ General ທີ່ກຳລັງໃຊ້ງານ
      setActiveGeneralBillId: (id) => set({ activeGeneralBillId: id }),

      // ຟັງຊັນຮວມຂໍ້ມູນກະຕ່າຈາກ Local ແລະ Server (ໃຊ້ສຳລັບການ Sync ຂໍ້ມູນ)
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

      // ເພີ່ມສິນຄ້າເຂົ້າກະຕ່າ
      addToCart: (product: any, tableId?: string, skipToast?: boolean) => {
        const { activeTableId, carts } = get();
        const currentTableId = tableId || activeTableId || "default";

        // If activeTableId is null but product has a suggested type/prefix (future-proofing)
        // For now, we rely on the hook setting the activeTableId with prefix.
        
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
              i18n.t("customer.stockWarning", {
                name: product.name,
                qty: product.stockQty,
              }),
            );

            return;
          }

          nextCart[existingIndex] = {
            ...nextCart[existingIndex],
            quantity: nextCart[existingIndex].quantity + 1,
          };

          if (!skipToast) {
            toast.success(i18n.t("sale.itemAdded", { name: product.name }), {
              duration: 800,
              position: "top-center",
            });
          }
        } else {
          if (product.stockQty <= 0) {
            toast.error(
              i18n.t("customer.soldOut", {
                name: product.name,
              }),
            );

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
            unitName: product.unit?.name || undefined,
          });

          if (!skipToast) {
            toast.success(i18n.t("sale.itemAdded", { name: product.name }), {
              duration: 800,
              position: "top-center",
            });
          }
        }

        set({ carts: { ...carts, [currentTableId]: nextCart } });
      },

      // ລົບສິນຄ້າອອກຈາກກະຕ່າ
      removeFromCart: (id, status, note, tableId) => {
        const { activeTableId, carts } = get();
        const currentTableId = tableId || activeTableId || "default";
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

      // ອັບເດດຈຳນວນສິນຄ້າ (ເພີ່ມ ຫຼື ຫຼຸດ)
      updateQuantity: (id, status, delta, note, tableId) => {
        const { activeTableId, carts } = get();
        const currentTableId = tableId || activeTableId || "default";
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
                i18n.t("customer.stockWarning", {
                  name: item.name,
                  qty: item.stockQty,
                }),
              );

              return item;
            }

            return { ...item, quantity: newQty };
          }

          return item;
        });

        set({ carts: { ...carts, [currentTableId]: nextCart } });
      },

      // ກຳນົດຈຳນວນສິນຄ້າໂດຍກົງຈາກການພິມ
      setQuantity: (id, status, value, note, tableId) => {
        const { activeTableId, carts } = get();
        const currentTableId = tableId || activeTableId || "default";
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
                i18n.t("customer.stockWarning", {
                  name: item.name,
                  qty: item.stockQty,
                }),
              );

              return { ...item, quantity: item.stockQty };
            }

            return { ...item, quantity: Math.max(1, newQty) };
          }

          return item;
        });

        set({ carts: { ...carts, [currentTableId]: nextCart } });
      },

      // ອັບເດດສະຖານະຂອງສິນຄ້າ (ເຊັ່ນ: ກຳລັງປຸງແຕ່ງ, ເສີບແລ້ວ)
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

      // ອັບເດດໝາຍເຫດຂອງສິນຄ້າ
      updateItemNote: (id, status, oldNote, newNote, tableId) => {
        const { activeTableId, carts } = get();
        const currentTableId = tableId || activeTableId || "default";
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

      // ລ້າງຂໍ້ມູນສິນຄ້າໃນກະຕ່າຂອງບິນ ຫຼື ໂຕະນັ້ນໆ
      clearTableCart: (tableId) => {
        const { carts } = get();
        const nextCarts = { ...carts };

        delete nextCarts[tableId];
        set({ carts: nextCarts });
      },

      // ກຳນົດຂໍ້ມູນກະຕ່າໃຫ້ບິນ ຫຼື ໂຕະໂດຍກົງ (ໃຊ້ຕອນດຶງຂໍ້ມູນຈາກ Server)
      setTableCart: (tableId, cartData, isOverwrite = false) => {
        const { carts, mergeCarts } = get();
        const localCart = carts[tableId] || [];
        const mergedCart = isOverwrite
          ? cartData
          : mergeCarts(localCart, cartData);

        if (JSON.stringify(localCart) === JSON.stringify(mergedCart)) return;

        set({ carts: { ...carts, [tableId]: mergedCart } });
      },

      // ປິດການແຈ້ງເຕືອນອໍເດີໃໝ່ສຳລັບໂຕະນັ້ນໆ
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

      // ສ້າງບິນໃໝ່ (Multi-Cart) ໂດຍສາມາດກຳນົດ Prefix ຕາມປະເພດ (Cafe/General)
      createNewBill: (prefix?: string) => {
        const { carts } = get();
        const billId = prefix ? `${prefix}:bill-${Date.now()}` : `bill-${Date.now()}`;

        const updates: Partial<CartState> = {
          carts: { ...carts, [billId]: [] },
        };

        // ອັບເດດ Active ID ຕາມປະເພດ
        if (prefix === "CAFE") {
          updates.activeCafeBillId = billId;
        } else if (prefix === "GENERAL") {
          updates.activeGeneralBillId = billId;
        } else {
          updates.activeTableId = billId;
        }

        set(updates);

        toast.success(i18n.t("sale.newBillCreated") || "ສ້າງບິນໃໝ່ແລ້ວ", {
          duration: 800,
          position: "top-center",
        });
      },

      // ລົບບິນ ຫຼື ໂຕະອອກຈາກລະບົບ
      removeCart: (tableId: string) => {
        const { carts, activeCafeBillId, activeGeneralBillId, activeTableId } = get();
        const nextCarts = { ...carts };

        delete nextCarts[tableId];

        const updates: Partial<CartState> = { carts: nextCarts };

        // ຊອກຫາບິນຖັດໄປຕາມປະເພດ
        if (tableId.startsWith("CAFE:") && activeCafeBillId === tableId) {
          const remaining = Object.keys(nextCarts).filter((id) => id.startsWith("CAFE:"));
          updates.activeCafeBillId = remaining.length > 0 ? remaining[0] : "CAFE:default";
        } else if (tableId.startsWith("GENERAL:") && activeGeneralBillId === tableId) {
          const remaining = Object.keys(nextCarts).filter((id) => id.startsWith("GENERAL:"));
          updates.activeGeneralBillId = remaining.length > 0 ? remaining[0] : "GENERAL:default";
        } else if (activeTableId === tableId) {
          const remaining = Object.keys(nextCarts).filter((id) => !id.includes(":"));
          updates.activeTableId = remaining.length > 0 ? remaining[0] : "default";
        }

        set(updates);
      },

      // ລ້າງຂໍ້ມູນກະຕ່າທັງໝົດ ແລະ ເລີ່ມຕົ້ນໃໝ່
      resetCart: () => {
        set({
          carts: { default: [] },
          activeTableId: "default",
          activeCafeBillId: "CAFE:default",
          activeGeneralBillId: "GENERAL:default",
          dismissedCarts: {},
        });
      },
    }),
    {
      name: "pos-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        carts: state.carts,
        dismissedCarts: state.dismissedCarts,
        activeCafeBillId: state.activeCafeBillId,
        activeGeneralBillId: state.activeGeneralBillId,
      }),
    },
  ),
);
