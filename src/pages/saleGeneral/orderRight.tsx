import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
  Button,
  Image,
  ScrollShadow,
  Chip,
  useDisclosure,
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
  Save,
} from "lucide-react";

import { formatNumber } from "@/utils/numberFormat";
import { getDisplayImageUrl } from "@/lib/utils";
import { useGeneralCart } from "@/hooks/useGeneralCart";
import ConfirmModal from "@/components/common/popup-confirm";

interface OrderRightProps {
  isMinimized: boolean;
  setIsMinimized: (v: boolean) => void;
  onPaymentOpen: () => void;
  editingOrderNumber?: string;
  onCancelEdit?: () => void;
  onUpdateOrder?: () => void;
  isUpdatingOrder?: boolean;
}

export const OrderRight: React.FC<OrderRightProps> = ({
  isMinimized,
  setIsMinimized,
  onPaymentOpen,
  editingOrderNumber,
  onCancelEdit,
  onUpdateOrder,
  isUpdatingOrder,
}) => {
  const isEditing = !!editingOrderNumber;
  const { t } = useTranslation();
  const {
    cart,
    removeFromCart,
    updateQuantity,
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
                    <span className="w-5 text-center font-bold text-[11px]">
                      {item.quantity}
                    </span>
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
            {isEditing ? (
              <Button
                className="h-12 font-black text-lg shadow-lg shadow-primary/20"
                color="primary"
                isDisabled={isEmpty}
                isLoading={isUpdatingOrder}
                startContent={!isUpdatingOrder && <Save size={20} />}
                onPress={onUpdateOrder}
              >
                {t("sale.update")}
              </Button>
            ) : (
              <Button
                className="h-12 font-black text-lg shadow-lg shadow-primary/20"
                color="primary"
                isDisabled={isEmpty}
                startContent={<Banknote size={20} />}
                onPress={onPaymentOpen}
              >
                {t("sale.next")}
              </Button>
            )}
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
