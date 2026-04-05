import React from "react";
import {
  Button,
  Checkbox,
  Image,
  ScrollShadow,
  Chip,
} from "@heroui/react";
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
} from "lucide-react";
import { useCart } from "@/provider";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";
import clsx from "clsx";
import { toast } from "react-hot-toast";

interface OrderRightProps {
  selectedTable: any;
  setSelectedTable: (table: any | null) => void;
  filteredCart: any[];
  selectedCartItems: string[];
  setSelectedCartItems: React.Dispatch<React.SetStateAction<string[]>>;
  isSelectingMenu: boolean;
  setIsSelectingMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setItemToRemove: React.Dispatch<React.SetStateAction<{ id: string; status: string; note?: string; } | null>>;
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
}

const getStatusDisplay = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return { label: "ລໍຖ້າ", color: "warning" as const };
    case "COOKING":
      return { label: "ກຳລັງຄົວ", color: "primary" as const };
    case "SERVED":
      return { label: "ເສີບແລ້ວ", color: "success" as const };
    case "CANCEL":
      return { label: "ຍົກເລີກ", color: "danger" as const };
    default:
      return { label: status || "ລໍຖ້າ", color: "default" as const };
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
}) => {
  const {
    cart,
    updateQuantity,
    setQuantity,
    updateStatus,
    subtotal,
    isConnected, // 🌐 Get connection status
  } = useCart();

  return (
    <div className="w-full lg:w-[400px] flex flex-col bg-white dark:bg-gray-800 border-t lg:border-t-0 lg:border-l border-divider shadow-2xl z-30 h-[55vh] lg:h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="p-2 lg:p-3 border-b border-divider flex items-center justify-between bg-primary/5">
        <div className="flex flex-col flex-grow">
          <div className="flex items-center gap-2 font-bold text-base lg:text-lg">
            <ShoppingCart size={18} className="text-primary" />
            <span>ໂຕະ {selectedTable?.name}</span>
          </div>
          <div className="flex items-center gap-4 ml-8 mt-1">
            <p className="text-xs text-default-500">
              {selectedTable?.capacity} ບ່ອນນັ່ງ
            </p>
          </div>
        </div>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          onClick={() => setSelectedTable(null)}
        >
          ✕
        </Button>
      </div>

      <div className="flex items-center justify-between px-2 lg:px-3 py-1.5 bg-default-100/50 border-b border-divider">
        <div className="flex items-center gap-2">
          <Checkbox
            isSelected={
              filteredCart.length > 0 &&
              filteredCart.every((item) =>
                selectedCartItems.includes(
                  `${item.id}-${item.status}-${item.note || ""}`,
                ),
              )
            }
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
                    (item) =>
                      `${item.id}-${item.status}-${item.note || ""}`,
                  ),
                );
                setSelectedCartItems(
                  selectedCartItems.filter((id) => !filteredIds.has(id)),
                );
              }
            }}
            size="sm"
            isDisabled={filteredCart.length === 0}
          >
            <span className="text-xs font-bold text-default-700">
              ເລືອກທັງໝົດ
            </span>
          </Checkbox>
          <div className="flex flex-wrap items-center gap-1 lg:gap-1.5 ml-2 lg:ml-3">
            {[
              { value: "ALL", label: "ທັງໝົດ" },
              { value: "PENDING", label: "ລໍຖ້າ" },
              { value: "COOKING", label: "ກຳລັງຄົວ" },
              { value: "SERVED", label: "ເສີບແລ້ວ" },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  setStatusFilter(status.value);
                  setSelectedCartItems([]);
                }}
                className={`px-2 py-1 text-[9px] lg:text-[10px] font-bold rounded-lg transition-all whitespace-nowrap outline-none border-[0.5px] ${
                  statusFilter === status.value
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/30 scale-[1.02]"
                    : "bg-default-100 text-default-500 border-default-200 hover:bg-default-200 hover:text-default-700"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
        {selectedCartItems.length > 0 && (
          <span className="text-xs text-primary font-bold">
            ເລືອກແລ້ວ {selectedCartItems.length}
          </span>
        )}
      </div>

      <ScrollShadow
        size={0}
        className="flex-grow p-2 lg:p-3 space-y-2 lg:space-y-3"
      >
        {filteredCart.length > 0
          ? filteredCart.map((item) => {
              const uniqueId = `${item.id}-${item.status}-${item.note || ""}`;
              return (
                <div
                  key={uniqueId}
                  className="flex gap-1.5 group items-center border-b border-divider border-dashed pb-1.5 lg:pb-2 last:border-b-0 last:pb-0"
                >
                  <Checkbox
                    isSelected={selectedCartItems.includes(uniqueId)}
                    onValueChange={(isSelected) => {
                      if (isSelected) {
                        setSelectedCartItems((prev) => [...prev, uniqueId]);
                      } else {
                        setSelectedCartItems((prev) =>
                          prev.filter((id) => id !== uniqueId),
                        );
                      }
                    }}
                    size="sm"
                    className="mr-0.5"
                  />
                  <Image
                    src={getDisplayImageUrl(item.image)}
                    className="w-9 h-9 lg:w-12 lg:h-12 object-cover min-w-[36px] lg:min-w-[48px]"
                    radius="md"
                  />
                  <div className="flex-grow flex flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-semibold text-[11px] lg:text-[13px] line-clamp-1">
                        {item.name}
                      </span>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onClick={() => {
                          setItemToRemove({
                            id: item.id,
                            status: item.status,
                            note: item.note,
                          });
                          onRemoveItemOpen();
                        }}
                        className="min-w-5 h-5 w-5 lg:min-w-6 lg:h-6 lg:w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center mt-0.5 gap-1.5">
                      <span className="text-primary font-bold text-[11px] lg:text-[13px] shrink-0">
                        {formatNumber(item.price * item.quantity)} ກີບ
                      </span>

                      <div className="flex items-center gap-3">
                        {/* note & status stack */}
                        <div className="flex flex-col items-end gap-1">
                          {/* note badge */}
                          {item.note && (
                            <div
                              className={clsx(
                                "flex items-center gap-1.5 px-2 py-1 rounded-full cursor-pointer transition-all border shadow-sm",
                                expandedNotes.has(uniqueId)
                                  ? "bg-primary text-white border-primary scale-105"
                                  : "bg-danger-50 text-danger border-danger-100 hover:bg-danger-100",
                              )}
                              onClick={() => {
                                console.log("🛒 Cart Item Details:", item);
                                toggleNote(uniqueId);
                              }}
                            >
                              <div className="relative">
                                <MessageSquare
                                  size={14}
                                  strokeWidth={
                                    expandedNotes.has(uniqueId) ? 2.5 : 2
                                  }
                                  className={
                                    expandedNotes.has(uniqueId)
                                      ? "text-white"
                                      : "text-danger"
                                  }
                                />
                                <div className="absolute -top-1 -right-1 bg-danger text-white text-[7px] font-bold w-3 h-3 flex items-center justify-center rounded-full ring-1 ring-white">
                                  1
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Status  */}
                          {(() => {
                            const statusConfig = getStatusDisplay(
                              item.status,
                            );
                            return (
                              <Chip
                                size="sm"
                                color={statusConfig.color}
                                variant="flat"
                                className="font-bold text-[9px] h-5"
                              >
                                {statusConfig.label}
                              </Chip>
                            );
                          })()}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 lg:gap-2 bg-default-100 rounded-lg p-0.5 shadow-sm border border-default-200/50">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="min-w-5 h-5 w-5 lg:min-w-6 lg:h-6 lg:w-6"
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
                            type="text"
                            id={`qty-${uniqueId}`}
                            name={`qty-${uniqueId}`}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="off"
                            value={item.quantity === 0 ? "" : item.quantity}
                            onChange={(e) => {
                              const val = e.target.value.replace(
                                /[^0-9]/g,
                                "",
                              );
                              setQuantity(
                                item.id,
                                item.status,
                                val,
                                item.note,
                              );
                            }}
                            className="w-5 lg:w-6 text-center bg-transparent font-bold text-[10px] lg:text-xs outline-none"
                          />
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="min-w-5 h-5 w-5 lg:min-w-6 lg:h-6 lg:w-6"
                            isDisabled={
                              item.quantity +
                                cart
                                  .filter(
                                    (i) =>
                                      i.id === item.id &&
                                      i.status !== "CANCEL" &&
                                      `${i.id}-${i.status}-${item.note || ""}` !==
                                        uniqueId,
                                  )
                                  .reduce(
                                    (sum, i) => sum + i.quantity,
                                    0,
                                  ) >=
                              item.stockQty
                            }
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.status,
                                1,
                                item.note,
                              )
                            }
                          >
                            <Plus size={10} />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {item.note && expandedNotes.has(uniqueId) && (
                      <div className="mt-2 px-2.5 py-2 bg-warning-50/50 border border-warning-100 rounded-xl animate-in fade-in zoom-in duration-200 shadow-sm">
                        <p className="text-[10px] lg:text-[11px] text-warning-700 font-bold flex items-center gap-1.5">
                          <MessageSquare size={12} className="shrink-0" />
                          <span>ໝາຍເຫດ:</span>
                        </p>
                        <p className="text-[10px] lg:text-[11px] text-warning-600 mt-0.5 leading-relaxed">
                          {item.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          : null}
      </ScrollShadow>

      <div className="px-2 py-1.5 lg:px-3 lg:py-2 border-t border-divider bg-default-50/50 flex-shrink-0">
        <div className="grid grid-cols-4 gap-1 lg:gap-1.5">
          <Button
            variant="flat"
            color={isSelectingMenu ? "danger" : "primary"}
            className={`h-8 lg:h-9 font-bold text-[9px] lg:text-[11px] px-1 ${isSelectingMenu ? "bg-danger/10 text-danger" : "bg-primary/10"}`}
            onClick={() => setIsSelectingMenu(!isSelectingMenu)}
            startContent={<Utensils size={12} />}
          >
            {isSelectingMenu ? "ປິດເມນູ" : "ເປີດເມນູ"}
          </Button>
          <Button
            color="warning"
            className="h-8 lg:h-9 font-bold text-[9px] lg:text-[11px] text-white shadow-sm px-1"
            onClick={() => {
              if (!isConnected) {
                toast.error("⚠️ ຕອນນີ້ Offline! ອໍເດີ້ຈະຖືກສົ່ງໄປຄົວທັນທີເມື່ອເນັດກັບມາ.", {
                  duration: 4000,
                  style: { fontWeight: "bold" }
                });
              }
              console.log(
                "🚀 Clicked Send to Kitchen. selectedCartItems:",
                selectedCartItems,
              );
              try {
                updateStatus(selectedCartItems, "COOKING");
                setSelectedCartItems([]);
                toast.success("ອັບເດດສະຖານະສຳເລັດ");

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
            startContent={<ChefHat size={12} />}
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
          >
            ສົ່ງໄປຄົວ
          </Button>
          <Button
            color="primary"
            className="h-8 lg:h-9 font-bold text-[9px] lg:text-[11px] text-white shadow-sm px-1"
            onClick={() => {
              if (!isConnected) {
                toast.error("⚠️ ຕອນນີ້ Offline! ຂໍ້ມູນຈະອັບເດດໄປຍັງເຄື່ອງອື່ນເມື່ອເນັດກັບມາ.", {
                  duration: 4000,
                  style: { fontWeight: "bold" }
                });
              }
              try {
                updateStatus(selectedCartItems, "SERVED");
                setSelectedCartItems([]);
                toast.success("ອັບເດດສະຖານະສຳເລັດ");
              } catch (error) {
                toast.error("ເກີດຂໍ้ຜິດພาดໃນการอับเดด");
              }
            }}
            startContent={<ChefHat size={12} />}
            isDisabled={
              selectedCartItems.length === 0 ||
              selectedCartItems.some((uId) => {
                const item = cart.find(
                  (i) => `${i.id}-${i.status}-${i.note || ""}` === uId,
                );
                return item?.status === "SERVED";
              })
            }
          >
            ເສີບອາຫານ
          </Button>
          <Button
            color="secondary"
            variant="solid"
            className="h-8 lg:h-9 font-bold text-[9px] lg:text-[11px] text-white shadow-sm px-1"
            onClick={onQrOpen}
            startContent={<QrCode size={12} />}
          >
            QR
          </Button>
        </div>
      </div>

      <div className="px-2 py-2 lg:px-3 lg:py-2.5 border-t border-divider bg-white mt-auto flex-shrink-0">
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex justify-between items-center text-[10px] lg:text-xs text-warning-600 font-bold">
            <span>ລໍຖ້າ:</span>
            <span>{formatNumber(statusTotals.PENDING)} ກີບ</span>
          </div>
          <div className="flex justify-between items-center text-[10px] lg:text-xs text-primary-600 font-bold">
            <span>ກຳລັງຄົວ:</span>
            <span>{formatNumber(statusTotals.COOKING)} ກີບ</span>
          </div>
          <div className="flex justify-between items-center text-[10px] lg:text-xs text-success-600 font-bold">
            <span>ເສີບແລ້ວ:</span>
            <span>{formatNumber(statusTotals.SERVED)} ກີບ</span>
          </div>
          <div className="flex justify-between items-center font-black pt-1 border-t border-divider mt-1">
            <span className="text-xs lg:text-sm text-default-700">
              ທັງໝົດ:
            </span>
            <div className="text-right">
              <span className="text-primary text-base lg:text-lg">
                {formatNumber(subtotal)} ກີບ
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          <Button
            variant="flat"
            color="danger"
            className="h-9 lg:h-11 font-bold text-xs lg:text-sm"
            isLoading={updateTablePending}
            onClick={() => {
              if (cart.length > 0) {
                toast.error(
                  "ບໍ່ສາມາດປິດໂຕະໄດ້! ກະລຸນາເຄຼຍລາຍການອາຫານໃນກະຕ່າອອກໃຫ້ໝົດກ່ອນ.",
                  {
                    style: {
                      fontWeight: "bold",
                      borderRadius: "12px",
                    },
                  },
                );
                return;
              }
              onCloseTableOpen();
            }}
            startContent={<Trash2 size={14} />}
          >
            ປິດໂຕະ
          </Button>
          <Button
            color="primary"
            className="h-9 lg:h-11 font-bold text-xs lg:text-sm shadow-md shadow-primary/20"
            startContent={<Banknote size={14} />}
            onPress={onPaymentOpen}
            isDisabled={
              cart.length === 0 ||
              !cart.every(
                (item) =>
                  item.status?.toUpperCase() === "SERVED" ||
                  item.status?.toUpperCase() === "CANCEL",
              )
            }
          >
            ຕໍ່ໄປ
          </Button>
        </div>
      </div>
    </div>
  );
};
