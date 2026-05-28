import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
  Button,
  Image,
  ScrollShadow,
  Chip,
  useDisclosure,
  Autocomplete,
  AutocompleteItem,
  Input as HeroInput,
  Avatar,
} from "@heroui/react";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ChevronDown,
  Banknote,
  PenLine,
  X,
  Gift,
} from "lucide-react";

import { formatNumber } from "@/utils/numberFormat";
import { getDisplayImageUrl } from "@/lib/utils";
import { useGeneralCart } from "@/hooks/useGeneralCart";
import ConfirmModal from "@/components/common/popup-confirm";
import {
  ProductFreeItemInput,
} from "@/services/order/useOrder";
import { useGetProducts, Product } from "@/services/product/useProduct";

interface OrderRightProps {
  isMinimized: boolean;
  setIsMinimized: (v: boolean) => void;
  onPaymentOpen: () => void;
  editingOrderNumber?: string;
  onCancelEdit?: () => void;
  productFrees: ProductFreeItemInput[];
  setProductFrees: React.Dispatch<React.SetStateAction<ProductFreeItemInput[]>>;
  storeId?: string;
}

export const OrderRight: React.FC<OrderRightProps> = ({
  isMinimized,
  setIsMinimized,
  onPaymentOpen,
  editingOrderNumber,
  onCancelEdit,
  productFrees,
  setProductFrees,
  storeId,
}) => {
  const isEditing = !!editingOrderNumber;
  const { t } = useTranslation();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    setQuantity,
    clearCart,
    subtotal,
    allCarts,
    activeCartId,
    createNewBill,
    switchCart,
    removeCart,
  } = useGeneralCart();

  const {
    isOpen: isRemoveOpen,
    onOpen: onRemoveOpen,
    onOpenChange: onRemoveOpenChange,
  } = useDisclosure();
  const {
    isOpen: isClearOpen,
    onOpen: onClearOpen,
    onOpenChange: onClearOpenChange,
  } = useDisclosure();
  const [itemToRemove, setItemToRemove] = useState<{
    id: string;
    name: string;
    status: string;
  } | null>(null);
  const [billToRemove, setBillToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const prevCartsCount = React.useRef(Object.keys(allCarts).length);

  // Auto-scroll to new bill
  React.useEffect(() => {
    const currentCount = Object.keys(allCarts).length;
    if (currentCount > prevCartsCount.current) {
      // Small timeout to wait for the DOM to update
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            left: scrollRef.current.scrollWidth,
            behavior: "smooth",
          });
        }
      }, 100);
    }
    prevCartsCount.current = currentCount;
  }, [allCarts]);

  const {
    isOpen: isBillDeleteOpen,
    onOpen: onBillDeleteOpen,
    onOpenChange: onBillDeleteOpenChange,
  } = useDisclosure();

  const isEmpty = cart.length === 0;

  // ✨ ของแถม state + handlers
  const [isFreeOpen, setIsFreeOpen] = useState(false);
  const [freeSelectedProductId, setFreeSelectedProductId] = useState("");
  const [freeAmount, setFreeAmount] = useState("1");

  const { data: freeProductsResponse } = useGetProducts(
    storeId,
    undefined,
    true,
    undefined,
  );
  const freeProducts: Product[] = freeProductsResponse?.data || [];

  const handleAddFreeItem = () => {
    if (!freeSelectedProductId) return;
    const product = freeProducts.find((p) => p.id === freeSelectedProductId);

    if (!product) return;

    const amount = Math.max(1, Number(freeAmount) || 1);
    const price = Number(product.price);

    setProductFrees((prev) => {
      const idx = prev.findIndex((f) => f.productId === product.id);

      if (idx >= 0) {
        const next = [...prev];
        const newAmount = next[idx].amount + amount;

        next[idx] = {
          ...next[idx],
          amount: newAmount,
          totalPrice: price * newAmount,
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          amount,
          price,
          totalPrice: price * amount,
        },
      ];
    });
    setFreeSelectedProductId("");
    setFreeAmount("1");
    setIsFreeOpen(false);
  };

  const handleRemoveFreeItem = (productId: string) => {
    setProductFrees((prev) => prev.filter((f) => f.productId !== productId));
  };

  const handleRemoveClick = (id: string, name: string, status: string) => {
    setItemToRemove({ id, name, status });
    onRemoveOpen();
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove.id, itemToRemove.status);
      setItemToRemove(null);
    }
  };

  const confirmClear = () => {
    clearCart();
  };

  return (
    <>
      {/* Cart Section (Bottom Sheet on Mobile, Sidebar on Desktop) */}
      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 z-40 transition-all duration-500 ease-in-out transform lg:relative lg:inset-auto lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto shrink-0 flex flex-col bg-white dark:bg-gray-800 border-t lg:border-t-0 lg:border-l border-divider shadow-2xl lg:shadow-none lg:w-[350px] xl:w-[400px] overflow-hidden rounded-t-[30px] lg:rounded-none",
          (!isEmpty && !isMinimized) || window.innerWidth >= 1024
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto",
          "h-[75vh] lg:h-full",
        )}
      >
        <div className="flex flex-col items-center pt-2 pb-1 lg:hidden">
          <div className="w-10 h-1 bg-default-300 rounded-full mb-2" />
        </div>

        {isEditing && (
          <div className="px-3 py-1.5 bg-secondary/10 border-b border-secondary/30 flex items-center gap-1.5 text-secondary">
            <PenLine size={12} />
            <span className="text-[11px] font-black">
              {t("sale.editingOrder", { orderNumber: editingOrderNumber })}
            </span>
          </div>
        )}

        {/* Bill Switcher (Multi-Cart) */}
        <div className="px-4 py-2 flex items-center gap-2 border-b border-divider bg-default-50/50">
          <ScrollShadow
            ref={scrollRef}
            hideScrollBar
            className="flex-grow flex items-center gap-2"
            orientation="horizontal"
          >
            {Object.entries(allCarts).map(([id, items], index) => {
              const isActive = id === activeCartId;
              const itemCount = items.length;
              const hasItems = itemCount > 0;
              const billName = `${t("sale.billShort") || "ບິນ"} ${index + 1}`;

              return (
                <button
                  key={id}
                  type="button"
                  aria-label={`Switch to ${billName}`}
                  className={clsx(
                    "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all border-2 outline-none text-left",
                    isActive
                      ? "bg-primary text-white border-primary shadow-sm"
                      : hasItems
                        ? "bg-white border-divider hover:border-primary/50"
                        : "bg-white border-danger/30 hover:border-danger/60",
                    !isActive && !hasItems && "opacity-60",
                  )}
                  onClick={() => switchCart(id)}
                >
                  <span className="text-xs font-bold whitespace-nowrap">
                    {billName}
                  </span>
                  <Chip
                    className={clsx(
                      "h-4 min-w-4 px-1 text-[10px] font-black",
                      isActive
                        ? "bg-white text-primary"
                        : hasItems
                          ? "bg-primary/10 text-primary"
                          : "bg-danger/10 text-danger",
                    )}
                    size="sm"
                    variant="flat"
                  >
                    {itemCount}
                  </Chip>
                  {id !== "default" && (
                    <button
                      className={clsx(
                        "ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors",
                        isActive ? "text-white/80" : "text-default-400",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasItems) {
                          setBillToRemove({ id, name: billName });
                          onBillDeleteOpen();
                        } else {
                          removeCart(id);
                        }
                      }}
                    >
                      <Plus className="rotate-45" size={12} />
                    </button>
                  )}
                </button>
              );
            })}
          </ScrollShadow>

          <Button
            isIconOnly
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
            size="sm"
            variant="flat"
            onClick={createNewBill}
          >
            <Plus size={18} />
          </Button>
        </div>

        <div className="px-4 py-2 border-b border-divider flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-2 font-black text-base lg:text-lg text-primary">
            <ShoppingCart size={20} />
            <span>{t("sale.selectedItems")}</span>
            <Chip
              className="font-bold"
              color="primary"
              size="sm"
              variant="flat"
            >
              {cart.length}
            </Chip>
          </div>
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              className="lg:hidden"
              size="sm"
              variant="light"
              onClick={() => setIsMinimized(true)}
            >
              <ChevronDown size={20} />
            </Button>
            <Button
              isIconOnly
              color="danger"
              isDisabled={isEmpty}
              size="sm"
              variant="light"
              onClick={onClearOpen}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>

        <ScrollShadow
          className="flex-grow px-3 py-2 space-y-2.5 overflow-y-auto scrollbar-hide"
          size={0}
        >
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex gap-2.5 group items-center border-b border-divider border-dashed pb-2.5 last:border-b-0 last:pb-0"
            >
              <Image
                className="w-11 h-11 object-cover rounded-lg shadow-sm"
                src={getDisplayImageUrl(item.image)}
              />
              <div className="flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-[12px] lg:text-[13px] line-clamp-1">
                    {item.name}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <span className="text-primary font-black text-[11px] lg:text-xs">
                    {formatNumber(item.price * item.quantity)}{" "}
                    <span className="text-[9px] font-normal">
                      {t("sale.kip")}
                    </span>
                  </span>
                  <div className="flex items-center gap-1 bg-default-100 rounded-md p-0.5 border border-default-200">
                    <Button
                      isIconOnly
                      className="min-w-6 h-6 w-6"
                      size="sm"
                      variant="light"
                      onClick={() => updateQuantity(item.id, item.status, -1)}
                    >
                      <Minus size={10} />
                    </Button>
                    <input
                      className="w-8 text-center font-bold text-[11px] bg-transparent outline-none border-none p-0 focus:ring-0"
                      type="text"
                      value={item.quantity === 0 ? "" : item.quantity}
                      onChange={(e) => {
                        const val = e.target.value;

                        if (val === "" || /^\d+$/.test(val)) {
                          setQuantity(item.id, item.status, val);
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                    <Button
                      isIconOnly
                      className="min-w-6 h-6 w-6"
                      size="sm"
                      variant="light"
                      onClick={() => updateQuantity(item.id, item.status, 1)}
                    >
                      <Plus size={10} />
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                isIconOnly
                className="min-w-7 h-7 w-7 ml-1"
                color="danger"
                size="sm"
                variant="flat"
                onClick={() =>
                  handleRemoveClick(item.id, item.name, item.status)
                }
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full opacity-40 py-10">
              <ShoppingCart className="mb-2" size={48} />
              <p className="font-bold">{t("sale.noItems")}</p>
            </div>
          )}
        </ScrollShadow>

        {/* ✨ ของแถม (Free items) */}
        <div className="px-3 py-2 border-t border-divider bg-pink-50/30 space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-pink-600">
              <Gift size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t("payment.freeItems") || "ຂອງແຖມ"}
              </span>
              {productFrees.length > 0 && (
                <span className="text-[10px] font-black bg-pink-100 text-pink-700 px-1.5 rounded-full">
                  {productFrees.length}
                </span>
              )}
            </div>
            <Button
              className="font-bold"
              color="secondary"
              size="sm"
              startContent={<Plus size={14} />}
              variant="flat"
              onPress={() => setIsFreeOpen((v) => !v)}
            >
              {t("payment.addFreeItem") || "ເພີ່ມຂອງແຖມ"}
            </Button>
          </div>

          {isFreeOpen && (
            <div className="p-2.5 rounded-2xl border-2 border-dashed border-pink-200 bg-white/70 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <Autocomplete
                label={t("payment.selectProduct") || "ເລືອກສິນຄ້າ"}
                labelPlacement="outside"
                placeholder={
                  t("payment.searchProductPlaceholder") ||
                  t("sale.searchPlaceholder") ||
                  "ຄົ້ນຫາສິນຄ້າ..."
                }
                selectedKey={freeSelectedProductId || null}
                size="sm"
                variant="bordered"
                onSelectionChange={(key) => {
                  setFreeSelectedProductId((key as string) || "");
                }}
              >
                {freeProducts.map((p) => (
                  <AutocompleteItem
                    key={p.id}
                    isDisabled={(p.stockQty ?? 0) <= 0}
                    startContent={
                      <Avatar
                        alt={p.name}
                        className="w-7 h-7 flex-shrink-0"
                        radius="sm"
                        src={getDisplayImageUrl(p.image)}
                      />
                    }
                    textValue={p.name}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="font-bold text-xs truncate">
                        {p.name}
                      </span>
                      <span
                        className={clsx(
                          "text-[10px] font-black px-1.5 py-0.5 rounded-md whitespace-nowrap flex-shrink-0",
                          (p.stockQty ?? 0) > 10
                            ? "bg-success-100 text-success-700"
                            : (p.stockQty ?? 0) > 0
                              ? "bg-warning-100 text-warning-700"
                              : "bg-danger-100 text-danger-700",
                        )}
                      >
                        {(p.stockQty ?? 0) > 0
                          ? `${formatNumber(p.stockQty ?? 0)} ${p.unit?.name || ""}`
                          : t("sale.outOfStock") || "ໝົດ"}
                      </span>
                    </div>
                  </AutocompleteItem>
                ))}
              </Autocomplete>
              <HeroInput
                label={t("payment.amount") || "ຈຳນວນ"}
                labelPlacement="outside"
                min={1}
                placeholder="1"
                size="sm"
                type="number"
                value={freeAmount}
                variant="bordered"
                onValueChange={setFreeAmount}
              />
              <Button
                className="w-full font-bold"
                color="secondary"
                isDisabled={!freeSelectedProductId}
                startContent={<Plus size={14} />}
                onPress={handleAddFreeItem}
              >
                {t("payment.addToList") || "ເພີ່ມເຂົ້າລາຍການ"}
              </Button>
            </div>
          )}

          {productFrees.length > 0 && (
            <div className="space-y-1.5 max-h-[150px] overflow-y-auto scrollbar-hide">
              {productFrees.map((free) => {
                const product = freeProducts.find(
                  (p) => p.id === free.productId,
                );

                return (
                  <div
                    key={free.productId}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-pink-100"
                  >
                    <img
                      alt={product?.name || ""}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-default-100 border border-pink-100"
                      src={getDisplayImageUrl(product?.image)}
                    />
                    <div className="flex-grow min-w-0">
                      <p className="text-[11px] font-black text-default-700 truncate leading-tight">
                        {product?.name || t("payment.product") || "Product"}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Gift className="text-pink-600" size={10} />
                        <span className="text-[10px] font-black text-pink-600">
                          × {free.amount}
                        </span>
                      </div>
                    </div>
                    <Button
                      isIconOnly
                      className="min-w-7 h-7 w-7 flex-shrink-0"
                      color="danger"
                      size="sm"
                      variant="flat"
                      onPress={() => handleRemoveFreeItem(free.productId)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-divider bg-default-50/80 backdrop-blur-md">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center font-black">
              <span className="text-default-700">{t("sale.totalSummary")}</span>
              <span className="text-primary text-xl lg:text-2xl">
                {formatNumber(subtotal)}{" "}
                <span className="text-xs font-normal">{t("sale.kip")}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {isEditing ? (
              <Button
                className="h-12 font-bold text-base"
                color="danger"
                startContent={<X size={18} />}
                variant="flat"
                onClick={onCancelEdit}
              >
                {t("sale.cancelEdit")}
              </Button>
            ) : (
              <Button
                className="h-12 font-bold text-base"
                color="danger"
                isDisabled={isEmpty}
                startContent={<Trash2 size={18} />}
                variant="flat"
                onClick={onClearOpen}
              >
                {t("sale.cancel")}
              </Button>
            )}
            <Button
              className="h-12 font-black text-lg shadow-lg shadow-primary/20"
              color="primary"
              isDisabled={isEmpty}
              startContent={<Banknote size={20} />}
              onPress={onPaymentOpen}
            >
              {isEditing ? t("sale.update") : t("sale.next")}
            </Button>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {!isEmpty && !isMinimized && (
        <button
          type="button"
          aria-label="Close panel"
          tabIndex={-1}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden animate-in fade-in duration-300 border-none outline-none w-full cursor-default"
          onClick={() => setIsMinimized(true)}
        />
      )}

      {/* Confirm Remove Item Modal */}
      <ConfirmModal
        color="danger"
        icon={<Trash2 size={24} />}
        isOpen={isRemoveOpen}
        message={t("sale.confirmRemoveItem", { name: itemToRemove?.name })}
        title={t("sale.confirmRemove")}
        onConfirm={confirmRemove}
        onOpenChange={onRemoveOpenChange}
      />

      {/* Confirm Clear Cart Modal */}
      <ConfirmModal
        color="danger"
        icon={<Trash2 size={24} />}
        isOpen={isClearOpen}
        message={t("sale.confirmClearMsg")}
        title={t("sale.confirmClear")}
        onConfirm={confirmClear}
        onOpenChange={onClearOpenChange}
      />

      {/* Confirm Delete Bill Modal (Multi-Cart) */}
      <ConfirmModal
        color="danger"
        icon={<Trash2 size={24} />}
        isOpen={isBillDeleteOpen}
        message={t("sale.confirmDeleteBillMsg", { name: billToRemove?.name }) || `คุณแน่ใจหรือไม่ว่าต้องการลบบิล ${billToRemove?.name}? ข้อมูลสินค้าในบิลนี้จะหายไปทั้งหมด`}
        title={t("sale.confirmDeleteBill") || "ยืนยันการลบบิล"}
        onConfirm={() => {
          if (billToRemove) {
            removeCart(billToRemove.id);
            setBillToRemove(null);
          }
        }}
        onOpenChange={onBillDeleteOpenChange}
      />
    </>
  );
};
