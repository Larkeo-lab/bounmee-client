import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { AlertTriangle, Calendar, LogOut } from "lucide-react";
import { useAuth } from "@/routes/AuthContext";

interface ModelGlobleEnDateProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  endDate?: string | null;
  storeName?: string;
}

export default function ModelGlobleEnDate({
  isOpen,
  onOpenChange,
  endDate,
  storeName = "ຮ້ານຄ້າ",
}: ModelGlobleEnDateProps) {
  const { logout } = useAuth();

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("lo-LA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      hideCloseButton={true}
      classNames={{
        backdrop: "bg-black/75 backdrop-blur-xl",
        base: "border-t-4 border-danger bg-background text-foreground max-w-md mx-4 rounded-2xl shadow-2xl",
        header: "flex flex-col gap-1 items-center pt-6 pb-2",
        body: "flex flex-col items-center text-center px-6 py-4",
        footer: "flex gap-2 justify-center pb-6 pt-2 px-6 w-full",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-2 animate-pulse">
                <AlertTriangle className="w-8 h-8 text-danger" />
              </div>
              <h3 className="font-extrabold text-xl text-danger tracking-wide">
                ລະບົບໝົດອາຍຸການໃຊ້ງານ
              </h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-foreground/85 text-base leading-relaxed mb-4">
                ຮ້ານຄ້າ <strong className="text-danger">{storeName}</strong> ໄດ້ໝົດກຳນົດເວລາການໃຊ້ງານແລ້ວ! ກະລຸນາຕິດຕໍ່ຜູ້ເບິ່ງແຍງລະບົບ ຫຼື ຊຳລະຄ່າບໍລິການເພື່ອສືບຕໍ່ໃຊ້ງານ.
              </p>
              {endDate && (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-xs">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-foreground/60">
                    ວັນໝົດອາຍຸ:
                  </span>
                  <span className="text-xs font-bold text-danger">
                    {formatDate(endDate)}
                  </span>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="w-full">
              <Button
                color="danger"
                variant="solid"
                onPress={logout}
                className="font-bold text-sm w-full py-6 flex items-center gap-2 rounded-xl"
                startContent={<LogOut className="w-4 h-4" />}
              >
                ອອກຈາກລະບົບ
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
