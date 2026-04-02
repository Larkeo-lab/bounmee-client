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
} from "@heroui/react";
import { Plus, Minus, CheckCircle, Clock, Utensils } from "lucide-react";
import { formatNumber } from "@/utils/numberFormat";
import { getDisplayImageUrl } from "@/lib/utils";
import { toast } from "react-hot-toast";

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
  onUpdatePlacedQuantity: (index: number, delta: number) => void;
}

const getStatusDisplay = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return { label: "ລໍຖ້າ (Pending)", color: "warning" as const };
    case "COOKING":
      return { label: "ກຳລັງຄົວ (Cooking)", color: "primary" as const };
    case "SERVED":
      return { label: "ເສີບແລ້ວ (Served)", color: "success" as const };
    case "CANCEL":
      return { label: "ຍົກເລີກ (Cancel)", color: "danger" as const };
    default:
      return { label: status || "ລໍຖ້າ", color: "default" as const };
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
  onUpdatePlacedQuantity,
}: ListmenuSelectProps) {
  const combinedOrdersSubtotal = (placedOrders || []).reduce(
    (acc, item) => 
      item.status?.toUpperCase() === "CANCEL" 
        ? acc 
        : acc + Number(item.price) * Number(item.quantity),
    0,
  );

  console.log("placedOrders", placedOrders);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="bottom"
      scrollBehavior="inside"
      className="rounded-t-3xl sm:rounded-3xl m-0 sm:m-4 max-h-[90vh]"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 p-5 pb-4">
              <h3 className="font-black text-xl flex items-center justify-between text-default-800">
                ລາຍການສັ່ງອາຫານ
                <span className="text-primary text-sm px-3 py-1 bg-primary/10 rounded-full w-auto">
                  ທັງໝົດ {cartTotalItems + (placedOrders?.length || 0)} ລາຍການ
                </span>
              </h3>
            </ModalHeader>
            <ModalBody className="p-4 sm:p-5">
              <div className="flex flex-col gap-6">
                {/* 1. รายการที่กำลังเลือก (Pending Local Cart) */}
                {cart.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-sm text-default-500 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle size={16} /> ລາຍການທີ່ກຳລັງເລືອກ
                    </h4>
                    <div className="flex flex-col gap-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 border-b border-gray-50 pb-3 h-24 last:border-0 last:pb-0"
                        >
                          <div className="w-20 h-20 shrink-0">
                            <Image
                              src={getDisplayImageUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-xl shadow-sm border border-default-100"
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-between h-full py-1 min-w-0">
                            <div>
                              <span className="font-black line-clamp-1 leading-tight text-default-800 block">
                                {item.name}
                              </span>
                              <span className="text-primary font-black text-sm block mt-1">
                                {formatNumber(item.price)} ₭
                              </span>
                            </div>
                            <div className="flex items-center justify-end mt-auto">
                              <div className="flex items-center gap-1.5 bg-default-100/80 rounded-xl p-1 shadow-inner border border-default-200">
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="light"
                                  className="h-8 w-8 min-w-8"
                                  onPress={() => updateQuantity(item.id, -1)}
                                >
                                  <Minus size={14} />
                                </Button>
                                <span className="font-extrabold w-6 text-center text-primary">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="light"
                                  className="h-8 w-8 min-w-8 bg-white shadow-sm"
                                  isDisabled={item.quantity >= (item.stockQty || 999)}
                                  onPress={() => {
                                    if (item.quantity >= (item.stockQty || 999)) {
                                      toast.error(`ຂໍອະໄພ, ສິນຄ້າ "${item.name}" ມີໃນສາງພຽງ ${item.stockQty} ລາຍການ`);
                                      return;
                                    }
                                    updateQuantity(item.id, 1);
                                  }}
                                >
                                  <Plus size={14} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cart.length > 0 && placedOrders.length > 0 && (
                  <Divider className="opacity-50" />
                )}

                {/* 2. รายการที่สั่งไปแล้ว (Placed Orders Sync from POS) */}
                {Array.isArray(placedOrders) && placedOrders.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-sm text-success uppercase tracking-widest flex items-center gap-2">
                      <Clock size={16} /> ລາຍການທີ່ສັ່ງໄປແລ້ວ ({placedOrders.length})
                    </h4>
                    <div className="flex flex-col gap-4">
                      {placedOrders.map((item, index) => {
                        const statusInfo = getStatusDisplay(item.status);
                        return (
                          <div
                            key={`ord-${item.id || index}-${index}`}
                            className="flex items-center gap-3 border-b border-gray-50 pb-3 h-24 last:border-0 last:pb-0"
                          >
                            <div className="w-20 h-20 shrink-0">
                              <Image
                                src={getDisplayImageUrl(item.image)}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-xl shadow-sm border border-default-100"
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
                                    size="sm"
                                    color={statusInfo.color}
                                    variant="flat"
                                    className="font-bold text-[10px]"
                                  >
                                    {statusInfo.label}
                                  </Chip>
                                </div>
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
                    <p className="font-bold">ຍັງບໍ່ມີລາຍການອາຫານ</p>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex-col gap-3 p-5 pt-3 border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] bg-gray-50/50">
              <div className="w-full flex justify-between items-center px-1">
                <span className="text-default-500 font-semibold text-sm">
                  ຍອດລວມທັງໝົດ:
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
                  color="primary"
                  size="lg"
                  className="w-full font-black text-base shadow-lg shadow-primary/30 h-14 rounded-2xl"
                  isLoading={isPending}
                  onPress={submitOrder}
                >
                  ຍືນຍັນການສັ່ງອາຫານ
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
