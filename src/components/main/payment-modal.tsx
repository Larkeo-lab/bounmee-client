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
import { useAuth } from "@/routes/AuthContext";
import { useGetBanks, Bank } from "@/services/bank/useBank";
import { useCreateOrder, OrderItemInput } from "@/services/order/useOrder";
import { API_BASE_URL } from "@/lib/axios";
import toast from "react-hot-toast";
import { getDisplayImageUrl } from "@/lib/utils";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  total: number;
  items: CartItem[];
  onPaymentSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onOpenChange,
  total,
  items,
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

  const change = Math.max(0, Number(receivedAmount) - total);

  const handleConfirm = async (onClose: () => void) => {
    if (!user?.user?.storeId || !user?.user?.id) {
      toast.error("Auth session invalid");
      return;
    }

    try {
      const orderItems: OrderItemInput[] = items.map((item) => ({
        productId: item.id,
        qty: Number(item.quantity),
        unitPrice: Number(item.price),
        subTotal: Number(item.price) * Number(item.quantity),
      }));

      await createOrderMutation.mutateAsync({
        totalAmount: Number(total),
        receivedAmount: Number(receivedAmount),
        change: Number(change),
        paymentMethod: paymentMethod,
        storeId: user.user.storeId,
        employeeId: user.user.employee?.id || null,
        bankId: selectedBank,
        items: orderItems,
      });

      toast.success("ຊຳລະເງິນສຳເລັດແລ້ວ!");
      onPaymentSuccess();
      clearReceived();
      onClose();
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("ການຊຳລະເງິນຫຼົ້ມເຫຼວ ກະລຸນາລອງໃໝ່");
    }
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return "/assets/logo.png";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}/api/v1/storage/view-image/${url}`;
  };

  console.log("banks", banks);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      backdrop="blur"
      className="dark:bg-gray-900"
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
                <div className="flex justify-center">
                  <ButtonGroup className="w-full max-w-md shadow-sm">
                    <Button
                      className="flex-grow h-14 font-bold text-lg"
                      color={paymentMethod === "CASH" ? "primary" : "default"}
                      variant={paymentMethod === "CASH" ? "solid" : "flat"}
                      startContent={<Banknote size={24} />}
                      onClick={() => {
                        setPaymentMethod("CASH");
                        setSelectedBank(null);
                      }}
                    >
                      ເງິນສົດ
                    </Button>
                    <Button
                      className="flex-grow h-14 font-bold text-lg"
                      color={
                        paymentMethod === "TRANSFER" ? "primary" : "default"
                      }
                      variant={paymentMethod === "TRANSFER" ? "solid" : "flat"}
                      startContent={<CreditCard size={24} />}
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
                    <div className="p-4 bg-default-50 rounded-2xl border border-divider">
                      <p className="text-default-500 text-sm mb-1 uppercase tracking-wider font-semibold">
                        ຍອດລວມທັງໝົດ
                      </p>
                      <p className="text-4xl font-black text-primary">
                        {total.toLocaleString()}{" "}
                        <span className="text-xl font-normal">ກີບ</span>
                      </p>
                    </div>

                    <div className="space-y-4">
                      {paymentMethod === "CASH" ? (
                        <>
                          <div>
                            <p className="text-default-500 text-sm mb-2 font-medium">
                              ເລືອກສະກຸນເງິນ
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {["LAK", "THB", "USD"].map((curr) => (
                                <Button
                                  key={curr}
                                  variant={currency === curr ? "solid" : "flat"}
                                  color={
                                    currency === curr ? "primary" : "default"
                                  }
                                  className="font-bold h-12"
                                  onClick={() => setCurrency(curr)}
                                >
                                  {curr}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                            <p className="text-primary text-sm mb-1 font-semibold uppercase">
                              ຈຳນວນເງິນທີ່ຮັບມາ
                            </p>
                            <p className="text-3xl font-black text-primary-600">
                              {Number(receivedAmount).toLocaleString()}{" "}
                              <span className="text-lg font-normal">
                                {currency}
                              </span>
                            </p>
                          </div>

                          <div className="p-4 bg-success/10 rounded-2xl border border-success/20">
                            <p className="text-success-600 text-sm mb-1 font-semibold uppercase">
                              ເງິນທອນ
                            </p>
                            <p className="text-3xl font-black text-success">
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
                                  className={`h-22 min-h-20 py-2 flex flex-col gap-1 border-2 transition-all ${
                                    selectedBank === bank.id
                                      ? "border-primary bg-primary/10"
                                      : "border-transparent bg-default-100"
                                  }`}
                                  onClick={() => setSelectedBank(bank.id)}
                                >
                                  {bank.logoUrl ? (
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-divider">
                                      <img
                                        src={getDisplayImageUrl(bank.logoUrl)}
                                        alt={bank.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                            "/assets/logo.png";
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Landmark
                                        size={20}
                                        className="text-primary"
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
                          color="primary"
                          variant="solid"
                          className="h-16 text-2xl font-black rounded-xl mb-1 shadow-lg shadow-primary/20"
                          onPress={() => {
                            setReceivedAmount(total.toString());
                            setCurrency("LAK");
                          }}
                        >
                          ເຕັ້ມຈຳນວນ
                        </Button>
                        <div className="grid grid-cols-3 gap-3">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "0", "00", "000"].map(
                            (num) => (
                              <Button
                                key={num}
                                variant="flat"
                                className="h-16 text-2xl font-bold bg-default-100/50 hover:bg-primary hover:text-white transition-all rounded-xl shadow-sm"
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
                            color="warning"
                            variant="flat"
                            className="h-16 text-xl font-bold rounded-xl"
                            startContent={<Delete size={24} />}
                            onPress={deleteLastDigit}
                          >
                            ລຶບ
                          </Button>
                          <Button
                            color="danger"
                            variant="flat"
                            className="h-16 text-xl font-bold rounded-xl"
                            startContent={<XCircle size={24} />}
                            onPress={clearReceived}
                          >
                            ລຶບທັງໝົດ
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 bg-primary/5 rounded-3xl border-2 border-dashed border-primary/20 opacity-80">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <CreditCard size={48} className="text-primary" />
                        </div>
                        <p className="text-lg font-bold text-primary">
                          ກະລຸນາໂອນເງິນ
                        </p>
                        <p className="text-center text-sm text-default-500 mt-2">
                          ກະລຸນາກວດສອບຫຼັກຖານການໂອນ
                          <br />
                          ໃຫ້ຖືກຕ້ອງກ່ອນກົດຢືນຢັນ
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-divider p-6">
              <Button
                color="default"
                variant="flat"
                onPress={onClose}
                className="h-14 px-8 font-bold text-lg"
              >
                ຍົກເລີກ
              </Button>
              <Button
                color="primary"
                className="flex-grow h-14 font-black text-xl shadow-lg shadow-primary/30"
                startContent={<CheckCircle2 size={24} />}
                onPress={() => handleConfirm(onClose)}
                isLoading={createOrderMutation.isPending}
                isDisabled={
                  paymentMethod === "CASH"
                    ? Number(receivedAmount) < total
                    : !selectedBank
                }
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
