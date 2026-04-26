import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  Chip,
  Divider,
  Input,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Minus,
  CheckCircle,
  Clock,
  Utensils,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { formatNumber } from "@/utils/numberFormat";
import { getDisplayImageUrl } from "@/lib/utils";

interface ListmenuSelectProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cart: any[];
  placedOrders: any[];
  updateQuantity: (id: string, delta: number) => void;
  subtotal: number;
  cartTotalItems: number;
  submitOrder: () => void;
  isPending: boolean;
  updateNote: (id: string, note: string) => void;
}

const getStatusDisplay = (status: string, t: any) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return { label: t("customer.status.pending"), color: "warning" as const };
    case "COOKING":
      return { label: t("customer.status.cooking"), color: "primary" as const };
    case "SERVED":
      return { label: t("customer.status.served"), color: "success" as const };
    case "CANCEL":
      return { label: t("customer.status.cancel"), color: "danger" as const };
    default:
      return {
        label: status || t("customer.status.pending"),
        color: "default" as const,
      };
  }
};

export default function ListmenuSelect({
  isOpen,
  onOpenChange,
  cart,
  placedOrders = [],
  updateQuantity,
  subtotal,
  cartTotalItems,
  submitOrder,
  isPending,
  updateNote,
}: ListmenuSelectProps) {
  const { t } = useTranslation();
  const [activeNoteIds, setActiveNoteIds] = useState<Set<string>>(new Set());

  const toggleNote = (id: string) => {
    setActiveNoteIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

  const combinedOrdersSubtotal = (placedOrders || []).reduce(
    (acc, item) =>
      item.status?.toUpperCase() === "CANCEL"
        ? acc
        : acc + Number(item.price) * Number(item.quantity),
    0,
  );

  return (
    <Modal
      className="rounded-t-3xl sm:rounded-3xl m-0 sm:m-4 max-h-[90vh]"
      isOpen={isOpen}
      placement="bottom"
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 p-5 pb-4">
              <h3 className="font-black text-xl flex items-center justify-between text-default-800">
                {t("customer.orderList")}
                <span className="text-primary text-sm px-3 py-1 bg-primary/10 rounded-full w-auto">
                  ທັງໝົດ {cartTotalItems + (placedOrders?.length || 0)} ລายການ
                </span>
              </h3>
            </ModalHeader>
            <ModalBody className="p-4 sm:p-5">
              <div className="flex flex-col gap-6">
                {cart.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-sm text-default-500 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle size={16} /> {t("customer.selecting")}
                    </h4>
                    <div className="flex flex-col gap-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-2 border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 shrink-0">
                              <Image
                                alt={item.name}
                                className="w-full h-full object-cover rounded-xl shadow-sm border border-default-100"
                                src={getDisplayImageUrl(item.image)}
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                              <span className="font-black line-clamp-1 leading-tight text-default-800 block text-sm mb-1">
                                {item.name}
                              </span>

                              <div className="flex items-center justify-between gap-2">
                                <span className="text-primary font-black text-sm">
                                  {formatNumber(item.price)} ₭
                                </span>

                                <div className="flex items-center gap-1.5 bg-default-100/80 rounded-xl p-1 shadow-inner border border-default-200">
                                  <Button
                                    isIconOnly
                                    className="h-7 w-7 min-w-7"
                                    size="sm"
                                    variant="light"
                                    onPress={() => updateQuantity(item.id, -1)}
                                  >
                                    <Minus size={12} />
                                  </Button>
                                  <span className="font-extrabold w-5 text-center text-primary text-xs">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    isIconOnly
                                    className="h-7 w-7 min-w-7 bg-white shadow-sm"
                                    isDisabled={
                                      item.quantity >= (item.stockQty || 999)
                                    }
                                    size="sm"
                                    variant="light"
                                    onPress={() => {
                                      if (
                                        item.quantity >= (item.stockQty || 999)
                                      ) {
                                        toast.error(
                                          t("customer.stockWarning", {
                                            name: item.name,
                                            qty: item.stockQty,
                                          }),
                                        );

                                        return;
                                      }
                                      updateQuantity(item.id, 1);
                                    }}
                                  >
                                    <Plus size={12} />
                                  </Button>
                                </div>
                              </div>

                              {!item.note && !activeNoteIds.has(item.id) && (
                                <div className="mt-1">
                                  <Button
                                    className="h-6 min-w-0 px-2 bg-default-100/50 rounded-xl text-[10px] font-bold text-default-400"
                                    size="sm"
                                    startContent={<MessageSquare size={12} />}
                                    variant="flat"
                                    onPress={() => toggleNote(item.id)}
                                  >
                                    {t("customer.addNote")}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          {(item.note || activeNoteIds.has(item.id)) && (
                            <div className="flex flex-col gap-1.5 mt-1">
                              <Input
                                autoFocus
                                classNames={{
                                  input: "text-[11px] font-medium",
                                  inputWrapper:
                                    "h-8 bg-default-100/50 rounded-xl px-2",
                                }}
                                endContent={
                                  !item.note && (
                                    <Button
                                      isIconOnly
                                      className="h-6 w-6 min-w-6"
                                      size="sm"
                                      variant="light"
                                      onPress={() => toggleNote(item.id)}
                                    >
                                      <Minus size={12} />
                                    </Button>
                                  )
                                }
                                placeholder={t("customer.notePlaceholder")}
                                size="sm"
                                startContent={
                                  <MessageSquare
                                    className="text-primary"
                                    size={14}
                                  />
                                }
                                value={item.note || ""}
                                variant="flat"
                                onValueChange={(val) =>
                                  updateNote(item.id, val)
                                }
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cart.length > 0 && placedOrders.length > 0 && (
                  <Divider className="opacity-50" />
                )}

                {Array.isArray(placedOrders) && placedOrders.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-sm text-success uppercase tracking-widest flex items-center gap-2">
                      <Clock size={16} />{" "}
                      {t("customer.alreadyOrdered", {
                        count: placedOrders.length,
                      })}
                    </h4>
                    <div className="flex flex-col gap-4">
                      {placedOrders.map((item, index) => {
                        const statusInfo = getStatusDisplay(item.status, t);

                        return (
                          <div
                            key={`ord-${item.id || index}-${index}`}
                            className="flex items-center gap-3 border-b border-gray-50 pb-3 h-24 last:border-0 last:pb-0"
                          >
                            <div className="w-20 h-20 shrink-0">
                              <Image
                                alt={item.name}
                                className="w-full h-full object-cover rounded-xl shadow-sm border border-default-100"
                                src={getDisplayImageUrl(item.image)}
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between h-full py-1 min-w-0">
                              <div>
                                <span className="font-bold line-clamp-1 leading-tight text-default-600 block">
                                  {item.name}
                                </span>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-default-500 font-bold text-sm">
                                    x{item.quantity}
                                  </span>
                                  <Chip
                                    className="font-bold text-[10px]"
                                    color={statusInfo.color}
                                    size="sm"
                                    variant="flat"
                                  >
                                    {statusInfo.label}
                                  </Chip>
                                </div>
                                {item.note && (
                                  <p className="text-[10px] text-default-400 italic mt-1 bg-default-50 p-1 rounded border border-divider/5 line-clamp-1">
                                    ໝາຍເຫດ: {item.note}
                                  </p>
                                )}
                              </div>
                              <span className="text-default-700 font-black text-sm mt-auto">
                                {formatNumber(item.price * item.quantity)} ₭
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {cart.length === 0 && placedOrders.length === 0 && (
                  <div className="py-12 flex flex-col items-center justify-center text-default-400 gap-3">
                    <Utensils size={48} strokeWidth={1} />
                    <p className="font-bold">{t("customer.noOrders")}</p>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex-col gap-3 p-5 pt-3 border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] bg-gray-50/50">
              <div className="w-full flex justify-between items-center px-1">
                <span className="text-default-500 font-semibold text-sm">
                  {t("customer.grandTotal")}:
                </span>
                <div className="text-right">
                  {placedOrders.length > 0 && (
                    <p className="text-[10px] text-default-400 line-through">
                      {formatNumber(combinedOrdersSubtotal)} ₭
                    </p>
                  )}
                  <span className="text-2xl font-black text-primary">
                    {formatNumber(subtotal + combinedOrdersSubtotal)} ₭
                  </span>
                </div>
              </div>
              {cart.length > 0 && (
                <Button
                  className="w-full font-black text-base shadow-lg shadow-primary/30 h-14 rounded-2xl"
                  color="primary"
                  isLoading={isPending}
                  size="lg"
                  onPress={submitOrder}
                >
                  {t("customer.confirmOrder")}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
