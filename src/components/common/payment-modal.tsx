import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ButtonGroup,
  Spinner,
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

import { useAuth } from "@/routes/AuthContext";
import { useGetBanks, Bank } from "@/services/bank/useBank";
import { useCreateOrder } from "@/services/order/useOrder";
import { useGetMoneyRates } from "@/services/moneyRate/useMoneyRate";
import { getDisplayImageUrl } from "@/lib/utils";

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
  onPaymentSuccess: (order?: any) => void;
}

export default function PaymentModal({
  isOpen,
  onOpenChange,
  total,
  items,
  tableId,
  businessType,
  onPaymentSuccess,
}: PaymentModalProps) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">(
    "CASH",
  );
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [receivedAmount, setReceivedAmount] = useState("0");
  const [currency, setCurrency] = useState("LAK");

  const createOrderMutation = useCreateOrder();

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
    setReceivedAmount((prev) => {
      if (prev === "0") return val;

      return prev + val;
    });
  };

  const clearReceived = () => setReceivedAmount("0");
  const deleteLastDigit = () => {
    setReceivedAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  const currentRate = moneyRates.find((r: any) => r.name === currency);
  const rateValue = currentRate ? Number(currentRate.rateBuy) : 1;
  const receivedAmountInLAK = Number(receivedAmount) * rateValue;

  const change = Math.max(0, receivedAmountInLAK - total);

  const handleConfirm = async (onClose: () => void) => {
    if (!user?.user?.storeId || !user?.user?.id) {
      toast.error("Auth session invalid");

      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        totalAmount: Number(total),
        receivedAmount: Number(receivedAmountInLAK),
        change: Number(change),
        paymentMethod: paymentMethod,
        storeId: user.user.storeId,
        employeeId: user.user.employee?.id || null,
        bankId: selectedBank,
        tableId: tableId,
        businessType: businessType,
        items: items.map((item: any) => ({
          productId: item.id,
          qty: Number(item.quantity),
          unitPrice: Number(item.price),
          subTotal: Number(item.price) * Number(item.quantity),
          status: item.status,
          note: item.note || "",
          unitName: item.unitName || "",
        })),
      });

      toast.success("ຊຳລະເງິນສຳເລັດແລ້ວ!");
      onPaymentSuccess(result?.data);
      clearReceived();
      onClose();
    } catch (error: any) {
      console.error("Payment failed:", error);
      const errorData = error?.response?.data;

      if (errorData?.errorCode === "POS-9004") {
        const stockInfo = errorData.errors;

        toast.error(
          `ສິນຄ້າ "${stockInfo.productName}" ບໍ່ພໍ! (ມີ: ${stockInfo.availableStock}, ຕ້ອງການ: ${stockInfo.requested})`,
          {
            duration: 5000,
            icon: "⚠️",
          },
        );
      } else {
        toast.error(errorData?.message || "ການຊຳລະເງິນຫຼົ້ມເຫຼວ ກະລຸນາລອງໃໝ່");
      }
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
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-2xl font-bold text-primary">
              ຊຳລະເງິນ
            </ModalHeader>
            <ModalBody className="pb-8">
              <div className="flex flex-col gap-6">
                {/* Payment Method Selection */}
                <div className="flex justify-center -mt-2">
                  <ButtonGroup className="w-full max-w-full sm:max-w-md shadow-sm">
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
                      ເງິນສົດ
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
                        setReceivedAmount(total.toString());
                      }}
                    >
                      ເງິນໂອນ
                    </Button>
                  </ButtonGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Side: Summary */}
                  <div className="space-y-6">
                    <div className="p-3 bg-default-50 rounded-2xl border border-divider">
                      <p className="text-default-500 text-xs mb-1 uppercase tracking-wider font-semibold">
                        ຍອດລວມທັງໝົດ
                      </p>
                      <p className="text-2xl font-black text-primary">
                        {total.toLocaleString()}{" "}
                        <span className="text-lg font-normal">ກີບ</span>
                      </p>
                    </div>

                    <div className="space-y-4">
                      {paymentMethod === "CASH" ? (
                        <>
                          <div>
                            <p className="text-default-500 text-xs mb-2 font-medium">
                              ເລືອກສະກຸນເງິນ
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
                              ຈຳນວນເງິນທີ່ຮັບມາ
                            </p>
                            <div className="flex flex-col">
                              <p className="text-2xl font-black text-primary-600">
                                {Number(receivedAmount).toLocaleString()}{" "}
                                <span className="text-lg font-normal">
                                  {currency}
                                </span>
                              </p>
                              {currency !== "LAK" && (
                                <p className="text-xs font-bold text-primary/60">
                                  ≈ {receivedAmountInLAK.toLocaleString()} ກີບ
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="p-3 bg-success/10 rounded-2xl border border-success/20">
                            <p className="text-success-600 text-xs mb-1 font-semibold uppercase">
                              ເງິນທອນ
                            </p>
                            <p className="text-2xl font-black text-success">
                              {change.toLocaleString()}{" "}
                              <span className="text-lg font-normal">ກີບ</span>
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-default-500 text-sm font-medium">
                            ເລືອກທະນາຄານ
                          </p>
                          {isLoadingBanks ? (
                            <div className="flex justify-center py-8">
                              <Spinner label="ກຳລັງໂຫຼດລາຍການທະນາຄານ..." />
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
                                            "/assets/logo.png";
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

                  {/* Right Side: Keypad (Only for Cash) */}
                  <div className="flex flex-col gap-3">
                    {paymentMethod === "CASH" ? (
                      <>
                        <Button
                          className="h-12 text-xl font-black rounded-xl mb-1 shadow-md shadow-primary/20"
                          color="primary"
                          variant="solid"
                          onPress={() => {
                            setCurrency("LAK");
                            setReceivedAmount(total.toString());
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
                            ລຶບທັງໝົດ
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
                              ກະລຸນາສະແກນ QR ເພື່ອໂອນເງິນ
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                              <CreditCard className="text-primary" size={48} />
                            </div>
                            <p className="text-lg font-bold text-primary">
                              ກະລຸນາໂອນເງິນ
                            </p>
                            <p className="text-center text-sm text-default-500 mt-2 font-medium">
                              ກະລຸນາກວດສອບຫຼັກຖານການໂອນ
                              <br />
                              ໃຫ້ຖືກຕ້ອງກ່ອນກົດຢືນຢັນ
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
                ຍົກເລີກ
              </Button>
              <Button
                className="flex-grow h-12 font-black text-lg shadow-md shadow-primary/30"
                color="primary"
                isDisabled={
                  paymentMethod === "CASH"
                    ? receivedAmountInLAK < total
                    : !selectedBank
                }
                isLoading={createOrderMutation.isPending}
                startContent={<CheckCircle2 size={22} />}
                onPress={() => handleConfirm(onClose)}
              >
                ຢືນຢັນການຊຳລະເງິນ
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
