import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
  Image,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
} from "@heroui/react";
import {
  Receipt,
  Download,
  User,
  ShoppingBag,
  Banknote,
  Landmark,
} from "lucide-react";
import { Order } from "@/services/order/useOrder";
import dayjs from "dayjs";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";
import { useAuth } from "@/routes/AuthContext";
import BillModal from "@/components/common/bill";

interface OrderDetailProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedOrder: Order | null;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
  isOpen,
  onOpenChange,
  selectedOrder,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    isOpen: isBillOpen,
    onOpen: onBillOpen,
    onOpenChange: onBillOpenChange,
  } = useDisclosure();

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "CASH":
        return "success";
      case "TRANSFER":
        return "primary";
      default:
        return "default";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH":
        return t("order.paymentCash") || "ເງິນສົດ";
      case "TRANSFER":
        return t("order.paymentTransfer") || "ເງິນໂອນ";
      default:
        return method;
    }
  };

  console.log("user", user);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
        placement="center"
        className="mx-0 sm:mx-2"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-0.5 border-b bg-default-50/50">
                <span className="text-primary font-black text-xl uppercase tracking-tighter leading-tight">
                  {t("order.billNo")} {selectedOrder?.orderNumber}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-default-400">
                  {dayjs(selectedOrder?.createdAt).format(
                    "DD/MM/YYYY HH:mm:ss",
                  )}
                </span>
              </ModalHeader>
              <ModalBody className="p-0 sm:p-4">
                <div className="p-4 space-y-4">
                  {/* Summary Row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-default-100 p-2 rounded-xl flex flex-col items-center">
                      <User size={14} className="text-default-400 mb-1" />
                      <span className="text-[9px] font-bold text-default-400 uppercase">
                        {t("order.tableEmployeeCol")}
                      </span>
                      <span className="text-[10px] font-black truncate w-full text-center">
                        {selectedOrder?.employee?.name || t("order.owner")}
                      </span>
                    </div>
                    <div className="bg-default-100 p-2 rounded-xl flex flex-col items-center">
                      <ShoppingBag
                        size={14}
                        className="text-default-400 mb-1"
                      />
                      <span className="text-[9px] font-bold text-default-400 uppercase">
                        {t("order.tableTable")}
                      </span>
                      <span className="text-[10px] font-black text-primary">
                        {selectedOrder?.businessType === "CAFE"
                          ? "Cafe"
                          : selectedOrder?.table?.name || t("order.shopFloor")}
                      </span>
                    </div>
                    <div className="bg-default-100 p-2 rounded-xl flex flex-col items-center">
                      <Banknote size={14} className="text-default-400 mb-1" />
                      <span className="text-[9px] font-bold text-default-400 uppercase">
                        {t("order.tablePayment")}
                      </span>
                      <Chip
                        size="sm"
                        color={getPaymentMethodColor(
                          selectedOrder?.paymentMethod || "",
                        )}
                        variant="flat"
                        className="h-4 text-[8px] font-black"
                      >
                        {getPaymentMethodLabel(
                          selectedOrder?.paymentMethod || "",
                        )}
                      </Chip>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    <p className="font-black text-sm flex items-center gap-2 text-default-700">
                      <Receipt size={16} className="text-primary" />
                      {t("order.tableItems")} ({selectedOrder?.items.length})
                    </p>
                    <Table
                      aria-label="Order items table"
                      shadow="none"
                      removeWrapper
                      className="border border-divider rounded-2xl overflow-hidden bg-default-50/30"
                      classNames={{
                        th: "bg-default-100 text-default-600 font-bold text-[10px] uppercase py-2 h-10",
                        td: "py-3 border-b border-divider/50 last:border-none bg-white/50",
                      }}
                    >
                      <TableHeader>
                        <TableColumn width={40} align="center">
                          {t("order.tableRank")}
                        </TableColumn>
                        <TableColumn>{t("order.imageName")}</TableColumn>
                        <TableColumn align="end">{t("order.priceUnit")}</TableColumn>
                        <TableColumn align="center">{t("order.qty")}</TableColumn>
                        <TableColumn align="end">{t("order.subtotal")}</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {(selectedOrder?.items || []).map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <span className="text-[10px] font-bold text-default-400">
                                {idx + 1}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2.5 min-w-[120px]">
                                <Image
                                  src={getDisplayImageUrl(
                                    (item as any).product.image,
                                  )}
                                  className="w-10 h-10 min-w-[40px] object-cover"
                                  radius="md"
                                />
                                <span className="text-[11px] font-bold text-default-800 leading-tight">
                                  {(item as any).product.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-[11px] font-medium text-default-600">
                                {formatNumber(Number(item.unitPrice))}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-[11px] font-black text-default-700 bg-default-100 px-2 py-0.5 rounded-md">
                                {item.qty}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-[11px] font-black text-primary">
                                {formatNumber(Number(item.subTotal))}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Totals Section */}
                  <div className="bg-gradient-to-br from-primary to-primary-700 p-4 rounded-3xl text-white shadow-lg shadow-primary/30 space-y-2 relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 rotate-12 -mr-6 -mt-4">
                      <Landmark size={120} />
                    </div>
                    <div className="flex justify-between items-center text-xs text-white/70 font-bold uppercase tracking-widest">
                      <span>{t("order.subtotal")}:</span>
                      <span>
                        {formatNumber(Number(selectedOrder?.totalAmount))} {t("order.kip") || "ກີບ"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-white/70 font-bold uppercase tracking-widest">
                      <span>{t("order.received")}</span>
                      <span>
                        {formatNumber(Number(selectedOrder?.receivedAmount))}{" "}
                        {t("order.kip") || "ກີບ"}
                      </span>
                    </div>
                    <Divider className="bg-white/20" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black uppercase tracking-tighter">
                        {t("order.change")}
                      </span>
                      <span className="text-xl font-black">
                        {formatNumber(Number(selectedOrder?.change))} {t("order.kip") || "ກີບ"}
                      </span>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t bg-default-50 p-4">
                <Button
                  variant="flat"
                  onPress={onClose}
                  className="font-bold flex-grow sm:flex-grow-0"
                >
                  {t("order.close")}
                </Button>
                <Button
                  color="primary"
                  className="font-black flex-grow sm:flex-grow-0 shadow-md shadow-primary/20"
                  startContent={<Download size={18} />}
                  onPress={onBillOpen}
                >
                  {t("order.reprint")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {selectedOrder && (
        <BillModal
          isOpen={isBillOpen}
          onOpenChange={onBillOpenChange}
          tableData={{
            store: user?.user?.store,
            name: selectedOrder?.table?.name || t("order.shopFloor"),
          }}
          finalOrder={selectedOrder}
          paymentMethod={selectedOrder.paymentMethod}
          bankName={selectedOrder.bank?.name || null}
          placedOrders={selectedOrder.items.map((item) => ({
            ...item,
            price: item.unitPrice,
            quantity: item.qty,
          }))}
        />
      )}
    </>
  );
};
