import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  Spinner,
} from "@heroui/react";
import { Banknote, Landmark, CheckCircle2, HandCoins } from "lucide-react";
import { formatNumber, parseNumber } from "@/utils/numberFormat";
import { useAuth } from "@/routes/AuthContext";
import { useGetBanks, Bank } from "@/services/bank/useBank";
import { getDisplayImageUrl } from "@/lib/utils";

interface ConfirmDebtModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  order: any;
  onConfirm: (data: {
    paymentStatus: string;
    receivedAmount: number;
    note?: string;
    bankId?: string | null;
    paymentMethod?: string;
  }) => void;
  isLoading?: boolean;
}

export default function ConfirmDebtModal({
  isOpen,
  onOpenChange,
  order,
  onConfirm,
  isLoading,
}: ConfirmDebtModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const { data: bankResponse, isLoading: isLoadingBanks } = useGetBanks(
    isOpen ? user?.user?.storeId : "",
  );
  const banks = bankResponse?.data || [];
  const selectedBankData = banks.find((b: Bank) => b.id === selectedBank);

  const debtAmount = order
    ? order.totalAmount - (order.receivedAmount || 0)
    : 0;

  useEffect(() => {
    if (isOpen && order) {
      setReceivedAmount(debtAmount);
      setNote("");
      setPaymentMethod("CASH");
      setSelectedBank(null);
    }
  }, [isOpen, order, debtAmount]);

  const handleConfirm = () => {
    onConfirm({
      paymentStatus: receivedAmount >= debtAmount ? "PAID" : "PARTIALLY_PAID",
      receivedAmount: Number((order?.receivedAmount || 0) + receivedAmount),
      note: note,
      bankId: selectedBank,
      paymentMethod: paymentMethod,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      backdrop="blur"
      classNames={{
        base: "border-none",
        header: "border-b-[1px] border-divider",
        footer: "border-t-[1px] border-divider",
        backdrop: "bg-background/20 backdrop-blur-md",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <HandCoins className="text-primary" size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black">
                    {t("debt.payment") || "ຊຳລະໜີ້"}
                  </span>
                  <span className="text-[10px] text-default-400 font-bold uppercase tracking-widest">
                    #{order?.orderNumber}
                  </span>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-default-500 uppercase tracking-widest px-1">
                    {t("order.paymentMethod") || "ວິທີການຊຳລະ"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      className={`h-14 font-bold border-2 ${
                        paymentMethod === "CASH"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-default-100 bg-transparent text-default-500"
                      }`}
                      startContent={<Banknote size={20} />}
                      onPress={() => setPaymentMethod("CASH")}
                    >
                      {t("order.cash") || "ເງິນສົດ"}
                    </Button>
                    <Button
                      className={`h-14 font-bold border-2 ${
                        paymentMethod === "TRANSFER"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-default-100 bg-transparent text-default-500"
                      }`}
                      startContent={<Landmark size={20} />}
                      onPress={() => setPaymentMethod("TRANSFER")}
                    >
                      {t("order.transfer") || "ເງິນໂອນ"}
                    </Button>
                  </div>
                </div>

                {paymentMethod === "TRANSFER" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <p className="text-default-500 text-sm font-black uppercase tracking-wider px-1">
                      {t("order.selectBank") || "ເລືອກທະນາຄານ"}
                    </p>
                    {isLoadingBanks ? (
                      <div className="flex justify-center py-4">
                        <Spinner size="sm" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {banks.map((bank: Bank) => (
                          <Button
                            key={bank.id}
                            className={`h-20 flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                              selectedBank === bank.id
                                ? "border-primary bg-primary/5"
                                : "border-default-100 bg-transparent"
                            }`}
                            onPress={() => setSelectedBank(bank.id)}
                          >
                            {bank.logoUrl ? (
                              <img
                                alt={bank.name}
                                className="w-8 h-8 rounded-full object-contain"
                                src={getDisplayImageUrl(bank.logoUrl)}
                              />
                            ) : (
                              <Landmark
                                size={20}
                                className="text-default-400"
                              />
                            )}
                            <span className="text-[10px] font-bold truncate w-full text-center px-1">
                              {bank.name}
                            </span>
                          </Button>
                        ))}
                      </div>
                    )}

                    {selectedBankData?.qrCodeImage && (
                      <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-3xl border-2 border-dashed border-primary/20">
                        <div className="bg-white p-3 rounded-2xl shadow-sm mb-3 border border-divider">
                          <img
                            alt="QR Code"
                            className="w-48 h-48 object-contain"
                            src={getDisplayImageUrl(
                              selectedBankData.qrCodeImage,
                            )}
                          />
                        </div>
                        <p className="text-sm font-black text-primary">
                          {selectedBankData.name}
                        </p>
                        <p className="text-[10px] text-default-500 font-bold uppercase tracking-widest mt-1">
                          {t("order.scanToPay") ||
                            "ກະລຸນາສະແກນ QR ເພື່ອໂອນເງິນ"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {/* Debt Summary Card */}
                <Card className="bg-primary-50/30 border-none shadow-none">
                  <CardBody className="p-4 flex flex-row justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                        {t("debt.debtAmount") || "ຍອດໜີ້ທີ່ຄ້າງ"}
                      </span>
                      <span className="text-3xl font-black text-primary">
                        {formatNumber(debtAmount)}{" "}
                        <small className="text-sm font-normal">₭</small>
                      </span>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <Landmark className="text-primary" size={32} />
                    </div>
                  </CardBody>
                </Card>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-default-500 uppercase tracking-widest px-1">
                      {t("order.receivedAmount") || "ຈຳນວນເງິນທີ່ຊຳລະ"}
                    </label>
                    <Input
                      type="text"
                      size="lg"
                      variant="bordered"
                      value={receivedAmount === 0 ? "" : formatNumber(receivedAmount)}
                      onChange={(e) =>
                        setReceivedAmount(parseNumber(e.target.value))
                      }
                      placeholder="0"
                      endContent={
                        <span className="text-default-400 font-bold">₭</span>
                      }
                      classNames={{
                        input: "text-2xl font-black",
                        inputWrapper:
                          "h-16 border-2 focus-within:border-primary",
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-primary-500 uppercase tracking-widest px-1">
                    {t("order.change") || "ເງິນທອນ: "}
                    {formatNumber(Math.max(0, receivedAmount - debtAmount))}
                  </label>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} className="font-bold">
                {t("common.cancel")}
              </Button>
              <Button
                color="primary"
                className="font-black px-10 shadow-lg shadow-primary/20"
                isLoading={isLoading}
                isDisabled={paymentMethod === "TRANSFER" && !selectedBank}
                onPress={handleConfirm}
                startContent={!isLoading && <CheckCircle2 size={20} />}
              >
                {t("common.confirmPayment") || "ຢືນຢັນການຊຳລະ"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
