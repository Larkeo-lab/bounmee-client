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
  PenLine,
  Gift,
} from "lucide-react";
import dayjs from "dayjs";

import { Order } from "@/services/order/useOrder";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/routes/AuthContext";
import BillModal from "@/components/common/bill";

interface OrderDetailProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedOrder: Order | null;
  IS_GENERAL_STORE: boolean;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
  isOpen,
  onOpenChange,
  selectedOrder,
  IS_GENERAL_STORE,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
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
      case "TRANSFER_CASH":
        return "warning";
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
      case "TRANSFER_CASH":
        return t("order.paymentTransferCash") || "ໂອນ + ສົດ";
      default:
        return method;
    }
  };

  return (
    <>
      <Modal
        backdrop="blur"
        className="mx-0 sm:mx-2"
        isOpen={isOpen}
        placement="center"
        scrollBehavior="inside"
        size="3xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent className="rounded-2xl">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-0.5 border-b bg-default-50/50 rounded-t-2xl">
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
                  <div
                    className={`grid gap-2 ${IS_GENERAL_STORE
                      ? "grid-cols-2"
                      : "grid-cols-2 sm:grid-cols-3"
                      }`}
                  >
                    <div className="bg-default-100 p-2.5 rounded-2xl flex flex-col items-center">
                      <User className="text-default-400 mb-1" size={14} />
                      <span className="text-[9px] font-bold text-default-400 uppercase">
                        {t("order.tableEmployeeCol")}
                      </span>
                      <span className="text-[10px] font-black truncate w-full text-center">
                        {selectedOrder?.employee?.name || t("order.owner")}
                      </span>
                    </div>

                    {!IS_GENERAL_STORE && (
                      <div className="bg-default-100 p-2.5 rounded-2xl flex flex-col items-center">
                        <ShoppingBag
                          className="text-default-400 mb-1"
                          size={14}
                        />
                        <span className="text-[9px] font-bold text-default-400 uppercase">
                          {t("order.tableTable")}
                        </span>
                        <span className="text-[10px] font-black text-primary">
                          {selectedOrder?.businessType === "CAFE"
                            ? "Cafe"
                            : selectedOrder?.table?.name ||
                            t("order.shopFloor")}
                        </span>
                      </div>
                    )}

                    <div className="bg-default-100 p-2.5 rounded-2xl flex flex-col items-center">
                      <Banknote className="text-default-400 mb-1" size={14} />
                      <span className="text-[9px] font-bold text-default-400 uppercase">
                        {t("order.tablePayment")}
                      </span>
                      <div className="flex flex-col gap-1 items-center">
                        {selectedOrder?.isDebt ? (
                          <Chip
                            className="h-4 text-[8px] font-black"
                            color="danger"
                            size="sm"
                            variant="flat"
                          >
                            ຕິດໜີ້
                          </Chip>
                        ) : (
                          <Chip
                            className="h-4 text-[8px] font-black"
                            color={getPaymentMethodColor(
                              selectedOrder?.paymentMethod || "",
                            )}
                            size="sm"
                            variant="flat"
                          >
                            {getPaymentMethodLabel(
                              selectedOrder?.paymentMethod || "",
                            )}
                          </Chip>
                        )}

                        <Chip
                          className="h-4 text-[7px] font-black uppercase"
                          color={
                            selectedOrder?.paymentStatus === "PAID"
                              ? "success"
                              : selectedOrder?.paymentStatus ===
                                "PARTIALLY_PAID"
                                ? "warning"
                                : "danger"
                          }
                          size="sm"
                          variant="dot"
                        >
                          {selectedOrder?.paymentStatus === "PAID"
                            ? t("order.paid") || "ຊຳລະແລ້ວ"
                            : selectedOrder?.paymentStatus === "PARTIALLY_PAID"
                              ? t("order.partiallyPaid") || "ຊຳລະບາງສ່ວນ"
                              : t("order.unpaid") || "ຍັງບໍ່ຊຳລະ"}
                        </Chip>
                      </div>
                    </div>

                    {selectedOrder?.member && (
                      <div className="col-span-full space-y-2">
                        <div className="flex items-center gap-2 px-1">
                          <User className="text-primary" size={16} />
                          <span className="text-xs font-black text-default-700 uppercase tracking-tight">
                            {t("order.memberInfo") || "ຂໍ້ມູນລູກຄ້າສະມາຊິກ"}
                          </span>
                        </div>
                        <Table
                          removeWrapper
                          aria-label="Member information table"
                          className="border border-divider rounded-2xl overflow-hidden bg-primary/5"
                          classNames={{
                            th: "bg-primary/10 text-primary font-bold text-[10px] uppercase py-2 h-8",
                            td: "py-3 border-b border-divider/50 last:border-none bg-white/40",
                          }}
                        >
                          <TableHeader>
                            <TableColumn width={200}>
                              {t("order.memberName") || "ຊື່ລູກຄ້າ"}
                            </TableColumn>
                            <TableColumn>
                              {t("order.memberPhone") || "ເບີໂທລະສັບ"}
                            </TableColumn>
                          </TableHeader>
                          <TableBody>
                            <TableRow key="1">
                              <TableCell className="text-[11px] font-black text-primary">
                                {selectedOrder.member.name}
                              </TableCell>
                              <TableCell className="text-[11px] font-bold text-default-600">
                                {selectedOrder.member.phone}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    <p className="font-black text-sm flex items-center gap-2 text-default-700">
                      <Receipt className="text-primary" size={16} />
                      {t("order.tableItems")} ({selectedOrder?.items.length})
                    </p>
                    <Table
                      removeWrapper
                      aria-label="Order items table"
                      className="border border-divider rounded-2xl overflow-hidden bg-default-50/30"
                      classNames={{
                        th: "bg-default-100 text-default-600 font-bold text-[10px] uppercase py-2 h-10",
                        td: "py-3 border-b border-divider/50 last:border-none bg-white/50",
                      }}
                      shadow="none"
                    >
                      <TableHeader>
                        <TableColumn align="center" width={40}>
                          {t("order.tableRank")}
                        </TableColumn>
                        <TableColumn>{t("order.imageName")}</TableColumn>
                        <TableColumn align="end">
                          {t("order.priceUnit")}
                        </TableColumn>
                        <TableColumn align="center">
                          {t("order.qty")}
                        </TableColumn>
                        <TableColumn align="end">
                          {t("order.subtotal")}
                        </TableColumn>
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
                                  className="w-10 h-10 min-w-[40px] object-cover"
                                  radius="lg"
                                  src={getDisplayImageUrl(item.product.image)}
                                />
                                <span className="text-[11px] font-bold text-default-800 leading-tight">
                                  {item.product.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-[11px] font-medium text-default-600">
                                {formatNumber(Number(item.unitPrice))}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-[11px] font-black text-default-700 bg-default-100 px-2.5 py-1 rounded-lg">
                                {item.qty}
                                {(item.product?.unit?.name ||
                                  item.unitName) && (
                                    <span className="text-[9px] font-medium text-default-400 ml-1">
                                      {item.product?.unit?.name || item.unitName}
                                    </span>
                                  )}
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

                  {/* ✨ Free Items Section */}
                  {selectedOrder?.productFrees &&
                    selectedOrder.productFrees.length > 0 && (
                      <div className="space-y-3">
                        <p className="font-black text-sm flex items-center gap-2 text-pink-600">
                          <Gift className="text-pink-600" size={16} />
                          {t("order.freeItemsSection", {
                            count: selectedOrder.productFrees.length,
                          }) ||
                            `ຂອງແຖມ (${selectedOrder.productFrees.length})`}
                        </p>
                        <Table
                          removeWrapper
                          aria-label="Free items table"
                          className="border border-pink-200 rounded-2xl overflow-hidden bg-pink-50/30"
                          classNames={{
                            th: "bg-pink-100/60 text-pink-700 font-bold text-[10px] uppercase py-2 h-10",
                            td: "py-3 border-b border-pink-100 last:border-none bg-white/60",
                          }}
                          shadow="none"
                        >
                          <TableHeader>
                            <TableColumn align="center" width={40}>
                              {t("order.tableRank")}
                            </TableColumn>
                            <TableColumn>{t("order.imageName")}</TableColumn>
                            <TableColumn align="end">
                              {t("order.priceUnit")}
                            </TableColumn>
                            <TableColumn align="center">
                              {t("order.qty")}
                            </TableColumn>
                            <TableColumn align="end">
                              {t("order.subtotal")}
                            </TableColumn>
                          </TableHeader>
                          <TableBody>
                            {selectedOrder.productFrees.map((free, idx) => (
                              <TableRow key={free.id}>
                                <TableCell>
                                  <span className="text-[10px] font-bold text-pink-400">
                                    {idx + 1}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2.5 min-w-[120px]">
                                    <Image
                                      className="w-10 h-10 min-w-[40px] object-cover"
                                      radius="lg"
                                      src={getDisplayImageUrl(
                                        free.product?.image,
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-[11px] font-bold text-default-800 leading-tight">
                                        {free.product?.name ||
                                          t("payment.product") ||
                                          "Product"}
                                      </span>
                                      <Chip
                                        className="h-4 text-[8px] font-black mt-0.5 w-fit"
                                        color="secondary"
                                        size="sm"
                                        startContent={<Gift size={8} />}
                                        variant="flat"
                                      >
                                        {t("order.freeItems") || "ຂອງແຖມ"}
                                      </Chip>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-[11px] font-medium text-default-600 line-through">
                                    {formatNumber(Number(free.price))}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-[11px] font-black text-pink-700 bg-pink-100 px-2.5 py-1 rounded-lg">
                                    × {free.amount}
                                    {free.product?.unit?.name && (
                                      <span className="text-[9px] font-medium text-pink-400 ml-1">
                                        {free.product.unit.name}
                                      </span>
                                    )}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-[11px] font-black text-pink-600">
                                    -{formatNumber(Number(free.totalPrice))}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {/* Total value of free items */}
                        <div className="flex justify-end items-center gap-2 text-xs font-bold text-pink-600 px-2">
                          <span className="uppercase tracking-wider">
                            {t("order.freeItemsTotalValue") || "ມູນຄ່າລວມ"}:
                          </span>
                          <span className="text-sm font-black">
                            {formatNumber(
                              selectedOrder.productFrees.reduce(
                                (acc, f) => acc + Number(f.totalPrice),
                                0,
                              ),
                            )}{" "}
                            {t("order.kip") || "ກີບ"}
                          </span>
                        </div>
                      </div>
                    )}

                  {/* Totals Section */}
                  <div className="bg-gradient-to-br from-primary to-primary-700 p-4 rounded-3xl text-white shadow-lg shadow-primary/30 space-y-2 relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 rotate-12 -mr-6 -mt-4">
                      <Landmark size={120} />
                    </div>

                    {/* Subtotal Before Discount */}
                    {selectedOrder?.isDiscount && (
                      <div className="flex justify-between items-center text-xs text-white/70 font-bold uppercase tracking-widest">
                        <span>
                          {t("order.totalBeforeDiscount") || "ຍອດລວມກ່ອນຫຼຸດ"}:
                        </span>
                        <span>
                          {formatNumber(
                            Number(selectedOrder?.totalAmount) +
                            Number(selectedOrder?.discountAmount || 0),
                          )}{" "}
                          {t("order.kip") || "ກີບ"}
                        </span>
                      </div>
                    )}

                    {/* Discount */}
                    {selectedOrder?.isDiscount && (
                      <div className="flex justify-between items-center text-xs text-warning-400 font-bold uppercase tracking-widest">
                        <span>{t("order.discount") || "ສ່ວນຫຼຸດ"}:</span>
                        <span className="flex items-center gap-1">
                          -{formatNumber(Number(selectedOrder?.discountAmount))}{" "}
                          {t("order.kip") || "ກີບ"}
                          {selectedOrder.discountPercent &&
                            selectedOrder.discountPercent > 0 && (
                              <span className="text-[10px] bg-warning/20 px-1 rounded">
                                {selectedOrder.discountPercent}%
                              </span>
                            )}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm font-black uppercase tracking-tighter">
                      <span>{t("order.total") || "ຍອດລວມສຸດທິ"}:</span>
                      <span>
                        {formatNumber(Number(selectedOrder?.totalAmount))}{" "}
                        {t("order.kip") || "ກີບ"}
                      </span>
                    </div>

                    <Divider className="bg-white/20" />

                    {/* Payment Breakdown */}
                    {selectedOrder?.paymentMethod === "TRANSFER_CASH" && (
                      <div className="space-y-1 py-1">
                        <div className="flex justify-between items-center text-[10px] text-white/60 font-bold uppercase">
                          <span>{t("order.paymentCash") || "ເງິນສົດ"}:</span>
                          <span>
                            {formatNumber(Number(selectedOrder?.cashAmount))}{" "}
                            {t("order.kip") || "ກີບ"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-white/60 font-bold uppercase">
                          <span>
                            {t("order.paymentTransfer") || "ເງິນໂອນ"}:
                          </span>
                          <span>
                            {formatNumber(
                              Number(selectedOrder?.transferAmount),
                            )}{" "}
                            {t("order.kip") || "ກີບ"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Debt Info */}
                    {selectedOrder?.isDebt && (
                      <div className="flex justify-between items-center text-xs text-danger-300 font-bold uppercase tracking-widest bg-danger/10 p-1.5 rounded-xl border border-danger/20">
                        <span>{t("order.debtAmount") || "ຍອດຕິດໜີ້"}:</span>
                        <span>
                          {formatNumber(Number(selectedOrder?.debtAmount))}{" "}
                          {t("order.kip") || "ກີບ"}
                        </span>
                      </div>
                    )}

                    {selectedOrder?.isDebt && selectedOrder?.dueDate && (
                      <div className="flex justify-between items-center text-[10px] text-danger-200 font-bold uppercase tracking-wider px-1">
                        <span>{t("order.dueDate") || "ວັນທີກຳນົດສົ່ງ"}:</span>
                        <span>
                          {dayjs(selectedOrder.dueDate).format("DD/MM/YYYY")}
                        </span>
                      </div>
                    )}

                    {!selectedOrder?.isDebt && (
                      <div className="flex justify-between items-center text-xs text-white/70 font-bold uppercase tracking-widest">
                        <span>{t("order.received")}</span>
                        <span>
                          {formatNumber(Number(selectedOrder?.receivedAmount))}{" "}
                          {t("order.kip") || "ກີບ"}
                        </span>
                      </div>
                    )}

                    {!selectedOrder?.isDebt && (
                      <div className="flex justify-between items-center pt-1 border-t border-white/10">
                        <span className="text-sm font-black uppercase tracking-tighter">
                          {t("order.change")}
                        </span>
                        <span className="text-xl font-black">
                          {formatNumber(Number(selectedOrder?.change))}{" "}
                          {t("order.kip") || "ກີບ"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t bg-default-50 p-4">
                <Button
                  className="font-bold flex-grow sm:flex-grow-0 rounded-xl"
                  variant="flat"
                  onPress={onClose}
                >
                  {t("order.close")}
                </Button>
                <Button
                  className="font-black flex-grow sm:flex-grow-0 shadow-md shadow-primary/20 rounded-xl"
                  color="secondary"
                  startContent={<PenLine size={18} />}
                  onPress={() => {
                    onClose();
                    if (selectedOrder?.businessType === "CAFE") {
                      navigate("/saleCafe", { state: { editOrder: selectedOrder } });
                    } else if (selectedOrder?.tableId || selectedOrder?.table) {
                      navigate("/table", { state: { editOrder: selectedOrder } });
                    } else {
                      navigate("/saleGeneral", { state: { editOrder: selectedOrder } });
                    }
                  }}
                >
                  {t("common.edit")}
                </Button>
                <Button
                  className="font-black flex-grow sm:flex-grow-0 shadow-md shadow-primary/20 rounded-xl"
                  color="primary"
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
          bankName={selectedOrder.bank?.name || null}
          finalOrder={selectedOrder}
          isOpen={isBillOpen}
          paymentMethod={selectedOrder.paymentMethod}
          placedOrders={selectedOrder.items.map((item) => ({
            ...item,
            price: item.unitPrice,
            quantity: item.qty,
          }))}
          tableData={{
            store: user?.user?.store,
            name: selectedOrder?.table?.name || t("order.shopFloor"),
          }}
          onOpenChange={onBillOpenChange}
        />
      )}
    </>
  );
};
