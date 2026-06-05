/**
 * useCafeCart — Hook ສຳລັບຈັດການກະຕ່າສິນຄ້າຂອງ Cafe ໂດຍສະເພາະ
 *
 * ຂໍ້ມູນທັງໝົດຈະຖືກແຍກອອກຈາກ General ແລະ Table ຢ່າງສົມບູນ
 * ໃຊ້ Prefix "CAFE:" ສຳລັບ ID ຂອງບິນ ເຊັ່ນ "CAFE:default", "CAFE:bill-123"
 * ຂໍ້ມູນເກັບໃນ localStorage ເທົ່ານັ້ນ (ບໍ່ Sync ກັບ Server)
 */
import { useMemo, useCallback } from "react";
import { useCartStore, CartItem } from "@/store/useCartStore";

export type { CartItem };

const PREFIX = "CAFE";
const EMPTY_ARRAY: CartItem[] = [];

export const useCafeCart = () => {
  const store = useCartStore();

  // ດຶງ ID ບິນ Cafe ທີ່ກຳລັງໃຊ້ງານ (ແຍກຈາກ General ແລະ Table)
  const activeCartId = store.activeCafeBillId || `${PREFIX}:default`;

  // ດຶງລາຍການສິນຄ້າໃນກະຕ່າປະຈຸບັນ
  const cart = store.carts[activeCartId] || EMPTY_ARRAY;

  // ຄິດໄລ່ຍອດລວມ
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ກັ່ນກອງສະເພາະບິນ Cafe ເທົ່ານັ້ນ
  const allCarts = useMemo(() => {
    const filtered = Object.fromEntries(
      Object.entries(store.carts).filter(([id]) => id.startsWith(`${PREFIX}:`)),
    );
    // ຮັບປະກັນວ່າຈະມີບິນຫຼັກ (default) ຂອງ Cafe ສະເໝີ
    if (!filtered[`${PREFIX}:default`]) {
      filtered[`${PREFIX}:default`] = store.carts[`${PREFIX}:default`] || [];
    }
    return filtered;
  }, [store.carts]);

  // ສະຫຼັບບິນ Cafe
  const switchCart = useCallback(
    (id: string) => {
      store.setActiveCafeBillId(id);
    },
    [store.setActiveCafeBillId],
  );

  // ສ້າງບິນໃໝ່ສຳລັບ Cafe
  const createNewBill = useCallback(() => {
    store.createNewBill(PREFIX);
  }, [store.createNewBill]);

  // ຜູກມັດທຸກ Action ເຂົ້າກັບ activeCartId ຂອງ Cafe
  const actions = useMemo(
    () => ({
      addToCart: (product: any, skipToast?: boolean) => store.addToCart(product, activeCartId, skipToast),
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
