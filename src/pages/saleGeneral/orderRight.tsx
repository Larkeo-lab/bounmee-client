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
} from "lucide-react";
import { formatNumber } from "@/utils/numberFormat";
import { getDisplayImageUrl } from "@/lib/utils";
import { useCart } from "@/provider";
import ConfirmModal from "@/components/common/popup-confirm";

interface OrderRightProps {
  isMinimized: boolean;
  setIsMinimized: (v: boolean) => void;
  onPaymentOpen: () => void;
}

export const OrderRight: React.FC<OrderRightProps> = ({
  isMinimized,
  setIsMinimized,
  onPaymentOpen,
}) => {
  const { t } = useTranslation();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
  } = useCart();

  const { isOpen: isRemoveOpen, onOpen: onRemoveOpen, onOpenChange: onRemoveOpenChange } = useDisclosure();
  const { isOpen: isClearOpen, onOpen: onClearOpen, onOpenChange: onClearOpenChange } = useDisclosure();
  const [itemToRemove, setItemToRemove] = useState<{ id: string; name: string; status: string } | null>(null);

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
          (!isEmpty && !isMinimized) || (window.innerWidth >= 1024)
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto",
          "h-[75vh] lg:h-full"
        )}
      >
        <div className="flex flex-col items-center pt-2 pb-1 lg:hidden">
          <div className="w-10 h-1 bg-default-300 rounded-full mb-2" />
        </div>

        <div className="px-4 py-2 border-b border-divider flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-2 font-black text-base lg:text-lg text-primary">
            <ShoppingCart size={20} />
            <span>{t("sale.selectedItems")}</span>
            <Chip color="primary" size="sm" variant="flat" className="font-bold">
              {cart.length}
            </Chip>
          </div>
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="lg:hidden"
              onClick={() => setIsMinimized(true)}
            >
              <ChevronDown size={20} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onClick={onClearOpen}
              isDisabled={isEmpty}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>

        <ScrollShadow size={0} className="flex-grow p-4 space-y-4 overflow-y-auto scrollbar-hide">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 group items-center border-b border-divider border-dashed pb-3 last:border-b-0 last:pb-0"
            >
              <Image
                src={getDisplayImageUrl(item.image)}
                className="w-14 h-14 object-cover rounded-xl shadow-sm"
              />
              <div className="flex-grow flex flex-col justify-between py-0.5">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-[13px] lg:text-sm line-clamp-1">
                    {item.name}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-primary font-black text-xs lg:text-sm">
                    {formatNumber(item.price * item.quantity)} <span className="text-[10px] font-normal">{t("sale.kip")}</span>
                  </span>
                  <div className="flex items-center gap-1 bg-default-100 rounded-lg p-0.5 border border-default-200">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="min-w-7 h-7 w-7"
                      onClick={() => updateQuantity(item.id, item.status, -1)}
                    >
                      <Minus size={12} />
                    </Button>
                    <span className="w-6 text-center font-bold text-xs">
                       {item.quantity}
                    </span>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="min-w-7 h-7 w-7"
                      onClick={() => updateQuantity(item.id, item.status, 1)}
                    >
                      <Plus size={12} />
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="danger"
                onClick={() => handleRemoveClick(item.id, item.name, item.status)}
                className="min-w-8 h-8 w-8 ml-2"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full opacity-40 py-10">
              <ShoppingCart size={48} className="mb-2" />
              <p className="font-bold">{t("sale.noItems")}</p>
            </div>
          )}
        </ScrollShadow>

        <div className="p-4 border-t border-divider bg-default-50/80 backdrop-blur-md">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center font-black">
              <span className="text-default-700">{t("sale.totalSummary")}</span>
              <span className="text-primary text-xl lg:text-2xl">
                {formatNumber(subtotal)} <span className="text-xs font-normal">{t("sale.kip")}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="flat"
              color="danger"
              className="h-12 font-bold text-base"
              onClick={onClearOpen}
              startContent={<Trash2 size={18} />}
              isDisabled={isEmpty}
            >
              {t("sale.cancel")}
            </Button>
            <Button
              color="primary"
              className="h-12 font-black text-lg shadow-lg shadow-primary/20"
              startContent={<Banknote size={20} />}
              onPress={onPaymentOpen}
              isDisabled={isEmpty}
            >
              {t("sale.next")}
            </Button>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {!isEmpty && !isMinimized && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMinimized(true)}
        />
      )}

      {/* Confirm Remove Item Modal */}
      <ConfirmModal
        isOpen={isRemoveOpen}
        onOpenChange={onRemoveOpenChange}
        title={t("sale.confirmRemove")}
        message={t("sale.confirmRemoveItem", { name: itemToRemove?.name })}
        onConfirm={confirmRemove}
        color="danger"
        icon={<Trash2 size={24} />}
      />

      {/* Confirm Clear Cart Modal */}
      <ConfirmModal
        isOpen={isClearOpen}
        onOpenChange={onClearOpenChange}
        title={t("sale.confirmClear")}
        message={t("sale.confirmClearMsg")}
        onConfirm={confirmClear}
        color="danger"
        icon={<Trash2 size={24} />}
      />
    </>
  );
};
