import React from "react";
import { Button, Checkbox, Image, ScrollShadow, Chip } from "@heroui/react";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  Trash2,
  MessageSquare,
  Plus,
  Minus,
  Utensils,
  ChefHat,
  QrCode,
  Banknote,
  ChevronDown,
  PenLine,
  X,
  Save,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "react-hot-toast";

import { useCart } from "@/provider";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";

interface OrderRightProps {
  selectedTable: any;
  setSelectedTable: (table: any | null) => void;
  filteredCart: any[];
  selectedCartItems: string[];
  setSelectedCartItems: React.Dispatch<React.SetStateAction<string[]>>;
  isSelectingMenu: boolean;
  setIsSelectingMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setItemToRemove: React.Dispatch<
    React.SetStateAction<{ id: string; status: string; note?: string } | null>
  >;
  onRemoveItemOpen: () => void;
  expandedNotes: Set<string>;
  toggleNote: (uId: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  statusTotals: Record<string, number>;
  onQrOpen: () => void;
  onPaymentOpen: () => void;
  onCloseTableOpen: () => void;
  updateTablePending: boolean;
  editingOrderNumber?: string;
  onCancelEdit?: () => void;
  onUpdateOrder?: () => void;
  isUpdatingOrder?: boolean;
}

const getStatusDisplay = (status: string, t: any) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return { label: t("table.cart.pending"), color: "warning" as const };
    case "COOKING":
      return { label: t("table.cart.cooking"), color: "primary" as const };
    case "SERVED":
      return { label: t("table.cart.served"), color: "success" as const };
    case "CANCEL":
      return { label: t("table.cart.cancel"), color: "danger" as const };
    default:
      return {
        label: status || t("table.cart.pending"),
        color: "default" as const,
      };
  }
};

export const OrderRight: React.FC<OrderRightProps> = ({
  selectedTable,
  setSelectedTable,
  filteredCart,
  selectedCartItems,
  setSelectedCartItems,
  isSelectingMenu,
  setIsSelectingMenu,
  setItemToRemove,
  onRemoveItemOpen,
  expandedNotes,
  toggleNote,
  statusFilter,
  setStatusFilter,
  statusTotals,
  onQrOpen,
  onPaymentOpen,
  onCloseTableOpen,
  updateTablePending,
  editingOrderNumber,
  onCancelEdit,
  onUpdateOrder,
  isUpdatingOrder,
}) => {
  const isEditing = !!editingOrderNumber;
  const { t } = useTranslation();
  const {
    cart,
    updateQuantity,
    setQuantity,
    updateStatus,
    subtotal,
    isConnected, // 🌐 Get connection status
  } = useCart();
  const [isSending, setIsSending] = React.useState(false);

  console.log('filteredCart', filteredCart)

  return (
    <div
      className={clsx(
        "w-full sm:w-[320px] md:w-[350px] lg:w-[400px] flex flex-col bg-white dark:bg-gray-800 border-t sm:border-t-0 sm:border-l border-divider shadow-2xl z-30 sm:h-full overflow-hidden flex-shrink-0 rounded-t-[30px] sm:rounded-none animate-in fade-in slide-in-from-bottom-full sm:slide-in-from-right-4 duration-500",
        isSelectingMenu ? "h-[45vh]" : "h-[75vh]",
      )}
    >
      {/* Mobile Drag Indicator */}
      <div className="flex justify-center pt-2 sm:hidden">
        <div className="w-10 h-1 bg-default-300 rounded-full" />
      </div>

      {isEditing && (
        <div className="px-3 py-1.5 bg-secondary/10 border-b border-secondary/30 flex items-center gap-1.5 text-secondary">
          <PenLine size={12} />
          <span className="text-[11px] font-black">
            {t("sale.editingOrder", { orderNumber: editingOrderNumber })}
          </span>
        </div>
      )}

      <div className="p-2 md:p-3 border-b border-divider flex items-center justify-between bg-primary/5 flex-shrink-0">
        <div className="flex flex-col flex-grow">
          <div className="flex items-center gap-2 font-bold text-base md:text-lg">
            <ShoppingCart className="text-primary" size={18} />
            <span>
              {selectedTable
                ? t("table.cart.title", { name: selectedTable.name })
                : t("table.cart.selectPrompt")}
            </span>
          </div>
          {selectedTable && (
            <p className="text-xs text-default-500">
              {t("table.seats", { count: selectedTable.capacity })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Mobile Minimize instead of Close Table when Menu is open */}
          <Button
            isIconOnly
            className="sm:hidden"
            color="default"
            size="sm"
            variant="light"
            onClick={() => setIsSelectingMenu(false)}
          >
            <ChevronDown size={20} />
          </Button>
          {selectedTable && (
            <Button
              isIconOnly
              color="danger"
              size="sm"
              variant="light"
              onClick={() => setSelectedTable(null)}
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-2 md:px-3 py-1.5 bg-default-100/50 border-b border-divider flex-shrink-0">
        <div className="flex items-center gap-2">
          <Checkbox
            isDisabled={filteredCart.length === 0}
            isSelected={
              filteredCart.length > 0 &&
              filteredCart.every((item) =>
                selectedCartItems.includes(
                  `${item.id}-${item.status}-${item.note || ""}`,
                ),
              )
            }
            size="sm"
            onValueChange={(isSelected) => {
              if (isSelected) {
                const newIds = filteredCart.map(
                  (item) => `${item.id}-${item.status}-${item.note || ""}`,
                );

                setSelectedCartItems(
                  Array.from(new Set([...selectedCartItems, ...newIds])),
                );
              } else {
                const filteredIds = new Set(
                  filteredCart.map(
                    (item) => `${item.id}-${item.status}-${item.note || ""}`,
                  ),
                );

                setSelectedCartItems(
                  selectedCartItems.filter((id) => !filteredIds.has(id)),
                );
              }
            }}
          >
            <span className="text-xs font-bold text-default-700">
              {t("table.cart.selectAll")}
            </span>
          </Checkbox>
          <div className="flex flex-wrap items-center gap-1 lg:gap-1.5 ml-2 lg:ml-3">
            {[
              { value: "ALL", label: t("table.cart.total") },
              { value: "PENDING", label: t("table.cart.pending") },
              { value: "COOKING", label: t("table.cart.cooking") },
              { value: "SERVED", label: t("table.cart.served") },
            ].map((status) => (
              <button
                key={status.value}
                className={`px-2 py-1 text-[9px] lg:text-[10px] font-bold rounded-lg transition-all whitespace-nowrap outline-none border-[0.5px] ${statusFilter === status.value
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/30 scale-[1.02]"
                    : "bg-default-100 text-default-500 border-default-200 hover:bg-default-200 hover:text-default-700"
                  }`}
                onClick={() => {
                  setStatusFilter(status.value);
                  setSelectedCartItems([]);
                }}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedCartItems.length > 0 && (
        <div className="px-3 py-1 bg-primary/10 border-b border-primary/20 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-[10px] sm:text-xs text-primary font-bold">
            {t("table.cart.selectedCount", { count: selectedCartItems.length })}
          </span>
        </div>
      )}

      <ScrollShadow className="flex-grow overflow-y-auto px-1 md:px-2 py-1 md:py-2 flex flex-col gap-1 sm:gap-1.5 scrollbar-hide">
        {filteredCart.length > 0 ? (
          filteredCart.map((item) => {
            const uniqueId = `${item.id}-${item.status}-${item.note || ""}`;

            return (
              <div
                key={uniqueId}
                className="flex gap-2 group items-center border-b border-divider border-dashed pb-2 last:border-b-0 last:pb-0"
              >
                <Checkbox
                  isSelected={selectedCartItems.includes(uniqueId)}
                  size="sm"
                  onValueChange={(isSelected) => {
                    if (isSelected) {
                      setSelectedCartItems((prev) => [...prev, uniqueId]);
                    } else {
                      setSelectedCartItems((prev) =>
                        prev.filter((id) => id !== uniqueId),
                      );
                    }
                  }}
                />
                <Image
                  className="w-10 h-10 lg:w-12 lg:h-12 object-cover min-w-[40px] lg:min-w-[48px]"
                  radius="md"
                  src={getDisplayImageUrl(item.image)}
                />
                <div className="flex-grow flex flex-col justify-between py-0.5 min-w-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-xs lg:text-sm line-clamp-1">
                      {item.name}
                    </span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-primary font-black text-xs lg:text-sm">
                        {formatNumber(item.price * item.quantity)}{" "}
                        {t("table.cart.kip")}
                      </span>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          {item.note && (
                            <button
                              type="button"
                              aria-label="Toggle Note"
                              className={clsx(
                                "p-1.5 rounded-full cursor-pointer transition-all border outline-none",
                                expandedNotes.has(uniqueId)
                                  ? "bg-primary text-white border-primary"
                                  : "bg-danger-50 text-danger border-danger-100",
                              )}
                              onClick={() => toggleNote(uniqueId)}
                            >
                              <MessageSquare size={14} strokeWidth={2.5} />
                            </button>
                          )}

                          {(() => {
                            const statusConfig = getStatusDisplay(
                              item.status,
                              t,
                            );

                            return (
                              <Chip
                                className="font-bold text-[9px] h-5"
                                color={statusConfig.color}
                                size="sm"
                                variant="flat"
                              >
                                {statusConfig.label}
                              </Chip>
                            );
                          })()}
                        </div>

                        <div className="flex items-center gap-1 bg-default-100 rounded-lg p-0.5 border border-default-200">
                          <Button
                            isIconOnly
                            className="min-w-6 h-6 w-6"
                            size="sm"
                            variant="light"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.status,
                                -1,
                                item.note,
                              )
                            }
                          >
                            <Minus size={10} />
                          </Button>
                          <input
                            className="w-8 text-center font-bold text-xs bg-transparent outline-none border-none focus:ring-0"
                            type="text"
                            value={item.quantity}
                            onChange={(e) =>
                              setQuantity(
                                item.id,
                                item.status,
                                e.target.value,
                                item.note,
                              )
                            }
                            onFocus={(e) => e.target.select()}
                          />
                          <Button
                            isIconOnly
                            className="min-w-6 h-6 w-6"
                            isDisabled={item.quantity >= item.stockQty}
                            size="sm"
                            variant="light"
                            onClick={() =>
                              updateQuantity(item.id, item.status, 1, item.note)
                            }
                          >
                            <Plus size={10} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {item.note && expandedNotes.has(uniqueId) && (
                    <div className="mt-2 px-2.5 py-2 bg-warning-50 border border-warning-100 rounded-xl">
                      <p className="text-[10px] text-warning-700 font-bold flex items-center gap-1">
                        <MessageSquare size={12} />
                        <span>{t("table.cart.noteLabel")}</span>
                      </p>
                      <p className="text-[10px] text-warning-600 mt-0.5">
                        {item.note}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  isIconOnly
                  className="min-w-8 h-8 w-8 sm:min-w-7 sm:h-7 sm:w-7 transition-all -mr-1"
                  color="danger"
                  size="sm"
                  variant="flat"
                  onClick={() => {
                    setItemToRemove({
                      id: item.id,
                      status: item.status,
                      note: item.note,
                    });
                    onRemoveItemOpen();
                  }}
                >
                  <Trash2 className="sm:size-[14px]" size={16} />
                </Button>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-default-400 gap-2 opacity-60">
            <ShoppingCart size={40} strokeWidth={1} />
            <p className="text-xs font-bold">{t("table.cart.empty")}</p>
          </div>
        )}
      </ScrollShadow>

      <div className="px-2 py-1 sm:px-3 sm:py-1.5 border-t border-divider bg-default-50/50 flex-shrink-0 z-40">
        <div className="grid grid-cols-4 xl:grid-cols-4 gap-1 md:gap-1.5 items-stretch">
          <Button
            className={`h-8 md:h-9 font-bold text-[9px] md:text-[11px] px-1 ${isSelectingMenu ? "bg-danger/10 text-danger" : "bg-primary/10"}`}
            color={isSelectingMenu ? "danger" : "primary"}
            startContent={<Utensils size={12} />}
            variant="flat"
            onClick={() => setIsSelectingMenu(!isSelectingMenu)}
          >
            {isSelectingMenu
              ? t("table.cart.closeMenu")
              : t("table.cart.openMenu")}
          </Button>
          <Button
            className="h-8 md:h-9 font-bold text-[9px] md:text-[11px] text-white shadow-sm px-1"
            color="warning"
            isDisabled={
              !selectedTable ||
              selectedCartItems.length === 0 ||
              isSending ||
              selectedCartItems.some((uId) => {
                const item = cart.find(
                  (i) => `${i.id}-${i.status}-${i.note || ""}` === uId,
                );

                return item?.status === "COOKING" || item?.status === "SERVED";
              })
            }
            isLoading={isSending}
            startContent={!isSending && <ChefHat size={12} />}
            onClick={async () => {
              if (!isConnected) {
                toast.error(t("table.cart.offlineOrderWarning"), {
                  duration: 4000,
                  style: { fontWeight: "bold" },
                });
              }

              setIsSending(true);
              try {
                // Simulate a small delay for better UX and to allow socket to emit
                await new Promise((resolve) => setTimeout(resolve, 800));

                updateStatus(selectedCartItems, "COOKING");
                setSelectedCartItems([]);
                toast.success(t("table.cart.updateSuccess"));

                // Play notification sound locally to confirm action
                try {
                  const audio = new Audio("/assets/void/notification.mp3");
                  audio
                    .play()
                    .catch((e) => console.log("Audio play blocked:", e));
                } catch (e) { }
              } catch (error) {
                toast.error(t("table.cart.updateError"));
              } finally {
                setIsSending(false);
              }
            }}
          >
            {t("table.cart.sendToKitchen")}
          </Button>
          <Button
            className="h-8 md:h-9 font-bold text-[9px] md:text-[11px] text-white shadow-sm px-1"
            color="primary"
            isDisabled={
              !selectedTable ||
              selectedCartItems.length === 0 ||
              selectedCartItems.some((uId) => {
                const item = cart.find(
                  (i) => `${i.id}-${i.status}-${i.note || ""}` === uId,
                );

                return item?.status === "SERVED";
              })
            }
            startContent={<ChefHat size={12} />}
            onClick={() => {
              if (!isConnected) {
                toast.error(t("table.cart.offlineSyncWarning"), {
                  duration: 4000,
                  style: { fontWeight: "bold" },
                });
              }
              try {
                updateStatus(selectedCartItems, "SERVED");
                setSelectedCartItems([]);
                toast.success(t("table.cart.updateSuccess"));
              } catch (error) {
                toast.error(t("table.cart.updateError"));
              }
            }}
          >
            {t("table.cart.serveFood")}
          </Button>
          <Button
            className="h-8 md:h-9 font-bold text-[9px] md:text-[11px] text-white shadow-sm px-1"
            color="secondary"
            startContent={<QrCode size={12} />}
            variant="solid"
            isDisabled={!selectedTable}
            onClick={onQrOpen}
          >
            QR
          </Button>
        </div>
      </div>

      <div className="p-2 md:p-2.5 border-t border-divider bg-white mt-auto flex-shrink-0">
        <div className="flex flex-col gap-1 mb-2">
          <div className="grid grid-cols-3 gap-1 py-1 border-b border-divider/50 border-dashed">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-warning-600 font-bold leading-none mb-0.5">{t("table.cart.pending")}</span>
              <span className="text-[10px] font-black text-warning-700">
                {formatNumber(statusTotals.PENDING)} {t("table.cart.kip")}
              </span>
            </div>
            <div className="flex flex-col items-center border-x border-divider/50">
              <span className="text-[9px] text-primary-600 font-bold leading-none mb-0.5">{t("table.cart.cooking")}</span>
              <span className="text-[10px] font-black text-primary-700">
                {formatNumber(statusTotals.COOKING)} {t("table.cart.kip")}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-success-600 font-bold leading-none mb-0.5">{t("table.cart.served")}</span>
              <span className="text-[10px] font-black text-success-700">
                {formatNumber(statusTotals.SERVED)} {t("table.cart.kip")}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center font-black pt-1">
            <span className="text-[10px] text-default-600">
              {t("table.cart.total")}:
            </span>
            <div className="text-right">
              <span className="text-primary text-base lg:text-lg">
                {formatNumber(subtotal)} {t("table.cart.kip")}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {isEditing ? (
            <Button
              className="h-9 md:h-10 font-bold text-xs"
              color="danger"
              startContent={<X size={14} />}
              variant="flat"
              onClick={onCancelEdit}
            >
              {t("sale.cancelEdit")}
            </Button>
          ) : (
            <Button
              className="h-9 md:h-10 font-bold text-xs"
              color="danger"
              isLoading={updateTablePending}
              startContent={<Trash2 size={14} />}
              variant="flat"
              onClick={() => {
                if (!selectedTable) return;
                if (cart.length > 0) {
                  toast.error(t("table.cart.closeTableError"), {
                    style: {
                      fontWeight: "bold",
                      borderRadius: "12px",
                    },
                  });

                  return;
                }
                onCloseTableOpen();
              }}
            >
              {t("table.cart.closeTable")}
            </Button>
          )}
          {isEditing ? (
            <Button
              className="h-9 md:h-10 font-black text-sm shadow-md shadow-primary/20"
              color="primary"
              isDisabled={!selectedTable || cart.length === 0}
              isLoading={isUpdatingOrder}
              startContent={!isUpdatingOrder && <Save size={16} />}
              onPress={onUpdateOrder}
            >
              {t("sale.update")}
            </Button>
          ) : (
            <Button
              className="h-9 md:h-10 font-black text-sm shadow-md shadow-primary/20"
              color="primary"
              isDisabled={
                !selectedTable ||
                cart.length === 0 ||
                !cart.every(
                  (item) =>
                    item.status?.toUpperCase() === "SERVED" ||
                    item.status?.toUpperCase() === "CANCEL",
                )
              }
              startContent={<Banknote size={16} />}
              onPress={onPaymentOpen}
            >
              {t("table.cart.next")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
