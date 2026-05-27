import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ButtonGroup,
  Spinner,
  Input,
  Checkbox,
} from "@heroui/react";
import {
  Delete,
  XCircle,
  CheckCircle2,
  CreditCard,
  Banknote,
  Landmark,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/routes/AuthContext";
import { useGetBanks, Bank } from "@/services/bank/useBank";
import {
  useCreateOrder,
  useUpdateOrderItems,
} from "@/services/order/useOrder";
import { useGetMoneyRates } from "@/services/moneyRate/useMoneyRate";
import { getDisplayImageUrl } from "@/lib/utils";
import DebtModal from "./debt-modal";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  unitName?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  total: number;
  items: CartItem[];
  tableId?: string | null;
  businessType?: "RETAIL" | "CAFE";
  editingOrderId?: string;
  onPaymentSuccess: (order?: any) => void;
}

export default function PaymentModal({
  isOpen,
  onOpenChange,
  total,
  items,
  tableId,
  businessType,
  editingOrderId,
  onPaymentSuccess,
}: PaymentModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "TRANSFER" | "TRANSFER_CASH"
  >("CASH");
  const [mixedCashAmount, setMixedCashAmount] = useState("0");
  const [mixedTransferAmount, setMixedTransferAmount] = useState("0");
  const [activeMixedField, setActiveMixedField] = useState<"CASH" | "TRANSFER">(
    "CASH",
  );
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [receivedAmount, setReceivedAmount] = useState("0");
  const [currency, setCurrency] = useState("LAK");

  // Discount State
  const [discountType, setDiscountType] = useState<"AMOUNT" | "PERCENT">(
    "AMOUNT",
  );
  const [discountValue, setDiscountValue] = useState("0");
  const [isDiscount, setIsDiscount] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);

  const createOrderMutation = useCreateOrder();
  const updateOrderItemsMutation = useUpdateOrderItems();
  const isEditing = !!editingOrderId;

  const { data: bankResponse, isLoading: isLoadingBanks } = useGetBanks(
    isOpen ? user?.user?.storeId : "",
  );
  const banks = bankResponse?.data || [];
  const selectedBankData = banks.find((b: Bank) => b.id === selectedBank);
  // get money rate

  const { data: moneyRateResponse } = useGetMoneyRates(
    isOpen ? user?.user?.storeId : "",
  );
  const moneyRates = moneyRateResponse?.data || [];

  const handleKeypadPress = (val: string) => {
    if (paymentMethod === "TRANSFER_CASH") {
      const currentVal =
        activeMixedField === "CASH" ? mixedCashAmount : mixedTransferAmount;
      const newVal = currentVal === "0" ? val : currentVal + val;

      updateMixedAmounts(activeMixedField, newVal);
    } else {
      setReceivedAmount((prev) => {
        if (prev === "0") return val;

        return prev + val;
      });
    }
  };

  const updateMixedAmounts = (field: "CASH" | "TRANSFER", value: string) => {
    const rawValue = parseNumeric(value);
    const numValue = Number(rawValue || "0");
    const remaining = Math.max(0, finalTotal - numValue);

    if (field === "CASH") {
      setMixedCashAmount(rawValue || "0");
      setMixedTransferAmount(remaining.toString());
    } else {
      setMixedTransferAmount(rawValue || "0");
      setMixedCashAmount(remaining.toString());
    }
  };

  const clearReceived = () => {
    if (paymentMethod === "TRANSFER_CASH") {
      updateMixedAmounts(activeMixedField, "0");
    } else {
      setReceivedAmount("0");
    }
  };

  const deleteLastDigit = () => {
    if (paymentMethod === "TRANSFER_CASH") {
      const currentVal =
        activeMixedField === "CASH" ? mixedCashAmount : mixedTransferAmount;
      const newVal = currentVal.length > 1 ? currentVal.slice(0, -1) : "0";

      updateMixedAmounts(activeMixedField, newVal);
    } else {
      setReceivedAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    }
  };

  // Replace setter usage in delete/clear if needed, but for now focus on main inputs
  // Let's also update clearReceived to reset both or handle logic
  // Actually, handleReceivedAmountChange is the most important for keyboard/manual entry

  const currentRate = moneyRates.find((r: any) => r.name === currency);
  const rateValue = currentRate ? Number(currentRate.rateBuy) : 1;
  const receivedAmountInLAK = Number(receivedAmount) * rateValue;

  // Helper for parsing/formatting
  const parseNumeric = (val: string) => val.replace(/,/g, "");

  const handleDiscountChange = (val: string) => {
    const rawValue = parseNumeric(val);
    if (rawValue !== "" && isNaN(Number(rawValue))) return;

    let numValue = Number(rawValue);
    if (discountType === "AMOUNT") {
      if (numValue > total) numValue = total;
    } else {
      if (numValue > 100) numValue = 100;
    }

    setDiscountValue(rawValue === "" ? "0" : numValue.toString());
  };

  const handleReceivedAmountChange = (val: string) => {
    const rawValue = parseNumeric(val);
    if (rawValue !== "" && isNaN(Number(rawValue))) return;

    if (paymentMethod === "TRANSFER_CASH") {
      updateMixedAmounts(activeMixedField, rawValue || "0");
    } else {
      setReceivedAmount(rawValue === "" ? "0" : rawValue);
    }
  };

  // Discount Calculation
  const discountAmount = isDiscount
    ? discountType === "AMOUNT"
      ? Number(parseNumeric(discountValue))
      : (total * Number(parseNumeric(discountValue))) / 100
    : 0;
  const discountPercent =
    isDiscount && discountType === "PERCENT"
      ? Number(parseNumeric(discountValue))
      : 0;
  const finalTotal = Math.max(0, total - discountAmount);

  // Sync received amount for Transfer/Mixed
  useEffect(() => {
    if (paymentMethod === "TRANSFER") {
      setReceivedAmount(finalTotal.toString());
    } else if (paymentMethod === "TRANSFER_CASH") {
      // Initialize mixed amounts if they are 0
      if (mixedCashAmount === "0" && mixedTransferAmount === "0") {
        setMixedCashAmount("0");
        setMixedTransferAmount(finalTotal.toString());
      }
    }
  }, [paymentMethod, finalTotal]);

  const change = Math.max(0, receivedAmountInLAK - finalTotal);

  const handleConfirm = async (onClose: () => void) => {
    if (!user?.user?.storeId || !user?.user?.id) {
      toast.error("Auth session invalid");

      return;
    }

    const computedReceivedAmount =
      paymentMethod === "TRANSFER_CASH"
        ? Number(parseNumeric(mixedCashAmount)) +
          Number(parseNumeric(mixedTransferAmount))
        : Number(receivedAmountInLAK);
    const computedChange =
      paymentMethod === "TRANSFER_CASH" ? 0 : Number(change);
    const computedCash =
      paymentMethod === "TRANSFER_CASH"
        ? Number(parseNumeric(mixedCashAmount))
        : paymentMethod === "CASH"
          ? Number(receivedAmountInLAK)
          : 0;
    const computedTransfer =
      paymentMethod === "TRANSFER_CASH"
        ? Number(parseNumeric(mixedTransferAmount))
        : paymentMethod === "TRANSFER"
          ? Number(receivedAmountInLAK)
          : 0;
    const mappedItems = items.map((item: any) => ({
      productId: item.id,
      qty: Number(item.quantity),
      unitPrice: Number(item.price),
      subTotal: Number(item.price) * Number(item.quantity),
      status: item.status,
      note: item.note || "",
      unitName: item.unitName || "",
    }));

    try {
      let result: any;

      if (isEditing && editingOrderId) {
        result = await updateOrderItemsMutation.mutateAsync({
          id: editingOrderId,
          data: {
            totalAmount: Number(finalTotal),
            receivedAmount: computedReceivedAmount,
            change: computedChange,
            discountAmount: Number(discountAmount),
            isDiscount: isDiscount,
            discountPercent: Number(discountPercent),
            paymentMethod: paymentMethod,
            paymentStatus: "PAID",
            cashAmount: computedCash,
            transferAmount: computedTransfer,
            bankId: selectedBank,
            // ตัด debt fields ออกในกรณีที่กดชำระปกติ (จากเดิมที่อาจเคยติดหนี้)
            isDebt: false,
            debtAmount: 0,
            memberId: null,
            dueDate: null,
            items: mappedItems,
          },
        });
      } else {
        result = await createOrderMutation.mutateAsync({
          totalAmount: Number(finalTotal),
          receivedAmount: computedReceivedAmount,
          change: computedChange,
          discountAmount: Number(discountAmount),
          isDiscount: isDiscount,
          discountPercent: Number(discountPercent),
          paymentMethod: paymentMethod,
          paymentStatus: "PAID",
          cashAmount: computedCash,
          transferAmount: computedTransfer,
          storeId: user.user.storeId,
          employeeId: user.user.employee?.id || null,
          bankId: selectedBank,
          tableId: tableId,
          businessType: businessType,
          items: mappedItems,
        });
      }

      toast.success(
        isEditing
          ? t("sale.updateOrderSuccess") || "ອັບເດດສຳເລັດ!"
          : t("payment.success") || "ຊຳລະເງິນສຳເລັດແລ້ວ!",
      );
      onPaymentSuccess(result?.data);
      clearReceived();
      onClose();
    } catch (error: any) {
      console.error("Payment failed:", error);
      const errorData = error?.response?.data;

      if (errorData?.errorCode === "POS-9004") {
        const stockInfo = errorData.errors;

        toast.error(
          t("customer.stockWarning", { name: stockInfo.productName, qty: stockInfo.availableStock }) ||
          `ສິນຄ້າ "${stockInfo.productName}" ບໍ່ພໍ! (ມີ: ${stockInfo.availableStock}, ต้องการ: ${stockInfo.requested})`,
          {
            duration: 5000,
            icon: "⚠️",
          },
        );
      } else {
        toast.error(errorData?.message || t("payment.failed") || "ການຊຳລະເງິນຫຼົ້ມເຫຼວ ກະລຸນາລອງໃໝ່");
      }
    }
  };

  const handleDebtConfirm = async (memberId: string, dueDate?: string | null) => {
    if (!user?.user?.storeId || !user?.user?.id) {
      toast.error("Auth session invalid");

      return;
    }

    const mappedItems = items.map((item: any) => ({
      productId: item.id,
      qty: Number(item.quantity),
      unitPrice: Number(item.price),
      subTotal: Number(item.price) * Number(item.quantity),
      status: item.status,
      note: item.note || "",
      unitName: item.unitName || "",
    }));

    try {
      let result: any;

      if (isEditing && editingOrderId) {
        result = await updateOrderItemsMutation.mutateAsync({
          id: editingOrderId,
          data: {
            totalAmount: Number(finalTotal),
            receivedAmount: 0,
            change: 0,
            discountAmount: Number(discountAmount),
            isDiscount: isDiscount,
            discountPercent: Number(discountPercent),
            paymentMethod: "CASH",
            paymentStatus: "UNPAID",
            cashAmount: 0,
            transferAmount: 0,
            bankId: null,
            isDebt: true,
            debtAmount: Number(finalTotal),
            memberId: memberId,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            items: mappedItems,
          },
        });
      } else {
        result = await createOrderMutation.mutateAsync({
          totalAmount: Number(finalTotal),
          receivedAmount: 0,
          change: 0,
          discountAmount: Number(discountAmount),
          isDiscount: isDiscount,
          discountPercent: Number(discountPercent),
          paymentMethod: "CASH",
          paymentStatus: "UNPAID",
          isDebt: true,
          debtAmount: Number(finalTotal),
          storeId: user.user.storeId,
          employeeId: user.user.employee?.id || null,
          memberId: memberId,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          tableId: tableId,
          businessType: businessType,
          items: mappedItems,
        });
      }

      toast.success(t("payment.debtSuccess") || "ບັນທຶກການຕິດໜີ້ສຳເລັດ!");
      onPaymentSuccess(result?.data);
      setIsDebtModalOpen(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Debt payment failed:", error);
      toast.error(t("payment.debtFailed") || "ການບັນທຶກການຕິດໜີ້ຫຼົ້ມເຫຼວ");
    }
  };

  return (
    <Modal
      backdrop="blur"
      className="dark:bg-gray-900 mx-0 sm:mx-2"
      classNames={{
        wrapper: "z-[60]",
        backdrop: "z-[60]",
      }}
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="4xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-2xl font-bold text-primary">
              {t("payment.title") || "ຊຳລະເງິນ"}
            </ModalHeader>
            <ModalBody className="pb-8">
              <div className="flex flex-col gap-6">
                {/* Payment Method Selection */}
                <div className="flex justify-center -mt-2">
                  <ButtonGroup className="w-full max-w-full sm:max-w-2xl shadow-sm">
                    <Button
                      className="flex-grow h-10 sm:h-11 font-bold text-sm sm:text-base"
                      color={paymentMethod === "CASH" ? "primary" : "default"}
                      startContent={<Banknote size={20} />}
                      variant={paymentMethod === "CASH" ? "solid" : "flat"}
                      onClick={() => {
                        setPaymentMethod("CASH");
                        setSelectedBank(null);
                      }}
                    >
                      {t("payment.cash") || "ເງິນສົດ"}
                    </Button>
                    <Button
                      className="flex-grow h-10 sm:h-11 font-bold text-sm sm:text-base"
                      color={
                        paymentMethod === "TRANSFER" ? "primary" : "default"
                      }
                      startContent={<CreditCard size={20} />}
                      variant={paymentMethod === "TRANSFER" ? "solid" : "flat"}
                      onClick={() => {
                        setPaymentMethod("TRANSFER");
                        setReceivedAmount(finalTotal.toString());
                      }}
                    >
                      {t("payment.transfer") || "ເງິນໂອນ"}
                    </Button>
                    <Button
                      className="flex-grow h-10 sm:h-11 font-bold text-sm sm:text-base"
                      color={
                        paymentMethod === "TRANSFER_CASH"
                          ? "primary"
                          : "default"
                      }
                      startContent={
                        <div className="flex -space-x-2">
                          <Banknote size={16} />
                          <CreditCard size={16} />
                        </div>
                      }
                      variant={
                        paymentMethod === "TRANSFER_CASH" ? "solid" : "flat"
                      }
                      onClick={() => {
                        setPaymentMethod("TRANSFER_CASH");
                        // Don't clear bank if there was one, but usually needs selection
                      }}
                    >
                      {t("payment.cashTransfer") || "ເງີນສົດແລະໂອນ"}
                    </Button>
                  </ButtonGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Side: Summary */}
                  <div className="space-y-6">
                    <div className="p-3 bg-default-50 rounded-2xl border border-divider">
                      <p className="text-default-500 text-xs mb-1 uppercase tracking-wider font-semibold">
                        {t("payment.total") || "ຍອດລວມ"}
                      </p>
                      <p className="text-xl font-bold text-default-700">
                        {total.toLocaleString()}{" "}
                        <span className="text-sm font-normal">{t("payment.kip") || "ກີບ"}</span>
                      </p>
                    </div>

                    {/* Discount Section */}
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Checkbox
                          isSelected={isDiscount}
                          onValueChange={(val) => {
                            setIsDiscount(val);
                            if (!val) setDiscountValue("0");
                          }}
                          color="warning"
                          size="sm"
                          classNames={{
                            label:
                              "text-warning-600 text-xs font-bold uppercase tracking-wider",
                          }}
                        >
                          {t("payment.discount") || "ສ່ວນຫຼຸດ"}
                        </Checkbox>
                      </div>

                      {isDiscount && (
                        <div className="space-y-3 pl-6">
                          <ButtonGroup className="w-full" size="sm">
                            <Button
                              className="w-1/2 font-bold"
                              color={
                                discountType === "AMOUNT"
                                  ? "warning"
                                  : "default"
                              }
                              variant={
                                discountType === "AMOUNT" ? "solid" : "flat"
                              }
                              onClick={() => setDiscountType("AMOUNT")}
                            >
                              {t("payment.byAmount") || "ເປັນເງິນ"}
                            </Button>
                            <Button
                              className="w-1/2 font-bold"
                              color={
                                discountType === "PERCENT"
                                  ? "warning"
                                  : "default"
                              }
                              variant={
                                discountType === "PERCENT" ? "solid" : "flat"
                              }
                              onClick={() => setDiscountType("PERCENT")}
                            >
                              {t("payment.byPercent") || "ເປັນ %"}
                            </Button>
                          </ButtonGroup>
                          <Input
                            classNames={{
                              input: "text-right font-black text-warning-600",
                              inputWrapper:
                                "border-warning/30 group-data-[focus=true]:border-warning",
                            }}
                            endContent={
                              <span className="font-bold text-warning-600">
                                {discountType === "AMOUNT" ? (t("payment.kip") || "ກີບ") : "%"}
                              </span>
                            }
                            placeholder="0"
                            size="sm"
                            type="text"
                            value={
                              discountType === "AMOUNT"
                                ? Number(
                                    parseNumeric(discountValue),
                                  ).toLocaleString()
                                : discountValue
                            }
                            variant="bordered"
                            onChange={(e) =>
                              handleDiscountChange(e.target.value)
                            }
                          />
                          {discountType === "PERCENT" && (
                            <p className="text-[10px] text-right text-warning-600 font-bold">
                              ≈ {discountAmount.toLocaleString()} {t("payment.kip") || "ກີບ"}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-primary/5 rounded-2xl border-2 border-primary/20">
                      <p className="text-primary text-xs mb-1 uppercase tracking-wider font-bold">
                        {t("payment.grandTotal") || "ຍອດລວມທີ່ຕ້ອງຈ່າຍ"}
                      </p>
                      <p className="text-2xl font-black text-primary">
                        {finalTotal.toLocaleString()}{" "}
                        <span className="text-lg font-normal">{t("payment.kip") || "ກີບ"}</span>
                      </p>
                    </div>

                    <div className="space-y-4">
                      {paymentMethod === "TRANSFER_CASH" ? (
                        <div className="space-y-4">
                          <div
                            className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                              activeMixedField === "CASH"
                                ? "bg-primary/10 border-primary"
                                : "bg-default-50 border-divider"
                            }`}
                            onClick={() => setActiveMixedField("CASH")}
                          >
                            <p className="text-primary text-xs mb-1 font-bold uppercase">
                              {t("payment.cashAmount") || "ຈ່າຍເງິນສົດ"}
                            </p>
                            <Input
                              classNames={{
                                input:
                                  "text-xl font-black text-primary-600 text-right",
                                inputWrapper:
                                  "bg-transparent border-none shadow-none h-auto p-0",
                              }}
                              endContent={
                                <span className="text-sm font-bold text-primary-600 ml-1">
                                  {t("payment.kip") || "ກີບ"}
                                </span>
                              }
                              type="text"
                              value={Number(
                                parseNumeric(mixedCashAmount),
                              ).toLocaleString()}
                              variant="flat"
                              onChange={(e) =>
                                handleReceivedAmountChange(e.target.value)
                              }
                            />
                          </div>

                          <div
                            className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                              activeMixedField === "TRANSFER"
                                ? "bg-primary/10 border-primary"
                                : "bg-default-50 border-divider"
                            }`}
                            onClick={() => setActiveMixedField("TRANSFER")}
                          >
                            <p className="text-primary text-xs mb-1 font-bold uppercase">
                              {t("payment.transferAmount") || "ຈ່າຍເງິນໂອນ"}
                            </p>
                            <Input
                              classNames={{
                                input:
                                  "text-xl font-black text-primary-600 text-right",
                                inputWrapper:
                                  "bg-transparent border-none shadow-none h-auto p-0",
                              }}
                              endContent={
                                <span className="text-sm font-bold text-primary-600 ml-1">
                                  {t("payment.kip") || "ກີບ"}
                                </span>
                              }
                              type="text"
                              value={Number(
                                parseNumeric(mixedTransferAmount),
                              ).toLocaleString()}
                              variant="flat"
                              onChange={(e) =>
                                handleReceivedAmountChange(e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-4">
                            <p className="text-default-500 text-sm font-medium">
                              {t("payment.selectBankTransfer") || "ເລືອກທະນາຄານ (ສຳລັບເງິນໂອນ)"}
                            </p>
                            {isLoadingBanks ? (
                              <Spinner size="sm" />
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {banks.map((bank: Bank) => (
                                  <Button
                                    key={bank.id}
                                    className={`h-12 py-1 flex items-center gap-2 border-2 transition-all ${
                                      selectedBank === bank.id
                                        ? "border-primary bg-primary/10"
                                        : "border-transparent bg-default-100"
                                    }`}
                                    onClick={() => setSelectedBank(bank.id)}
                                  >
                                    {bank.logoUrl && (
                                      <img
                                        alt={bank.name}
                                        className="w-6 h-6 rounded-full object-contain"
                                        src={getDisplayImageUrl(bank.logoUrl)}
                                      />
                                    )}
                                    <span className="text-[10px] font-bold truncate">
                                      {bank.name}
                                    </span>
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : paymentMethod === "CASH" ? (
                        <>
                          <div>
                            <p className="text-default-500 text-xs mb-2 font-medium">
                              {t("payment.selectCurrency") || "ເລືອກສະກຸນເງິນ"}
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                "LAK",
                                ...moneyRates.map((r: any) => r.name),
                              ].map((curr) => (
                                <Button
                                  key={curr}
                                  className="font-bold h-10"
                                  color={
                                    currency === curr ? "primary" : "default"
                                  }
                                  variant={currency === curr ? "solid" : "flat"}
                                  onClick={() => setCurrency(curr)}
                                >
                                  {curr}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                            <p className="text-primary text-xs mb-1 font-semibold uppercase">
                              {t("payment.receivedAmount") || "ຈຳນວນເງິນທີ່ຮັບມາ"}
                            </p>
                            <Input
                              classNames={{
                                input:
                                  "text-2xl font-black text-primary-600 text-right",
                                inputWrapper:
                                  "bg-transparent border-none shadow-none min-h-unit-10 h-auto p-0 group-data-[focus=true]:bg-transparent",
                              }}
                              endContent={
                                <span className="text-lg font-normal text-primary-600 ml-1">
                                  {currency}
                                </span>
                              }
                              type="text"
                              value={Number(
                                parseNumeric(receivedAmount),
                              ).toLocaleString()}
                              variant="flat"
                              onChange={(e) =>
                                handleReceivedAmountChange(e.target.value)
                              }
                            />
                            {currency !== "LAK" && (
                              <p className="text-xs font-bold text-primary/60 text-right mt-1">
                                ≈ {receivedAmountInLAK.toLocaleString()} {t("payment.kip") || "ກີບ"}
                              </p>
                            )}
                          </div>

                          <div className="p-3 bg-success/10 rounded-2xl border border-success/20">
                            <p className="text-success-600 text-xs mb-1 font-semibold uppercase">
                              {t("payment.change") || "ເງິນທອນ"}
                            </p>
                            <p className="text-2xl font-black text-success">
                              {change.toLocaleString()}{" "}
                              <span className="text-lg font-normal">{t("payment.kip") || "ກີບ"}</span>
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-default-500 text-sm font-medium">
                            {t("payment.selectBank") || "ເລືอกທະນາຄານ"}
                          </p>
                          {isLoadingBanks ? (
                            <div className="flex justify-center py-8">
                              <Spinner label={t("payment.loadingBanks") || "ກຳລັງໂຫຼດລາຍການທະນາຄານ..."} />
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              {banks.map((bank: Bank) => (
                                <Button
                                  key={bank.id}
                                  className={`h-22 min-h-18 py-2 flex flex-col gap-1 border-2 transition-all ${
                                    selectedBank === bank.id
                                      ? "border-primary bg-primary/10"
                                      : "border-transparent bg-default-100"
                                  }`}
                                  onClick={() => setSelectedBank(bank.id)}
                                >
                                  {bank.logoUrl ? (
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-divider">
                                      <img
                                        alt={bank.name}
                                        className="w-full h-full object-contain"
                                        src={getDisplayImageUrl(bank.logoUrl)}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                            "/assets/eezypos_logo.jpg";
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Landmark
                                        className="text-primary"
                                        size={20}
                                      />
                                    </div>
                                  )}
                                  <span className="text-xs font-bold truncate w-full text-center">
                                    {bank.name}
                                  </span>
                                </Button>
                              ))}
                              {banks.length === 0 && !isLoadingBanks && (
                                <div className="col-span-2 text-center py-4 bg-default-50 rounded-xl border border-dashed text-default-400 text-sm">
                                  ບໍ່ພົບຂໍ້ມູນທະນາຄານ
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Keypad (Only for Cash or Split) */}
                  <div className="flex flex-col gap-3">
                    {paymentMethod === "CASH" ||
                    paymentMethod === "TRANSFER_CASH" ? (
                      <>
                        <Button
                          className="h-12 text-xl font-black rounded-xl mb-1 shadow-md shadow-primary/20"
                          color="primary"
                          variant="solid"
                          onPress={() => {
                            if (paymentMethod === "TRANSFER_CASH") {
                              if (activeMixedField === "CASH") {
                                setMixedCashAmount(finalTotal.toString());
                                setMixedTransferAmount("0");
                              } else {
                                setMixedTransferAmount(finalTotal.toString());
                                setMixedCashAmount("0");
                              }
                            } else {
                              setCurrency("LAK");
                              setReceivedAmount(finalTotal.toString());
                            }
                          }}
                        >
                          ເຕັ້ມຈຳນວນ
                        </Button>
                        <div className="grid grid-cols-3 gap-3">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "0", "00", "000"].map(
                            (num) => (
                              <Button
                                key={num}
                                className="h-14 text-xl font-bold bg-default-100/50 hover:bg-primary hover:text-white transition-all rounded-xl shadow-sm"
                                variant="flat"
                                onPress={() =>
                                  handleKeypadPress(num.toString())
                                }
                              >
                                {num}
                              </Button>
                            ),
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <Button
                            className="h-12 text-lg font-bold rounded-xl"
                            color="warning"
                            startContent={<Delete size={20} />}
                            variant="flat"
                            onPress={deleteLastDigit}
                          >
                            ລຶບ
                          </Button>
                          <Button
                            className="h-12 text-lg font-bold rounded-xl"
                            color="danger"
                            startContent={<XCircle size={20} />}
                            variant="flat"
                            onPress={clearReceived}
                          >
                            {t("payment.clearAll") || "ລຶບທັງໝົດ"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-4 bg-primary/5 rounded-3xl border-2 border-dashed border-primary/20 transition-all">
                        {selectedBankData?.qrCodeImage ? (
                          <>
                            <div className="bg-white p-3 rounded-2xl shadow-sm mb-4 border border-divider">
                              <img
                                alt="QR Code"
                                className="w-48 h-48 sm:w-64 sm:h-64 object-contain"
                                src={getDisplayImageUrl(
                                  selectedBankData.qrCodeImage,
                                )}
                              />
                            </div>
                            <p className="text-lg font-black text-primary text-center">
                              {selectedBankData.name}
                            </p>
                            <p className="text-sm text-default-500 font-bold">
                              {t("payment.scanQrMsg") || "ກະລຸນາສະແກນ QR ເພື່ອໂອນເງິນ"}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                              <CreditCard className="text-primary" size={48} />
                            </div>
                            <p className="text-lg font-bold text-primary">
                              {t("payment.transferMoneyMsg") || "ກະລຸນາໂอนເງິນ"}
                            </p>
                            <p className="text-center text-sm text-default-500 mt-2 font-medium">
                              {t("payment.checkSlipMsg") || "ກະລຸນາກວດສອບຫຼັກຖານການໂອນ"}
                              <br />
                              {t("payment.correctCheckMsg") || "ໃຫ້ຖືກຕ້ອງກ່ອນກົດຢືນຢັນ"}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-divider p-6">
              <Button
                className="h-12 px-6 font-bold text-base"
                color="default"
                variant="flat"
                onPress={onClose}
              >
                {t("common.cancel") || "ຍົກເລີກ"}
              </Button>
              <Button
                className="h-12 px-6 font-bold text-base"
                color="danger"
                variant="flat"
                onPress={() => setIsDebtModalOpen(true)}
              >
                {t("common.debt") || "ຕິດໜີ້"}
              </Button>
              <Button
                className="flex-grow h-12 font-black text-lg shadow-md shadow-primary/30"
                color="primary"
                isDisabled={
                  paymentMethod === "TRANSFER_CASH"
                    ? Number(parseNumeric(mixedCashAmount)) +
                        Number(parseNumeric(mixedTransferAmount)) <
                        finalTotal || !selectedBank
                    : paymentMethod === "CASH"
                      ? receivedAmountInLAK < finalTotal
                      : !selectedBank
                }
                isLoading={
                  createOrderMutation.isPending ||
                  updateOrderItemsMutation.isPending
                }
                startContent={<CheckCircle2 size={22} />}
                onPress={() => handleConfirm(onClose)}
              >
                {t("common.confirmPayment") || "ຢືນຢັນການຊຳລະເງິນ"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>

      <DebtModal
        isOpen={isDebtModalOpen}
        onOpenChange={setIsDebtModalOpen}
        total={finalTotal}
        onConfirm={handleDebtConfirm}
        isLoading={
                  createOrderMutation.isPending ||
                  updateOrderItemsMutation.isPending
                }
      />
    </Modal>
  );
}
