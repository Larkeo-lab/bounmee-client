import { useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
  Avatar,
} from "@heroui/react";
import { Search, UserPlus, Phone, User, CheckCircle2, X } from "lucide-react";
import { useAuth } from "@/routes/AuthContext";
import {
  useGetMembers,
  useCreateMember,
  Member,
} from "@/services/member/useMember";
import toast from "react-hot-toast";

interface DebtModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  total: number;
  onConfirm: (memberId: string, dueDate?: string | null) => void;
  isLoading?: boolean;
}

export default function DebtModal({
  isOpen,
  onOpenChange,
  total,
  onConfirm,
  isLoading,
}: DebtModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", phone: "" });
  const [dueDate, setDueDate] = useState<string>("");

  const { data: memberResponse, isLoading: isLoadingMembers } = useGetMembers(
    user?.user?.storeId || "",
    searchTerm,
  );
  const members = memberResponse?.data || [];

  const createMemberMutation = useCreateMember();

  const handleCreateMember = async () => {
    if (!newMember.name || !newMember.phone) {
      toast.error(t("debt.fillAllFields") || "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
      return;
    }

    try {
      const result = await createMemberMutation.mutateAsync({
        ...newMember,
        storeId: user?.user?.storeId || "",
      });
      setSelectedMember(result.data);
      setIsAddingNew(false);
      setNewMember({ name: "", phone: "" });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleConfirmDebt = () => {
    if (!selectedMember) {
      toast.error(t("debt.selectMemberMsg") || "ກະລຸນາເລືອກສະມາຊິກ");
      return;
    }

    if (dueDate && dayjs(dueDate).isBefore(dayjs(), "day")) {
      toast.error(t("debt.pastDueDateMsg") || "ວັນທີກຳນົດສົ່ງບໍ່ສາມາດເປັນວັນທີໃນອະດີດໄດ້");
      return;
    }

    onConfirm(selectedMember.id, dueDate || null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      backdrop="blur"
      classNames={{
        wrapper: "z-[70]",
        backdrop: "z-[70]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-2xl font-bold text-primary">
              {t("debt.modalTitle") || "ຕິດໜີ້ (Debt)"}
            </ModalHeader>
            <ModalBody className="pb-6">
              <div className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                  <p className="text-primary text-xs mb-1 uppercase font-bold tracking-wider">
                    {t("debt.enterAmount") || "ຍອດເງິນທີ່ຕິດໜີ້"}
                  </p>
                  <p className="text-3xl font-black text-primary">
                    {total.toLocaleString()}{" "}
                    <span className="text-lg font-normal">{t("payment.kip") || "ກີບ"}</span>
                  </p>
                </div>

                {!isAddingNew ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        labelPlacement="outside"
                        placeholder={t("debt.searchMember") || "ຄົ້ນຫາສະມາຊິກ (ຊື່ ຫຼື ເບີໂທ)..."}
                        startContent={
                          <Search size={18} className="text-default-400" />
                        }
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        className="flex-grow"
                      />
                      <Button
                        isIconOnly
                        color="primary"
                        variant="flat"
                        onPress={() => setIsAddingNew(true)}
                      >
                        <UserPlus size={20} />
                      </Button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {isLoadingMembers ? (
                        <div className="flex justify-center py-8">
                          <Spinner label={t("debt.loading") || "ກຳລັງໂຫຼດຂໍ້ມູນ..."} />
                        </div>
                      ) : members.length > 0 ? (
                        members.map((member: Member) => (
                          <div
                            key={member.id}
                            className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                              selectedMember?.id === member.id
                                ? "border-primary bg-primary/5"
                                : "border-default-100 hover:border-primary/30"
                            }`}
                            onClick={() => setSelectedMember(member)}
                          >
                            <Avatar
                              name={member.name}
                              size="sm"
                              className="bg-primary/10 text-primary font-bold"
                            />
                            <div className="flex-grow">
                              <p className="font-bold text-sm">{member.name}</p>
                              <div className="flex items-center gap-1 text-xs text-default-500">
                                <Phone size={12} />
                                <span>{member.phone}</span>
                              </div>
                            </div>
                            {selectedMember?.id === member.id && (
                              <CheckCircle2
                                size={20}
                                className="text-primary"
                              />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-default-400 text-sm italic">
                          {t("debt.memberNotFound") || "ບໍ່ພົບຂໍ້ມູນສະມາຊິກ"}
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-warning/5 rounded-2xl border border-warning/20 space-y-2">
                      <p className="text-warning-600 text-[10px] font-black uppercase tracking-wider px-1">
                        {t("debt.dueDate") || "ວັນທີກຳນົດສົ່ງ"} (Due Date)
                      </p>
                      <Input
                        type="date"
                        variant="flat"
                        size="sm"
                        value={dueDate}
                        onValueChange={setDueDate}
                        min={dayjs().format("YYYY-MM-DD")}
                        classNames={{
                          input: "font-bold text-warning-700",
                          inputWrapper: "bg-white dark:bg-gray-800 border-divider",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-default-50 rounded-2xl border border-divider space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-primary">{t("debt.addNewMember") || "ເພີ່ມສະມາຊິກໃໝ່"}</p>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => setIsAddingNew(false)}
                      >
                        <X size={18} />
                      </Button>
                    </div>
                    <div className="space-y-8 my-4">
                      <Input
                        label={t("debt.memberName") || "ຊື່ສະມາຊິກ"}
                        labelPlacement="outside"
                        placeholder={t("debt.enterName") || "ປ້ອນຊື່..."}
                        startContent={
                          <User size={18} className="text-default-400" />
                        }
                        value={newMember.name}
                        onValueChange={(val) =>
                          setNewMember((p) => ({ ...p, name: val }))
                        }
                      />
                      <Input
                        label={t("debt.memberPhone") || "ເບີໂທລະສັບ"}
                        labelPlacement="outside"
                        placeholder={t("debt.enterPhone") || "ປ້ອນເບີໂທ..."}
                        startContent={
                          <Phone size={18} className="text-default-400" />
                        }
                        value={newMember.phone}
                        onValueChange={(val) =>
                          setNewMember((p) => ({ ...p, phone: val }))
                        }
                      />
                      <Button
                        className="w-full font-bold"
                        color="primary"
                        isLoading={createMemberMutation.isPending}
                        onPress={handleCreateMember}
                      >
                        {t("debt.saveMember") || "ບັນທຶກສະມາຊິກ"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-divider">
              <Button variant="flat" onPress={onClose}>
                {t("common.cancel") || "ຍົກເລີກ"}
              </Button>
              <Button
                color="primary"
                className="font-black px-8"
                isDisabled={!selectedMember || isAddingNew || !dueDate}
                isLoading={isLoading}
                onPress={handleConfirmDebt}
              >
                {t("debt.confirmDebt") || "ຢືນຢັນການຕິດໜີ້"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
