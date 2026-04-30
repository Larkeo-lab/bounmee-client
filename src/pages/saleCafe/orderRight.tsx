import React from "react";
import {
  Button,
  Checkbox,
  Image,
  ScrollShadow,
  Chip,
  Input,
  Tooltip,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  Trash2,
  MessageSquare,
  Plus,
  Minus,
  Utensils,
  ChefHat,
  Banknote,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "react-hot-toast";

import { useCart } from "@/provider";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";

interface OrderRightProps {
  isMinimized: boolean;
  setIsMinimized: (v: boolean) => void;
  filteredCart: any[];
  selectedCartItems: string[];
  setSelectedCartItems: React.Dispatch<React.SetStateAction<string[]>>;
  setItemToRemove: React.Dispatch<
    React.SetStateAction<{ id: string; status: string; note?: string } | null>
  >;
  onRemoveItemOpen: () => void;
  expandedNotes: Set<string>;
  toggleNote: (uId: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  statusTotals: Record<string, number>;
  onPaymentOpen: () => void;
  onClearCartOpen: () => void;
}

const getStatusDisplay = (status: string, t: any) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return { label: t("sale.statusPending"), color: "warning" as const };
    case "COOKING":
      return { label: t("sale.statusCooking"), color: "primary" as const };
    case "SERVED":
      return { label: t("sale.statusServed"), color: "success" as const };
    case "CANCEL":
      return { label: t("sale.statusCancel"), color: "danger" as const };
    default:
      return {
        label: status || t("sale.statusPending"),
        color: "default" as const,
      };
  }
};

export const OrderRight: React.FC<OrderRightProps> = ({
  isMinimized,
  setIsMinimized,
  filteredCart,
  selectedCartItems,
  setSelectedCartItems,
  setItemToRemove,
  onRemoveItemOpen,
  expandedNotes,
  toggleNote,
  statusFilter,
  setStatusFilter,
  statusTotals,
  onPaymentOpen,
  onClearCartOpen,
}) => {
  const { t } = useTranslation();
  const {
    cart,
    updateQuantity,
    setQuantity,
    updateStatus,
    updateItemNote,
    subtotal,
    isConnected,
  } = useCart();

  const isEmpty = cart.length === 0;

  return (
    <>
      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 z-40 transition-all duration-500 ease-in-out transform lg:relative lg:inset-auto lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto shrink-0 flex flex-col bg-white dark:bg-gray-800 border-t lg:border-t-0 lg:border-l border-divider shadow-2xl lg:shadow-none lg:w-[350px] xl:w-[400px] overflow-hidden rounded-t-[30px] lg:rounded-none",
          (!isEmpty && !isMinimized) || window.innerWidth >= 1024
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto",
          "h-[75vh] lg:h-full",
        )}
      >
        {/* Mobile Drag Indicator */}
        <div className="flex justify-center pt-2 lg:hidden">
          <div className="w-10 h-1 bg-default-300 rounded-full mb-2" />
        </div>

        <div className="p-3 border-b border-divider flex items-center justify-between bg-primary/5 flex-shrink-0">
          <div className="flex items-center gap-2 font-black text-base lg:text-lg text-primary">
            <ShoppingCart size={20} />
            <span>ລາຍການທີ່ເລືອກ</span>
            <Chip
              className="font-bold"
              color="primary"
              size="sm"
              variant="flat"
            >
              {cart.length}
            </Chip>
          </div>
          <div className="flex items-center gap-1">
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
              onClick={onClearCartOpen}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-default-100/50 border-b border-divider flex-shrink-0">
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
                {t("sale.selectAll")}
              </span>
            </Checkbox>
            <div className="flex flex-wrap items-center gap-1 ml-2">
              {[
                { value: "ALL", label: t("sale.categoryAll") },
                { value: "PENDING", label: t("sale.statusPending") },
                { value: "COOKING", label: t("sale.statusCooking") },
                { value: "SERVED", label: t("sale.statusServed") },
              ].map((status) => (
                <button
                  key={status.value}
                  className={clsx(
                    "px-2 py-1 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap outline-none border-[0.5px]",
                    statusFilter === status.value
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/30 scale-[1.02]"
                      : "bg-default-100 text-default-500 border-default-200 hover:bg-default-200 hover:text-default-700",
                  )}
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
          <div className="px-3 py-1 bg-primary/10 border-b border-primary/20 animate-in fade-in slide-in-from-top-1 duration-300 flex justify-between items-center">
            <span className="text-xs text-primary font-bold">
              {t("sale.selectedCount", { count: selectedCartItems.length })}
            </span>
          </div>
        )}

        <ScrollShadow className="flex-grow overflow-y-auto p-2 space-y-1.5 scrollbar-hide">
          {filteredCart.length > 0 ? (
            filteredCart.map((item) => {
              const uniqueId = `${item.id}-${item.status}-${item.note || ""}`;

              return (
                <div
                  key={uniqueId}
                  className="flex gap-2 group items-center border-b border-divider border-dashed pb-1.5 last:border-b-0 last:pb-0"
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
                    className="w-10 h-10 object-cover rounded-lg shadow-sm"
                    src={getDisplayImageUrl(item.image)}
                  />
                  <div className="flex-grow flex flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-bold text-[12px] lg:text-[13px] line-clamp-1">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <div className="flex flex-col">
                        <span className="text-primary font-black text-[11px] lg:text-xs">
                          {formatNumber(item.price * item.quantity)}{" "}
                          <span className="text-[9px] font-normal">
                            {t("sale.kip")}
                          </span>
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {(item.status !== "SERVED" || item.note) && (
                            <Tooltip
                              content={
                                item.status === "SERVED"
                                  ? t("sale.viewNote")
                                  : item.note
                                    ? t("sale.editNote")
                                    : t("sale.addNote")
                              }
                            >
                              <div
                                className={clsx(
                                  "p-1 rounded-full cursor-pointer transition-all border",
                                  expandedNotes.has(uniqueId)
                                    ? "bg-primary text-white border-primary"
                                    : item.note
                                      ? "bg-warning-50 text-warning border-warning-100"
                                      : "bg-default-50 text-default-400 border-default-200",
                                )}
                                onClick={() => toggleNote(uniqueId)}
                              >
                                <MessageSquare size={12} strokeWidth={2.5} />
                              </div>
                            </Tooltip>
                          )}
                          {(() => {
                            const statusConfig = getStatusDisplay(
                              item.status,
                              t,
                            );

                            return (
                              <Chip
                                className="font-bold text-[8px] h-4"
                                color={statusConfig.color}
                                size="sm"
                                variant="flat"
                              >
                                {statusConfig.label}
                              </Chip>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex items-center gap-0 bg-default-100 rounded-md p-0.5 border border-default-200">
                        <Button
                          isIconOnly
                          className="min-w-5 h-5 w-5"
                          isDisabled={item.quantity <= 1}
                          size="sm"
                          variant="light"
                          onClick={() =>
                            updateQuantity(item.id, item.status, -1, item.note)
                          }
                        >
                          <Minus size={8} />
                        </Button>
                        <input
                          className="w-6 text-center font-bold text-[10px] bg-transparent outline-none border-none p-0 focus:ring-0"
                          type="text"
                          value={item.quantity === 0 ? "" : item.quantity}
                          onChange={(e) => {
                            const val = e.target.value;

                            if (val === "" || /^\d+$/.test(val)) {
                              setQuantity(item.id, item.status, val, item.note);
                            }
                          }}
                        />
                        <Button
                          isIconOnly
                          className="min-w-5 h-5 w-5"
                          size="sm"
                          variant="light"
                          onClick={() =>
                            updateQuantity(item.id, item.status, 1, item.note)
                          }
                        >
                          <Plus size={8} />
                        </Button>
                      </div>
                    </div>
                    {expandedNotes.has(uniqueId) && (
                      <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                        {item.status === "SERVED" ? (
                          <div className="px-2.5 py-2 bg-warning-50 border border-warning-100 rounded-xl">
                            <p className="text-[10px] text-warning-700 font-bold flex items-center gap-1">
                              <MessageSquare size={12} />
                              <span>{t("sale.noteLabel")}</span>
                            </p>
                            <p className="text-[10px] text-warning-600 mt-0.5">
                              {item.note || t("sale.noNote")}
                            </p>
                          </div>
                        ) : (
                          <Input
                            autoFocus
                            classNames={{
                              input: "text-[11px]",
                              inputWrapper:
                                "h-8 min-h-8 px-2 bg-warning-50/30 border-warning-200 focus-within:!border-warning-400",
                            }}
                            defaultValue={item.note || ""}
                            placeholder={t("sale.notePlaceholder")}
                            size="sm"
                            startContent={
                              <MessageSquare
                                className="text-default-400"
                                size={14}
                              />
                            }
                            variant="bordered"
                            onBlur={(e) => {
                              const val = e.target.value;

                              if (val !== (item.note || "")) {
                                updateItemNote(
                                  item.id,
                                  item.status,
                                  item.note,
                                  val,
                                );
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = (e.target as HTMLInputElement)
                                  .value;

                                updateItemNote(
                                  item.id,
                                  item.status,
                                  item.note,
                                  val,
                                );
                                toggleNote(uniqueId);
                              }
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    isIconOnly
                    className="min-w-6 h-6 w-6 ml-1"
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
                    <Trash2 size={12} />
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-40 py-10">
              <ShoppingCart className="mb-2" size={48} />
              <p className="font-bold">{t("sale.noItems")}</p>
            </div>
          )}
        </ScrollShadow>

        <div className="px-3 py-2 border-t border-divider bg-default-50/50 flex-shrink-0 z-40">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Button
              className="h-8 md:h-9 font-bold text-[9px] md:text-[11px] text-white shadow-sm px-1"
              color="warning"
              isDisabled={
                selectedCartItems.length === 0 ||
                selectedCartItems.some((uId) => {
                  const item = cart.find(
                    (i) => `${i.id}-${i.status}-${i.note || ""}` === uId,
                  );

                  return (
                    item?.status === "COOKING" || item?.status === "SERVED"
                  );
                })
              }
              startContent={<ChefHat size={12} />}
              onClick={() => {
                if (!isConnected) {
                  toast.error(t("sale.offlineKitchen"), {
                    duration: 4000,
                    style: { fontWeight: "bold" },
                  });
                }
                console.log(
                  "🚀 Clicked Send to Kitchen. selectedCartItems:",
                  selectedCartItems,
                );
                try {
                  updateStatus(selectedCartItems, "COOKING");
                  setSelectedCartItems([]);
                  toast.success(t("sale.updateSuccess"));

                  // Play notification sound
                  try {
                    const audio = new Audio("/assets/void/notification.mp3");

                    audio
                      .play()
                      .catch((e) => console.log("Audio play blocked:", e));
                  } catch (e) {}
                } catch (error) {
                  toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ");
                }
              }}
            >
              {t("sale.sendToKitchen")}
            </Button>
            <Button
              className="h-8 md:h-9 font-bold text-[9px] md:text-[11px] text-white shadow-sm px-1"
              color="primary"
              isDisabled={
                selectedCartItems.length === 0 ||
                selectedCartItems.some((uId) => {
                  const item = cart.find(
                    (i) => `${i.id}-${i.status}-${i.note || ""}` === uId,
                  );

                  return item?.status === "SERVED";
                })
              }
              startContent={<Utensils size={12} />}
              onClick={() => {
                if (!isConnected) {
                  toast.error(t("sale.offlineSync"), {
                    duration: 4000,
                    style: { fontWeight: "bold" },
                  });
                }
                try {
                  updateStatus(selectedCartItems, "SERVED");
                  setSelectedCartItems([]);
                  toast.success(t("sale.updateSuccess"));
                } catch (error) {
                  toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ");
                }
              }}
            >
              {t("sale.serveFood")}
            </Button>
          </div>
        </div>

        <div className="p-4 border-t border-divider bg-default-50/80 backdrop-blur-md">
          <div className="flex flex-col gap-1 mb-3">
            <div className="flex justify-between items-center text-xs text-warning-600 font-bold">
              <span>{t("sale.totalPending")}</span>
              <span>
                {formatNumber(statusTotals.PENDING)} {t("sale.kip")}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-primary-600 font-bold">
              <span>{t("sale.totalCooking")}</span>
              <span>
                {formatNumber(statusTotals.COOKING)} {t("sale.kip")}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-success-600 font-bold">
              <span>{t("sale.totalServed")}</span>
              <span>
                {formatNumber(statusTotals.SERVED)} {t("sale.kip")}
              </span>
            </div>
            <div className="flex justify-between items-center font-black pt-2 border-t border-divider mt-1">
              <span className="text-default-700">{t("sale.totalSummary")}</span>
              <span className="text-primary text-xl lg:text-2xl">
                {formatNumber(subtotal)}{" "}
                <span className="text-xs font-normal">{t("sale.kip")}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              className="h-12 font-bold text-base"
              color="danger"
              isDisabled={isEmpty}
              startContent={<Trash2 size={18} />}
              variant="flat"
              onClick={onClearCartOpen}
            >
              {t("sale.cancel")}
            </Button>
            <Button
              className="h-12 font-black text-lg shadow-lg shadow-primary/20"
              color="primary"
              isDisabled={
                isEmpty ||
                !cart.every(
                  (i) => i.status === "SERVED" || i.status === "CANCEL",
                )
              }
              startContent={<Banknote size={20} />}
              onPress={onPaymentOpen}
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
    </>
  );
};
