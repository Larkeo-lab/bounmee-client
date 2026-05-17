/**
 * useGeneralCart — Hook ສຳລັບຈັດການກະຕ່າສິນຄ້າຂອງ General (ຂາຍປີກ) ໂດຍສະເພາະ
 *
 * ຂໍ້ມູນທັງໝົດຈະຖືກແຍກອອກຈາກ Cafe ແລະ Table ຢ່າງສົມບູນ
 * ໃຊ້ Prefix "GENERAL:" ສຳລັບ ID ຂອງບິນ ເຊັ່ນ "GENERAL:default", "GENERAL:bill-123"
 * ຂໍ້ມູນເກັບໃນ localStorage ເທົ່ານັ້ນ (ບໍ່ Sync ກັບ Server)
 */
import { useMemo, useCallback } from "react";
import { useCartStore, CartItem } from "@/store/useCartStore";

export type { CartItem };

const PREFIX = "GENERAL";
const EMPTY_ARRAY: CartItem[] = [];

export const useGeneralCart = () => {
  const store = useCartStore();

  // ດຶງ ID ບິນ General ທີ່ກຳລັງໃຊ້ງານ (ແຍກຈາກ Cafe ແລະ Table)
  const activeCartId = store.activeGeneralBillId || `${PREFIX}:default`;

  // ດຶງລາຍການສິນຄ້າໃນກະຕ່າປະຈຸບັນ
  const cart = store.carts[activeCartId] || EMPTY_ARRAY;

  // ຄິດໄລ່ຍອດລວມ
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ກັ່ນກອງສະເພາະບິນ General ເທົ່ານັ້ນ
  const allCarts = useMemo(() => {
    const filtered = Object.fromEntries(
      Object.entries(store.carts).filter(([id]) => id.startsWith(`${PREFIX}:`)),
    );
    // ຮັບປະກັນວ່າຈະມີບິນຫຼັກ (default) ຂອງ General ສະເໝີ
    if (!filtered[`${PREFIX}:default`]) {
      filtered[`${PREFIX}:default`] = store.carts[`${PREFIX}:default`] || [];
    }
    return filtered;
  }, [store.carts]);

  // ສະຫຼັບບິນ General
  const switchCart = useCallback(
    (id: string) => {
      store.setActiveGeneralBillId(id);
    },
    [store.setActiveGeneralBillId],
  );

  // ສ້າງບິນໃໝ່ສຳລັບ General
  const createNewBill = useCallback(() => {
    store.createNewBill(PREFIX);
  }, [store.createNewBill]);

  // ຜູກມັດທຸກ Action ເຂົ້າກັບ activeCartId ຂອງ General
  const actions = useMemo(
    () => ({
      addToCart: (product: any) => store.addToCart(product, activeCartId),
      removeFromCart: (id: string, status: string, note?: string) =>
        store.removeFromCart(id, status, note, activeCartId),
      updateQuantity: (
        id: string,
        status: string,
        delta: number,
        note?: string,
      ) => store.updateQuantity(id, status, delta, note, activeCartId),
      setQuantity: (
        id: string,
        status: string,
        value: string,
        note?: string,
      ) => store.setQuantity(id, status, value, note, activeCartId),
      updateItemNote: (
        id: string,
        status: string,
        oldNote: string | undefined,
        newNote: string,
      ) => store.updateItemNote(id, status, oldNote, newNote, activeCartId),
      updateStatus: (uniqueIds: string[], status: string) =>
        store.updateStatus(uniqueIds, status, activeCartId),
      clearCart: () => store.clearTableCart(activeCartId),
    }),
    [activeCartId, store],
  );

  return {
    cart,
    subtotal,
    allCarts,
    activeCartId,
    switchCart,
    createNewBill,
    removeCart: store.removeCart,
    isConnected: store.isConnected,
    ...actions,
  };
};
