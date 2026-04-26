import { 
  Modal, 
  ModalContent, 
  ModalBody, 
  ModalFooter, 
  Button 
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { Mail, MessageCircle } from "lucide-react";

interface PendingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PendingModal({
  isOpen,
  onOpenChange,
}: PendingModalProps) {
  const { t } = useTranslation();

  const handleWhatsAppRedirect = () => {
    // 💡 REPLACE THIS WITH THE ACTUAL NUMBER
    const phoneNumber = "8562099999999"; 
    const message = encodeURIComponent("Sabaidee, I would like to inquire about my store approval status.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
    onOpenChange(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="sm"
      placement="center"
      hideCloseButton
      backdrop="blur"
      classNames={{
        wrapper: "z-[9999]",
        backdrop: "z-[9998] bg-black/30",
        base: "border-none shadow-2xl rounded-[32px]",
      }}
    >
      <ModalContent>
        <ModalBody className="py-8 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-warning-50 flex items-center justify-center text-warning mb-6 scale-110 shadow-inner">
            <Mail size={40} strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-black text-center text-default-800">
            {t("settings.common.pendingTitle")}
          </h3>
          <p className="text-default-500 text-base text-center mt-3 px-6 leading-relaxed font-medium">
            {t("settings.common.pendingMsg")}
          </p>
        </ModalBody>
        <ModalFooter className="flex flex-col gap-3 p-6 pt-2 border-t border-divider/30 bg-default-50/30">
          <Button
            fullWidth
            color="success"
            variant="shadow"
            startContent={<MessageCircle size={20} />}
            onPress={handleWhatsAppRedirect}
            className="font-bold h-12 rounded-2xl shadow-success/30"
          >
            Contact via WhatsApp
          </Button>
          <Button
            fullWidth
            variant="flat"
            onPress={() => onOpenChange(false)}
            className="font-bold h-12 rounded-2xl"
          >
            {t("settings.common.ok")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
